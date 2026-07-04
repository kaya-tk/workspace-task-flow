"use client"

import { useState, useEffect, useCallback } from "react"
import { Goal, Project, Status, Task, TaskDetail, ProjectMeta, GoalMeta } from "@/lib/types"
import { PaneProjects } from "@/components/PaneProjects"
import { PaneGoals } from "@/components/PaneGoals"
import { PaneTree } from "@/components/PaneTree"
import { PaneDetail } from "@/components/PaneDetail"
import { ProjectSplashModal } from "@/components/ProjectSplashModal"
import { TodayTasksOverlay } from "@/components/TodayTasksOverlay"
import { GlobalHeader } from "@/components/GlobalHeader"

// ── 今日のDay番号を計算（Day1 = 2026/4/26）
const PROJECT_START = new Date("2026-04-26").getTime()
const TODAY_DAY = Math.max(1, Math.min(60,
  Math.floor((Date.now() - PROJECT_START) / 86_400_000) + 1
))

// ── API ヘルパー ─────────────────────────────────────────────
function api(path: string, opts?: RequestInit) {
  return fetch(path, { headers: { "Content-Type": "application/json" }, ...opts })
    .catch(e => console.error(`API error [${path}]`, e))
}

// ── タスク検索ヘルパー ────────────────────────────────────────
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

function findCategoryId(projects: Project[], taskId: string): string | null {
  for (const p of projects) {
    for (const g of p.goals) {
      for (const c of g.categories) {
        if (c.tasks.some(t => t.id === taskId)) return c.id
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
    startDate: task.startDate ?? "",
    dueDate: task.dueDate ?? "",
    labels: task.labels ?? [],
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

// ── Undoトースト（グローバル）────────────────────────────────
interface UndoEntry { label: string; restore: () => void }
function GlobalUndoToast({ entry, onDone }: { entry: UndoEntry; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(), 3500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-foreground text-background text-xs rounded-xl px-4 py-2.5 shadow-lg">
      <span>「{entry.label}」を削除しました</span>
      <button onClick={() => { entry.restore(); onDone() }} className="font-bold text-primary hover:opacity-80">元に戻す</button>
    </div>
  )
}

type DetailMode = "task" | "project" | "goal"

export default function Home() {
  // ── 状態 ──────────────────────────────────────────────────
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [selectedGoalId, setSelectedGoalId] = useState("")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [detailMode, setDetailMode] = useState<DetailMode>("task")
  const [taskStatusMap, setTaskStatusMap] = useState<Record<string, Status>>({})
  const [projectMetaMap, setProjectMetaMap] = useState<Record<string, ProjectMeta>>({})
  const [goalMetaMap, setGoalMetaMap] = useState<Record<string, GoalMeta>>({})
  const [undoEntry, setUndoEntry] = useState<UndoEntry | null>(null)
  const [showTodayOverlay, setShowTodayOverlay] = useState(true)
  const [splashProjectId, setSplashProjectId] = useState<string | null>(null)
  const [seenProjectIds, setSeenProjectIds] = useState<Set<string>>(new Set())

  // ── DB からデータをロード ────────────────────────────────
  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(({ projects: loaded, projectMetaMap: pm, goalMetaMap: gm }) => {
        setProjects(loaded)
        setProjectMetaMap(pm)
        setGoalMetaMap(gm)
        if (loaded.length > 0) {
          const first = loaded[0]
          setSelectedProjectId(first.id)
          setSeenProjectIds(new Set([first.id]))
          if (first.goals.length > 0) setSelectedGoalId(first.goals[0].id)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  // ── 派生データ ────────────────────────────────────────────
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

  const project = resolvedProjects.find(p => p.id === selectedProjectId) ?? resolvedProjects[0]
  const goals: Goal[] = project?.goals ?? []
  const goal = goals.find(g => g.id === selectedGoalId) ?? goals[0]
  const taskDetail = deriveDetail(selectedTaskId, projects, goal?.name ?? "", project?.name ?? "", taskStatusMap)
  const selectedCategoryId = selectedTaskId ? findCategoryId(projects, selectedTaskId) : null

  // ── タスク CRUD ──────────────────────────────────────────
  const handleAddTaskToCategory = (catId: string) => {
    const newId = crypto.randomUUID()
    setProjects(prev => prev.map(p =>
      p.id !== selectedProjectId ? p : {
        ...p,
        goals: p.goals.map(g =>
          g.id !== selectedGoalId ? g : {
            ...g,
            categories: g.categories.map(c =>
              c.id !== catId ? c : {
                ...c,
                tasks: [...c.tasks, { id: newId, title: "新しいタスク", status: "todo" as Status, order: c.tasks.length }],
              }
            ),
          }
        ),
      }
    ))
    setSelectedTaskId(newId)
    setDetailMode("task")
    api("/api/tasks", { method: "POST", body: JSON.stringify({ id: newId, title: "新しいタスク", categoryId: catId }) })
  }

  const handleDeleteTask = (taskId: string) => {
    const snap = projects
    const label = findTaskById(projects, taskId)?.title ?? "タスク"
    setProjects(prev => prev.map(p => ({
      ...p,
      goals: p.goals.map(g => ({
        ...g,
        categories: g.categories.map(c => ({ ...c, tasks: c.tasks.filter(t => t.id !== taskId) })),
      })),
    })))
    if (selectedTaskId === taskId) setSelectedTaskId(null)
    setUndoEntry({
      label,
      restore: () => {
        setProjects(snap)
        // undo: 削除をAPIレベルで取り消せないので再作成はしない（将来対応）
      },
    })
    api(`/api/tasks/${taskId}`, { method: "DELETE" })
  }

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
    api(`/api/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ title: newTitle }) })
  }

  const handleStatusChange = (taskId: string, newStatus: Status) => {
    setTaskStatusMap(prev => ({ ...prev, [taskId]: newStatus }))
    api(`/api/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) })
  }

  const handleStartDateChange = (taskId: string, startDate: string) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      goals: p.goals.map(g => ({
        ...g,
        categories: g.categories.map(c => ({
          ...c,
          tasks: c.tasks.map(t => t.id === taskId ? { ...t, startDate: startDate || undefined } : t),
        })),
      })),
    })))
    api(`/api/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ startDate: startDate || null }) })
  }

  const handleDueDateChange = (taskId: string, dueDate: string) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      goals: p.goals.map(g => ({
        ...g,
        categories: g.categories.map(c => ({
          ...c,
          tasks: c.tasks.map(t => t.id === taskId ? { ...t, dueDate: dueDate || undefined } : t),
        })),
      })),
    })))
    api(`/api/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ dueDate: dueDate || null }) })
  }

  const handleLabelsChange = (taskId: string, labels: string[]) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      goals: p.goals.map(g => ({
        ...g,
        categories: g.categories.map(c => ({
          ...c,
          tasks: c.tasks.map(t => t.id === taskId ? { ...t, labels } : t),
        })),
      })),
    })))
    api(`/api/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ labels }) })
  }

  // ── カテゴリ CRUD ────────────────────────────────────────
  const handleAddCategory = () => {
    const id = crypto.randomUUID()
    setProjects(prev => prev.map(p =>
      p.id !== selectedProjectId ? p : {
        ...p,
        goals: p.goals.map(g =>
          g.id !== selectedGoalId ? g : {
            ...g,
            categories: [...g.categories, { id, name: "新しいカテゴリー", tasks: [] }],
          }
        ),
      }
    ))
    api("/api/categories", { method: "POST", body: JSON.stringify({ id, name: "新しいカテゴリー", goalId: selectedGoalId }) })
  }

  const handleRenameCategory = (catId: string, name: string) => {
    setProjects(prev => prev.map(p =>
      p.id !== selectedProjectId ? p : {
        ...p,
        goals: p.goals.map(g =>
          g.id !== selectedGoalId ? g : {
            ...g,
            categories: g.categories.map(c => c.id === catId ? { ...c, name } : c),
          }
        ),
      }
    ))
    api(`/api/categories/${catId}`, { method: "PATCH", body: JSON.stringify({ name }) })
  }

  const handleReorderCategories = (from: number, to: number) => {
    if (from === to) return
    setProjects(prev => prev.map(p =>
      p.id !== selectedProjectId ? p : {
        ...p,
        goals: p.goals.map(g => {
          if (g.id !== selectedGoalId) return g
          const next = [...g.categories]
          const [moved] = next.splice(from, 1)
          next.splice(to, 0, moved)
          api("/api/categories/reorder", { method: "PATCH", body: JSON.stringify({ ids: next.map(c => c.id) }) })
          return { ...g, categories: next }
        }),
      }
    ))
  }

  const handleDeleteCategory = (catId: string) => {
    const snap = projects
    const label = projects
      .find(p => p.id === selectedProjectId)
      ?.goals.find(g => g.id === selectedGoalId)
      ?.categories.find(c => c.id === catId)?.name ?? "カテゴリー"
    setProjects(prev => prev.map(p =>
      p.id !== selectedProjectId ? p : {
        ...p,
        goals: p.goals.map(g =>
          g.id !== selectedGoalId ? g : {
            ...g,
            categories: g.categories.filter(c => c.id !== catId),
          }
        ),
      }
    ))
    setUndoEntry({ label, restore: () => setProjects(snap) })
    api(`/api/categories/${catId}`, { method: "DELETE" })
  }

  // ── プロジェクト CRUD ─────────────────────────────────────
  const handleAddProject = () => {
    const id = crypto.randomUUID()
    const newProj: Project = { id, name: "新しいプロジェクト", color: "#6b7280", goals: [] }
    setProjects(prev => [...prev, newProj])
    setProjectMetaMap(prev => ({
      ...prev,
      [id]: { description: "", targetOutcome: "", kpiSummary: "", period: "", risks: "" },
    }))
    setSelectedProjectId(id)
    setSelectedGoalId("")
    setSelectedTaskId(null)
    setDetailMode("project")
    setSeenProjectIds(prev => new Set([...prev, id]))
    api("/api/projects", { method: "POST", body: JSON.stringify({ id, name: "新しいプロジェクト", color: "#6b7280" }) })
  }

  const handleRenameProject = (id: string, name: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p))
    api(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify({ name }) })
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
    api(`/api/projects/${id}`, { method: "DELETE" })
  }

  const handleReorderProjects = (from: number, to: number) => {
    if (from === to) return
    setProjects(prev => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      api("/api/projects/reorder", { method: "PATCH", body: JSON.stringify({ ids: next.map(p => p.id) }) })
      return next
    })
  }

  // ── ゴール CRUD ──────────────────────────────────────────
  const handleAddGoal = () => {
    const id = crypto.randomUUID()
    const newGoal: Goal = { id, name: "新しいゴール", completedCount: 0, totalCount: 0, categories: [] }
    setProjects(prev => prev.map(p =>
      p.id === selectedProjectId ? { ...p, goals: [...p.goals, newGoal] } : p
    ))
    setGoalMetaMap(prev => ({
      ...prev,
      [id]: { description: "", targetMetric: "", period: "", notes: "" },
    }))
    setSelectedGoalId(id)
    setSelectedTaskId(null)
    setDetailMode("goal")
    api("/api/goals", { method: "POST", body: JSON.stringify({ id, name: "新しいゴール", projectId: selectedProjectId }) })
  }

  const handleRenameGoal = (goalId: string, name: string) => {
    setProjects(prev => prev.map(p =>
      p.id === selectedProjectId
        ? { ...p, goals: p.goals.map(g => g.id === goalId ? { ...g, name } : g) }
        : p
    ))
    api(`/api/goals/${goalId}`, { method: "PATCH", body: JSON.stringify({ name }) })
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
    api(`/api/goals/${goalId}`, { method: "DELETE" })
  }

  const handleReorderGoals = (from: number, to: number) => {
    if (from === to) return
    setProjects(prev => prev.map(p => {
      if (p.id !== selectedProjectId) return p
      const next = [...p.goals]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      api("/api/goals/reorder", { method: "PATCH", body: JSON.stringify({ ids: next.map(g => g.id) }) })
      return { ...p, goals: next }
    }))
  }

  // ── メタ更新 ─────────────────────────────────────────────
  const handleProjectMetaChange = (id: string, updates: Partial<ProjectMeta>) => {
    setProjectMetaMap(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }))
    api(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(updates) })
  }

  const handleGoalMetaChange = (id: string, updates: Partial<GoalMeta>) => {
    setGoalMetaMap(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }))
    api(`/api/goals/${id}`, { method: "PATCH", body: JSON.stringify(updates) })
  }

  // ── ナビゲーション ─────────────────────────────────────────
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

  const handleSelectGoal = (id: string) => {
    setSelectedGoalId(id)
    setSelectedTaskId(null)
    setDetailMode("goal")
  }

  const handleSelectTask = (id: string) => {
    setSelectedTaskId(id)
    setDetailMode("task")
  }

  const handleShowProjectDetail = (id: string) => { setSelectedProjectId(id); setDetailMode("project") }
  const handleShowGoalDetail = (id: string) => { setSelectedGoalId(id); setDetailMode("goal") }

  const handleSelectTodayTask = (projectId: string, goalId: string, taskId: string) => {
    setSelectedProjectId(projectId)
    setSelectedGoalId(goalId)
    setSelectedTaskId(taskId)
    setDetailMode("task")
    setShowTodayOverlay(false)
  }

  const handleAddTaskFromDetail = () => {
    if (selectedCategoryId) handleAddTaskToCategory(selectedCategoryId)
  }

  // ── ローディング ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground text-sm">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
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
      <div className="flex flex-col flex-1 min-w-0">
        <GlobalHeader
          projectName={project?.name ?? ""}
          goalName={goal?.name ?? ""}
          taskTitle={detailMode === "task" && taskDetail ? taskDetail.title : null}
          onClickProject={() => handleShowProjectDetail(selectedProjectId)}
          onClickGoal={() => handleShowGoalDetail(selectedGoalId)}
        />
        <div className="flex flex-1 min-h-0">
          <PaneGoals
            key={`goals-${selectedProjectId}`}
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
            key={`tree-${selectedGoalId}`}
            goalName={goal?.name ?? ""}
            onRenameGoal={selectedGoalId ? (name) => handleRenameGoal(selectedGoalId, name) : undefined}
            categories={goal?.categories ?? []}
            selectedTaskId={selectedTaskId}
            onSelectTask={handleSelectTask}
            taskStatusMap={taskStatusMap}
            onStatusChange={handleStatusChange}
            todayDay={TODAY_DAY}
            onOpenTodayOverlay={() => setShowTodayOverlay(true)}
            onAddTask={handleAddTaskToCategory}
            onRenameTask={handleTaskTitleChange}
            onDeleteTask={handleDeleteTask}
            onAddCategory={handleAddCategory}
            onRenameCategory={handleRenameCategory}
            onDeleteCategory={handleDeleteCategory}
            onReorderCategories={handleReorderCategories}
          />
          <PaneDetail
            key={`detail-${detailMode}-${detailMode === "task" ? selectedTaskId : detailMode === "project" ? selectedProjectId : selectedGoalId}`}
            mode={detailMode}
            detail={taskDetail}
            onStatusChange={handleStatusChange}
            onTaskTitleChange={handleTaskTitleChange}
            onStartDateChange={handleStartDateChange}
            onDueDateChange={handleDueDateChange}
            onLabelsChange={handleLabelsChange}
            project={project}
            projectMeta={projectMetaMap[selectedProjectId] ?? null}
            onProjectMetaChange={(updates) => handleProjectMetaChange(selectedProjectId, updates)}
            onRenameProject={(name) => handleRenameProject(selectedProjectId, name)}
            goal={goal}
            goalMeta={goalMetaMap[selectedGoalId] ?? null}
            onGoalMetaChange={(updates) => handleGoalMetaChange(selectedGoalId, updates)}
            onRenameGoal={selectedGoalId ? (name) => handleRenameGoal(selectedGoalId, name) : undefined}
            projects={projects}
            goalMetaMap={goalMetaMap}
            onAddTask={detailMode === "task" && selectedTaskId ? handleAddTaskFromDetail : undefined}
          />
        </div>
      </div>

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
