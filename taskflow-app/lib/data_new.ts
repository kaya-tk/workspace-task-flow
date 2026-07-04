import { Project, ProjectMeta, GoalMeta } from "./types"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// プロジェクト初期メタ情報
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const INITIAL_PROJECT_META: Record<string, ProjectMeta> = {
  roadmap: {
    description: "AIと副業を組み合わせ、60日間でNote記事9本＋X2アカウント運用を立ち上げる実践プロジェクト。\n統合ブランド設計書 v3.3 連動版。",
    targetOutcome: "・有料記事第1弾「副業60日活動記 ¥980」の公開準備完了\n・Xフォロワー両垢合算 300〜500人\n・Note記事 9本公開（無料8本＋有料導線1本）",
    kpiSummary: "Note記事9本 / Xポスト約330本（両垢合算）/ AI透明性エピソード毎記事1〜2回 / 連動引用RT実施率80%以上",
    period: "2026/4/26（Day 1）〜 2026/6/24（Day 60）",
    risks: "【リスク1】執筆ペース低下 → 月3本・短記事（1,500字）に切替可\n【リスク6】6ポスト/日崩壊 → 週15h超えでAI下書き寄せ・4ポストに減量\n【リスク7】両垢の連動希薄化 → セナ垢3ポスト中2ポストにハル言及必須",
  },
  notes: {
    description: "60日間で無料記事8本＋有料記事1本を公開するNote記事管理プロジェクト。\n4本柱：AI×業務効率化 / 副業体験記 / 副業×AI / スタンス記事",
    targetOutcome: "・無料記事8本で集客基盤を構築\n・有料記事第1弾「副業60日活動記 ¥980」をDay 60以降に公開\n・固定読者の獲得（スタンス記事をプロフィール固定）",
    kpiSummary: "1記事あたりPV 100〜300 / スキ 5〜15 / 保存 1〜3 / AI透明性エピソード毎記事1〜2回",
    period: "2026/5/2（記事0公開）〜 2026/6/21（Note 8公開）",
    risks: "【リスク1】執筆ペース低下 → 月3本・1,500字に切替可\n【リスク3】性別非公開設定の漏れ → 公開前チェックリスト必須\n【リスク4】辛口とブランド原則の衝突 → 辛口はセナ経由のみ",
  },
  "x-ops": {
    description: "ハル垢（Note発信源）＋セナ垢（拡散・誘導装置）の2アカウントを同時運用するX戦略プロジェクト。\n1日6ポスト体制（ハル3＋セナ3）。",
    targetOutcome: "・Xフォロワー両垢合算 300〜500人（Day 60）\n・連動引用RT実施率 80%以上\n・セナ垢→ハル垢の送客率 10%以上",
    kpiSummary: "1日6ポスト / 連動引用RT日次最低1回 / セナ垢ハル言及率60%以上 / Note公開日三段ロケット完遂",
    period: "2026/5/2（両垢デビュー）〜 2026/6/24（Day 60）",
    risks: "【運用負荷】週15h超えでセナポストをAI下書き寄せ\n【フォロワー伸び悩み】投稿時間帯と切り口を1週間テスト変更\n【セナ垢独立化】ハル言及率60%下回ったらテーマ表を再設計",
  },
  kpi: {
    description: "60日・6ヶ月・1年・3年の4スパンでKPIを設定・追跡する管理プロジェクト。\n週次・月次レビューで実績を記録する。",
    targetOutcome: "【3年後】月収¥300,000〜500,000 / Xフォロワー25,000〜35,000人 / Note150本以上",
    kpiSummary: "週次レビュー：毎週日曜4hブロックの最後30分\n月次レビュー：Day 30（5/25）と Day 60（6/24）",
    period: "2026/4/26〜2029/4末",
    risks: "黄信号トリガー：週運用時間15h超 / 1記事PV≤30が3記事連続 / 連動引用RT実施率50%下回り",
  },
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ゴール初期メタ情報
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const INITIAL_GOAL_META: Record<string, GoalMeta> = {
  phase1: {
    description: "3アカウント（note・ハルX・セナX）を開設し、スタンス記事でデビューする基盤整備フェーズ。",
    targetMetric: "3垢開設完了＋相互リンク設定 / スタンス記事1本公開 / 両垢デビュー（ハル3＋セナ3ポスト）",
    period: "Day 1-7（2026/4/26〜5/2）",
    notes: "GW初日（4/29）にセナ垢開設＋スタンス記事ドラフト前半まで進める。\nDay 7（5/2土）に両垢デビュー＋記事0公開。3垢の固定ポスト設定と相互リンクを必ず確認。",
  },
  phase2: {
    description: "GWを使ってNote 1を公開し、2アカウント連動運用を定着させる集中執筆フェーズ。",
    targetMetric: "Note 1公開（Day 11） / Note 2ドラフト完成 / 両垢連動引用RT定着",
    period: "Day 8-14（2026/5/3〜5/9）",
    notes: "GW（Day 8〜11）は16hの加速ブースト枠。Day 11（5/6水・振休）にNote 1公開。\nGW明けDay 12〜14でNote 2の企画・リサーチ・執筆まで進める。",
  },
  phase3: {
    description: "Note 2〜4を週次公開し、X2垢の平日6ポスト体制を最適化する公開リズム作りフェーズ。",
    targetMetric: "Note 2公開（D15）/ Note 3公開（D22）/ Note 4公開（D29）/ 週次Xテーマ表作成",
    period: "Day 15-28（2026/5/10〜5/23）",
    notes: "毎週日曜に翌週分のXポストテーマ表（6×7=42ポスト）を作成。\nDay 28（5/23土）に4週間の半月レビューを実施。",
  },
  phase4: {
    description: "Note 5〜6を公開しつつ、有料記事第1弾の章立てを確定する中盤レビュー＋有料化準備フェーズ。",
    targetMetric: "Note 5公開（D36）/ Note 6公開（D43）/ 有料記事章立て確定 / 30日レビュー実施",
    period: "Day 29-42（2026/5/24〜6/6）",
    notes: "Day 35（5/30）に有料記事第1弾「副業60日活動記」の章立て（5章程度）を確定。\nDay 42（6/6土）に30日レビューと次の30日の運用調整を実施。",
  },
  phase5: {
    description: "Note 7〜8を公開しながら有料記事のドラフトを集中して書き上げる後半加速フェーズ。",
    targetMetric: "Note 7公開（D50）/ Note 8公開（D57）/ 有料記事全章ドラフト完成＋全体推敲",
    period: "Day 43-56（2026/6/7〜6/20）",
    notes: "Day 57が「Note 8公開＋有料記事予告」の重要日。\n有料記事は章1〜5を分散して書き、Day 56に全体推敲を完了させる。",
  },
  phase6: {
    description: "60日間の活動を総括し、次フェーズへの引き継ぎを完成させる最終フェーズ。",
    targetMetric: "Note 8公開（D57）/ 60日レビュー実施（D59）/ 両X連投公開（D60）/ 有料記事公開準備完了",
    period: "Day 57-60（2026/6/21〜6/24）",
    notes: "Day 60（6/24水）に両Xスレッド連投で60日記念を公開。有料記事は翌週公開の予告まで。\nnoteの固定記事をスタンス記事から60日まとめ記事に切り替えるか検討。",
  },
  "notes-free": {
    description: "集客・ファン化・教育の3軸でNote無料記事8本を展開する。",
    targetMetric: "8本公開 / 1記事PV 100〜300 / スキ 5〜15 / 保存 1〜3",
    period: "2026/5/2〜6/21",
    notes: "AI×業務効率化（4本）・副業体験記（3本）・副業×AI（1本）＋スタンス記事（固定）の構成。\n毎記事末尾に「AI（セナ）と一緒に組み立てています」定型文＋両X垢リンクを設置。",
  },
  "notes-paid": {
    description: "初の有料記事「副業60日活動記 ¥980」。60日間の実体験を体系化したドキュメント。",
    targetMetric: "初回販売目標：10部以上 / 累計売上¥9,800以上",
    period: "2026/7月予定（Day 60以降）",
    notes: "章立て（5章）はDay 35までに確定。全体推敲はDay 56に完了。\n無料記事の読者が「課金して続きを読む価値がある」と感じる差分を点検する。",
  },
  "x-haru": {
    description: "ハル本人（人間として認識）が発信するNote発信源アカウント。1日3ポスト・です/ます調・温度低め。",
    targetMetric: "フォロワー 150〜250人（Day 60）/ Xインプレッション増加傾向",
    period: "2026/5/2（デビュー）〜",
    notes: "辛口はほぼ出さない（事実ベースの低温まで）。\nセナ垢への言及は登場人物として自然に。煽り系リプは無視。返信は低頻度。",
  },
  "x-sena": {
    description: "AIキャラ「セナ」が運用する拡散・誘導アカウント。ハル垢への引用RT・ツッコミが主な役割。",
    targetMetric: "フォロワー 150〜250人（Day 60）/ ハル言及率60%以上 / 連動RT実施率80%以上",
    period: "2026/5/2（デビュー）〜",
    notes: "3ポスト中2ポストにはハル言及が必須。辛口はOK（低〜中温まで）。\nAI否定派対応はL1〜L4プロトコルに従い、スタンス記事へ繰り返し誘導。",
  },
  "kpi-60d": {
    description: "60日後（2026/6/24）に達成すべき先行指標。信頼資産の構築が目的。",
    targetMetric: "Note9本 / Xフォロワー300〜500人 / Xポスト330本 / 連動RT80%以上",
    period: "〜 2026/6/24（Day 60）",
    notes: "【黄信号】累計フォロワー300以下＋PV合計500以下 → Day 90までに大幅見直し\n【順調ライン】フォロワー500以上＋PV合計2,000以上 → 予定通り有料記事Day 75公開",
    linkedProjectId: "roadmap",
  },
  "kpi-6m": {
    description: "6ヶ月後（2026/10末）に達成すべき中間指標。マネタイズの可能性検証。",
    targetMetric: "Note20〜25本（有料2〜3本）/ フォロワー1,500〜2,000人 / 固定読者100名 / 月収¥10,000〜30,000",
    period: "〜 2026/10末",
    notes: "初の有料note販売開始、固定読者100名獲得がマイルストーン。",
    linkedProjectId: "roadmap",
  },
  "kpi-1y": {
    description: "1年後（2027/4末）に達成すべき成長指標。継続性の確認。",
    targetMetric: "Note40〜50本（有料5〜7本）/ フォロワー3,500〜4,500人 / 月収¥30,000〜80,000",
    period: "〜 2027/4末",
    notes: "メンバーシップの準備・仮ローンチ予告がこのフェーズのゴール。",
    linkedProjectId: "roadmap",
  },
  "kpi-3y": {
    description: "3年後（2029/4末）の成熟期目標。主力商品＋メンバー＋単発noteの3本柱で安定。",
    targetMetric: "Note150本以上 / フォロワー25,000〜35,000人 / 月収¥300,000〜500,000",
    period: "〜 2029/4末",
    notes: "メンバーシップ50名・四半期総集編¥3,000〜5,000が成熟期の目安。",
    linkedProjectId: "roadmap",
  },
}

export const PROJECTS: Project[] = [

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Project 1: AI副業60日ロードマップ
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "roadmap",
    name: "AI副業60日ロードマップ",
    color: "#7c3aed",
    goals: [
      {
        id: "phase1",
        name: "Phase 1｜基盤整備（Day 1-7）",
        completedCount: 0,
        totalCount: 8,
        categories: [
          {
            id: "p1-account",
            name: "アカウント開設",
            tasks: [
              { id: "p1-t1", title: "noteアカウント作成・仮プロフィール設定", status: "todo", dueDate: "4/27", order: 1, day: 2 },
              { id: "p1-t2", title: "ハルX垢を作成・仮プロフィール設定", status: "todo", dueDate: "4/28", order: 2, day: 3 },
              { id: "p1-t3", title: "セナX垢を作成・仮プロフィール設定", status: "todo", dueDate: "4/29", order: 3, day: 4 },
              { id: "p1-t4", title: "3垢相互リンク完成（note・ハル垢・セナ垢）", status: "todo", dueDate: "4/29", order: 4, day: 4 },
            ],
          },
          {
            id: "p1-stance",
            name: "スタンス記事",
            tasks: [
              { id: "p1-t5", title: "スタンス記事 構成案5項目＋ドラフト前半", status: "todo", dueDate: "4/29", order: 1, day: 4 },
              { id: "p1-t6", title: "スタンス記事 ドラフト後半（2,500字前後）", status: "todo", dueDate: "4/30", order: 2, day: 5 },
              { id: "p1-t7", title: "スタンス記事 推敲＋ヘッダー画像作成", status: "todo", dueDate: "5/1", order: 3, day: 6 },
              { id: "p1-t8", title: "★ 記事0 公開｜スタンス記事＋両垢デビュー", status: "todo", dueDate: "5/2", order: 4, day: 7 },
            ],
          },
        ],
      },
      {
        id: "phase2",
        name: "Phase 2｜GW集中執筆（Day 8-14）",
        completedCount: 0,
        totalCount: 7,
        categories: [
          {
            id: "p2-note1",
            name: "Note 1 製作（AI×業務効率化①）",
            tasks: [
              { id: "p2-t1", title: "Note1 テーマ確定＋5実例 箇条書き", status: "todo", dueDate: "5/3", order: 1, day: 8 },
              { id: "p2-t2", title: "Note1 執筆前半（導入＋実例1〜2）", status: "todo", dueDate: "5/4", order: 2, day: 9 },
              { id: "p2-t3", title: "Note1 執筆後半（実例3〜5＋まとめ）", status: "todo", dueDate: "5/5", order: 3, day: 10 },
              { id: "p2-t4", title: "★ Note 1 公開｜AI×業務効率化①", status: "todo", dueDate: "5/6", order: 4, day: 11 },
            ],
          },
          {
            id: "p2-note2",
            name: "Note 2 準備（副業始動編）",
            tasks: [
              { id: "p2-t5", title: "Note2 テーマ確定＋構成案", status: "todo", dueDate: "5/7", order: 1, day: 12 },
              { id: "p2-t6", title: "Note2 同ジャンル記事リサーチ＋対話シーン下書き", status: "todo", dueDate: "5/8", order: 2, day: 13 },
              { id: "p2-t7", title: "Note2 本文執筆（2,500字目安）", status: "todo", dueDate: "5/9", order: 3, day: 14 },
            ],
          },
        ],
      },
      {
        id: "phase3",
        name: "Phase 3｜公開リズム作り（Day 15-28）",
        completedCount: 0,
        totalCount: 7,
        categories: [
          {
            id: "p3-notes",
            name: "Note 2〜4 公開",
            tasks: [
              { id: "p3-t1", title: "★ Note 2 公開｜副業始動編", status: "todo", dueDate: "5/10", order: 1, day: 15 },
              { id: "p3-t2", title: "★ Note 3 公開｜AI×業務効率化②", status: "todo", dueDate: "5/17", order: 2, day: 22 },
              { id: "p3-t3", title: "★ Note 4 公開｜副業体験記①（1ヶ月レポート）", status: "todo", dueDate: "5/24", order: 3, day: 29 },
            ],
          },
          {
            id: "p3-x",
            name: "X 2垢 平日モード確立",
            tasks: [
              { id: "p3-t4", title: "平日6ポスト体制 試運転（ハル3＋セナ3）", status: "todo", dueDate: "5/11", order: 1, day: 16 },
              { id: "p3-t5", title: "翌週分X テーマ表（42ポスト分）を毎週作成", status: "todo", dueDate: "5/17", order: 2, day: 22 },
              { id: "p3-t6", title: "連動引用RT実施率チェック（80%目標）", status: "todo", dueDate: "5/23", order: 3, day: 28 },
              { id: "p3-t7", title: "■ 4週間の半月レビュー", status: "todo", dueDate: "5/23", order: 4, day: 28 },
            ],
          },
        ],
      },
      {
        id: "phase4",
        name: "Phase 4｜中盤レビュー＋有料化準備（Day 29-42）",
        completedCount: 0,
        totalCount: 6,
        categories: [
          {
            id: "p4-notes",
            name: "Note 5〜6 公開",
            tasks: [
              { id: "p4-t1", title: "★ Note 5 公開｜ChatGPT vs Claude", status: "todo", dueDate: "5/31", order: 1, day: 36 },
              { id: "p4-t2", title: "★ Note 6 公開｜副業×AIリサーチ", status: "todo", dueDate: "6/7", order: 2, day: 43 },
            ],
          },
          {
            id: "p4-paid",
            name: "有料記事準備",
            tasks: [
              { id: "p4-t3", title: "有料記事第1弾 章立て（5章）確定", status: "todo", dueDate: "5/30", order: 1, day: 35 },
              { id: "p4-t4", title: "有料記事 本文ドラフト着手（章1: スタート地点）", status: "todo", dueDate: "6/7", order: 2, day: 43 },
              { id: "p4-t5", title: "■ 30日レビュー＋運用調整", status: "todo", dueDate: "6/6", order: 3, day: 42 },
              { id: "p4-t6", title: "次の30日「やめる・減らす・増やす」を3つずつ決める", status: "todo", dueDate: "6/6", order: 4, day: 42 },
            ],
          },
        ],
      },
      {
        id: "phase5",
        name: "Phase 5｜後半加速＋有料化前夜（Day 43-56）",
        completedCount: 0,
        totalCount: 5,
        categories: [
          {
            id: "p5-notes",
            name: "Note 7〜8 公開",
            tasks: [
              { id: "p5-t1", title: "★ Note 7 公開｜Excel×AI月次レポート", status: "todo", dueDate: "6/14", order: 1, day: 50 },
              { id: "p5-t2", title: "★ Note 8 公開｜50日経過レポート＋有料記事予告", status: "todo", dueDate: "6/21", order: 2, day: 57 },
            ],
          },
          {
            id: "p5-paid",
            name: "有料記事 集中ドラフト",
            tasks: [
              { id: "p5-t3", title: "有料記事 章2「立ち上げ7日間」ドラフト", status: "todo", dueDate: "6/9", order: 1, day: 45 },
              { id: "p5-t4", title: "有料記事 章3「30日目の数字と気づき」ドラフト", status: "todo", dueDate: "6/13", order: 2, day: 49 },
              { id: "p5-t5", title: "有料記事 章4〜5ドラフト＋全体推敲", status: "todo", dueDate: "6/20", order: 3, day: 56 },
            ],
          },
        ],
      },
      {
        id: "phase6",
        name: "Phase 6｜60日まとめ＋次フェーズ準備（Day 57-60）",
        completedCount: 0,
        totalCount: 4,
        categories: [
          {
            id: "p6-final",
            name: "60日まとめ＆引き継ぎ",
            tasks: [
              { id: "p6-t1", title: "有料記事 表紙・サムネ・タイトル文確定", status: "todo", dueDate: "6/21", order: 1, day: 57 },
              { id: "p6-t2", title: "60日サマリー X連投準備（ハル5〜7本＋セナ5本）", status: "todo", dueDate: "6/22", order: 2, day: 58 },
              { id: "p6-t3", title: "■ 60日レビュー＋次の60日設計", status: "todo", dueDate: "6/23", order: 3, day: 59 },
              { id: "p6-t4", title: "★ 両Xスレッド公開｜60日記念連投＋有料記事予告", status: "todo", dueDate: "6/24", order: 4, day: 60 },
            ],
          },
        ],
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Project 2: Note記事管理
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "notes",
    name: "Note記事管理",
    color: "#0ea5e9",
    goals: [
      {
        id: "notes-free",
        name: "無料記事（集客・ファン化・教育）",
        completedCount: 0,
        totalCount: 8,
        categories: [
          {
            id: "nc-stance",
            name: "スタンス記事（固定）",
            tasks: [
              { id: "n0", title: "記事0｜AIと一緒に副業を組み立てている、私のスタンス", status: "todo", dueDate: "5/2", order: 1, day: 7 },
            ],
          },
          {
            id: "nc-efficiency",
            name: "AI×業務効率化シリーズ（4本）",
            tasks: [
              { id: "n1", title: "Note 1｜会社で実際にやっている5つの業務自動化", status: "todo", dueDate: "5/6", order: 1, day: 11 },
              { id: "n3", title: "Note 3｜プロンプト設計の基本（業務再利用テンプレ）", status: "todo", dueDate: "5/17", order: 2, day: 22 },
              { id: "n5", title: "Note 5｜ChatGPT vs Claude 業務での使い分け", status: "todo", dueDate: "5/31", order: 3, day: 36 },
              { id: "n7", title: "Note 7｜Excel×AIで月次レポート作業を半減した話", status: "todo", dueDate: "6/14", order: 4, day: 50 },
            ],
          },
          {
            id: "nc-taiken",
            name: "副業体験記シリーズ（3本）",
            tasks: [
              { id: "n2", title: "Note 2｜noteとXをゼロから立ち上げて2週間でわかったこと", status: "todo", dueDate: "5/10", order: 1, day: 15 },
              { id: "n4", title: "Note 4｜Note・X開設1ヶ月でわかったこと", status: "todo", dueDate: "5/24", order: 2, day: 29 },
              { id: "n8", title: "Note 8｜50日経過レポート＋有料記事の予告", status: "todo", dueDate: "6/21", order: 3, day: 57 },
            ],
          },
          {
            id: "nc-research",
            name: "副業×AIシリーズ（1本）",
            tasks: [
              { id: "n6", title: "Note 6｜副業のリサーチをAIで回す手順", status: "todo", dueDate: "6/7", order: 1, day: 43 },
            ],
          },
        ],
      },
      {
        id: "notes-paid",
        name: "有料記事（準備中）",
        completedCount: 0,
        totalCount: 1,
        categories: [
          {
            id: "nc-paid",
            name: "副業60日活動記",
            tasks: [
              { id: "n-paid1", title: "有料記事第1弾｜副業60日活動記 ¥980", status: "todo", dueDate: "7月予定", order: 1 },
            ],
          },
        ],
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Project 3: X運用（2アカウント）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "x-ops",
    name: "X運用（2アカウント）",
    color: "#1d4ed8",
    goals: [
      {
        id: "x-haru",
        name: "ハル垢｜Note発信源（1日3ポスト）",
        completedCount: 0,
        totalCount: 6,
        categories: [
          {
            id: "x-h-daily",
            name: "標準ポスト（平日）",
            tasks: [
              { id: "x-h1", title: "朝｜今日の活動宣言・セナとの壁打ち予告", status: "todo", order: 1 },
              { id: "x-h2", title: "昼｜作業中の気づき・ノウハウ・ツール紹介", status: "todo", order: 2 },
              { id: "x-h3", title: "夜｜1日の活動報告・学び・収益進捗", status: "todo", order: 3 },
            ],
          },
          {
            id: "x-h-note",
            name: "Note公開日｜三段ロケット（1段目）",
            tasks: [
              { id: "x-h4", title: "朝｜公開直前ティザー", status: "todo", order: 1 },
              { id: "x-h5", title: "昼｜公開告知「書きました」", status: "todo", order: 2 },
              { id: "x-h6", title: "夜｜読者反応への感謝＋気づき", status: "todo", order: 3 },
            ],
          },
        ],
      },
      {
        id: "x-sena",
        name: "セナ垢｜拡散・誘導装置（1日3ポスト）",
        completedCount: 0,
        totalCount: 5,
        categories: [
          {
            id: "x-s-daily",
            name: "標準ポスト（平日）",
            tasks: [
              { id: "x-s1", title: "朝｜ハル垢を引用RT＋ツッコミ（日次必須）", status: "todo", order: 1 },
              { id: "x-s2", title: "昼｜AI視点の単独コンテンツ", status: "todo", order: 2 },
              { id: "x-s3", title: "夜｜ハルの活動実況＋Note誘導", status: "todo", order: 3 },
            ],
          },
          {
            id: "x-s-note",
            name: "Note公開日｜三段ロケット（2〜3段目）",
            tasks: [
              { id: "x-s4", title: "2段目｜ハル告知を引用RT「書いたらしい」", status: "todo", order: 1 },
              { id: "x-s5", title: "3段目｜記事の見どころ抜粋＋誘導", status: "todo", order: 2 },
            ],
          },
        ],
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Project 4: KPI管理
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "kpi",
    name: "KPI管理",
    color: "#059669",
    goals: [
      {
        id: "kpi-60d",
        name: "60日KPI｜先行指標（2026/6/24）",
        completedCount: 0,
        totalCount: 6,
        categories: [
          {
            id: "kpi-content",
            name: "コンテンツ指標",
            tasks: [
              { id: "kpi-1", title: "Note記事 9本公開", status: "todo", dueDate: "6/24", order: 1 },
              { id: "kpi-2", title: "Xポスト累計 約330本（両垢合算）", status: "todo", dueDate: "6/24", order: 2 },
              { id: "kpi-3", title: "AI透明性エピソード 毎記事1〜2回", status: "todo", dueDate: "6/24", order: 3 },
            ],
          },
          {
            id: "kpi-reach",
            name: "リーチ指標",
            tasks: [
              { id: "kpi-4", title: "Xフォロワー 両垢合算300〜500人", status: "todo", dueDate: "6/24", order: 1 },
              { id: "kpi-5", title: "1記事あたりPV 100〜300", status: "todo", dueDate: "6/24", order: 2 },
              { id: "kpi-6", title: "連動引用RT実施率 80%以上", status: "todo", dueDate: "6/24", order: 3 },
            ],
          },
        ],
      },
      {
        id: "kpi-6m",
        name: "6ヶ月KPI｜中間指標（2026/10末）",
        completedCount: 0,
        totalCount: 4,
        categories: [
          {
            id: "kpi-6m-items",
            name: "目標",
            tasks: [
              { id: "kpi-7", title: "Note累計 20〜25本（有料2〜3本）", status: "todo", dueDate: "10月末", order: 1 },
              { id: "kpi-8", title: "Xフォロワー 両垢合算1,500〜2,000人", status: "todo", dueDate: "10月末", order: 2 },
              { id: "kpi-9", title: "固定読者 100名", status: "todo", dueDate: "10月末", order: 3 },
              { id: "kpi-10", title: "月収 ¥10,000〜30,000", status: "todo", dueDate: "10月末", order: 4 },
            ],
          },
        ],
      },
      {
        id: "kpi-1y",
        name: "1年KPI｜成長指標（2027/4末）",
        completedCount: 0,
        totalCount: 4,
        categories: [
          {
            id: "kpi-1y-items",
            name: "目標",
            tasks: [
              { id: "kpi-11", title: "Note累計 40〜50本（有料5〜7本）", status: "todo", dueDate: "2027/4末", order: 1 },
              { id: "kpi-12", title: "Xフォロワー 両垢合算3,500〜4,500人", status: "todo", dueDate: "2027/4末", order: 2 },
              { id: "kpi-13", title: "月収 ¥30,000〜80,000で安定", status: "todo", dueDate: "2027/4末", order: 3 },
              { id: "kpi-14", title: "メンバーシップ仮ローンチ予告", status: "todo", dueDate: "2027/4末", order: 4 },
            ],
          },
        ],
      },
      {
        id: "kpi-3y",
        name: "3年KPI｜成熟指標（2029/4末）",
        completedCount: 0,
        totalCount: 3,
        categories: [
          {
            id: "kpi-3y-items",
            name: "目標",
            tasks: [
              { id: "kpi-15", title: "Note累計 150本以上", status: "todo", dueDate: "2029/4末", order: 1 },
              { id: "kpi-16", title: "Xフォロワー 両垢合算25,000〜35,000人", status: "todo", dueDate: "2029/4末", order: 2 },
              { id: "kpi-17", title: "月収 ¥300,000〜500,000（3本柱で安定）", status: "todo", dueDate: "2029/4末", order: 3 },
            ],
          },
        ],
      },
    ],
  },
]

