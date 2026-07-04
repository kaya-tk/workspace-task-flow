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
  const dow = today.getDay()
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
  categoryId: string
  categoryName: string
  goalId: string
  goalName: string
  projectId: string
  projectName: string
  projectColor: string
  isOverdue: boolean
}

// ── グループ化された表示用型 ─────────────────────────────────
interface CategoryGroup {
  categoryId: string
  categoryName: string
  tasks: TodayTask[]
}
interface GoalGroup {
  goalId: string
  goalName: string
  categories: CategoryGroup[]
}
interface ProjectGroup {
  projectId: string
  projectName: string
  projectColor: string
  goals: GoalGroup[]
}

function groupTasks(tasks: TodayTask[]): ProjectGroup[] {
  const projectMap = new Map<string, ProjectGroup>()
  for (const item of tasks) {
    if (!projectMap.has(item.projectId)) {
      projectMap.set(item.projectId, { projectId: item.projectId, projectName: item.projectName, projectColor: item.projectColor, goals: [] })
    }
    const pg = projectMap.get(item.projectId)!
    let gg = pg.goals.find(g => g.goalId === item.goalId)
    if (!gg) { gg = { goalId: item.goalId, goalName: item.goalName, categories: [] }; pg.goals.push(gg) }
    let cg = gg.categories.find(c => c.categoryId === item.categoryId)
    if (!cg) { cg = { categoryId: item.categoryId, categoryName: item.categoryName, tasks: [] }; gg.categories.push(cg) }
    cg.tasks.push(item)
  }
  return [...projectMap.values()]
}

// ── タスク収集（今日） ────────────────────────────────────────
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
            task,
            categoryId: cat.id, categoryName: cat.name,
            goalId: goal.id, goalName: goal.name,
            projectId: project.id, projectName: project.name, projectColor: project.color,
            isOverdue,
          }

          if (isOverdue) {
            overdue.push(entry)
          } else {
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

          const taskStart = start ?? weekStart
          const taskEnd = end ?? weekEnd
          if (taskStart <= weekEnd && taskEnd >= weekStart) {
            tasks.push({
              task,
              categoryId: cat.id, categoryName: cat.name,
              goalId: goal.id, goalName: goal.name,
              projectId: project.id, projectName: project.name, projectColor: project.color,
              isOverdue: !!(end && end < now),
            })
          }
        }
      }
    }
  }

  return tasks
}

// ── タスク行 ─────────────────────────────────────────────────
interface TaskRowProps extends TodayTask {
  status: Status
  onSelectTask: (p: string, g: string, t: string) => void
}

function TaskRow({ task, goalId, projectId, isOverdue, status, onSelectTask }: TaskRowProps) {
  const now = getToday()
  const endDate = parseDate(task.dueDate)
  const daysLate = isOverdue && endDate ? Math.floor((now.getTime() - endDate.getTime()) / 86400000) : 0
  const dueDateLabel = task.dueDate ? formatShortDate(parseDate(task.dueDate)!) : null

  return (
    <button
      onClick={() => onSelectTask(projectId, goalId, task.id)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors group",
        isOverdue ? "bg-red-50 hover:bg-red-100" : "hover:bg-accent"
      )}
    >
      <StatusIcon status={status} size="sm" />
      <p className={cn(
        "flex-1 min-w-0 text-sm font-medium leading-snug truncate",
        isOverdue ? "text-red-700" : "text-foreground"
      )}>
        {task.title}
      </p>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isOverdue && (
          <span className="flex items-center gap-0.5 text-[11px] font-bold text-red-500 bg-red-100 rounded-full px-1.5 py-0.5">
            <AlertTriangle size={9} />
            {daysLate}日
          </span>
        )}
        {dueDateLabel && !isOverdue && (
          <span className="text-[11px] font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5">
            {dueDateLabel}
          </span>
        )}
      </div>
    </button>
  )
}

// ── グループ表示 ─────────────────────────────────────────────
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace("#", "").match(/.{2}/g)
  if (!m || m.length < 3) return null
  return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) }
}

function GroupedTaskList({ groups, taskStatusMap, onSelectTask, showProject }: {
  groups: ProjectGroup[]
  taskStatusMap: Record<string, Status>
  onSelectTask: (p: string, g: string, t: string) => void
  showProject: boolean
}) {
  if (groups.length === 0) return null

  return (
    <div className="space-y-2">
      {groups.map(pg => {
        const rgb = hexToRgb(pg.projectColor)
        const bgStyle = showProject && rgb
          ? { backgroundColor: `rgba(${rgb.r},${rgb.g},${rgb.b},0.07)`, borderColor: `rgba(${rgb.r},${rgb.g},${rgb.b},0.25)` }
          : {}

        return (
          <div
            key={pg.projectId}
            className={showProject ? "rounded-xl border px-2 pb-2" : ""}
            style={bgStyle}
          >
            {showProject && (
              <div className="flex items-center gap-1.5 px-2 pt-2.5 pb-1">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: pg.projectColor }} />
                <span className="text-[12px] font-bold text-foreground">{pg.projectName}</span>
              </div>
            )}
            {pg.goals.map(gg => (
              <div key={gg.goalId} className="mt-1">
                <div className="flex items-center gap-1.5 px-2 py-0.5">
                  <span className="text-[11px] font-bold text-primary/60 uppercase tracking-widest truncate">{gg.goalName}</span>
                </div>
                {gg.categories.map(cg => (
                  <div key={cg.categoryId}>
                    <div className="flex items-center gap-1.5 px-2 py-0.5">
                      <span className="text-[11px] text-muted-foreground/60 font-medium truncate">— {cg.categoryName}</span>
                    </div>
                    <div className="space-y-0.5">
                      {cg.tasks.map(item => (
                        <TaskRow
                          key={item.task.id}
                          {...item}
                          status={taskStatusMap[item.task.id] ?? item.task.status}
                          onSelectTask={onSelectTask}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )
      })}
    </div>
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
  const [projectFilter, setProjectFilter] = useState<string>("all")

  const { overdue, today } = collectTodayTasks(projects)
  const weekTasks = collectWeekTasks(projects)
  const { weekStart, weekEnd } = getWeekBounds()

  // 完了済みを除外
  const overdueIncomplete = overdue.filter(t => (taskStatusMap[t.task.id] ?? t.task.status) !== "done")
  const todayIncomplete = today.filter(t => (taskStatusMap[t.task.id] ?? t.task.status) !== "done")
  const weekIncomplete = weekTasks.filter(t => (taskStatusMap[t.task.id] ?? t.task.status) !== "done")

  // プロジェクトフィルター
  const filterByProject = (tasks: TodayTask[]) =>
    projectFilter === "all" ? tasks : tasks.filter(t => t.projectId === projectFilter)

  const filteredOverdue = filterByProject(overdueIncomplete)
  const filteredToday = filterByProject(todayIncomplete)
  const filteredWeek = filterByProject(weekIncomplete)

  const todayAll = filteredToday.length + filteredOverdue.length
  const weekAll = filteredWeek.length

  // プロジェクトタブ（タスクがあるもののみ）
  const allTasks = tab === "today" ? [...overdueIncomplete, ...todayIncomplete] : weekIncomplete
  const activeProjectIds = new Set(allTasks.map(t => t.projectId))
  const projectTabs = projects.filter(p => activeProjectIds.has(p.id))

  const showProject = projectFilter === "all"

  // グループ化（ペイン順を維持：projects配列の順番に従って収集済み）
  const overdueGroups = groupTasks(filteredOverdue)
  const todayGroups = groupTasks(filteredToday)
  const weekGroups = groupTasks(filteredWeek)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(3px)" }}
    >
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-[45rem] mx-6 h-[80vh] flex flex-col overflow-hidden">

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <CalendarCheck size={15} className="text-primary" />
            <span className="font-bold text-foreground text-sm">タスク確認</span>
            {tab === "today" && overdueIncomplete.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-100 rounded-full px-2 py-0.5">
                <AlertTriangle size={9} />
                超過 {overdueIncomplete.length}件
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* 今日/今週 タブ */}
        <div className="flex border-b border-border flex-shrink-0">
          <button
            onClick={() => { setTab("today"); setProjectFilter("all") }}
            className={cn(
              "flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold transition-colors border-b-2",
              tab === "today" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <CalendarCheck size={13} />
            今日
          </button>
          <button
            onClick={() => { setTab("week"); setProjectFilter("all") }}
            className={cn(
              "flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold transition-colors border-b-2",
              tab === "week" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <CalendarDays size={13} />
            今週
          </button>
        </div>

        {/* プロジェクトフィルタータブ */}
        {projectTabs.length > 1 && (
          <div className="flex items-center gap-1 px-3 py-2 border-b border-border flex-shrink-0 overflow-x-auto">
            <button
              onClick={() => setProjectFilter("all")}
              className={cn(
                "flex-shrink-0 text-[12px] font-semibold px-3 py-1 rounded-full transition-colors",
                projectFilter === "all"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              すべて
            </button>
            {projectTabs.map(p => (
              <button
                key={p.id}
                onClick={() => setProjectFilter(p.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full transition-colors",
                  projectFilter === p.id ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                style={projectFilter === p.id ? { backgroundColor: p.color } : {}}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: projectFilter === p.id ? "rgba(255,255,255,0.8)" : p.color }}
                />
                {p.name}
              </button>
            ))}
          </div>
        )}

        {/* タスク一覧 */}
        <div className="flex-1 overflow-y-auto py-2">

          {/* 今日タブ */}
          {tab === "today" && (
            filteredOverdue.length === 0 && filteredToday.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-muted-foreground/40">
                <CalendarCheck size={28} className="mb-3" />
                <p className="text-sm font-medium">今日のタスクはありません</p>
              </div>
            ) : (
              <div className="px-2 space-y-2">
                {filteredOverdue.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
                      <AlertTriangle size={11} className="text-red-400" />
                      <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest">期限超過</span>
                    </div>
                    <GroupedTaskList groups={overdueGroups} taskStatusMap={taskStatusMap} onSelectTask={onSelectTask} showProject={showProject} />
                    {filteredToday.length > 0 && <div className="h-px bg-border my-2 mx-3" />}
                  </div>
                )}
                {filteredToday.length > 0 && (
                  <div>
                    {filteredOverdue.length > 0 && (
                      <div className="flex items-center gap-1.5 px-3 pb-1">
                        <CalendarCheck size={11} className="text-primary/70" />
                        <span className="text-[11px] font-bold text-primary/70 uppercase tracking-widest">進行中</span>
                      </div>
                    )}
                    <GroupedTaskList groups={todayGroups} taskStatusMap={taskStatusMap} onSelectTask={onSelectTask} showProject={showProject} />
                  </div>
                )}
              </div>
            )
          )}

          {/* 今週タブ */}
          {tab === "week" && (
            filteredWeek.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-muted-foreground/40">
                <CalendarDays size={28} className="mb-3" />
                <p className="text-sm font-medium">今週のタスクはありません</p>
              </div>
            ) : (
              <div className="px-2 pt-2">
                <div className="flex items-center gap-1.5 px-3 pb-1">
                  <CalendarDays size={11} className="text-purple-400" />
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest">
                    {formatShortDate(weekStart)} 〜 {formatShortDate(weekEnd)}
                  </span>
                </div>
                <GroupedTaskList groups={weekGroups} taskStatusMap={taskStatusMap} onSelectTask={onSelectTask} showProject={showProject} />
              </div>
            )
          )}
        </div>

        {/* フッター */}
        <div className="px-5 py-3 border-t border-border flex-shrink-0 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {tab === "today" ? `残り ${todayAll} 件（今日）` : `残り ${weekAll} 件（今週）`}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-foreground text-background hover:opacity-80 transition-opacity"
          >
            作業を始める
          </button>
        </div>
      </div>
    </div>
  )
}
