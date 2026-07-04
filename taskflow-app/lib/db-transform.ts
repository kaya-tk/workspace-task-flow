import { TaskStatus } from "@prisma/client"
import type { Status, Task, Category, Goal, Project, ProjectMeta, GoalMeta } from "./types"

// ── ステータス変換 ──────────────────────────────────────────
export function toFrontendStatus(status: TaskStatus): Status {
  const map: Record<TaskStatus, Status> = {
    TODO: "todo",
    INPROGRESS: "inprogress",
    DONE: "done",
    HOLD: "hold",
  }
  return map[status] ?? "todo"
}

export function toDbStatus(status: Status): TaskStatus {
  const map: Record<Status, TaskStatus> = {
    todo: TaskStatus.TODO,
    inprogress: TaskStatus.INPROGRESS,
    done: TaskStatus.DONE,
    hold: TaskStatus.HOLD,
  }
  return map[status] ?? TaskStatus.TODO
}

// ── DB → フロントエンド型へ変換 ──────────────────────────────
type DbTask = {
  id: string; title: string; status: TaskStatus; order: number
  startDate: Date | null; dueDate: Date | null; labels: string[]
}
type DbCategory = { id: string; name: string; order: number; tasks: DbTask[] }
type DbGoal = {
  id: string; name: string; order: number
  description: string | null; targetMetric: string | null; risks: string | null
  categories: DbCategory[]
}
type DbProject = {
  id: string; name: string; color: string; order: number
  description: string | null; targetOutcome: string | null; risks: string | null
  goals: DbGoal[]
}

export function transformProjects(dbProjects: DbProject[]): {
  projects: Project[]
  projectMetaMap: Record<string, ProjectMeta>
  goalMetaMap: Record<string, GoalMeta>
} {
  const projects: Project[] = []
  const projectMetaMap: Record<string, ProjectMeta> = {}
  const goalMetaMap: Record<string, GoalMeta> = {}

  for (const p of dbProjects) {
    projectMetaMap[p.id] = {
      description: p.description ?? "",
      targetOutcome: p.targetOutcome ?? "",
      kpiSummary: "",
      period: "",
      risks: p.risks ?? "",
    }

    const goals: Goal[] = []
    for (const g of p.goals) {
      goalMetaMap[g.id] = {
        description: g.description ?? "",
        targetMetric: g.targetMetric ?? "",
        period: "",
        notes: g.risks ?? "",
      }

      const categories: Category[] = g.categories.map(c => ({
        id: c.id,
        name: c.name,
        tasks: c.tasks.map(t => ({
          id: t.id,
          title: t.title,
          status: toFrontendStatus(t.status),
          order: t.order,
          startDate: t.startDate?.toISOString().split("T")[0],
          dueDate: t.dueDate?.toISOString().split("T")[0],
          labels: t.labels,
        } satisfies Task)),
      }))

      goals.push({ id: g.id, name: g.name, completedCount: 0, totalCount: 0, categories })
    }

    projects.push({ id: p.id, name: p.name, color: p.color, goals })
  }

  return { projects, projectMetaMap, goalMetaMap }
}
