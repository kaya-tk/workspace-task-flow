"use client"

import { useState, useRef, useEffect } from "react"
import { Category, Status, Task } from "@/lib/types"
import { TaskTreeNode } from "./TaskTreeNode"
import { Plus, CalendarCheck, ChevronDown, ChevronRight, Search, X, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaneTreeProps {
  goalName: string
  categories: Category[]
  selectedTaskId: string | null
  onSelectTask: (id: string) => void
  taskStatusMap: Record<string, Status>
  onStatusChange: (taskId: string, newStatus: Status) => void
  todayDay: number
  onOpenTodayOverlay: () => void
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
  // 作業開始日が同じ・未設定の場合は dueDate → day の順でフォールバック
  const dd = parseDateForSort(a.dueDate) - parseDateForSort(b.dueDate)
  if (dd !== 0) return dd
  return (a.day ?? Infinity) - (b.day ?? Infinity)
}

function renameTaskInList(tasks: Task[], id: string, title: string): Task[] {
  return tasks.map(t => t.id === id ? { ...t, title } : t)
}

function deleteTaskInList(tasks: Task[], id: string): Task[] {
  return tasks.filter(t => t.id !== id)
}

interface UndoEntry { label: string; restore: () => void }

function UndoToast({ entry, onDone }: { entry: UndoEntry; onDone: () => void }) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone() }, 3500)
    return () => clearTimeout(t)
  }, [onDone])
  if (!visible) return null
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white text-xs rounded-xl px-4 py-2.5 shadow-lg">
      <span>「{entry.label}」を削除しました</span>
      <button onClick={() => { entry.restore(); setVisible(false); onDone() }} className="font-bold text-blue-300 hover:text-blue-200 transition-colors">元に戻す</button>
    </div>
  )
}

export function PaneTree({
  goalName, categories: initialCategories, selectedTaskId, onSelectTask,
  taskStatusMap, onStatusChange, todayDay, onOpenTodayOverlay,
}: PaneTreeProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [showDone, setShowDone] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const [editingCatId, setEditingCatId] = useState<string | null>(null)
  const [editingCatName, setEditingCatName] = useState("")
  const catInputRef = useRef<HTMLInputElement>(null)
  const [undoEntry, setUndoEntry] = useState<UndoEntry | null>(null)

  useEffect(() => { if (editingCatId) catInputRef.current?.focus() }, [editingCatId])
  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])

  const addTask = (catId: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === catId
        ? { ...cat, tasks: [...cat.tasks, { id: `task-${Date.now()}`, title: "新しいタスク", status: "todo" as Status, order: cat.tasks.length + 1 }] }
        : cat
    ))
  }

  const addCategory = () => {
    const id = `cat-${Date.now()}`
    setCategories(prev => [...prev, { id, name: "新しいカテゴリー", tasks: [] }])
  }

  const handleRenameTask = (taskId: string, newTitle: string) => {
    setCategories(prev => prev.map(cat => ({ ...cat, tasks: renameTaskInList(cat.tasks, taskId, newTitle) })))
  }

  const handleDeleteTask = (taskId: string) => {
    const snapshot = categories
    const task = categories.flatMap(c => c.tasks).find(t => t.id === taskId)
    setCategories(prev => prev.map(cat => ({ ...cat, tasks: deleteTaskInList(cat.tasks, taskId) })))
    setUndoEntry({ label: task?.title ?? "タスク", restore: () => setCategories(snapshot) })
  }

  const commitCatRename = () => {
    const v = editingCatName.trim()
    if (v && editingCatId)
      setCategories(prev => prev.map(cat => cat.id === editingCatId ? { ...cat, name: v } : cat))
    setEditingCatId(null)
  }

  const handleDeleteCategory = (catId: string) => {
    const snapshot = categories
    const cat = categories.find(c => c.id === catId)
    setCategories(prev => prev.filter(c => c.id !== catId))
    setUndoEntry({ label: cat?.name ?? "カテゴリー", restore: () => setCategories(snapshot) })
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
    <section className="flex flex-col h-screen flex-shrink-0 border-r border-gray-200 bg-white" style={{ width: "calc(100vw * 5 / 16)" }}>

      {/* Header */}
      <div className="px-3 h-[57px] border-b border-gray-100 flex-shrink-0 flex items-center gap-2">
        {/* 検索バー */}
        <div className={cn(
          "flex items-center gap-2 flex-1 py-1.5 rounded-xl border px-3 transition-colors",
          searchOpen ? "bg-white border-blue-300" : "bg-gray-50 border-gray-200 hover:border-gray-300"
        )}>
          <Search size={13} className={searchOpen ? "text-blue-500" : "text-gray-400"} />
          {searchOpen ? (
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="タスクを検索..."
              className="flex-1 text-xs text-gray-700 bg-transparent outline-none placeholder:text-gray-300"
            />
          ) : (
            <button className="flex-1 text-left text-xs text-gray-500 font-medium" onClick={() => setSearchOpen(true)}>
              タスクを検索
            </button>
          )}
          {searchOpen && (
            <button onClick={() => { setSearchOpen(false); setSearchQuery("") }} className="text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          )}
        </div>

        {/* 今日のタスクオーバーレイを開くボタン */}
        <button
          onClick={onOpenTodayOverlay}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex-shrink-0 bg-gray-50 border-gray-200 text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
        >
          <CalendarCheck size={12} />
          今日のタスク
        </button>
      </div>

      {/* Goal header */}
      <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
        <h2 className="font-bold text-gray-900 leading-snug" style={{ fontSize: 20 }}>{goalName}</h2>
        {totalDone > 0 && (
          <button
            onClick={() => setShowDone(v => !v)}
            className={cn(
              "flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg transition-colors",
              showDone ? "text-green-600 bg-green-50 hover:bg-green-100" : "text-gray-400 hover:bg-gray-100"
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
              <div className="mx-4 mt-4 py-6 rounded-xl border border-dashed border-gray-200 text-center">
                <p className="text-sm text-gray-300">一致するタスクがありません</p>
              </div>
            ) : (
              <div>
                <p className="px-4 py-1 text-[11px] text-gray-400">{flatSearchResults.length} 件</p>
                {flatSearchResults.map(task => (
                  <div key={task.id} className="pl-4">
                    <TaskTreeNode
                      task={task} depth={0} selectedId={selectedTaskId} onSelect={onSelectTask}
                      taskStatusMap={taskStatusMap} onStatusChange={onStatusChange}
                      onRename={handleRenameTask} onDelete={handleDeleteTask}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {visibleCategories.map((cat) => {
              const isCollapsed = collapsed[cat.id]
              return (
                <div key={cat.id}>
                  {/* カテゴリヘッダー */}
                  <div className="group/cat flex items-center gap-1.5 px-2 py-2 select-none mt-1">
                    <button onClick={() => setCollapsed(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))} className="flex-shrink-0">
                      {isCollapsed ? <ChevronRight size={13} className="text-gray-500" /> : <ChevronDown size={13} className="text-gray-500" />}
                    </button>

                    {editingCatId === cat.id ? (
                      <input
                        ref={catInputRef} value={editingCatName}
                        onChange={e => setEditingCatName(e.target.value)}
                        onBlur={commitCatRename}
                        onKeyDown={e => { if (e.key === "Enter") commitCatRename(); if (e.key === "Escape") setEditingCatId(null); e.stopPropagation() }}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 text-[12px] font-bold text-gray-600 bg-white border border-blue-300 rounded px-1 outline-none uppercase tracking-widest"
                      />
                    ) : (
                      <span
                        className="flex-1 text-[12px] font-bold text-gray-600 uppercase tracking-widest truncate cursor-text"
                        onDoubleClick={e => { e.stopPropagation(); setEditingCatName(cat.name); setEditingCatId(cat.id) }}
                      >
                        {cat.name}
                      </span>
                    )}

                    <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 flex-shrink-0">
                      {cat.tasks.length}
                    </span>
                    <span className="text-[9px] text-gray-300 flex-shrink-0 hidden group-hover/cat:inline">開始日順</span>

                    <div className="opacity-0 group-hover/cat:opacity-100 transition-opacity flex items-center gap-0.5">
                      <button onClick={() => addTask(cat.id)} className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="タスク追加">
                        <Plus size={11} />
                      </button>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50" title="カテゴリ削除">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="pb-1 pl-4">
                      {cat.tasks.map((task, ti) => (
                        <TaskTreeNode
                          key={task.id} task={task} depth={0} selectedId={selectedTaskId}
                          onSelect={onSelectTask} isLast={ti === cat.tasks.length - 1}
                          taskStatusMap={taskStatusMap} onStatusChange={onStatusChange}
                          onRename={handleRenameTask} onDelete={handleDeleteTask}
                        />
                      ))}
                      {cat.tasks.length === 0 && (
                        <div className="mx-4 mb-1 py-2 px-3 rounded-lg border border-dashed border-gray-200 text-[13px] text-gray-300 text-center">
                          タスクなし
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            <button onClick={addCategory} className="flex items-center gap-1.5 text-xs w-full mt-1 py-2 px-4 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <Plus size={12} /> カテゴリを追加する
            </button>
          </>
        )}
      </div>

      {undoEntry && <UndoToast entry={undoEntry} onDone={() => setUndoEntry(null)} />}
    </section>
  )
}
