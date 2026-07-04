"use client"

import { useState, useRef, useEffect } from "react"
import { Category, Status, Task } from "@/lib/types"
import { TaskTreeNode } from "./TaskTreeNode"
import { Plus, CalendarCheck, ChevronDown, ChevronRight, Search, X, Eye, EyeOff, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "./ConfirmDialog"

interface PaneTreeProps {
  goalName: string
  onRenameGoal?: (name: string) => void
  categories: Category[]
  selectedTaskId: string | null
  onSelectTask: (id: string) => void
  taskStatusMap: Record<string, Status>
  onStatusChange: (taskId: string, newStatus: Status) => void
  todayDay: number
  onOpenTodayOverlay: () => void
  onAddTask: (catId: string) => void
  onRenameTask: (taskId: string, title: string) => void
  onDeleteTask: (taskId: string) => void
  onAddCategory: () => void
  onRenameCategory: (catId: string, name: string) => void
  onDeleteCategory: (catId: string) => void
  onReorderCategories?: (from: number, to: number) => void
}

function parseDateForSort(d?: string): number {
  if (!d) return Infinity
  const md = d.match(/^(\d{1,2})\/(\d{1,2})$/)
  if (md) return new Date(2026, parseInt(md[1]) - 1, parseInt(md[2])).getTime()
  const ymd = d.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/)
  if (ymd) return new Date(parseInt(ymd[1]), parseInt(ymd[2]) - 1, parseInt(ymd[3])).getTime()
  return Infinity
}

function sortByStartDate(a: Task, b: Task): number {
  const sa = parseDateForSort(a.startDate)
  const sb = parseDateForSort(b.startDate)
  if (sa !== sb) return sa - sb
  const dd = parseDateForSort(a.dueDate) - parseDateForSort(b.dueDate)
  if (dd !== 0) return dd
  return (a.day ?? Infinity) - (b.day ?? Infinity)
}

export function PaneTree({
  goalName, onRenameGoal, categories, selectedTaskId, onSelectTask,
  taskStatusMap, onStatusChange, todayDay, onOpenTodayOverlay,
  onAddTask, onRenameTask, onDeleteTask,
  onAddCategory, onRenameCategory, onDeleteCategory, onReorderCategories,
}: PaneTreeProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [showDone, setShowDone] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editingCatName, setEditingCatName] = useState("")
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const catInputRef = useRef<HTMLInputElement>(null)
  const [editingGoalName, setEditingGoalName] = useState(false)
  const [goalNameValue, setGoalNameValue] = useState(goalName)
  const goalNameRef = useRef<HTMLInputElement>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; type: "cat" | "task" } | null>(null)

  useEffect(() => { setGoalNameValue(goalName) }, [goalName])
  useEffect(() => { if (editingCatId) catInputRef.current?.focus() }, [editingCatId])
  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])
  useEffect(() => { if (editingGoalName) goalNameRef.current?.focus() }, [editingGoalName])

  const commitGoalRename = () => {
    const v = goalNameValue.trim()
    if (v && v !== goalName) onRenameGoal?.(v)
    else setGoalNameValue(goalName)
    setEditingGoalName(false)
  }

  const commitCatRename = () => {
    const v = editingCatName.trim()
    if (v && editingCatId) onRenameCategory(editingCatId, v)
    setEditingCatId(null)
  }

  // 検索モード
  const isSearchMode = searchOpen && searchQuery.trim() !== ""
  const flatSearchResults: Array<Task & { catName: string }> = isSearchMode
    ? categories.flatMap(cat =>
        cat.tasks
          .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
          .filter(t => showDone || (taskStatusMap[t.id] ?? t.status) !== "done")
          .map(t => ({ ...t, catName: cat.name }))
      ).sort(sortByStartDate)
    : []

  // 通常表示
  const visibleCategories = categories.map(cat => {
    let tasks = [...cat.tasks]
    if (!showDone) tasks = tasks.filter(t => (taskStatusMap[t.id] ?? t.status) !== "done")
    tasks = tasks.sort(sortByStartDate)
    return { ...cat, tasks }
  })

  const totalDone = categories.flatMap(c => c.tasks).filter(t => (taskStatusMap[t.id] ?? t.status) === "done").length

  return (
    <>
    <section className="flex flex-col h-full flex-[3] min-w-0 border-r border-border bg-card">

      {/* Header */}
      <div className="px-3 h-12 border-b border-border flex-shrink-0 flex items-center gap-2">
        <div className={cn(
          "flex items-center gap-2 flex-1 py-1.5 rounded-lg border px-3 transition-colors",
          searchOpen ? "bg-card border-primary/50" : "bg-muted border-border hover:border-primary/30"
        )}>
          <Search size={13} className={searchOpen ? "text-primary" : "text-muted-foreground"} />
          {searchOpen ? (
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="タスクを検索..."
              className="flex-1 text-xs text-foreground bg-transparent outline-none placeholder:text-muted-foreground/50"
            />
          ) : (
            <button className="flex-1 text-left text-xs text-muted-foreground" onClick={() => setSearchOpen(true)}>
              タスクを検索
            </button>
          )}
          {searchOpen && (
            <button onClick={() => { setSearchOpen(false); setSearchQuery("") }} className="text-muted-foreground hover:text-foreground">
              <X size={12} />
            </button>
          )}
        </div>

        <button
          onClick={onOpenTodayOverlay}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex-shrink-0 bg-muted border-border text-muted-foreground hover:bg-accent hover:border-primary/30 hover:text-primary"
        >
          <CalendarCheck size={12} />
          今日
        </button>
      </div>

      {/* Goal header */}
      <div className="px-4 py-3 flex-shrink-0 flex items-center justify-between">
        {editingGoalName ? (
          <input
            ref={goalNameRef}
            value={goalNameValue}
            onChange={e => setGoalNameValue(e.target.value)}
            onBlur={commitGoalRename}
            onKeyDown={e => { if (e.key === "Enter") commitGoalRename(); if (e.key === "Escape") { setGoalNameValue(goalName); setEditingGoalName(false) } }}
            className="flex-1 font-bold text-foreground leading-snug text-lg bg-transparent border-b-2 border-primary outline-none"
          />
        ) : (
          <h2
            className="font-bold text-foreground leading-snug text-lg cursor-text hover:bg-muted rounded px-0.5 -mx-0.5 transition-colors"
            onDoubleClick={() => { setGoalNameValue(goalName); setEditingGoalName(true) }}
            title="ダブルクリックで編集"
          >{goalName}</h2>
        )}
        {totalDone > 0 && (
          <button
            onClick={() => setShowDone(v => !v)}
            className={cn(
              "flex items-center gap-1 text-[13px] font-medium px-2 py-1 rounded-lg transition-colors",
              showDone ? "text-green-600 bg-green-50 hover:bg-green-100" : "text-muted-foreground hover:bg-muted"
            )}
            title={showDone ? "完了済みを非表示" : "完了済みを表示"}
          >
            {showDone ? <Eye size={11} /> : <EyeOff size={11} />}
            完了 {totalDone}件
          </button>
        )}
      </div>

      {/* タスク一覧 */}
      <div className="flex-1 overflow-y-auto py-2">

        {isSearchMode ? (
          <div>
            {flatSearchResults.length === 0 ? (
              <div className="mx-4 mt-4 py-6 rounded-lg border border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground">一致するタスクがありません</p>
              </div>
            ) : (
              <div>
                <p className="px-4 py-1 text-[13px] text-muted-foreground">{flatSearchResults.length} 件</p>
                {flatSearchResults.map(task => (
                  <div key={task.id} className="pl-4">
                    <TaskTreeNode
                      task={task} depth={0} selectedId={selectedTaskId} onSelect={onSelectTask}
                      taskStatusMap={taskStatusMap} onStatusChange={onStatusChange}
                      onRename={onRenameTask}
                      onDelete={t => setConfirmDelete({ id: t, name: task.title, type: "task" })}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {visibleCategories.map((cat, catIndex) => {
              const isCollapsed = collapsed[cat.id]
              const isDragging = dragIndex === catIndex
              const isOver = overIndex === catIndex && dragIndex !== catIndex
              return (
                <div
                  key={cat.id}
                  draggable
                  onDragStart={() => { setDragIndex(catIndex); setOverIndex(catIndex) }}
                  onDragEnter={() => setOverIndex(catIndex)}
                  onDragOver={e => e.preventDefault()}
                  onDragEnd={() => {
                    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
                      onReorderCategories?.(dragIndex, overIndex)
                    }
                    setDragIndex(null)
                    setOverIndex(null)
                  }}
                  style={{ opacity: isDragging ? 0.4 : 1 }}
                >
                  {catIndex > 0 && <div className="h-4" />}
                  <div className={cn(
                    "group/cat flex items-center gap-1.5 px-2 py-2 select-none mt-1 bg-muted/60 rounded-md mx-2",
                    isOver && "ring-2 ring-primary/40 ring-inset"
                  )}>
                    <GripVertical size={13} className="flex-shrink-0 text-muted-foreground/40 cursor-grab active:cursor-grabbing" />
                    <button onClick={() => setCollapsed(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))} className="flex-shrink-0">
                      {isCollapsed
                        ? <ChevronRight size={13} className="text-muted-foreground" />
                        : <ChevronDown size={13} className="text-muted-foreground" />}
                    </button>

                    {editingCatId === cat.id ? (
                      <input
                        ref={catInputRef} value={editingCatName}
                        onChange={e => setEditingCatName(e.target.value)}
                        onBlur={commitCatRename}
                        onKeyDown={e => { if (e.key === "Enter") commitCatRename(); if (e.key === "Escape") setEditingCatId(null); e.stopPropagation() }}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 text-[15px] font-bold text-muted-foreground bg-transparent border-b border-primary outline-none uppercase tracking-widest"
                      />
                    ) : (
                      <span
                        className="flex-1 text-[15px] font-bold text-muted-foreground uppercase tracking-widest truncate cursor-text"
                        onDoubleClick={e => { e.stopPropagation(); setEditingCatName(cat.name); setEditingCatId(cat.id) }}
                      >
                        {cat.name}
                      </span>
                    )}

                    <span className="text-[14px] font-semibold text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 flex-shrink-0">
                      {cat.tasks.length}
                    </span>

                    <div className="opacity-0 group-hover/cat:opacity-100 transition-opacity flex items-center gap-0.5">
                      <button onClick={() => onAddTask(cat.id)} className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-accent" title="タスク追加">
                        <Plus size={16} />
                      </button>
                      <button onClick={() => setConfirmDelete({ id: cat.id, name: cat.name, type: "cat" })} className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10" title="カテゴリ削除">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="pt-[5px] pb-[5px] pl-4">
                      {cat.tasks.map((task, ti) => (
                        <TaskTreeNode
                          key={task.id} task={task} depth={0} selectedId={selectedTaskId}
                          onSelect={onSelectTask} isLast={ti === cat.tasks.length - 1}
                          taskStatusMap={taskStatusMap} onStatusChange={onStatusChange}
                          onRename={onRenameTask}
                          onDelete={t => setConfirmDelete({ id: t, name: task.title, type: "task" })}
                        />
                      ))}
                      {cat.tasks.length === 0 && (
                        <button
                          onClick={() => onAddTask(cat.id)}
                          className="mx-4 mb-1 w-[calc(100%-2rem)] flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg py-2.5 px-3 text-white hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: "#008000" }}
                        >
                          <Plus size={12} /> タスクを追加する
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>

      <div className="p-3 border-t border-border flex-shrink-0">
        <button
          onClick={onAddCategory}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg py-2.5 px-3 text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#008000" }}
        >
          <Plus size={12} /> カテゴリを追加する
        </button>
      </div>
    </section>

    {confirmDelete && (
      <ConfirmDialog
        message={
          confirmDelete.type === "cat"
            ? `カテゴリ「${confirmDelete.name}」を削除します。含まれるタスクも全て削除されます。`
            : `タスク「${confirmDelete.name}」を削除します。この操作は取り消せません。`
        }
        onConfirm={() => {
          if (confirmDelete.type === "cat") onDeleteCategory(confirmDelete.id)
          else onDeleteTask(confirmDelete.id)
          setConfirmDelete(null)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    )}
    </>
  )
}
