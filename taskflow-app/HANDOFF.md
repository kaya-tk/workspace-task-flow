# HANDOFF — TaskFlow Web App

## プロジェクト概要
Next.js 15 App Router + TypeScript + Tailwind CSS v4 で構築した、AI副業ロードマップ管理ツール。
ローカル: `http://localhost:3000`

---

## 技術スタック
- Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- ルートファイル: `taskflow-app/` 配下

---

## 画面構成（4ペイン）
| ペイン | 幅 | コンポーネント | 役割 |
|--------|-----|---------------|------|
| Pane1 | 2/16 | `PaneProjects` | プロジェクト一覧 |
| Pane2 | 3/16 | `PaneGoals` | ゴール一覧 |
| Pane3 | 5/16 | `PaneTree` | タスクツリー |
| Pane4 | flex-1 | `PaneDetail` | タスク/プロジェクト/ゴール詳細 |

---

## データ構造（`lib/types.ts`）

```typescript
export type Status = "backlog" | "todo" | "inprogress" | "done"
export type Priority = "none" | "low" | "medium" | "high"
export type TaskType = "task" | "note-article" | "review"

export interface Task {
  id: string; title: string; status: Status; priority: Priority
  dueDate?: string; children?: Task[]; order: number
  day?: number; taskType?: TaskType; noteInfo?: NoteInfo
}
export interface Category { id: string; name: string; tasks: Task[] }
export interface Goal { id: string; name: string; completedCount: number; totalCount: number; categories: Category[] }
export interface Project { id: string; name: string; color: string; goals: Goal[] }

export interface ProjectMeta {
  description: string; targetOutcome: string; kpiSummary: string
  period: string; risks: string; comments: string
}
export interface GoalMeta {
  description: string; targetMetric: string; period: string
  notes: string; comments: string
  linkedProjectId?: string  // KPI管理→各プロジェクトの紐づけ
}
```

---

## 状態管理（`app/page.tsx`）

```typescript
const [selectedProjectId, setSelectedProjectId] = useState("roadmap")
const [selectedGoalId, setSelectedGoalId] = useState("phase6")
const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
const [detailMode, setDetailMode] = useState<DetailMode>("task")  // "task" | "project" | "goal"
const [taskStatusMap, setTaskStatusMap] = useState<Record<string, Status>>({})
const [projectMetaMap, setProjectMetaMap] = useState<Record<string, ProjectMeta>>(INITIAL_PROJECT_META)
const [goalMetaMap, setGoalMetaMap] = useState<Record<string, GoalMeta>>(INITIAL_GOAL_META)

// TODAY_DAY: Day1=2026/4/26、現在=Day57
const TODAY_DAY = Math.max(1, Math.min(60,
  Math.floor((Date.now() - new Date("2026-04-26").getTime()) / 86_400_000) + 1
))
```

---

## 実装済み機能

### ① クリックでステータス変更
- `TaskTreeNode.tsx` — StatusIconをクリックするとステータスをサイクル変更
- サイクル: `backlog → todo → inprogress → done → todo`
- `taskStatusMap` (page.tsx) が各タスクのステータス上書きを保持

### ② 今日のToDoフィルター
- `PaneTree.tsx` — ヘッダーの「今日のToDo」ボタンでトグル
- `task.day === TODAY_DAY` のタスクのみ表示（dayなしタスクは除外）

### ③ プロジェクト詳細パネル
- PaneProjects の各プロジェクトカードにホバーで ℹ️ ボタン表示
- クリックで `detailMode = "project"`, Pane4 に `ProjectDetailPanel` 表示
- 編集フィールド: 期間, 概要, 達成目標, KPI・先行指標, リスク, メモ
- 「関連KPI」セクション: `goalMetaMap` から `linkedProjectId === project.id` のKPIゴールを自動表示

### ④ ゴール詳細パネル
- PaneGoals の各ゴールカードにホバーで ℹ️ ボタン表示
- クリックで `detailMode = "goal"`, Pane4 に `GoalDetailPanel` 表示
- 編集フィールド: 対象プロジェクト（セレクト）, 期間, 概要, 達成指標, 重要事項, コメント

### ⑤ KPI管理→プロジェクト紐づけ
- `GoalMeta.linkedProjectId` フィールドで管理
- KPI管理プロジェクトのゴール詳細に「対象プロジェクト」セレクトボックス
- PaneGoals のKPIゴールカードにカラーバッジで紐づき先プロジェクト名を表示
- AI副業60日ロードマップの詳細に「関連KPI」セクションで逆引き表示

---

## プロジェクト・ゴールID一覧（`lib/data.ts`）

### プロジェクト
| id | 名前 | color |
|----|------|-------|
| `roadmap` | AI副業60日ロードマップ | `#6366f1` |
| `note` | Note記事管理 | `#10b981` |
| `x` | X運用（2アカウント） | `#0ea5e9` |
| `kpi` | KPI管理 | `#8b5cf6` |

### KPIゴール（`lib/data.ts` の INITIAL_GOAL_META）
| id | 名前 | linkedProjectId |
|----|------|----------------|
| `kpi-60d` | 60日KPI｜先行指標 | `roadmap` |
| `kpi-6m` | 6ヶ月KPI｜中間指標 | `roadmap` |
| `kpi-1y` | 1年KPI｜成長指標 | `roadmap` |
| `kpi-3y` | 3年KPI｜成熟指標 | `roadmap` |

---

## コンポーネント一覧

```
components/
  PaneProjects.tsx   プロジェクト一覧（onShowDetail: ℹ️ボタン）
  PaneGoals.tsx      ゴール一覧（goalMetaMap, projects でバッジ表示）
  PaneTree.tsx       タスクツリー（今日フィルター, statusMap）
  PaneDetail.tsx     3モード詳細パネル（task/project/goal）
  TaskTreeNode.tsx   タスク行（クリックでステータス変更）
  StatusIcon.tsx     ステータスアイコン
lib/
  types.ts           型定義
  data.ts            PROJECTS, TASK_DETAILS, INITIAL_PROJECT_META, INITIAL_GOAL_META
  utils.ts           cn()
```

---

## PaneDetail の Props

```typescript
interface PaneDetailProps {
  mode: "task" | "project" | "goal"
  detail?: TaskDetail | null         // task mode
  project?: Project | null           // project mode
  projectMeta?: ProjectMeta | null
  onProjectMetaChange?: (updates: Partial<ProjectMeta>) => void
  goal?: Goal | null                 // goal mode
  goalMeta?: GoalMeta | null
  onGoalMetaChange?: (updates: Partial<GoalMeta>) => void
  projects?: Project[]               // 共通（プロジェクト選択UI、関連KPI表示）
  goalMetaMap?: Record<string, GoalMeta>  // 共通（関連KPI逆引き）
}
```

---

## 既知の注意点・対処済みバグ

1. **page.tsx からの export 禁止**: Next.js は page.tsx からページコンポーネント以外の export を許可しない。`TODAY_DAY`, `STATUS_CYCLE` 等は export しない
2. **PaneGoals/PaneTree の stale state**: useState(props) パターンを使うため、`key={selectedProjectId}` / `key={selectedGoalId}` でプロジェクト/ゴール切り替え時に強制リマウント
3. **ステータスの反映**: `deriveDetail()` が `taskStatusMap` を受け取り、PaneDetail に渡す `detail` にマージされるので自動伝播

---

## 今後の拡張候補（未実装）

- データ永続化（localStorage or DB）
- プロジェクト/ゴール/タスクの追加・削除UI
- 実績値の入力フィールド（KPIの達成率記録）
- Day番号の自動更新（現在は起動時に計算）
- モバイル対応
