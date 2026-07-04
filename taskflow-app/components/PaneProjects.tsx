"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Project } from "@/lib/types"
import { Plus, Trash2, ChevronLeft, ChevronRight, Info } from "lucide-react"
import { ConfirmDialog } from "./ConfirmDialog"

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

function getProgress(p: Project) {
  const total = p.goals.reduce((s, g) => s + g.totalCount, 0)
  const done  = p.goals.reduce((s, g) => s + g.completedCount, 0)
  return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
}

export function PaneProjects({
  projects, selectedId, onSelect, onShowDetail, onAdd, onRename, onDelete, onReorder,
}: PaneProjectsProps) {
  const [collapsed, setCollapsed]   = useState(false)
  const [hoverId, setHoverId]       = useState<string | null>(null)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editValue, setEditValue]   = useState("")
  const [dragIndex, setDragIndex]   = useState<number | null>(null)
  const [overIndex, setOverIndex]   = useState<number | null>(null)
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
    <aside
      className={cn(
        "flex flex-col h-screen flex-shrink-0 transition-all duration-200 overflow-hidden",
        "bg-sidebar border-r border-sidebar-border",
        collapsed ? "w-12" : "w-[20vw]"
      )}
    >
      {/* ── Header ── */}
      <div className={cn(
        "flex items-center h-12 border-b border-sidebar-border flex-shrink-0",
        collapsed ? "justify-center px-0" : "justify-between px-3"
      )}>
        {!collapsed && (
          <span className="text-[13px] font-bold text-sidebar-muted tracking-widest uppercase">
            Projects
          </span>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="w-7 h-7 flex items-center justify-center rounded-md text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          title={collapsed ? "展開" : "折りたたむ"}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* ── Project list ── */}
      <div className="flex-1 overflow-y-auto py-2">
        {projects.map((p, i) => {
          const { total, pct } = getProgress(p)
          const isSelected = p.id === selectedId
          const isHovered  = hoverId === p.id

          return (
            <div
              key={p.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={e => { e.preventDefault(); setOverIndex(i) }}
              onDragEnd={() => {
                if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex)
                  onReorder(dragIndex, overIndex)
                setDragIndex(null); setOverIndex(null)
              }}
              onMouseEnter={() => setHoverId(p.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => editingId !== p.id && onSelect(p.id)}
              title={collapsed ? p.name : undefined}
              className={cn(
                "group relative flex items-center gap-2.5 mx-2 mb-[6px] rounded-md cursor-pointer transition-colors select-none",
                collapsed ? "px-2 py-2.5 justify-center" : "pl-2.5 pr-1 py-2",
                isSelected ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60",
                overIndex === i && dragIndex !== i && "border-t-2 border-sidebar-foreground/40"
              )}
            >
              {/* Color dot / indicator */}
              <span
                className="flex-shrink-0 size-2.5 rounded-full"
                style={{ backgroundColor: p.color }}
              />

              {!collapsed && (
                <>
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
                        className="w-full text-xs bg-transparent text-sidebar-foreground outline-none border-b border-sidebar-foreground/40"
                      />
                    ) : (
                      <p
                        className="text-xs text-sidebar-foreground leading-snug truncate"
                        onDoubleClick={e => {
                          e.stopPropagation()
                          setEditValue(p.name)
                          setEditingId(p.id)
                        }}
                      >
                        {p.name}
                      </p>
                    )}
                    {/* Progress bar */}
                    <div className="mt-1 h-0.5 rounded-full bg-sidebar-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: p.color }}
                      />
                    </div>
                  </div>

                  {/* Percentage + Hover actions */}
                  {editingId !== p.id && (
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <span className="text-[12px] text-sidebar-muted tabular-nums">{pct}%</span>
                      {isHovered && (
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmDelete({ id: p.id, name: p.name }) }}
                          title="削除"
                          className="w-6 h-6 flex items-center justify-center rounded text-sidebar-muted hover:text-red-400 hover:bg-sidebar-border transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Add / Footer ── */}
      <div className={cn("p-3 border-t border-sidebar-border flex-shrink-0", collapsed && "flex justify-center")}>
        {collapsed ? (
          <button
            onClick={onAdd}
            title="プロジェクト追加"
            className="size-9 flex items-center justify-center rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#008000" }}
          >
            <Plus size={14} />
          </button>
        ) : (
          <button
            onClick={onAdd}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg py-2.5 px-3 text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#008000" }}
          >
            <Plus size={13} /> プロジェクト追加
          </button>
        )}
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
