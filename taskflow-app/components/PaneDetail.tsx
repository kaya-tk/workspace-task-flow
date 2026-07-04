"use client"

import { useState } from "react"
import { TaskDetail, Status, Project, Goal, ProjectMeta, GoalMeta, WorkMemo, ReviewEntry } from "@/lib/types"
import { StatusIcon } from "./StatusIcon"
import { cn } from "@/lib/utils"
import {
  MessageSquare, Lightbulb, Send, Calendar,
  Target, Clock, Tag, X, Plus,
  Folder, Flag, BarChart2, AlertTriangle, BookOpen, TrendingUp, CheckCircle2, XCircle, ArrowRight,
  RefreshCw,
} from "lucide-react"
import { Recurrence } from "@/lib/types"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface PaneDetailProps {
  mode: "task" | "project" | "goal"
  detail?: TaskDetail | null
  onStatusChange?: (taskId: string, newStatus: Status) => void
  onTaskTitleChange?: (taskId: string, newTitle: string) => void
  project?: Project | null
  projectMeta?: ProjectMeta | null
  onProjectMetaChange?: (updates: Partial<ProjectMeta>) => void
  goal?: Goal | null
  goalMeta?: GoalMeta | null
  onGoalMetaChange?: (updates: Partial<GoalMeta>) => void
  projects?: Project[]
  goalMetaMap?: Record<string, GoalMeta>
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STATUS_LABELS: Record<Status, string> = {
  todo: "未着手", inprogress: "進行中", done: "完了",
}
const STATUS_STYLE: Record<Status, string> = {
  todo:       "bg-gray-100 text-gray-600",
  inprogress: "bg-blue-50 text-blue-600 border border-blue-200",
  done:       "bg-green-50 text-green-600",
}
const STATUS_CYCLE: Record<Status, Status> = {
  todo: "inprogress", inprogress: "done", done: "todo",
}
const LABEL_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Sub-components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function SectionHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span className={color}>{icon}</span>
      <span className="text-[12px] font-semibold text-gray-500 tracking-widest uppercase">{label}</span>
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
        "w-full text-xs leading-relaxed text-gray-700 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 outline-none resize-none",
        "focus:border-blue-300 focus:bg-white transition-colors placeholder:text-gray-300",
        className
      )}
    />
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Project detail panel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ProjectDetailPanel({ project, meta, onMetaChange }: {
  project: Project; meta: ProjectMeta; onMetaChange: (u: Partial<ProjectMeta>) => void
}) {
  const totalTasks = project.goals.reduce((s, g) => s + g.totalCount, 0)
  const doneTasks  = project.goals.reduce((s, g) => s + g.completedCount, 0)
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <aside className="flex flex-col h-screen bg-white border-l border-gray-200 flex-1 min-w-0">
      <div className="px-4 h-[57px] border-b border-gray-100 flex-shrink-0 flex items-center gap-2">
        <Folder size={14} className="text-gray-400" />
        <p className="text-xs font-semibold text-gray-500">プロジェクト詳細</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: project.color }}>{totalTasks}</span>
            <h2 className="font-bold text-gray-900 text-lg leading-snug">{project.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: project.color }} />
            </div>
            <span className="text-xs font-semibold text-gray-500 flex-shrink-0">{pct}%</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{doneTasks}/{totalTasks}</span>
          </div>
        </div>
        <div className="px-4 py-3 border-b border-gray-100">
          <SectionHeader icon={<BookOpen size={13} />} label="プロジェクト概要" />
          <MetaTextarea value={meta.description} onChange={v => onMetaChange({ description: v })} placeholder="プロジェクトの目的・背景を記入..." rows={4} />
        </div>
        <div className="px-4 py-3 border-b border-gray-100">
          <SectionHeader icon={<Flag size={13} className="text-rose-500" />} label="達成目標" color="text-rose-500" />
          <MetaTextarea value={meta.targetOutcome} onChange={v => onMetaChange({ targetOutcome: v })} placeholder="このプロジェクトで達成したいことを記入..." rows={3} />
        </div>
        <div className="px-4 py-3 border-b border-gray-100">
          <SectionHeader icon={<BarChart2 size={13} className="text-blue-500" />} label="KPI・先行指標" color="text-blue-500" />
          <MetaTextarea value={meta.kpiSummary} onChange={v => onMetaChange({ kpiSummary: v })} placeholder="KPI / 先行指標を記入..." rows={3} />
        </div>
        <div className="px-4 py-3 border-b border-gray-100">
          <SectionHeader icon={<AlertTriangle size={13} className="text-amber-500" />} label="リスク・注意事項" color="text-amber-500" />
          <MetaTextarea value={meta.risks} onChange={v => onMetaChange({ risks: v })} placeholder="想定リスクや注意点を記入..." rows={3} />
        </div>
        <div className="px-4 py-3">
          <SectionHeader icon={<Lightbulb size={13} className="text-amber-400" />} label="メモ" />
          <MetaTextarea value={meta.comments} onChange={v => onMetaChange({ comments: v })} placeholder="メモを記入..." rows={4} />
        </div>
      </div>
    </aside>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Goal detail panel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function GoalDetailPanel({ goal, meta, onMetaChange }: {
  goal: Goal; meta: GoalMeta; onMetaChange: (u: Partial<GoalMeta>) => void
}) {
  const pct = goal.totalCount > 0 ? Math.round((goal.completedCount / goal.totalCount) * 100) : 0
  return (
    <aside className="flex flex-col h-screen bg-white border-l border-gray-200 flex-1 min-w-0">
      <div className="px-4 h-[57px] border-b border-gray-100 flex-shrink-0 flex items-center gap-2">
        <Target size={14} className="text-pink-500" />
        <p className="text-xs font-semibold text-gray-500">ゴール詳細</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg leading-snug mb-3">{goal.name}</h2>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-500 flex-shrink-0">{pct}%</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{goal.completedCount}/{goal.totalCount} 完了</span>
          </div>
        </div>
        <div className="px-4 py-3 border-b border-gray-100">
          <SectionHeader icon={<BookOpen size={13} />} label="ゴール概要" />
          <MetaTextarea value={meta.description} onChange={v => onMetaChange({ description: v })} placeholder="このゴールの目的・概要を記入..." rows={3} />
        </div>
        <div className="px-4 py-3 border-b border-gray-100">
          <SectionHeader icon={<TrendingUp size={13} className="text-blue-500" />} label="達成指標" color="text-blue-500" />
          <MetaTextarea value={meta.targetMetric} onChange={v => onMetaChange({ targetMetric: v })} placeholder="何をもって達成とするか記入..." rows={3} />
        </div>
        <div className="px-4 py-3 border-b border-gray-100">
          <SectionHeader icon={<AlertTriangle size={13} className="text-amber-500" />} label="重要事項・メモ" color="text-amber-500" />
          <MetaTextarea value={meta.notes} onChange={v => onMetaChange({ notes: v })} placeholder="重要な注意点やメモを記入..." rows={4} />
        </div>
        <div className="px-4 py-3">
          <SectionHeader icon={<Lightbulb size={13} className="text-amber-400" />} label="コメント" />
          <MetaTextarea value={meta.comments} onChange={v => onMetaChange({ comments: v })} placeholder="自由なコメントを記入..." rows={3} />
        </div>
      </div>
    </aside>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Recurrence picker
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"]
const WEEK_LABELS = ["第1", "第2", "第3", "第4", "第5"]

function RecurrencePicker({ value, onChange }: {
  value: Recurrence | undefined
  onChange: (r: Recurrence | undefined) => void
}) {
  const isActive = !!value
  const type = value?.type ?? "weekly"
  const weekday = value?.weekday ?? 0
  const week = value?.week ?? 1

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(isActive ? undefined : { type: "weekly", weekday: 0 })}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border",
            isActive
              ? "bg-purple-50 border-purple-200 text-purple-700"
              : "bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300"
          )}
        >
          <RefreshCw size={11} />
          {isActive ? "繰り返しあり" : "繰り返しなし"}
        </button>
        {isActive && (
          <button onClick={() => onChange(undefined)} className="text-gray-300 hover:text-gray-500 transition-colors">
            <X size={11} />
          </button>
        )}
      </div>

      {isActive && (
        <div className="rounded-xl border border-purple-100 bg-purple-50 p-3 space-y-3">
          {/* タイプ選択 */}
          <div className="flex gap-1.5">
            <button
              onClick={() => onChange({ type: "weekly", weekday })}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border",
                type === "weekly"
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-white border-gray-200 text-gray-500 hover:border-purple-300"
              )}
            >毎週</button>
            <button
              onClick={() => onChange({ type: "monthly-nth", week, weekday })}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border",
                type === "monthly-nth"
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-white border-gray-200 text-gray-500 hover:border-purple-300"
              )}
            >毎月</button>
          </div>

          {/* 毎月の場合：第N週選択 */}
          {type === "monthly-nth" && (
            <div>
              <p className="text-[11px] text-purple-500 font-medium mb-1.5">第N週</p>
              <div className="flex gap-1">
                {WEEK_LABELS.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => onChange({ type: "monthly-nth", week: i + 1, weekday })}
                    className={cn(
                      "flex-1 py-1 rounded-lg text-[11px] font-semibold border transition-colors",
                      week === i + 1
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-white border-gray-200 text-gray-500 hover:border-purple-300"
                    )}
                  >{label}</button>
                ))}
              </div>
            </div>
          )}

          {/* 曜日選択 */}
          <div>
            <p className="text-[11px] text-purple-500 font-medium mb-1.5">曜日</p>
            <div className="flex gap-1">
              {WEEKDAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => onChange({ ...value!, weekday: i })}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors",
                    weekday === i
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-white border-gray-200 text-gray-500 hover:border-purple-300"
                  )}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* サマリー表示 */}
          <p className="text-[11px] text-purple-600 font-medium">
            {type === "weekly"
              ? `毎週${WEEKDAY_LABELS[weekday]}曜日`
              : `毎月${WEEK_LABELS[(week ?? 1) - 1]}${WEEKDAY_LABELS[weekday]}曜日`}
          </p>
        </div>
      )}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Task detail panel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TaskDetailPanel({ detail, onStatusChange, onTaskTitleChange }: {
  detail: TaskDetail | null
  onStatusChange?: (taskId: string, newStatus: Status) => void
  onTaskTitleChange?: (taskId: string, newTitle: string) => void
}) {
  const [estimate, setEstimate] = useState(detail?.estimate ?? "")
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(detail?.title ?? "")
  const [labels, setLabels] = useState<string[]>(detail?.labels ?? [])
  const [labelInput, setLabelInput] = useState("")
  const [memoInput, setMemoInput] = useState("")
  const [workMemos, setWorkMemos] = useState<WorkMemo[]>(detail?.workMemos ?? [])
  const [review, setReview] = useState<ReviewEntry>(
    detail?.reviewEntry ?? { good: "", bad: "", next: "" }
  )
  const [recurrence, setRecurrence] = useState<Recurrence | undefined>(detail?.recurrence)

  const addLabel = () => {
    const val = labelInput.trim()
    if (!val || labels.includes(val)) return
    setLabels(prev => [...prev, val])
    setLabelInput("")
  }
  const removeLabel = (l: string) => setLabels(prev => prev.filter(x => x !== l))

  const addMemo = () => {
    const text = memoInput.trim()
    if (!text) return
    const now = new Date()
    const time = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`
    setWorkMemos(prev => [...prev, { id: `memo-${Date.now()}`, text, time }])
    setMemoInput("")
  }

  if (!detail) {
    return (
      <aside className="flex flex-col h-screen bg-white border-l border-gray-200 flex-1 min-w-0">
        <div className="px-4 h-[57px] border-b border-gray-100 flex-shrink-0 flex items-center">
          <p className="text-xs font-semibold text-gray-400">選択中のタスク</p>
        </div>
        <div className="flex-1 flex items-center justify-center flex-col gap-2">
          <p className="text-sm text-gray-300">タスクを選択してください</p>
          <p className="text-xs text-gray-200">またはプロジェクト・ゴールの ℹ️ ボタンで詳細を表示</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="flex flex-col h-screen bg-white border-l border-gray-200 flex-1 min-w-0">
      {/* Header */}
      <div className="px-4 h-[57px] border-b border-gray-100 flex-shrink-0 flex items-center gap-2">
        <p className="text-xs font-semibold text-gray-400">選択中のタスク</p>
        {detail.day != null && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500">
            Day {detail.day}
          </span>
        )}
        {detail.isReview && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-600">
            振り返り
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Title + goal + status */}
        <div className="px-4 py-4 border-b border-gray-100">
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
              className="w-full font-bold text-gray-900 leading-snug mb-1 bg-transparent border-b-2 border-blue-400 outline-none"
              style={{ fontSize: 20 }}
            />
          ) : (
            <h2
              className="font-bold text-gray-900 leading-snug mb-1 cursor-text hover:bg-gray-50 rounded px-0.5 -mx-0.5 transition-colors"
              style={{ fontSize: 20 }}
              onDoubleClick={() => { setTitleValue(detail.title); setEditingTitle(true) }}
              title="ダブルクリックで編集"
            >
              {detail.title}
            </h2>
          )}
          <div className="flex items-center gap-1 mb-3">
            <Target size={11} className="text-pink-700" />
            <span className="text-[13px] text-pink-700 font-medium">{detail.goalName}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <button
              onClick={() => onStatusChange?.(detail.id, STATUS_CYCLE[detail.status])}
              className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[13px] font-medium hover:opacity-75 transition-opacity", STATUS_STYLE[detail.status])}
              title="クリックでステータス変更"
            >
              <StatusIcon status={detail.status} size="sm" />
              {STATUS_LABELS[detail.status]}
            </button>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[13px] font-medium bg-gray-100 text-gray-500">
              <Clock size={10} />
              <input
                value={estimate}
                onChange={e => setEstimate(e.target.value)}
                className="bg-transparent outline-none w-14 text-gray-500 font-medium"
                placeholder="工数"
              />
            </span>
          </div>
        </div>

        {/* ラベル */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-1.5 mb-2">
            <Tag size={12} className="text-gray-400" />
            <span className="text-[12px] font-semibold text-gray-400 tracking-widest uppercase">ラベル</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {labels.map((l, i) => (
              <span key={l} className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[13px] font-medium", LABEL_COLORS[i % LABEL_COLORS.length])}>
                {l}
                <button onClick={() => removeLabel(l)} className="hover:opacity-60 transition-opacity"><X size={9} /></button>
              </span>
            ))}
            <div className="inline-flex items-center gap-1">
              <input
                value={labelInput}
                onChange={e => setLabelInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addLabel() }}
                placeholder="追加..."
                className="text-[13px] text-gray-400 placeholder:text-gray-300 bg-transparent outline-none w-16 border-b border-transparent hover:border-gray-200 focus:border-blue-400 transition-colors"
              />
              <button onClick={addLabel} className="text-gray-300 hover:text-blue-500 transition-colors"><Plus size={11} /></button>
            </div>
          </div>
        </div>

        {/* 繰り返し設定 */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-1.5 mb-2">
            <RefreshCw size={12} className="text-purple-400" />
            <span className="text-[12px] font-semibold text-gray-500 tracking-widest uppercase">繰り返し</span>
          </div>
          <RecurrencePicker value={recurrence} onChange={setRecurrence} />
        </div>

        {/* 振り返りフォーム（reviewタスクのみ） */}
        {detail.isReview && (
          <div className="px-4 py-3 border-b border-gray-100 bg-amber-50">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[12px] font-bold text-amber-700 tracking-widest uppercase">振り返り</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 size={12} className="text-green-500" />
                  <span className="text-[11px] font-semibold text-green-700">できたこと</span>
                </div>
                <MetaTextarea
                  value={review.good}
                  onChange={v => setReview(r => ({ ...r, good: v }))}
                  placeholder="今週できたことを記入..."
                  rows={3}
                  className="bg-white border-green-100 focus:border-green-300"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <XCircle size={12} className="text-red-400" />
                  <span className="text-[11px] font-semibold text-red-600">できなかったこと</span>
                </div>
                <MetaTextarea
                  value={review.bad}
                  onChange={v => setReview(r => ({ ...r, bad: v }))}
                  placeholder="できなかったことを記入..."
                  rows={3}
                  className="bg-white border-red-100 focus:border-red-300"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowRight size={12} className="text-blue-400" />
                  <span className="text-[11px] font-semibold text-blue-600">来週の調整</span>
                </div>
                <MetaTextarea
                  value={review.next}
                  onChange={v => setReview(r => ({ ...r, next: v }))}
                  placeholder="来週変えること・続けることを記入..."
                  rows={3}
                  className="bg-white border-blue-100 focus:border-blue-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* 作業メモ */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 mb-3">
            <MessageSquare size={13} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-600">作業メモ</span>
          </div>
          {workMemos.length === 0 ? (
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-4 text-center mb-3">
              <p className="text-xs text-gray-400">作業メモを追加してください</p>
            </div>
          ) : (
            <div className="space-y-2 mb-3">
              {workMemos.map(m => (
                <div key={m.id} className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">{m.text}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{m.time}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-1.5">
            <input
              value={memoInput}
              onChange={e => setMemoInput(e.target.value)}
              placeholder="作業メモを追加..."
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-gray-700 placeholder:text-gray-300 transition-all"
              onKeyDown={e => { if (e.key === "Enter") addMemo() }}
            />
            <button
              onClick={addMemo}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex-shrink-0"
            >
              <Send size={11} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function PaneDetail({
  mode, detail, onStatusChange, onTaskTitleChange,
  project, projectMeta, onProjectMetaChange,
  goal, goalMeta, onGoalMetaChange,
}: PaneDetailProps) {
  if (mode === "project" && project && projectMeta && onProjectMetaChange)
    return <ProjectDetailPanel project={project} meta={projectMeta} onMetaChange={onProjectMetaChange} />
  if (mode === "goal" && goal && goalMeta && onGoalMetaChange)
    return <GoalDetailPanel goal={goal} meta={goalMeta} onMetaChange={onGoalMetaChange} />
  return <TaskDetailPanel detail={detail ?? null} onStatusChange={onStatusChange} onTaskTitleChange={onTaskTitleChange} />
}
