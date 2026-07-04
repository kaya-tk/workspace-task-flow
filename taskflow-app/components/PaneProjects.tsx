"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Project } from "@/lib/types"
import { Plus, GripVertical, Info, Trash2 } from "lucide-react"

interface PaneProjectsProps {
  projects: Project[]
  selectedId: string
  onSelect: (id: string) => void
  onShowDetail: (id: string) => void
  onAdd: () => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onReorder: (from: number, to: number) => void
}

function countTasks(p: Project): number {
  return p.goals.reduce((s, g) => s + g.totalCount, 0)
}
function completedTasks(p: Project): number {
  return p.goals.reduce((s, g) => s + g.completedCount, 0)
}

export function PaneProjects({
  projects, selectedId, onSelect, onShowDetail, onAdd, onRename, onDelete, onReorder,
}: PaneProjectsProps) {
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
    <aside className="flex flex-col h-screen flex-shrink-0 border-r border-gray-200 bg-white" style={{ width: "calc(100vw * 2 / 16)" }}>

      <div className="px-4 h-[57px] border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <span className="text-xs font-semibold text-gray-400">プロジェクト</span>
        <button
          onClick={onAdd}
          title="プロジェクト追加"
          className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>

      {projects.length > 1 && (
        <div className="px-4 py-1.5 flex items-center gap-1 text-[10px] text-gray-400 border-b border-gray-100">
          <GripVertical size={10} className="flex-shrink-0" />
          ドラッグで並び替え可能
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-3 px-3">
        <div className="space-y-1">
          {projects.map((p, i) => {
            const isActive = selectedId === p.id
            const total = countTasks(p)
            const done = completedTasks(p)
            const pct = total > 0 ? (done / total) * 100 : 0
            const goal = p.goals[0]
            const isDragging = dragIndex === i
            const isOver = overIndex === i && dragIndex !== i

            return (
              <div
                key={p.id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragEnd={() => { onReorder(dragIndex!, overIndex ?? dragIndex!); setDragIndex(null); setOverIndex(null) }}
                onDragOver={e => { e.preventDefault(); setOverIndex(i) }}
                onDragLeave={() => setOverIndex(null)}
                className={cn(
                  "group relative rounded-xl transition-all cursor-grab active:cursor-grabbing",
                  isDragging ? "opacity-40 scale-[0.98]" : "opacity-100",
                  isOver ? "border-t-2 border-blue-400" : ""
                )}
              >
                <button
                  onClick={() => editingId !== p.id && onSelect(p.id)}
                  className={cn(
                    "w-full text-left rounded-xl px-3 py-2.5 transition-colors border",
                    isActive ? "bg-blue-50 border-blue-200" : "border-transparent hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
                      <GripVertical size={12} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-bold text-white transition-all"
                        style={{ backgroundColor: isActive ? p.color : "#d1d5db" }}
                      >
                        {total || "＋"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingId === p.id ? (
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
                          className="w-full text-xs font-semibold bg-white border border-blue-300 rounded px-1 outline-none"
                        />
                      ) : (
                        <p
                          className={cn("text-xs font-semibold leading-snug cursor-text", isActive ? "text-blue-700" : "text-gray-800")}
                          onDoubleClick={e => { e.stopPropagation(); setEditValue(p.name); setEditingId(p.id) }}
                        >
                          {p.name}
                        </p>
                      )}
                      {goal && editingId !== p.id && (
                        <p className="text-[12px] text-gray-400 mt-0.5 truncate">{goal.name}</p>
                      )}
                      <div className="mt-1.5 h-1 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                      </div>
                    </div>
                  </div>
                </button>

                {/* ホバー操作ボタン */}
                <div className="absolute right-1 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <button
                    onClick={e => { e.stopPropagation(); onShowDetail(p.id) }}
                    title="詳細"
                    className={cn("w-5 h-5 flex items-center justify-center rounded", isActive ? "text-blue-400 hover:text-blue-600 hover:bg-blue-100" : "text-gray-300 hover:text-gray-500 hover:bg-gray-100")}
                  >
                    <Info size={11} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(p.id) }}
                    title="削除"
                    className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="px-4 py-4 border-t border-gray-100 flex-shrink-0">
        <span className="text-sm font-bold text-blue-600 tracking-tight">Task Flow</span>
      </div>
    </aside>
  )
}
