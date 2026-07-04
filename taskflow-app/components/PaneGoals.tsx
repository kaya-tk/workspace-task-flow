"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Goal, GoalMeta, Project } from "@/lib/types"
import { Plus, Info, Trash2, GripVertical } from "lucide-react"

interface PaneGoalsProps {
  goals: Goal[]
  selectedId: string
  onSelect: (id: string) => void
  onShowDetail: (id: string) => void
  goalMetaMap?: Record<string, GoalMeta>
  projects?: Project[]
  onAdd: () => void
  onRename: (goalId: string, name: string) => void
  onDelete: (goalId: string) => void
  onReorder: (from: number, to: number) => void
}

export function PaneGoals({
  goals, selectedId, onSelect, onShowDetail, goalMetaMap, projects,
  onAdd, onRename, onDelete, onReorder,
}: PaneGoalsProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editingId) inputRef.current?.focus() }, [editingId])

  const commitEdit = () => {
    const v = editValue.trim()
    if (v && editingId) onRename(editingId, v)
    setEditingId(null)
  }

  return (
    <aside className="flex flex-col h-screen flex-shrink-0 border-r border-gray-200 bg-gray-50" style={{ width: "calc(100vw * 3 / 16)" }}>
      <div className="flex items-center justify-between px-4 h-[57px] border-b border-gray-100 flex-shrink-0">
        <span className="text-xs font-semibold text-gray-400 tracking-wide">ゴール</span>
        <button
          onClick={onAdd}
          title="ゴール追加"
          className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {goals.length > 1 && (
        <div className="px-4 py-1.5 flex items-center gap-1 text-[10px] text-gray-400 border-b border-gray-100">
          <GripVertical size={10} className="flex-shrink-0" />
          ドラッグで並び替え可能
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-2 px-3">
        {goals.map((goal, i) => {
          const pct = goal.totalCount > 0 ? (goal.completedCount / goal.totalCount) * 100 : 0
          const isActive = selectedId === goal.id
          const isDragging = dragIndex === i
          const isOver = overIndex === i && dragIndex !== i

          const meta = goalMetaMap?.[goal.id]
          const linkedProject = meta?.linkedProjectId
            ? projects?.find(p => p.id === meta.linkedProjectId)
            : null

          return (
            <div
              key={goal.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragEnd={() => { onReorder(dragIndex!, overIndex ?? dragIndex!); setDragIndex(null); setOverIndex(null) }}
              onDragOver={e => { e.preventDefault(); setOverIndex(i) }}
              onDragLeave={() => setOverIndex(null)}
              className={cn(
                "group relative transition-all mb-1 cursor-grab active:cursor-grabbing",
                isDragging ? "opacity-40 scale-[0.98]" : "opacity-100",
                isOver ? "border-t-2 border-blue-400 rounded-t" : ""
              )}
            >
              <button
                onClick={() => editingId !== goal.id && onSelect(goal.id)}
                className={cn(
                  "w-full flex items-start gap-2.5 px-3 py-3 rounded-xl text-left transition-colors border",
                  isActive ? "bg-white border-blue-200 shadow-sm" : "border-transparent hover:bg-white hover:border-gray-200"
                )}
              >
                <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
                  <GripVertical size={12} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-bold",
                    isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  )}>
                    {goal.totalCount}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pr-10">
                  {editingId === goal.id ? (
                    <input
                      ref={inputRef}
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={e => {
                        if (e.key === "Enter") commitEdit()
                        if (e.key === "Escape") setEditingId(null)
                        e.stopPropagation()
                      }}
                      onClick={e => e.stopPropagation()}
                      className="w-full text-xs font-medium bg-white border border-blue-300 rounded px-1 outline-none"
                    />
                  ) : (
                    <p
                      className={cn("text-xs font-medium leading-snug cursor-text", isActive ? "text-blue-700" : "text-gray-700")}
                      onDoubleClick={e => { e.stopPropagation(); setEditValue(goal.name); setEditingId(goal.id) }}
                    >
                      {goal.name}
                    </p>
                  )}
                  {editingId !== goal.id && (
                    <p className="text-[12px] text-gray-400 mt-0.5">{goal.completedCount} / {goal.totalCount} 完了</p>
                  )}

                  {linkedProject && editingId !== goal.id && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: linkedProject.color }} />
                      <span className="text-[10px] font-medium truncate" style={{ color: linkedProject.color }}>
                        {linkedProject.name}
                      </span>
                    </div>
                  )}

                  <div className="mt-2 h-1 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </button>

              {/* ホバー操作ボタン */}
              <div className="absolute right-2 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                <button
                  onClick={e => { e.stopPropagation(); onShowDetail(goal.id) }}
                  title="詳細"
                  className={cn("w-5 h-5 flex items-center justify-center rounded", isActive ? "text-blue-400 hover:text-blue-600 hover:bg-blue-100" : "text-gray-300 hover:text-gray-500 hover:bg-gray-100")}
                >
                  <Info size={12} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(goal.id) }}
                  title="削除"
                  className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
