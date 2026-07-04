"use client"

import { useState, useRef, useEffect } from "react"
import { Task, Status } from "@/lib/types"
import { cn } from "@/lib/utils"

const STATUS_CYCLE: Record<Status, Status> = {
  todo: "inprogress",
  inprogress: "done",
  done: "todo",
}

const STATUS_CONFIG: Record<Status, { label: string; dotCls: string; textCls: string; bgCls: string }> = {
  todo:       { label: "未着手",   dotCls: "bg-gray-400",  textCls: "text-gray-500", bgCls: "bg-gray-50" },
  inprogress: { label: "進行中",   dotCls: "bg-blue-500",  textCls: "text-blue-600", bgCls: "bg-blue-50" },
  done:       { label: "完了済み", dotCls: "bg-green-500", textCls: "text-green-600", bgCls: "bg-green-50" },
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
  if (/^\d{1,2}\/\d{1,2}$/.test(d)) return d
  const m = d.match(/^\d{4}\/(\d{1,2})\/(\d{1,2})/)
  if (m) return `${m[1]}/${m[2]}`
  return d
}

export function TaskTreeNode({
  task, depth, selectedId, onSelect, taskStatusMap, onStatusChange, onRename, onDelete,
}: TaskTreeNodeProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  const isSelected = selectedId === task.id
  const effectiveStatus: Status = taskStatusMap[task.id] ?? task.status
  const isDone = effectiveStatus === "done"
  const cfg = STATUS_CONFIG[effectiveStatus]

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onStatusChange(task.id, STATUS_CYCLE[effectiveStatus])
  }

  const commitEdit = () => {
    const v = editValue.trim()
    if (v && v !== task.title) onRename?.(task.id, v)
    setEditing(false)
  }

  const to = formatDate(task.dueDate)
  const leftPad = depth > 0 ? depth * 20 + 20 : 6

  return (
    <div className="relative group/task">
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl cursor-pointer transition-colors border select-none py-1.5 pr-2 mb-0.5",
          isSelected ? "bg-blue-50 border-blue-200" : "border-transparent hover:bg-gray-50",
        )}
        style={{ paddingLeft: leftPad }}
        onClick={() => !editing && onSelect(task.id)}
      >
        {/* 日付バッジ */}
        <div className="flex-shrink-0 flex justify-end" style={{ width: 36 }}>
          {to ? (
            <span className="text-[10px] font-semibold tabular-nums text-blue-600 bg-blue-50 border border-blue-100 rounded px-1 py-0.5 leading-none">
              {to}
            </span>
          ) : (
            <span className="text-[10px] text-gray-200">—</span>
          )}
        </div>

        {/* タイトル（ダブルクリックで編集） */}
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
            className="flex-1 text-sm bg-white border border-blue-300 rounded px-1 outline-none"
          />
        ) : (
          <span
            className={cn(
              "flex-1 text-sm truncate",
              isDone ? "line-through text-gray-400" : isSelected ? "text-blue-700 font-medium" : "text-gray-800"
            )}
            onDoubleClick={e => { e.stopPropagation(); setEditValue(task.title); setEditing(true) }}
          >
            {task.title}
            {task.recurrence && (
              <span className="ml-1.5 text-[10px] text-purple-400 font-medium">↻</span>
            )}
          </span>
        )}

        {/* ゴミ箱（ホバー時） */}
        {onDelete && !editing && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(task.id) }}
            className="opacity-0 group-hover/task:opacity-100 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
            title="削除"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        )}

        {/* ステータスバッジ */}
        <button
          onClick={handleStatusClick}
          title="クリックでステータス変更"
          className={cn(
            "flex items-center gap-1 flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium transition-opacity hover:opacity-70",
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
