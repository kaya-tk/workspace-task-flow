"use client"

import { useState } from "react"
import { Project, Status, Task } from "@/lib/types"
import { StatusIcon } from "./StatusIcon"
import { AlertTriangle, CalendarCheck, CalendarDays, X } from "lucide-react"
import { cn } from "@/lib/utils"

// ── 日付ユーティリティ ───────────────────────────────────────
function parseDate(s?: string): Date | null {
  if (!s) return null
  const m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/)
  if (!m) return null
  return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]))
}

function getToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekBounds(): { weekStart: Date; weekEnd: Date } {
  const today = getToday()
  const dow = today.getDay() // 0=日
  const daysSinceMonday = dow === 0 ? 6 : dow - 1
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - daysSinceMonday)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  return { weekStart, weekEnd }
}

function formatShortDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// ── 型定義 ──────────────────────────────────────────────────
interface TodayTask {
  task: Task
  goalId: string
  goalName: string
  projectId: string
  projectName: string
  projectColor: string
  isOverdue: boolean
}

// ── タスク収集（今日） ────────────────────────────────────────
// 開始日 ≤ 今日 ≤ 期限 を満たすタスクを抽出
// 期限 < 今日 → 超過セクション
function collectTodayTasks(projects: Project[]): { overdue: TodayTask[]; today: TodayTask[] } {
  const now = getToday()
  const overdue: TodayTask[] = []
  const today: TodayTask[] = []

  for (const project of projects) {
    for (const goal of project.goals) {
      for (const cat of goal.categories) {
        for (const task of cat.tasks) {
          const start = parseDate(task.startDate)
          const end = parseDate(task.dueDate)
          if (!start && !end) continue

          const isOverdue = !!(end && end < now)
          const entry: TodayTask = {
            task, goalId: goal.id, goalName: goal.name,
            projectId: project.id, projectName: project.name, projectColor: project.color,
            isOverdue,
          }

          if (isOverdue) {
            overdue.push(entry)
          } else {
            // 開始日 ≤ 今日 かつ 期限 ≥ 今日（片方がない場合はオープン）
            const started = !start || start <= now
            const notEnded = !end || end >= now
            if (started && notEnded) today.push(entry)
          }
        }
      }
    }
  }

  overdue.sort((a, b) => {
    const da = parseDate(a.task.dueDate)?.getTime() ?? 0
    const db = parseDate(b.task.dueDate)?.getTime() ?? 0
    return da - db
  })
  return { overdue, today }
}

// ── タスク収集（今週） ────────────────────────────────────────
// タスクの [startDate, dueDate] 範囲が今週と重なるものを抽出
function collectWeekTasks(projects: Project[]): TodayTask[] {
  const { weekStart, weekEnd } = getWeekBounds()
  const now = getToday()
  const tasks: TodayTask[] = []

  for (const project of projects) {
    for (const goal of project.goals) {
      for (const cat of goal.categories) {
        for (const task of cat.tasks) {
          const start = parseDate(task.startDate)
          const end = parseDate(task.dueDate)
          if (!start && !end) continue

          // タスク範囲が今週と交差するか
          const taskStart = start ?? weekStart
          const taskEnd = end ?? weekEnd
          if (taskStart <= weekEnd && taskEnd >= weekStart) {
            tasks.push({
              task, goalId: goal.id, goalName: goal.name,
              projectId: project.id, projectName: project.name, projectColor: project.color,
              isOverdue: !!(end && end < now),
            })
          }
        }
      }
    }
  }

  tasks.sort((a, b) => {
    const da = (parseDate(a.task.startDate) ?? parseDate(a.task.dueDate))?.getTime() ?? 0
    const db = (parseDate(b.task.startDate) ?? parseDate(b.task.dueDate))?.getTime() ?? 0
    return da - db
  })
  return tasks
}

// ── タスク行 ─────────────────────────────────────────────────
interface TaskRowProps extends TodayTask {
  status: Status
  onSelectTask: (p: string, g: string, t: string) => void
  showDateRange?: boolean
}

function TaskRow({ task, goalName, projectId, goalId, projectName, projectColor, isOverdue, status, onSelectTask, showDateRange }: TaskRowProps) {
  const isDone = status === "done"
  const now = getToday()
  const endDate = parseDate(task.dueDate)
  const daysLate = isOverdue && endDate ? Math.floor((now.getTime() - endDate.getTime()) / 86400000) : 0

  const dateLabel = (() => {
    const s = task.startDate ? formatShortDate(parseDate(task.startDate)!) : null
    const e = task.dueDate ? formatShortDate(parseDate(task.dueDate)!) : null
    if (s && e) return `${s} 〜 ${e}`
    if (s) return `${s} 〜`
    if (e) return `〜 ${e}`
    return null
  })()

  return (
    <button
      onClick={() => onSelectTask(projectId, goalId, task.id)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors group border",
        isDone
          ? "opacity-40 border-transparent hover:bg-muted"
          : isOverdue
            ? "border-red-100 bg-red-50 hover:bg-red-100"
            : "border-transparent hover:bg-accent"
      )}
    >
      <StatusIcon status={status} size="sm" />
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium leading-snug",
          isDone ? "line-through text-muted-foreground" : isOverdue ? "text-red-700 group-hover:text-red-800" : "text-foreground group-hover:text-primary"
        )}>
          {task.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: projectColor }} />
          <span className={cn("text-[13px] truncate", isOverdue && !isDone ? "text-red-400" : "text-muted-foreground")}>
            {projectName} · {goalName}
          </span>
          {showDateRange && dateLabel && (
            <span className="text-[12px] font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5">
              {dateLabel}
            </span>
          )}
        </div>
      </div>
      {isOverdue && !isDone && (
        <span className="flex items-center gap-1 text-[12px] font-bold text-red-500 bg-red-100 rounded-full px-2 py-0.5 flex-shrink-0">
          <AlertTriangle size={9} />
          {daysLate}日超過
        </span>
      )}
    </button>
  )
}

// ── メインコンポーネント ──────────────────────────────────────
type TabType = "today" | "week"

interface TodayTasksOverlayProps {
  projects: Project[]
  todayDay: number
  taskStatusMap: Record<string, Status>
  onSelectTask: (projectId: string, goalId: string, taskId: string) => void
  onClose: () => void
}

export function TodayTasksOverlay({ projects, todayDay, taskStatusMap, onSelectTask, onClose }: TodayTasksOverlayProps) {
  const [tab, setTab] = useState<TabType>("today")
  const { overdue, today } = collectTodayTasks(projects)
  const weekTasks = collectWeekTasks(projects)
  const { weekStart, weekEnd } = getWeekBounds()

  const overdueIncomplete = overdue.filter(t => (taskStatusMap[t.task.id] ?? t.task.status) !== "done")
  const todayAll = today.length + overdueIncomplete.length
  const todayDoneCount = today.filter(t => (taskStatusMap[t.task.id] ?? t.task.status) === "done").length
  const weekDoneCount = weekTasks.filter(t => (taskStatusMap[t.task.id] ?? t.task.status) === "done").length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(3px)" }}
    >
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-xl mx-6 max-h-[85vh] flex flex-col overflow-hidden">

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <CalendarCheck size={16} className="text-primary" />
            <span className="font-bold text-foreground text-base">タスク確認</span>
            <span className="text-xs font-semibold text-muted-foreground bg-muted rounded-full px-2 py-0.5">Day {todayDay}</span>
            {tab === "today" && overdueIncomplete.length > 0 && (
              <span className="flex items-center gap-1 text-[12px] font-bold text-red-500 bg-red-100 rounded-full px-2 py-0.5">
                <AlertTriangle size={9} />
                期限超過 {overdueIncomplete.length}件
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-border flex-shrink-0">
          <button
            onClick={() => setTab("today")}
            className={cn(
              "flex items-center gap-1.5 px-5 py-3 text-sm font-semibold transition-colors border-b-2",
              tab === "today" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <CalendarCheck size={13} />
            今日
          </button>
          <button
            onClick={() => setTab("week")}
            className={cn(
              "flex items-center gap-1.5 px-5 py-3 text-sm font-semibold transition-colors border-b-2",
              tab === "week" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <CalendarDays size={13} />
            今週
          </button>
        </div>

        {/* タスク一覧 */}
        <div className="flex-1 overflow-y-auto py-3">

          {/* 今日タブ */}
          {tab === "today" && (
            overdueIncomplete.length === 0 && today.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40">
                <CalendarCheck size={32} className="mb-3" />
                <p className="text-sm font-medium">今日のタスクはありません</p>
              </div>
            ) : (
              <div className="px-3 space-y-1">
                {overdueIncomplete.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 px-2 pt-1 pb-2">
                      <AlertTriangle size={11} className="text-red-400" />
                      <span className="text-[13px] font-bold text-red-400 uppercase tracking-widest">期限超過・未完了</span>
                    </div>
                    {overdueIncomplete.map(item => (
                      <TaskRow key={item.task.id} {...item}
                        status={taskStatusMap[item.task.id] ?? item.task.status}
                        onSelectTask={onSelectTask} showDateRange />
                    ))}
                    {today.length > 0 && <div className="h-px bg-border my-2 mx-2" />}
                  </>
                )}
                {today.length > 0 && (
                  <>
                    {overdueIncomplete.length > 0 && (
                      <div className="flex items-center gap-2 px-2 pt-1 pb-2">
                        <CalendarCheck size={11} className="text-primary/70" />
                        <span className="text-[13px] font-bold text-primary/70 uppercase tracking-widest">進行中・本日期限</span>
                      </div>
                    )}
                    {today.map(item => (
                      <TaskRow key={item.task.id} {...item}
                        status={taskStatusMap[item.task.id] ?? item.task.status}
                        onSelectTask={onSelectTask} showDateRange />
                    ))}
                  </>
                )}
              </div>
            )
          )}

          {/* 今週タブ */}
          {tab === "week" && (
            weekTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40">
                <CalendarDays size={32} className="mb-3" />
                <p className="text-sm font-medium">今週のタスクはありません</p>
              </div>
            ) : (
              <div className="px-3 space-y-1">
                <div className="flex items-center gap-2 px-2 pt-1 pb-2">
                  <CalendarDays size={11} className="text-purple-400" />
                  <span className="text-[13px] font-bold text-purple-400 uppercase tracking-widest">
                    {formatShortDate(weekStart)} 〜 {formatShortDate(weekEnd)}
                  </span>
                </div>
                {weekTasks.map(item => (
                  <TaskRow key={item.task.id} {...item}
                    status={taskStatusMap[item.task.id] ?? item.task.status}
                    onSelectTask={onSelectTask} showDateRange={true} />
                ))}
              </div>
            )
          )}
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-border flex-shrink-0 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {tab === "today"
              ? `${todayDoneCount} / ${todayAll} 完了（今日）`
              : `${weekDoneCount} / ${weekTasks.length} 完了（今週）`}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-foreground text-background hover:opacity-80 transition-opacity"
          >
            作業を始める
          </button>
        </div>
      </div>
    </div>
  )
}
