"use client"

import { useState } from "react"
import { Project, Status, Task } from "@/lib/types"
import { StatusIcon } from "./StatusIcon"
import { AlertTriangle, CalendarCheck, CalendarDays, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TodayTask {
  task: Task
  goalId: string
  goalName: string
  projectId: string
  projectName: string
  projectColor: string
  isOverdue: boolean
}

function collectTasks(projects: Project[], todayDay: number): { overdue: TodayTask[]; today: TodayTask[] } {
  const overdue: TodayTask[] = []
  const today: TodayTask[] = []

  for (const project of projects) {
    for (const goal of project.goals) {
      for (const cat of goal.categories) {
        for (const task of cat.tasks) {
          if (task.day == null) continue
          const entry: TodayTask = {
            task, goalId: goal.id, goalName: goal.name,
            projectId: project.id, projectName: project.name, projectColor: project.color,
            isOverdue: task.day < todayDay,
          }
          if (task.day === todayDay) today.push(entry)
          else if (task.day < todayDay) overdue.push(entry)
        }
      }
    }
  }

  overdue.sort((a, b) => (a.task.day ?? 0) - (b.task.day ?? 0))
  return { overdue, today }
}

// 今週のday範囲を計算（月曜始まり、PROJECT_START = 2026-04-26 = 日曜 = Day1）
function getWeekRange(todayDay: number): { start: number; end: number } {
  // PROJECT_START = 2026-04-26（日曜日）
  // Day 1 = 2026-04-26 = 日曜(0), Day 2 = 月曜(1) ...
  // weekday: 0=日, 1=月, ..., 6=土
  const weekday = (todayDay - 1 + 0) % 7 // Day1=日曜
  // 月曜始まり: 月=1, 火=2, ..., 日=7
  const daysSinceMonday = weekday === 0 ? 6 : weekday - 1
  const weekStart = todayDay - daysSinceMonday
  const weekEnd = weekStart + 6
  return { start: Math.max(1, weekStart), end: weekEnd }
}

function collectWeekTasks(projects: Project[], todayDay: number): TodayTask[] {
  const { start, end } = getWeekRange(todayDay)
  const tasks: TodayTask[] = []

  for (const project of projects) {
    for (const goal of project.goals) {
      for (const cat of goal.categories) {
        for (const task of cat.tasks) {
          if (task.day == null) continue
          if (task.day >= start && task.day <= end) {
            tasks.push({
              task, goalId: goal.id, goalName: goal.name,
              projectId: project.id, projectName: project.name, projectColor: project.color,
              isOverdue: task.day < todayDay,
            })
          }
        }
      }
    }
  }

  tasks.sort((a, b) => (a.task.day ?? 0) - (b.task.day ?? 0))
  return tasks
}

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"]
function dayLabel(day: number): string {
  const weekday = (day - 1) % 7
  return `Day${day} (${DAY_NAMES[weekday]})`
}

interface TodayTasksOverlayProps {
  projects: Project[]
  todayDay: number
  taskStatusMap: Record<string, Status>
  onSelectTask: (projectId: string, goalId: string, taskId: string) => void
  onClose: () => void
}

function TaskRow({
  task, goalId, goalName, projectId, projectName, projectColor, isOverdue, todayDay,
  status, onSelectTask, showDay,
}: TodayTask & { todayDay: number; status: Status; onSelectTask: (p: string, g: string, t: string) => void; showDay?: boolean }) {
  const isDone = status === "done"
  const daysLate = isOverdue && task.day != null ? todayDay - task.day : 0

  return (
    <button
      onClick={() => onSelectTask(projectId, goalId, task.id)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors group border",
        isDone
          ? "opacity-40 border-transparent hover:bg-gray-50"
          : isOverdue
            ? "border-red-100 bg-red-50 hover:bg-red-100"
            : "border-transparent hover:bg-blue-50"
      )}
    >
      <StatusIcon status={status} size="sm" />
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium leading-snug",
          isDone ? "line-through text-gray-400" : isOverdue ? "text-red-700 group-hover:text-red-800" : "text-gray-800 group-hover:text-blue-700"
        )}>
          {task.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: projectColor }} />
          <span className={cn("text-[11px] truncate", isOverdue && !isDone ? "text-red-400" : "text-gray-400")}>
            {projectName} · {goalName}
          </span>
          {showDay && task.day != null && (
            <span className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded",
              task.day === todayDay ? "text-blue-600 bg-blue-50" : "text-gray-500 bg-gray-100"
            )}>
              {dayLabel(task.day)}
            </span>
          )}
        </div>
      </div>
      {isOverdue && !isDone && (
        <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-100 rounded-full px-2 py-0.5 flex-shrink-0">
          <AlertTriangle size={9} />
          {daysLate}日超過
        </span>
      )}
    </button>
  )
}

type TabType = "today" | "week"

export function TodayTasksOverlay({ projects, todayDay, taskStatusMap, onSelectTask, onClose }: TodayTasksOverlayProps) {
  const [tab, setTab] = useState<TabType>("today")
  const { overdue, today } = collectTasks(projects, todayDay)
  const weekTasks = collectWeekTasks(projects, todayDay)

  const overdueIncomplete = overdue.filter(t => (taskStatusMap[t.task.id] ?? t.task.status) !== "done")
  const todayDoneCount = today.filter(t => (taskStatusMap[t.task.id] ?? t.task.status) === "done").length
  const weekDoneCount = weekTasks.filter(t => (taskStatusMap[t.task.id] ?? t.task.status) === "done").length
  const { start, end } = getWeekRange(todayDay)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(3px)" }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-6 max-h-[85vh] flex flex-col overflow-hidden">

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <CalendarCheck size={16} className="text-blue-500" />
            <span className="font-bold text-gray-900 text-base">タスク確認</span>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Day {todayDay}</span>
            {tab === "today" && overdueIncomplete.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-100 rounded-full px-2 py-0.5">
                <AlertTriangle size={9} />
                期限超過 {overdueIncomplete.length}件
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-100 flex-shrink-0">
          <button
            onClick={() => setTab("today")}
            className={cn(
              "flex items-center gap-1.5 px-5 py-3 text-sm font-semibold transition-colors border-b-2",
              tab === "today" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            <CalendarCheck size={13} />
            今日
          </button>
          <button
            onClick={() => setTab("week")}
            className={cn(
              "flex items-center gap-1.5 px-5 py-3 text-sm font-semibold transition-colors border-b-2",
              tab === "week" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
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
              <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                <CalendarCheck size={32} className="mb-3" />
                <p className="text-sm font-medium">今日のタスクはありません</p>
              </div>
            ) : (
              <div className="px-3 space-y-1">
                {overdueIncomplete.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 px-2 pt-1 pb-2">
                      <AlertTriangle size={11} className="text-red-400" />
                      <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest">期限超過・未完了</span>
                    </div>
                    {overdueIncomplete.map(item => (
                      <TaskRow key={item.task.id} {...item} todayDay={todayDay}
                        status={taskStatusMap[item.task.id] ?? item.task.status} onSelectTask={onSelectTask} />
                    ))}
                    {today.length > 0 && <div className="h-px bg-gray-100 my-2 mx-2" />}
                  </>
                )}
                {today.length > 0 && (
                  <>
                    {overdueIncomplete.length > 0 && (
                      <div className="flex items-center gap-2 px-2 pt-1 pb-2">
                        <CalendarCheck size={11} className="text-blue-400" />
                        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">今日</span>
                      </div>
                    )}
                    {today.map(item => (
                      <TaskRow key={item.task.id} {...item} todayDay={todayDay}
                        status={taskStatusMap[item.task.id] ?? item.task.status} onSelectTask={onSelectTask} />
                    ))}
                  </>
                )}
              </div>
            )
          )}

          {/* 今週タブ */}
          {tab === "week" && (
            weekTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                <CalendarDays size={32} className="mb-3" />
                <p className="text-sm font-medium">今週のタスクはありません</p>
              </div>
            ) : (
              <div className="px-3 space-y-1">
                <div className="flex items-center gap-2 px-2 pt-1 pb-2">
                  <CalendarDays size={11} className="text-purple-400" />
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest">
                    Day{start} – Day{end}
                  </span>
                </div>
                {weekTasks.map(item => (
                  <TaskRow key={item.task.id} {...item} todayDay={todayDay}
                    status={taskStatusMap[item.task.id] ?? item.task.status}
                    onSelectTask={onSelectTask} showDay={true} />
                ))}
              </div>
            )
          )}
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {tab === "today"
              ? `${todayDoneCount} / ${today.length} 完了（今日）`
              : `${weekDoneCount} / ${weekTasks.length} 完了（今週）`}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-700 transition-colors"
          >
            作業を始める
          </button>
        </div>
      </div>
    </div>
  )
}
