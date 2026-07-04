export type Status = "todo" | "inprogress" | "done"

export type RecurrenceType = "weekly" | "monthly-nth"

export interface Recurrence {
  type: RecurrenceType
  // weekly: 0=日, 1=月, ..., 6=土
  // monthly-nth: { week: 1-5, weekday: 0-6 }
  weekday?: number
  week?: number
}

export interface Task {
  id: string
  title: string
  status: Status
  startDate?: string
  dueDate?: string
  order: number
  day?: number          // Day number in the roadmap
  recurrence?: Recurrence  // 繰り返し設定
}

export interface Category {
  id: string
  name: string
  tasks: Task[]
}

export interface Goal {
  id: string
  name: string
  completedCount: number
  totalCount: number
  categories: Category[]
}

export interface Project {
  id: string
  name: string
  color: string
  goals: Goal[]
}

export interface ProjectMeta {
  description: string
  targetOutcome: string
  kpiSummary: string
  period: string
  risks: string
  comments: string
}

export interface GoalMeta {
  description: string
  targetMetric: string
  period: string
  notes: string
  comments: string
  linkedProjectId?: string
}

export interface WorkMemo {
  id: string
  text: string
  time: string
}

export interface ReviewEntry {
  good: string    // できたこと
  bad: string     // できなかったこと
  next: string    // 来週の調整
}

export interface TaskDetail {
  id: string
  title: string
  status: Status
  dueDate: string
  labels: string[]
  estimate: string
  goalName: string
  projectName: string
  workMemos: WorkMemo[]
  createdAt: string
  updatedAt: string
  day?: number
  isReview?: boolean
  reviewEntry?: ReviewEntry
  recurrence?: Recurrence
}
