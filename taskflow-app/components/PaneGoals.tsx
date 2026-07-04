"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Goal, GoalMeta, Project } from "@/lib/types"
import { Plus, Info, Trash2, GripVertical } from "lucide-react"
import { ConfirmDialog } from "./ConfirmDialog"

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
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editingId) inputRef.current?.focus() }, [editingId])

  const commitEdit = () => {
    const v = editValue.trim()
    if (v && editingId) onRename(editingId, v)
    setEditingId(null)
  }

  return (
    <>
    <aside className="flex flex-col h-full flex-[2] min-w-0 bg-card">
      <div className="flex items-center px-4 h-12 border-b border-border flex-shrink-0">
        <span className="text-[13px] font-bold text-muted-foreground tracking-widest uppercase">Goals</span>
      </div>

      <div
        className="flex-1 overflow-y-auto py-2 px-2 flex flex-col border-r border-border"
        onDragLeave={e => {
          // コンテナ外に出たときだけリセット
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverIndex(null)
        }}
      >
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
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); setOverIndex(i) }}
              className={cn(
                "group relative transition-all mb-1 cursor-grab active:cursor-grabbing",
                isDragging && "opacity-40 scale-[0.98]",
                isOver && "border-t-2 border-primary rounded-t"
              )}
            >
              <button
                onClick={() => editingId !== goal.id && onSelect(goal.id)}
                className={cn(
                  "w-full flex items-start gap-2.5 px-3 py-3 rounded-lg text-left transition-colors border",
                  isActive
                    ? "bg-accent border-primary/30 shadow-sm"
                    : "border-transparent hover:bg-muted"
                )}
              >
                <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
                  <GripVertical size={12} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-bold",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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
                      className="w-full text-xs font-medium bg-transparent border-b border-primary outline-none"
                    />
                  ) : (
                    <p
                      className={cn(
                        "text-xs font-medium leading-snug cursor-text",
                        isActive ? "text-accent-foreground" : "text-foreground"
                      )}
                      onDoubleClick={e => { e.stopPropagation(); setEditValue(goal.name); setEditingId(goal.id) }}
                    >
                      {goal.name}
                    </p>
                  )}
                  {editingId !== goal.id && (
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      {goal.completedCount} / {goal.totalCount} 完了
                    </p>
                  )}
                  {linkedProject && editingId !== goal.id && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: linkedProject.color }} />
                      <span className="text-[12px] font-medium truncate" style={{ color: linkedProject.color }}>
                        {linkedProject.name}
                      </span>
                    </div>
                  )}
                  <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </button>

              {/* Hover actions */}
              <div className="absolute right-2 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                <button
                  onClick={e => { e.stopPropagation(); setConfirmDelete({ id: goal.id, name: goal.name }) }}
                  title="削除"
                  className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}
        {/* 末尾ドロップゾーン */}
        <div
          className={cn(
            "flex-1 min-h-8 rounded transition-all",
            overIndex === goals.length && dragIndex !== null && dragIndex !== goals.length - 1
              ? "border-t-2 border-primary"
              : ""
          )}
          onDragOver={e => { e.preventDefault(); e.stopPropagation(); setOverIndex(goals.length) }}
        />
      </div>

      <div className="p-3 border-t border-border border-r border-border flex-shrink-0">
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg py-2.5 px-3 text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#008000" }}
        >
          <Plus size={12} /> ゴールを追加する
        </button>
      </div>
    </aside>

    {confirmDelete && (
      <ConfirmDialog
        message={`「${confirmDelete.name}」を削除します。この操作は取り消せません。`}
        onConfirm={() => { onDelete(confirmDelete.id); setConfirmDelete(null) }}
        onCancel={() => setConfirmDelete(null)}
      />
    )}
    </>
  )
}
