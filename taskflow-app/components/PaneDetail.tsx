"use client"

import { useState, useRef, useEffect } from "react"
import { TaskDetail, Status, Project, Goal, ProjectMeta, GoalMeta, WorkMemo, ReviewEntry } from "@/lib/types"
import { StatusIcon } from "./StatusIcon"
import { cn } from "@/lib/utils"
import {
  MessageSquare, Lightbulb, Send, Calendar,
  Target, Tag, X, Plus, Trash2,
  Folder, Flag, AlertTriangle, BookOpen, CheckCircle2, XCircle, ArrowRight,
} from "lucide-react"
import { ConfirmDialog } from "./ConfirmDialog"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface PaneDetailProps {
  mode: "task" | "project" | "goal"
  detail?: TaskDetail | null
  onStatusChange?: (taskId: string, newStatus: Status) => void
  onTaskTitleChange?: (taskId: string, newTitle: string) => void
  onStartDateChange?: (taskId: string, startDate: string) => void
  onDueDateChange?: (taskId: string, dueDate: string) => void
  onLabelsChange?: (taskId: string, labels: string[]) => void
  onAddTask?: () => void
  project?: Project | null
  projectMeta?: ProjectMeta | null
  onProjectMetaChange?: (updates: Partial<ProjectMeta>) => void
  onRenameProject?: (name: string) => void
  goal?: Goal | null
  goalMeta?: GoalMeta | null
  onGoalMetaChange?: (updates: Partial<GoalMeta>) => void
  onRenameGoal?: (name: string) => void
  projects?: Project[]
  goalMetaMap?: Record<string, GoalMeta>
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STATUS_LABELS: Record<Status, string> = {
  todo: "未着手", inprogress: "進行中", done: "完了", hold: "保留中",
}
const STATUS_STYLE: Record<Status, string> = {
  todo:       "bg-muted text-muted-foreground border border-transparent",
  inprogress: "bg-blue-50 text-blue-600 border border-blue-200",
  done:       "bg-green-50 text-green-600 border border-transparent",
  hold:       "bg-amber-50 text-amber-600 border border-amber-200",
}
const STATUS_CYCLE: Record<Status, Status> = {
  todo: "inprogress", inprogress: "done", done: "hold", hold: "todo",
}
const LABEL_COLORS = [
  "bg-accent text-primary",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function formatMemoTime(isoStr: string): string {
  const d = new Date(isoStr)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`
}

function api(path: string, opts?: RequestInit) {
  return fetch(path, { headers: { "Content-Type": "application/json" }, ...opts })
    .catch(e => console.error(`API error [${path}]`, e))
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Sub-components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SectionHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span className={color}>{icon}</span>
      <span className="text-[14px] font-semibold text-muted-foreground tracking-widest uppercase">{label}</span>
    </div>
  )
}

function MetaTextarea({ value, onChange, placeholder, rows = 3, className }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; className?: string
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "w-full text-xs leading-relaxed text-foreground rounded-lg border border-border bg-muted px-3 py-2.5 outline-none resize-none",
        "focus:border-primary/50 focus:bg-card transition-colors placeholder:text-muted-foreground/50",
        className
      )}
    />
  )
}

function MemoSection({ entityType, entityId }: { entityType: "project" | "goal"; entityId: string }) {
  const [memos, setMemos] = useState<WorkMemo[]>([])
  const [confirmDeleteMemoId, setConfirmDeleteMemoId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const memoBottomRef = useRef<HTMLDivElement>(null)
  const apiBase = `/api/${entityType}s/${entityId}/memos`

  useEffect(() => {
    fetch(apiBase)
      .then(r => r.json())
      .then((data: { id: string; text: string; createdAt: string }[]) => {
        setMemos(data.map(m => ({ id: m.id, text: m.text, time: formatMemoTime(m.createdAt) })))
      })
      .catch(console.error)
  }, [apiBase])

  useEffect(() => {
    memoBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [memos])

  const addMemo = async () => {
    const text = (textareaRef.current?.value ?? "").trim().replace(/\n{3,}/g, "\n\n")
    if (!text) return
    if (textareaRef.current) { textareaRef.current.value = ""; textareaRef.current.style.height = "auto" }
    const res = await api(apiBase, { method: "POST", body: JSON.stringify({ text }) })
    if (!res) return
    const m = await res.json()
    setMemos(prev => [...prev, { id: m.id, text: m.text, time: formatMemoTime(m.createdAt) }])
  }

  const deleteMemo = (id: string) => {
    setMemos(prev => prev.filter(m => m.id !== id))
    api(`${apiBase}/${id}`, { method: "DELETE" })
  }

  return (
    <div className="px-4 py-3">
      <SectionHeader icon={<Lightbulb size={13} className="text-amber-400" />} label="メモ" />
      {memos.length > 0 && (
        <div className="space-y-2 mb-3">
          {memos.map((m, i) => (
            <div key={m.id ?? `memo-${i}`} className="rounded-lg bg-muted border border-border px-3 py-2 group">
              <p className="text-xs text-foreground whitespace-pre-wrap">{m.text}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] text-muted-foreground">{m.time}</p>
                <button
                  onClick={() => setConfirmDeleteMemoId(m.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-destructive"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <div ref={memoBottomRef} />
        </div>
      )}
      {confirmDeleteMemoId && (
        <ConfirmDialog
          message="このメモを削除します。この操作は取り消せません。"
          onConfirm={() => { deleteMemo(confirmDeleteMemoId); setConfirmDeleteMemoId(null) }}
          onCancel={() => setConfirmDeleteMemoId(null)}
        />
      )}
      <div className="flex gap-1.5 items-end">
        <textarea
          ref={textareaRef}
          defaultValue=""
          placeholder="メモを追加... (Ctrl+Enter で登録)"
          rows={2}
          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/50 transition-all resize-none bg-background overflow-hidden"
          onInput={e => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = t.scrollHeight + "px" }}
          onKeyDown={e => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              addMemo()
            }
          }}
        />
        <button
          onClick={addMemo}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          <Send size={11} />
        </button>
      </div>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Project detail panel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ProjectDetailPanel({ project, meta, onMetaChange, onRenameProject }: {
  project: Project; meta: ProjectMeta; onMetaChange: (u: Partial<ProjectMeta>) => void
  onRenameProject?: (name: string) => void
}) {
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(project.name)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setNameValue(project.name) }, [project.name])
  useEffect(() => { if (editingName) nameRef.current?.focus() }, [editingName])

  const commitRename = () => {
    const v = nameValue.trim()
    if (v && v !== project.name) onRenameProject?.(v)
    else setNameValue(project.name)
    setEditingName(false)
  }

  const totalTasks = project.goals.reduce((s, g) => s + g.totalCount, 0)
  const doneTasks  = project.goals.reduce((s, g) => s + g.completedCount, 0)
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <aside className="flex flex-col h-full bg-card border-l border-border flex-[3] min-w-0">
      <div className="px-4 h-12 border-b border-border flex-shrink-0 flex items-center gap-2">
        <Folder size={14} className="text-muted-foreground" />
        <p className="text-xs font-semibold text-muted-foreground">プロジェクト詳細</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0" style={{ backgroundColor: project.color }}>{totalTasks}</span>
            {editingName ? (
              <input
                ref={nameRef}
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") { setNameValue(project.name); setEditingName(false) } }}
                className="flex-1 font-bold text-foreground text-lg leading-snug bg-transparent border-b-2 border-primary outline-none"
              />
            ) : (
              <h2
                className="font-bold text-foreground text-lg leading-snug cursor-text hover:bg-muted rounded px-0.5 -mx-0.5 transition-colors"
                onDoubleClick={() => { setNameValue(project.name); setEditingName(true) }}
                title="ダブルクリックで編集"
              >{project.name}</h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: project.color }} />
            </div>
            <span className="text-xs font-semibold text-muted-foreground flex-shrink-0">{pct}%</span>
            <span className="text-xs text-muted-foreground flex-shrink-0">{doneTasks}/{totalTasks}</span>
          </div>
        </div>
        <div className="px-4 py-3 border-b border-border">
          <SectionHeader icon={<BookOpen size={13} />} label="プロジェクト概要" />
          <MetaTextarea value={meta.description} onChange={v => onMetaChange({ description: v })} placeholder="目的・概要を記入..." rows={4} />
        </div>
        <div className="px-4 py-3 border-b border-border">
          <SectionHeader icon={<Flag size={13} className="text-rose-500" />} label="達成目標" color="text-rose-500" />
          <MetaTextarea value={meta.targetOutcome} onChange={v => onMetaChange({ targetOutcome: v })} placeholder="達成したいことを記入..." rows={3} />
        </div>
        <div className="px-4 py-3 border-b border-border">
          <SectionHeader icon={<AlertTriangle size={13} className="text-amber-500" />} label="リスク・注意事項" color="text-amber-500" />
          <MetaTextarea value={meta.risks} onChange={v => onMetaChange({ risks: v })} placeholder="想定リスクや注意点を記入..." rows={3} />
        </div>
        <MemoSection entityType="project" entityId={project.id} />
      </div>
    </aside>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Goal detail panel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function GoalDetailPanel({ goal, meta, onMetaChange, onRenameGoal }: {
  goal: Goal; meta: GoalMeta; onMetaChange: (u: Partial<GoalMeta>) => void
  onRenameGoal?: (name: string) => void
}) {
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(goal.name)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setNameValue(goal.name) }, [goal.name])
  useEffect(() => { if (editingName) nameRef.current?.focus() }, [editingName])

  const commitRename = () => {
    const v = nameValue.trim()
    if (v && v !== goal.name) onRenameGoal?.(v)
    else setNameValue(goal.name)
    setEditingName(false)
  }

  const pct = goal.totalCount > 0 ? Math.round((goal.completedCount / goal.totalCount) * 100) : 0
  return (
    <aside className="flex flex-col h-full bg-card border-l border-border flex-[3] min-w-0">
      <div className="px-4 h-12 border-b border-border flex-shrink-0 flex items-center gap-2">
        <Target size={14} className="text-pink-500" />
        <p className="text-xs font-semibold text-muted-foreground">ゴール詳細</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 border-b border-border">
          {editingName ? (
            <input
              ref={nameRef}
              value={nameValue}
              onChange={e => setNameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") { setNameValue(goal.name); setEditingName(false) } }}
              className="w-full font-bold text-foreground text-lg leading-snug mb-3 bg-transparent border-b-2 border-primary outline-none"
            />
          ) : (
            <h2
              className="font-bold text-foreground text-lg leading-snug mb-3 cursor-text hover:bg-muted rounded px-0.5 -mx-0.5 transition-colors"
              onDoubleClick={() => { setNameValue(goal.name); setEditingName(true) }}
              title="ダブルクリックで編集"
            >{goal.name}</h2>
          )}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-semibold text-muted-foreground flex-shrink-0">{pct}%</span>
            <span className="text-xs text-muted-foreground flex-shrink-0">{goal.completedCount}/{goal.totalCount} 完了</span>
          </div>
        </div>
        <div className="px-4 py-3 border-b border-border">
          <SectionHeader icon={<BookOpen size={13} />} label="ゴール概要" />
          <MetaTextarea value={meta.description} onChange={v => onMetaChange({ description: v })} placeholder="目的・概要を記入..." rows={3} />
        </div>
        <div className="px-4 py-3 border-b border-border">
          <SectionHeader icon={<Flag size={13} className="text-rose-500" />} label="達成指標" color="text-rose-500" />
          <MetaTextarea value={meta.targetMetric} onChange={v => onMetaChange({ targetMetric: v })} placeholder="達成したいことを記入..." rows={3} />
        </div>
        <div className="px-4 py-3 border-b border-border">
          <SectionHeader icon={<AlertTriangle size={13} className="text-amber-500" />} label="リスク・注意事項" color="text-amber-500" />
          <MetaTextarea value={meta.notes} onChange={v => onMetaChange({ notes: v })} placeholder="想定リスクや注意点を記入..." rows={4} />
        </div>
        <MemoSection entityType="goal" entityId={goal.id} />
      </div>
    </aside>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Task detail panel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TaskDetailPanel({ detail, onStatusChange, onTaskTitleChange, onStartDateChange, onDueDateChange, onLabelsChange, onAddTask }: {
  detail: TaskDetail | null
  onStatusChange?: (taskId: string, newStatus: Status) => void
  onTaskTitleChange?: (taskId: string, newTitle: string) => void
  onStartDateChange?: (taskId: string, startDate: string) => void
  onDueDateChange?: (taskId: string, dueDate: string) => void
  onLabelsChange?: (taskId: string, labels: string[]) => void
  onAddTask?: () => void
}) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(detail?.title ?? "")
  const [labels, setLabels] = useState<string[]>(detail?.labels ?? [])
  const labelInputRef = useRef<HTMLInputElement>(null)
  const [workMemos, setWorkMemos] = useState<WorkMemo[]>([])
  const [confirmDeleteMemoId, setConfirmDeleteMemoId] = useState<string | null>(null)
  const taskMemoRef = useRef<HTMLTextAreaElement>(null)
  const taskMemoBottomRef = useRef<HTMLDivElement>(null)
  const [review, setReview] = useState<ReviewEntry>(
    detail?.reviewEntry ?? { good: "", bad: "", next: "" }
  )

  // メモをマウント時にフェッチ（PaneDetailのkeyがtask変更で変わるためremount）
  useEffect(() => {
    if (!detail?.id) return
    fetch(`/api/tasks/${detail.id}/memos`)
      .then(r => r.json())
      .then((data: { id: string; text: string; createdAt: string }[]) => {
        setWorkMemos(data.map(m => ({ id: m.id, text: m.text, time: formatMemoTime(m.createdAt) })))
      })
      .catch(console.error)
  }, [detail?.id])

  // メモ追加時に最下部へスクロール
  useEffect(() => {
    taskMemoBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [workMemos])

  // YYYY/MM/DD or MM/DD → YYYY-MM-DD (for <input type="date">)
  const toInputValue = (d: string): string => {
    if (!d) return ""
    const ymd = d.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/)
    if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`
    return ""
  }
  const [startDateInput, setStartDateInput] = useState(toInputValue(detail?.startDate ?? ""))
  const [dueDateInput, setDueDateInput] = useState(toInputValue(detail?.dueDate ?? ""))
  const [dateError, setDateError] = useState<string | null>(null)
  const startDateRef = useRef<HTMLInputElement>(null)
  const dueDateRef = useRef<HTMLInputElement>(null)

  const validateDates = (start: string, due: string): boolean => {
    if (start && due && start > due) {
      setDateError("開始日は期限より前の日付を設定してください")
      return false
    }
    setDateError(null)
    return true
  }

  const handleStartDateChange = (v: string) => {
    setStartDateInput(v)
    if (!detail) return
    if (!validateDates(v, dueDateInput)) return
    const stored = v ? v.replace(/-/g, "/") : ""
    onStartDateChange?.(detail.id, stored)
  }

  const handleDueDateChange = (v: string) => {
    setDueDateInput(v)
    if (!detail) return
    if (!validateDates(startDateInput, v)) return
    const stored = v ? v.replace(/-/g, "/") : ""
    onDueDateChange?.(detail.id, stored)
  }

  const addLabel = () => {
    const val = (labelInputRef.current?.value ?? "").trim()
    if (!val || labels.includes(val)) return
    const next = [...labels, val]
    setLabels(next)
    if (detail) onLabelsChange?.(detail.id, next)
    if (labelInputRef.current) {
      labelInputRef.current.value = ""
      labelInputRef.current.focus()
    }
  }
  const removeLabel = (l: string) => {
    const next = labels.filter(x => x !== l)
    setLabels(next)
    if (detail) onLabelsChange?.(detail.id, next)
  }

  const addMemo = async () => {
    if (!detail) return
    const text = (taskMemoRef.current?.value ?? "").trim().replace(/\n{3,}/g, "\n\n")
    if (!text) return
    if (taskMemoRef.current) { taskMemoRef.current.value = ""; taskMemoRef.current.style.height = "auto" }
    const res = await api(`/api/tasks/${detail.id}/memos`, { method: "POST", body: JSON.stringify({ text }) })
    if (!res) return
    const m = await res.json()
    setWorkMemos(prev => [...prev, { id: m.id, text: m.text, time: formatMemoTime(m.createdAt) }])
  }

  const deleteMemo = (id: string) => {
    if (!detail) return
    setWorkMemos(prev => prev.filter(m => m.id !== id))
    api(`/api/tasks/${detail.id}/memos/${id}`, { method: "DELETE" })
  }

  if (!detail) {
    return (
      <aside className="flex flex-col h-full bg-card border-l border-border flex-[3] min-w-0">
        <div className="px-4 h-12 border-b border-border flex-shrink-0 flex items-center">
          <p className="text-xs font-semibold text-muted-foreground">選択中のタスク</p>
        </div>
        <div className="flex-1 flex items-center justify-center flex-col gap-2">
          <p className="text-sm text-muted-foreground/50">タスクを選択してください</p>
          <p className="text-xs text-muted-foreground/30">またはプロジェクト・ゴールの ℹ️ ボタンで詳細を表示</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="flex flex-col h-full bg-card border-l border-border flex-[3] min-w-0">
      {/* Header */}
      <div className="px-4 h-12 border-b border-border flex-shrink-0 flex items-center gap-2">
        <p className="text-xs font-semibold text-muted-foreground">選択中のタスク</p>
        {detail.day != null && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[15px] font-bold bg-muted text-muted-foreground">
            Day {detail.day}
          </span>
        )}
        {detail.isReview && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[15px] font-bold bg-amber-100 text-amber-600">
            振り返り
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Title + goal + status */}
        <div className="px-4 py-4 border-b border-border">
          {editingTitle ? (
            <input
              autoFocus
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={() => {
                const trimmed = titleValue.trim()
                if (trimmed && trimmed !== detail.title) onTaskTitleChange?.(detail.id, trimmed)
                else setTitleValue(detail.title)
                setEditingTitle(false)
              }}
              onKeyDown={e => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur()
                if (e.key === "Escape") { setTitleValue(detail.title); setEditingTitle(false) }
              }}
              className="w-full font-bold text-foreground leading-snug mb-1 bg-transparent border-b-2 border-primary outline-none"
              style={{ fontSize: 22 }}
            />
          ) : (
            <h2
              className="font-bold text-foreground leading-snug mb-1 cursor-text hover:bg-muted rounded px-0.5 -mx-0.5 transition-colors"
              style={{ fontSize: 22 }}
              onDoubleClick={() => { setTitleValue(detail.title); setEditingTitle(true) }}
              title="ダブルクリックで編集"
            >
              {detail.title}
            </h2>
          )}
          <div className="flex items-center gap-1 mb-3">
            <Target size={11} className="text-green-700" />
            <span className="text-[15px] text-green-700 font-medium">{detail.goalName}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <button
              onClick={() => onStatusChange?.(detail.id, STATUS_CYCLE[detail.status])}
              className={cn("inline-flex items-center justify-center gap-1 w-[80px] py-0.5 rounded-full text-[15px] font-medium hover:opacity-75 transition-opacity", STATUS_STYLE[detail.status])}
              title="クリックでステータス変更"
            >
              <StatusIcon status={detail.status} size="sm" />
              {STATUS_LABELS[detail.status]}
            </button>
          </div>
        </div>

        {/* 日程 */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-1.5 mb-3">
            <Calendar size={12} className="text-muted-foreground" />
            <span className="text-[14px] font-semibold text-muted-foreground tracking-widest uppercase">日程</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-8">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">開始日</span>
                <div className="flex items-center gap-1">
                  <input
                    ref={startDateRef}
                    type="date"
                    value={startDateInput}
                    onChange={e => handleStartDateChange(e.target.value)}
                    onKeyDown={e => e.preventDefault()}
                    onClick={() => startDateRef.current?.showPicker()}
                    className="w-[136px] text-xs text-foreground bg-muted border border-border rounded-lg px-3 py-1.5 outline-none focus:border-primary/50 transition-colors cursor-pointer"
                  />
                  <div className="w-4 flex items-center justify-center flex-shrink-0">
                    {startDateInput && (
                      <button onClick={() => handleStartDateChange("")} className="text-muted-foreground/50 hover:text-muted-foreground transition-colors" title="クリア">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">期限</span>
                <div className="flex items-center gap-1">
                  <input
                    ref={dueDateRef}
                    type="date"
                    value={dueDateInput}
                    onChange={e => handleDueDateChange(e.target.value)}
                    onKeyDown={e => e.preventDefault()}
                    onClick={() => dueDateRef.current?.showPicker()}
                    className="w-[136px] text-xs text-foreground bg-muted border border-border rounded-lg px-3 py-1.5 outline-none focus:border-primary/50 transition-colors cursor-pointer"
                  />
                  <div className="w-4 flex items-center justify-center flex-shrink-0">
                    {dueDateInput && (
                      <button onClick={() => handleDueDateChange("")} className="text-muted-foreground/50 hover:text-muted-foreground transition-colors" title="クリア">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {dateError && (
              <p className="text-xs text-red-500">{dateError}</p>
            )}
          </div>
        </div>

        {/* ラベル */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <Tag size={12} className="text-muted-foreground" />
            <span className="text-[14px] font-semibold text-muted-foreground tracking-widest uppercase">ラベル</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {labels.map((l, i) => (
              <span key={l} className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[15px] font-medium", LABEL_COLORS[i % LABEL_COLORS.length])}>
                {l}
                <button onClick={() => removeLabel(l)} className="hover:opacity-60 transition-opacity"><X size={9} /></button>
              </span>
            ))}
            <div className="inline-flex items-center gap-1">
              <input
                ref={labelInputRef}
                onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing) addLabel() }}
                placeholder="追加..."
                className="text-[15px] text-muted-foreground placeholder:text-muted-foreground/50 bg-transparent outline-none w-16 border-b border-transparent hover:border-border focus:border-primary transition-colors"
              />
              <button onClick={addLabel} className="text-muted-foreground/50 hover:text-primary transition-colors"><Plus size={11} /></button>
            </div>
          </div>
        </div>

        {/* 振り返りフォーム（reviewタスクのみ） */}
        {detail.isReview && (
          <div className="px-4 py-3 border-b border-border bg-amber-50">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[14px] font-bold text-amber-700 tracking-widest uppercase">振り返り</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 size={12} className="text-green-500" />
                  <span className="text-[15px] font-semibold text-green-700">できたこと</span>
                </div>
                <MetaTextarea
                  value={review.good}
                  onChange={v => setReview(r => ({ ...r, good: v }))}
                  placeholder="今週できたことを記入..."
                  rows={3}
                  className="bg-card border-green-100 focus:border-green-300"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <XCircle size={12} className="text-red-400" />
                  <span className="text-[15px] font-semibold text-red-600">できなかったこと</span>
                </div>
                <MetaTextarea
                  value={review.bad}
                  onChange={v => setReview(r => ({ ...r, bad: v }))}
                  placeholder="できなかったことを記入..."
                  rows={3}
                  className="bg-card border-red-100 focus:border-red-300"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowRight size={12} className="text-primary/70" />
                  <span className="text-[15px] font-semibold text-primary">来週の調整</span>
                </div>
                <MetaTextarea
                  value={review.next}
                  onChange={v => setReview(r => ({ ...r, next: v }))}
                  placeholder="来週変えること・続けることを記入..."
                  rows={3}
                  className="bg-card border-primary/30 focus:border-primary/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* 作業メモ */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 mb-3">
            <MessageSquare size={13} className="text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">作業メモ</span>
          </div>
          {workMemos.length > 0 && (
            <div className="space-y-2 mb-3">
              {workMemos.map((m, i) => (
                <div key={m.id ?? `wmemo-${i}`} className="rounded-lg bg-muted border border-border px-3 py-2 group">
                  <p className="text-xs text-foreground whitespace-pre-wrap">{m.text}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-muted-foreground">{m.time}</p>
                    <button
                      onClick={() => setConfirmDeleteMemoId(m.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/50 hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <div ref={taskMemoBottomRef} />
            </div>
          )}
          {confirmDeleteMemoId && (
            <ConfirmDialog
              message="このメモを削除します。この操作は取り消せません。"
              onConfirm={() => { deleteMemo(confirmDeleteMemoId); setConfirmDeleteMemoId(null) }}
              onCancel={() => setConfirmDeleteMemoId(null)}
            />
          )}
          <div className="flex gap-1.5 items-end">
            <textarea
              ref={taskMemoRef}
              defaultValue=""
              placeholder="作業メモを追加... (Ctrl+Enter で登録)"
              rows={2}
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-border outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/50 transition-all resize-none bg-background overflow-hidden"
              onInput={e => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = t.scrollHeight + "px" }}
              onKeyDown={e => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  addMemo()
                }
              }}
            />
            <button
              onClick={addMemo}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              <Send size={11} />
            </button>
          </div>
        </div>
      </div>

      {onAddTask && (
        <div className="p-3 border-t border-border flex-shrink-0">
          <button
            onClick={onAddTask}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg py-2.5 px-3 text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#008000" }}
          >
            <Plus size={12} /> タスクを追加する
          </button>
        </div>
      )}
    </aside>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function PaneDetail({
  mode, detail, onStatusChange, onTaskTitleChange, onStartDateChange, onDueDateChange, onLabelsChange, onAddTask,
  project, projectMeta, onProjectMetaChange, onRenameProject,
  goal, goalMeta, onGoalMetaChange, onRenameGoal,
}: PaneDetailProps) {
  if (mode === "project" && project && onProjectMetaChange) {
    const meta = projectMeta ?? { description: "", targetOutcome: "", kpiSummary: "", period: "", risks: "" }
    return <ProjectDetailPanel project={project} meta={meta} onMetaChange={onProjectMetaChange} onRenameProject={onRenameProject} />
  }
  if (mode === "goal" && goal && onGoalMetaChange) {
    const meta = goalMeta ?? { description: "", targetMetric: "", period: "", notes: "" }
    return <GoalDetailPanel goal={goal} meta={meta} onMetaChange={onGoalMetaChange} onRenameGoal={onRenameGoal} />
  }
  return <TaskDetailPanel detail={detail ?? null} onStatusChange={onStatusChange} onTaskTitleChange={onTaskTitleChange} onStartDateChange={onStartDateChange} onDueDateChange={onDueDateChange} onLabelsChange={onLabelsChange} onAddTask={onAddTask} />
}
