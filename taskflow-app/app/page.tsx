"use client"

import { useState, useEffect } from "react"
import { PROJECTS, INITIAL_PROJECT_META, INITIAL_GOAL_META } from "@/lib/data"
import { Goal, Project, Status, Task, TaskDetail, ProjectMeta, GoalMeta } from "@/lib/types"
import { PaneProjects } from "@/components/PaneProjects"
import { PaneGoals } from "@/components/PaneGoals"
import { PaneTree } from "@/components/PaneTree"
import { PaneDetail } from "@/components/PaneDetail"
import { ProjectSplashModal } from "@/components/ProjectSplashModal"
import { TodayTasksOverlay } from "@/components/TodayTasksOverlay"

// ── 今日のDay番号を計算（Day1 = 2026/4/26）
const PROJECT_START = new Date("2026-04-26").getTime()
const TODAY_DAY = Math.max(1, Math.min(60,
  Math.floor((Date.now() - PROJECT_START) / 86_400_000) + 1
))

// ── タスク検索ヘルパー
function findTaskById(projects: Project[], id: string): Task | null {
  for (const proj of projects) {
    for (const goal of proj.goals) {
      for (const cat of goal.categories) {
        const found = cat.tasks.find(t => t.id === id)
        if (found) return found
      }
    }
  }
  return null
}

function deriveDetail(
  taskId: string | null,
  projects: Project[],
  goalName: string,
  projectName: string,
  taskStatusMap: Record<string, Status>,
): TaskDetail | null {
  if (!taskId) return null
  const task = findTaskById(projects, taskId)
  if (!task) return null
  return {
    id: task.id,
    title: task.title,
    status: taskStatusMap[taskId] ?? task.status,
    dueDate: task.dueDate ?? "",
    labels: [],
    estimate: "",
    goalName,
    projectName,
    workMemos: [],
    createdAt: "",
    updatedAt: "",
    day: task.day,
    recurrence: task.recurrence,
  }
}

// ── Undoトースト（グローバル）
interface UndoEntry { label: string; restore: () => void }
function GlobalUndoToast({ entry, onDone }: { entry: UndoEntry; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(), 3500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white text-xs rounded-xl px-4 py-2.5 shadow-lg">
      <span>「{entry.label}」を削除しました</span>
      <button onClick={() => { entry.restore(); onDone() }} className="font-bold text-blue-300 hover:text-blue-200">元に戻す</button>
    </div>
  )
}

type DetailMode = "task" | "project" | "goal"

export default function Home() {
  // ── プロジェクト（state に昇格 → CRUD対応）
  const [projects, setProjects] = useState<Project[]>(PROJECTS)

  // ── プロジェクト・ゴール選択
  const [selectedProjectId, setSelectedProjectId] = useState("roadmap")
  const [selectedGoalId, setSelectedGoalId] = useState("phase6")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  // ── 詳細パネルモード
  const [detailMode, setDetailMode] = useState<DetailMode>("task")

  // ── タスクステータスのオーバーライドマップ
  const [taskStatusMap, setTaskStatusMap] = useState<Record<string, Status>>({})

  // ── completedCount/totalCount をリアルタイム計算したプロジェクト一覧
  const resolvedProjects = projects.map(p => ({
    ...p,
    goals: p.goals.map(g => {
      const allTasks = g.categories.flatMap(c => c.tasks)
      return {
        ...g,
        completedCount: allTasks.filter(t => (taskStatusMap[t.id] ?? t.status) === "done").length,
        totalCount: allTasks.length,
      }
    }),
  }))

  // ── メタ情報
  const [projectMetaMap, setProjectMetaMap] = useState<Record<string, ProjectMeta>>(INITIAL_PROJECT_META)
  const [goalMetaMap, setGoalMetaMap] = useState<Record<string, GoalMeta>>(INITIAL_GOAL_META)

  // ── グローバルUndoトースト
  const [undoEntry, setUndoEntry] = useState<UndoEntry | null>(null)

  // ── 起動時「今日のタスク」オーバーレイ
  const [showTodayOverlay, setShowTodayOverlay] = useState(true)

  // ── スプラッシュモーダル（セッション内で一度表示したプロジェクトはスキップ）
  const [splashProjectId, setSplashProjectId] = useState<string | null>(null)
  const [seenProjectIds, setSeenProjectIds] = useState<Set<string>>(new Set([selectedProjectId]))

  // ── 派生データ（resolvedProjects から導出することで counts が常に最新）
  const project = resolvedProjects.find(p => p.id === selectedProjectId) ?? resolvedProjects[0]
  const goals: Goal[] = project?.goals ?? []
  const goal = goals.find(g => g.id === selectedGoalId) ?? goals[0]
  const taskDetail = deriveDetail(selectedTaskId, projects, goal?.name ?? "", project?.name ?? "", taskStatusMap)

  // ── 今日のタスクオーバーレイからタスク選択
  const handleSelectTodayTask = (projectId: string, goalId: string, taskId: string) => {
    setSelectedProjectId(projectId)
    setSelectedGoalId(goalId)
    setSelectedTaskId(taskId)
    setDetailMode("task")
    setShowTodayOverlay(false)
  }

  // ── ステータス変更
  const handleStatusChange = (taskId: string, newStatus: Status) => {
    setTaskStatusMap(prev => ({ ...prev, [taskId]: newStatus }))
  }

  // ── タスクタイトル変更
  const handleTaskTitleChange = (taskId: string, newTitle: string) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      goals: p.goals.map(g => ({
        ...g,
        categories: g.categories.map(c => ({
          ...c,
          tasks: c.tasks.map(t => t.id === taskId ? { ...t, title: newTitle } : t),
        })),
      })),
    })))
  }

  // ── プロジェクト切り替え
  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id)
    const proj = projects.find(p => p.id === id)
    const firstGoal = proj?.goals[0]
    if (firstGoal) setSelectedGoalId(firstGoal.id)
    setSelectedTaskId(null)
    setDetailMode("project")
    if (!seenProjectIds.has(id)) {
      setSplashProjectId(id)
      setSeenProjectIds(prev => new Set([...prev, id]))
    }
  }

  // ── ゴール切り替え
  const handleSelectGoal = (id: string) => {
    setSelectedGoalId(id)
    setSelectedTaskId(null)
    setDetailMode("goal")
  }

  // ── タスク選択
  const handleSelectTask = (id: string) => {
    setSelectedTaskId(id)
    setDetailMode("task")
  }

  // ── 詳細表示
  const handleShowProjectDetail = (id: string) => { setSelectedProjectId(id); setDetailMode("project") }
  const handleShowGoalDetail = (id: string) => { setSelectedGoalId(id); setDetailMode("goal") }

  // ── メタ更新
  const handleProjectMetaChange = (id: string, updates: Partial<ProjectMeta>) => {
    setProjectMetaMap(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }))
  }
  const handleGoalMetaChange = (id: string, updates: Partial<GoalMeta>) => {
    setGoalMetaMap(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }))
  }

  // ── プロジェクト CRUD
  const handleAddProject = () => {
    const id = `proj-${Date.now()}`
    const newProj: Project = { id, name: "新しいプロジェクト", color: "#6b7280", goals: [] }
    setProjects(prev => [...prev, newProj])
    setSelectedProjectId(id)
    setSelectedGoalId("")
    setSelectedTaskId(null)
    setDetailMode("project")
  }

  const handleRenameProject = (id: string, name: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p))
  }

  const handleDeleteProject = (id: string) => {
    const snap = projects
    const label = projects.find(p => p.id === id)?.name ?? "プロジェクト"
    setProjects(prev => {
      const next = prev.filter(p => p.id !== id)
      if (selectedProjectId === id && next.length > 0) {
        setSelectedProjectId(next[0].id)
        setSelectedGoalId(next[0].goals[0]?.id ?? "")
        setSelectedTaskId(null)
      }
      return next
    })
    setUndoEntry({ label, restore: () => setProjects(snap) })
  }

  const handleReorderProjects = (from: number, to: number) => {
    if (from === to) return
    setProjects(prev => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  // ── ゴール CRUD
  const handleAddGoal = () => {
    const id = `goal-${Date.now()}`
    const newGoal: Goal = { id, name: "新しいゴール", completedCount: 0, totalCount: 0, categories: [] }
    setProjects(prev => prev.map(p =>
      p.id === selectedProjectId ? { ...p, goals: [...p.goals, newGoal] } : p
    ))
    setSelectedGoalId(id)
    setSelectedTaskId(null)
    setDetailMode("goal")
  }

  const handleRenameGoal = (goalId: string, name: string) => {
    setProjects(prev => prev.map(p =>
      p.id === selectedProjectId
        ? { ...p, goals: p.goals.map(g => g.id === goalId ? { ...g, name } : g) }
        : p
    ))
  }

  const handleDeleteGoal = (goalId: string) => {
    const snap = projects
    const label = goals.find(g => g.id === goalId)?.name ?? "ゴール"
    setProjects(prev => prev.map(p => {
      if (p.id !== selectedProjectId) return p
      const next = p.goals.filter(g => g.id !== goalId)
      if (selectedGoalId === goalId) {
        setSelectedGoalId(next[0]?.id ?? "")
        setSelectedTaskId(null)
      }
      return { ...p, goals: next }
    }))
    setUndoEntry({ label, restore: () => setProjects(snap) })
  }

  const handleReorderGoals = (from: number, to: number) => {
    if (from === to) return
    setProjects(prev => prev.map(p => {
      if (p.id !== selectedProjectId) return p
      const next = [...p.goals]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return { ...p, goals: next }
    }))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <PaneProjects
        projects={resolvedProjects}
        selectedId={selectedProjectId}
        onSelect={handleSelectProject}
        onShowDetail={handleShowProjectDetail}
        onAdd={handleAddProject}
        onRename={handleRenameProject}
        onDelete={handleDeleteProject}
        onReorder={handleReorderProjects}
      />
      <PaneGoals
        key={selectedProjectId}
        goals={goals}
        selectedId={selectedGoalId}
        onSelect={handleSelectGoal}
        onShowDetail={handleShowGoalDetail}
        goalMetaMap={goalMetaMap}
        projects={projects}
        onAdd={handleAddGoal}
        onRename={handleRenameGoal}
        onDelete={handleDeleteGoal}
        onReorder={handleReorderGoals}
      />
      <PaneTree
        key={selectedGoalId}
        goalName={goal?.name ?? ""}
        categories={goal?.categories ?? []}
        selectedTaskId={selectedTaskId}
        onSelectTask={handleSelectTask}
        taskStatusMap={taskStatusMap}
        onStatusChange={handleStatusChange}
        todayDay={TODAY_DAY}
        onOpenTodayOverlay={() => setShowTodayOverlay(true)}
      />
      <PaneDetail
        key={`${detailMode}-${detailMode === "task" ? selectedTaskId : detailMode === "project" ? selectedProjectId : selectedGoalId}`}
        mode={detailMode}
        detail={taskDetail}
        onStatusChange={handleStatusChange}
        onTaskTitleChange={handleTaskTitleChange}
        project={project}
        projectMeta={projectMetaMap[selectedProjectId] ?? null}
        onProjectMetaChange={(updates) => handleProjectMetaChange(selectedProjectId, updates)}
        goal={goal}
        goalMeta={goalMetaMap[selectedGoalId] ?? null}
        onGoalMetaChange={(updates) => handleGoalMetaChange(selectedGoalId, updates)}
        projects={projects}
        goalMetaMap={goalMetaMap}
      />

      {undoEntry && <GlobalUndoToast entry={undoEntry} onDone={() => setUndoEntry(null)} />}

      {showTodayOverlay && (
        <TodayTasksOverlay
          projects={projects}
          todayDay={TODAY_DAY}
          taskStatusMap={taskStatusMap}
          onSelectTask={handleSelectTodayTask}
          onClose={() => setShowTodayOverlay(false)}
        />
      )}

      {splashProjectId && (
        <ProjectSplashModal
          key={`splash-${splashProjectId}`}
          project={resolvedProjects.find(p => p.id === splashProjectId) ?? project}
          meta={projectMetaMap[splashProjectId] ?? null}
          onClose={() => setSplashProjectId(null)}
        />
      )}
    </div>
  )
}
