"use client"

import { useState, useRef, useEffect } from "react"
import { Task, Status } from "@/lib/types"
import { cn } from "@/lib/utils"

const STATUS_CYCLE: Record<Status, Status> = {
  todo: "inprogress",
  inprogress: "done",
  done: "hold",
  hold: "todo",
}

const STATUS_CONFIG: Record<Status, { label: string; dotCls: string; textCls: string; bgCls: string }> = {
  todo:       { label: "未着手",   dotCls: "bg-muted-foreground/40", textCls: "text-muted-foreground", bgCls: "bg-muted" },
  inprogress: { label: "進行中",   dotCls: "bg-blue-500",            textCls: "text-blue-600",         bgCls: "bg-blue-50" },
  done:       { label: "完了",     dotCls: "bg-green-500",           textCls: "text-green-700",        bgCls: "bg-green-50" },
  hold:       { label: "保留中",   dotCls: "bg-amber-400",           textCls: "text-amber-600",        bgCls: "bg-amber-50" },
}

interface TaskTreeNodeProps {
  task: Task
  depth: number
  selectedId: string | null
  onSelect: (id: string) => void
  isLast?: boolean
  taskStatusMap: Record<string, Status>
  onStatusChange: (taskId: string, newStatus: Status) => void
  onRename?: (taskId: string, newTitle: string) => void
  onDelete?: (taskId: string) => void
}

function formatDate(d?: string): string {
  if (!d) return ""
  // YYYY-MM-DD or YYYY/MM/DD → MM/DD
  const m = d.match(/^\d{4}[-\/](\d{1,2})[-\/](\d{1,2})/)
  if (m) return `${m[1].padStart(2, "0")}/${m[2].padStart(2, "0")}`
  return d
}

export function TaskTreeNode({
  task, depth, selectedId, onSelect, taskStatusMap, onStatusChange, onRename, onDelete,
}: TaskTreeNodeProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  const isSelected     = selectedId === task.id
  const effectiveStatus: Status = taskStatusMap[task.id] ?? task.status
  const isDone         = effectiveStatus === "done"
  const cfg            = STATUS_CONFIG[effectiveStatus]

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onStatusChange(task.id, STATUS_CYCLE[effectiveStatus])
  }

  const commitEdit = () => {
    const v = editValue.trim()
    if (v && v !== task.title) onRename?.(task.id, v)
    setEditing(false)
  }

  const from    = formatDate(task.startDate)
  const to      = formatDate(task.dueDate)

  const today = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d })()

  const parseTaskDate = (s?: string): Date | null => {
    if (!s) return null
    const m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
    if (!m) return null
    return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]))
  }

  // 開始日：今日以前（過去・今日）なら青、未来ならグレー
  const startDate = parseTaskDate(task.startDate)
  const isStartPastOrToday = startDate !== null && startDate <= today

  // 期限：今日以前（過去・今日）なら赤、未来なら青
  const dueDate = parseTaskDate(task.dueDate)
  const isDuePastOrToday = dueDate !== null && dueDate <= today  // 過去・今日 → 赤
  const isOverdue = isDuePastOrToday && !isDone                  // 完了タスクは除外

  const leftPad = depth > 0 ? depth * 20 + 20 : 6

  return (
    <div className="relative group/task">
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg cursor-pointer transition-colors border select-none py-2.5 pr-2 mb-[6px]",
          isSelected
            ? "bg-accent border-primary/30"
            : "border-transparent hover:bg-muted"
        )}
        style={{ paddingLeft: leftPad }}
        onClick={() => !editing && onSelect(task.id)}
      >
        {/* 開始日バッジ */}
        <div className="flex-shrink-0 flex justify-end" style={{ width: 36 }}>
          {from ? (
            <span className={cn(
              "text-[12px] font-semibold tabular-nums rounded px-1 py-0.5 leading-none",
              isDone
                ? "text-muted-foreground/40 bg-muted border border-border line-through"
                : isStartPastOrToday
                  ? "text-blue-600 bg-blue-50 border border-blue-200"
                  : "text-muted-foreground bg-muted border border-border"
            )}>
              {from}
            </span>
          ) : (
            <span className="text-[12px] text-border">—</span>
          )}
        </div>

        {/* タイトル */}
        {editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => {
              if (e.key === "Enter") commitEdit()
              if (e.key === "Escape") { setEditing(false); setEditValue(task.title) }
              e.stopPropagation()
            }}
            onClick={e => e.stopPropagation()}
            className="flex-1 text-sm bg-card border border-primary rounded px-1 outline-none"
          />
        ) : (
          <span
            className={cn(
              "flex-1 text-sm truncate",
              isDone
                ? "line-through text-muted-foreground/40"
                : isSelected
                  ? "text-accent-foreground font-medium"
                  : "text-foreground"
            )}
            onDoubleClick={e => { e.stopPropagation(); setEditValue(task.title); setEditing(true) }}
          >
            {task.title}
            {task.recurrence && (
              <span className="ml-1.5 text-[12px] text-primary/60 font-medium">↻</span>
            )}
          </span>
        )}

        {/* ゴミ箱（ホバー時） */}
        {onDelete && !editing && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(task.id) }}
            className="opacity-0 group-hover/task:opacity-100 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
            title="削除"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        )}

        {/* 期限バッジ */}
        <div className="flex-shrink-0 flex justify-end" style={{ width: 36 }}>
          {to ? (
            <span className={cn(
              "text-[12px] font-semibold tabular-nums rounded px-1 py-0.5 leading-none",
              isDone
                ? "text-muted-foreground/40 bg-muted border border-border line-through"
                : isDuePastOrToday
                  ? "text-red-600 bg-red-50 border border-red-200"
                  : "text-blue-600 bg-blue-50 border border-blue-200"
            )}>
              {to}
            </span>
          ) : (
            <span className="text-[12px] text-border">—</span>
          )}
        </div>

        {/* ステータスバッジ */}
        <button
          onClick={handleStatusClick}
          title="クリックでステータス変更"
          className={cn(
            "flex items-center justify-center gap-1 flex-shrink-0 w-[62px] py-0.5 rounded-full text-[13px] font-medium transition-opacity hover:opacity-70",
            cfg.bgCls, cfg.textCls
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dotCls)} />
          {cfg.label}
        </button>
      </div>
    </div>
  )
}
