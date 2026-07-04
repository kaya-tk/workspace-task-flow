# Task Flow — 引き継ぎドキュメント

## プロジェクト概要

AddnessやLinearを参考にした4ペイン構成のタスク管理Webアプリ。  
現在はUIプロトタイプ段階（モックデータ使用、DB未接続）。

**起動方法**
```bash
cd /Users/kaya/src/workspace-task-flow/taskflow-app
npm run dev   # → http://localhost:3000
```

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| スタイル | Tailwind CSS v4（CSS-based `@import "tailwindcss"`、config不要） |
| UIパターン | shadcn/ui風（`cn()` = clsx + tailwind-merge、CLIは未使用） |
| アイコン | lucide-react |
| 状態管理 | useState のみ（外部ライブラリなし） |

---

## ディレクトリ構成

```
taskflow-app/
├── app/
│   ├── globals.css        # Tailwind v4 import + body基本スタイル
│   ├── layout.tsx
│   └── page.tsx           # ルート。4ペインを並べる
├── components/
│   ├── PaneProjects.tsx   # ペイン1: プロジェクト一覧
│   ├── PaneGoals.tsx      # ペイン2: ゴール一覧
│   ├── PaneTree.tsx       # ペイン3: カテゴリー + タスクツリー
│   ├── PaneDetail.tsx     # ペイン4: タスク詳細
│   ├── TaskTreeNode.tsx   # 再帰ツリーノード（PaneTree内で使用）
│   └── StatusIcon.tsx     # ステータスアイコン（done/inprogress/todo/backlog）
├── lib/
│   ├── types.ts           # 型定義
│   ├── data.ts            # モックデータ
│   └── utils.ts           # cn() ユーティリティ
└── next.config.ts         # devIndicators: false
```

---

## 型定義（lib/types.ts）

```typescript
type Status = "backlog" | "todo" | "inprogress" | "done"
type Priority = "none" | "low" | "medium" | "high"

interface Task {
  id: string
  title: string
  status: Status
  priority: Priority
  dueDate?: string
  children?: Task[]   // サブタスク（任意の深さ）
  order: number
}

interface Category {
  id: string
  name: string
  tasks: Task[]
}

interface Goal {
  id: string
  name: string
  completedCount: number
  totalCount: number
  categories: Category[]
}

interface Project {
  id: string
  name: string
  color: string
  goals: Goal[]
}

interface TaskDetail {
  id, title, status, priority, dueDate,
  assignee, label, estimate,
  goalName, projectName, relatedTask?,
  memo, comments, createdAt, updatedAt
}
```

---

## レイアウト（4ペイン構成）

```
[Pane1: 2/16] [Pane2: 3/16] [Pane3: 5/16] [Pane4: 6/16 = flex-1]
```

各ペインはすべて `h-screen`、ヘッダーは `h-[57px] border-b` で高さ統一、横位置は `px-4` で統一。

---

## 各ペインの仕様

### Pane 1 — PaneProjects（2/16）

- **ヘッダー**: 「プロジェクト」ラベル + `+` ボタン（`px-4 h-[57px]`）
- **リスト**: プロジェクトカード（タスク総数バッジ＋名前＋ゴール名＋進捗バー）
- **ドラッグ**: HTML5 DnD でプロジェクト並び替え可能
- **フッター**: 「Task Flow」ロゴ（左下固定）
- **選択状態**: `bg-blue-50 border-blue-200`、バッジが青に変わる

### Pane 2 — PaneGoals（3/16、`bg-gray-50`）

- **ヘッダー**: 「ゴール」ラベル + `+` ボタン
- **リスト**: ゴールカード（タスク総数バッジ＋名前＋「X/Y 完了」＋進捗バー）
- **ドラッグ**: ゴール並び替え可能

### Pane 3 — PaneTree（5/16）

- **ヘッダー**: 「今日のToDo」カード（検索アイコン付き）
- **サブヘッダー**: ゴール名（18px）＋ステータスフィルターチップ（未完了/進行中/完了済み）
- **構造**: カテゴリー → タスク（TaskTreeNode）の2層
  - カテゴリーは折りたたみ可能（ChevronDown/Right）
  - カテゴリーのドラッグで並び替え
  - タスクは同カテゴリー内のみドラッグ並び替え
  - カテゴリーホバーで `+`（タスク追加）が表示
  - 下部に「カテゴリーを追加」ボタン
- **TaskTreeNode**: 再帰コンポーネント。子タスクにはツリーライン（縦/横の接続線）

**サンプルカテゴリー（g1用）:**
- 「準備・戦略」: 3タスク（全done）
- 「チャンネル外観」: 3タスク（うち1つに子タスク2件）
- 「コンテンツ計画」: 2タスク

### Pane 4 — PaneDetail（flex-1 = 6/16）

- **ヘッダー**: 「選択中のタスク」 + `MoreHorizontal`
- **タイトル**: h2、22px、太字
- **ゴール名**: タイトル直下、`text-pink-700`（Target アイコン付き）
- **ステータスバッジ行**: ステータス・期日・工数（インライン編集可）
- **ラベル**: 複数タグ付与可能（色分け、×で削除、入力で追加）
- **概要**: amber背景のcontentEditable（旧「作業メモ」）
- **コメント**: 入力＋送信ボタン
- **フッター**: 作成日・更新日（`text-gray-500`）

---

## StatusIcon コンポーネント

| Status | 見た目 |
|--------|--------|
| done | 緑丸（`bg-green-500`）＋白チェック |
| inprogress | 青丸（`bg-blue-600`）＋白三角 |
| todo | 白丸（`border-2 border-gray-300`） |
| backlog | 白丸破線（`border-dashed border-gray-300`） |

サイズ: `sm`(16px) / `md`(20px) / `lg`(24px)

---

## モックデータ（lib/data.ts）

- `PROJECTS`: 4プロジェクト（Youtube運営・副業ビジネス・スキルアップ・生活改善）
- Youtube運営のg1に3カテゴリー・計8タスク（入れ子あり）
- `SAMPLE_DETAIL`: `t2-2`「サムネイルデザインの方向性を決める」の詳細（コメント2件付き）

---

## 現状のUIデザイン方針

- **ライトテーマ**: 白ベース、`border-gray-100/200` で区切り
- **アクセントカラー**: `blue-600`（選択・進行中・CTA）
- **ゴール名**: `text-pink-700`（赤みがかった強調）
- **文字サイズ**: ヘッダーラベル `text-xs`(12px)、タスク `text-sm`(14px)、タイトル 22px
- **スクロールバー**: 幅4px、グレー、track透明

---

## 既知の制限・未実装事項

- データはすべてモック。DB・API未接続
- Pane 4 は `SAMPLE_DETAIL` 固定（タスク選択に連動していない）
- タスク追加UIは外観のみ（入力フォーム未実装）
- カテゴリー名の編集未実装
- 認証・ユーザー管理なし
- モバイル非対応（デスクトップ4ペイン固定）

---

## 次に取り組みたいこと（候補）

- Pane 4 をクリックしたタスクに連動させる
- タスク/カテゴリーの追加・編集・削除フォーム
- タスクのステータス変更（クリックでサイクル）
- 検索機能（Pane 3 の「今日のToDo」カード）
- 期日のカラー表示ロジック改善（現在 "6/18" ハードコード）
- アニメーション・トランジション強化
