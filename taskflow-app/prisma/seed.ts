/**
 * デモ用シードスクリプト
 * 実行: npx tsx prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { readFileSync } from "node:fs"
import path from "node:path"

// .env.local を手動ロード
try {
  const content = readFileSync(path.join(process.cwd(), ".env.local"), "utf-8")
  for (const line of content.split("\n")) {
    const match = line.match(/^([^#\s][^=]*)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const val = match[2].trim().replace(/^["']|["']$/g, "")
      if (!process.env[key]) process.env[key] = val
    }
  }
} catch {}

const pool = new Pool({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

function d(dateStr: string) {
  return new Date(dateStr.replace(/\//g, "-"))
}

async function main() {
  console.log("🗑️  既存データを削除中...")
  await prisma.taskWorkMemo.deleteMany()
  await prisma.task.deleteMany()
  await prisma.category.deleteMany()
  await prisma.goalMemo.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.projectMemo.deleteMany()
  await prisma.project.deleteMany()
  console.log("✅ 削除完了")

  console.log("🌱 デモデータを投入中...")

  // ──────────────────────────────────────────────
  // PROJECT 1: ウェブサイト リニューアル（進捗 約55%）
  // ──────────────────────────────────────────────
  const p1 = await prisma.project.create({
    data: {
      name: "ウェブサイト リニューアル",
      color: "#4f86c6",
      description: "会社のウェブサイトを全面リニューアルする。デザインを刷新し、スマートフォンでも見やすい構成に整える。",
      targetOutcome: "訪問者数 1.5倍、問い合わせ件数 月20件以上",
      risks: "デザイン確認・修正のやり取りで公開が遅れる可能性がある",
      order: 0,
    },
  })
  await prisma.projectMemo.createMany({ data: [
    { projectId: p1.id, text: "制作会社との定例MTGは毎週水曜 14:00〜。議事録はGoogleドライブの「WEBリニューアル」フォルダに保存している。" },
    { projectId: p1.id, text: "競合他社サイトを3社調査済み。シンプルで写真が大きいデザインが好評なので、同じ方向性で進める。" },
    { projectId: p1.id, text: "公開目標は7月末。それまでに社長確認が必要なので、7/20には最終デザインを送ること。" },
  ]})

  const g11 = await prisma.goal.create({
    data: {
      name: "デザイン・ページ制作",
      description: "各ページのデザインを作成し、コンテンツを揃える",
      targetMetric: "全ページの制作完了",
      order: 0,
      projectId: p1.id,
    },
  })
  await prisma.goalMemo.createMany({ data: [
    { goalId: g11.id, text: "デザインの方向性：白ベース、アクセントカラーは #4f86c6（青）。フォントはNoto Sans JP を使用。" },
    { goalId: g11.id, text: "写真素材は自社撮影分とストック素材を組み合わせる。ストック素材はUnsplashで調達済み。" },
  ]})

  const c111 = await prisma.category.create({ data: { name: "デザイン", order: 0, goalId: g11.id } })
  const t1 = await prisma.task.create({ data: { title: "ロゴ・ブランドカラーの決定", status: "DONE", order: 0, startDate: d("2026-05-10"), dueDate: d("2026-05-20"), categoryId: c111.id, labels: ["デザイン", "確認済み"] } })
  await prisma.taskWorkMemo.create({ data: { taskId: t1.id, text: "ロゴは既存のものを小変更。カラーコードは #4f86c6 に決定。デザイナーから最終データを受領済み。" } })

  const t2 = await prisma.task.create({ data: { title: "トップページのデザイン作成", status: "DONE", order: 1, startDate: d("2026-05-20"), dueDate: d("2026-06-05"), categoryId: c111.id, labels: ["デザイン", "確認済み"] } })
  await prisma.taskWorkMemo.create({ data: { taskId: t2.id, text: "社長レビューで「写真をもっと大きく」との指摘あり。修正版を6/3に提出し、承認をもらった。" } })

  const t3 = await prisma.task.create({ data: { title: "サービス紹介ページのデザイン", status: "INPROGRESS", order: 2, startDate: d("2026-06-15"), dueDate: d("2026-07-10"), categoryId: c111.id, labels: ["デザイン", "進行中"] } })
  await prisma.taskWorkMemo.create({ data: { taskId: t3.id, text: "サービスが5種類あるので、カード形式で横並びにする予定。デザイナーに7/5までに初稿を依頼している。" } })

  const c112 = await prisma.category.create({ data: { name: "コンテンツ制作", order: 1, goalId: g11.id } })
  const t4 = await prisma.task.create({ data: { title: "会社紹介・理念のテキスト作成", status: "DONE", order: 0, startDate: d("2026-06-01"), dueDate: d("2026-06-15"), categoryId: c112.id, labels: ["ライティング", "確認済み"] } })
  await prisma.taskWorkMemo.create({ data: { taskId: t4.id, text: "代表にインタビューしてまとめた。「お客様に寄り添う」をキーワードに統一。承認済み。" } })

  const t5 = await prisma.task.create({ data: { title: "スタッフ紹介ページの写真・文章準備", status: "INPROGRESS", order: 1, startDate: d("2026-06-20"), dueDate: d("2026-07-12"), categoryId: c112.id, labels: ["ライティング", "写真"] } })
  await prisma.taskWorkMemo.create({ data: { taskId: t5.id, text: "スタッフ8名分。写真撮影は6/28に完了。文章は各自に記入してもらうフォームを送付済み、3名未回答。" } })

  await prisma.task.create({ data: { title: "お客様の声・導入事例の掲載", status: "TODO", order: 2, startDate: d("2026-07-10"), dueDate: d("2026-07-25"), categoryId: c112.id, labels: ["ライティング"] } })

  const g12 = await prisma.goal.create({
    data: {
      name: "公開準備",
      description: "サーバー設定・最終確認を行い、公開に向けた準備を整える",
      targetMetric: "7月末までに公開",
      order: 1,
      projectId: p1.id,
    },
  })
  await prisma.goalMemo.create({ data: { goalId: g12.id, text: "公開前にGoogleアナリティクスの設定も必要。タグ埋め込みを制作会社に依頼すること。" } })

  const c121 = await prisma.category.create({ data: { name: "技術設定", order: 0, goalId: g12.id } })
  const t6 = await prisma.task.create({ data: { title: "ドメイン・サーバーの設定", status: "DONE", order: 0, startDate: d("2026-05-25"), dueDate: d("2026-06-01"), categoryId: c121.id, labels: ["技術", "確認済み"] } })
  await prisma.taskWorkMemo.create({ data: { taskId: t6.id, text: "さくらインターネットに契約済み。SSL証明書も設定完了。" } })

  await prisma.task.create({ data: { title: "お問い合わせフォームの動作確認", status: "TODO", order: 1, startDate: d("2026-07-15"), dueDate: d("2026-07-22"), categoryId: c121.id, labels: ["技術", "確認"] } })

  const c122 = await prisma.category.create({ data: { name: "公開前チェック", order: 1, goalId: g12.id } })
  await prisma.task.create({ data: { title: "スマートフォン表示の確認・修正", status: "TODO", order: 0, startDate: d("2026-07-20"), dueDate: d("2026-07-28"), categoryId: c122.id, labels: ["確認", "修正"] } })
  await prisma.task.create({ data: { title: "全ページのリンク・誤字チェック", status: "TODO", order: 1, startDate: d("2026-07-25"), dueDate: d("2026-07-31"), categoryId: c122.id, labels: ["確認"] } })

  // ──────────────────────────────────────────────
  // PROJECT 2: 新商品「ハンドクリーム」発売準備（進捗 約60%）
  // ──────────────────────────────────────────────
  const p2 = await prisma.project.create({
    data: {
      name: "新商品「ハンドクリーム」発売準備",
      color: "#e8855a",
      description: "オリジナルブランドの新商品ハンドクリームを企画・開発し、オンラインショップで販売を開始する。",
      targetOutcome: "発売初月で100個販売、リピート率 30%以上",
      risks: "製造会社とのスケジュール調整が遅れると発売日がずれる",
      order: 1,
    },
  })
  await prisma.projectMemo.createMany({ data: [
    { projectId: p2.id, text: "製造会社：株式会社〇〇コスメ（担当：田中さん TEL: 03-XXXX-XXXX）。納品は7/10〜15の予定。" },
    { projectId: p2.id, text: "価格設定：2,800円（税込）。送料は一律600円、5,000円以上で無料。競合より200円安い水準。" },
  ]})

  const g21 = await prisma.goal.create({
    data: {
      name: "商品開発",
      description: "レシピの確定からパッケージ完成まで",
      targetMetric: "6月末までに製造発注",
      order: 0,
      projectId: p2.id,
    },
  })
  await prisma.goalMemo.create({ data: { goalId: g21.id, text: "モニターテストの結果：「香りが良い」「伸びが良くべたつかない」と好評。「容量をもう少し多くしてほしい」という意見があったが、コスト面で現状維持に決定。" } })

  const c211 = await prisma.category.create({ data: { name: "試作・テスト", order: 0, goalId: g21.id } })
  const t7 = await prisma.task.create({ data: { title: "レシピ・成分の最終決定", status: "DONE", order: 0, startDate: d("2026-05-01"), dueDate: d("2026-05-20"), categoryId: c211.id, labels: ["開発", "確認済み"] } })
  await prisma.taskWorkMemo.create({ data: { taskId: t7.id, text: "ホホバオイルベース、香りはローズ。防腐剤不使用にこだわった。成分表は製造会社に提出済み。" } })

  const t8 = await prisma.task.create({ data: { title: "モニター10名へサンプル配布・フィードバック収集", status: "DONE", order: 1, startDate: d("2026-05-20"), dueDate: d("2026-06-10"), categoryId: c211.id, labels: ["テスト", "確認済み"] } })
  await prisma.taskWorkMemo.create({ data: { taskId: t8.id, text: "満足度平均4.3/5。「もっと大きいサイズがあれば買いたい」という声が3名から。次回ラインナップに検討する。" } })

  const t9 = await prisma.task.create({ data: { title: "パッケージデザインの決定", status: "DONE", order: 2, startDate: d("2026-06-05"), dueDate: d("2026-06-20"), categoryId: c211.id, labels: ["デザイン", "確認済み"] } })
  await prisma.taskWorkMemo.create({ data: { taskId: t9.id, text: "白地にゴールドの文字。ナチュラル・高級感を演出するデザインに決定。印刷データはデザイナーから入稿済み。" } })

  const c212 = await prisma.category.create({ data: { name: "製造手配", order: 1, goalId: g21.id } })
  const t10 = await prisma.task.create({ data: { title: "製造会社への発注・納期確認", status: "DONE", order: 0, startDate: d("2026-06-20"), dueDate: d("2026-06-30"), categoryId: c212.id, labels: ["発注", "確認済み"] } })
  await prisma.taskWorkMemo.create({ data: { taskId: t10.id, text: "初回ロット200個を発注。単価 @1,100円。納品予定 7/10〜15。発注書・請求書をドライブに保存済み。" } })

  const t11 = await prisma.task.create({ data: { title: "納品・品質確認", status: "INPROGRESS", order: 1, startDate: d("2026-07-01"), dueDate: d("2026-07-15"), categoryId: c212.id, labels: ["確認", "進行中"] } })
  await prisma.taskWorkMemo.create({ data: { taskId: t11.id, text: "7/10に200個が届く予定。全数の外観チェックと、10個をサンプルとして使用感チェックを行う。" } })

  const g22 = await prisma.goal.create({
    data: {
      name: "販売準備",
      description: "オンラインショップへの掲載と告知準備を行う",
      targetMetric: "8月1日に販売開始",
      order: 1,
      projectId: p2.id,
    },
  })
  await prisma.goalMemo.create({ data: { goalId: g22.id, text: "発売記念として、先着30名に「オリジナルポーチ」をプレゼントするキャンペーンを予定。ポーチの発注も忘れずに。" } })

  const c221 = await prisma.category.create({ data: { name: "ショップ設定", order: 0, goalId: g22.id } })
  const t12 = await prisma.task.create({ data: { title: "商品ページの作成（写真・説明文）", status: "INPROGRESS", order: 0, startDate: d("2026-07-05"), dueDate: d("2026-07-18"), categoryId: c221.id, labels: ["ライティング", "写真"] } })
  await prisma.taskWorkMemo.create({ data: { taskId: t12.id, text: "商品写真は7/12に撮影予定。説明文の下書きは完成。成分一覧・使い方・注意事項も記載する。" } })

  await prisma.task.create({ data: { title: "価格・送料・在庫数の設定", status: "TODO", order: 1, startDate: d("2026-07-15"), dueDate: d("2026-07-25"), categoryId: c221.id, labels: ["設定"] } })

  const c222 = await prisma.category.create({ data: { name: "告知・集客", order: 1, goalId: g22.id } })
  await prisma.task.create({ data: { title: "SNS告知の投稿スケジュール作成", status: "TODO", order: 0, startDate: d("2026-07-15"), dueDate: d("2026-07-22"), categoryId: c222.id, labels: ["SNS", "マーケティング"] } })
  await prisma.task.create({ data: { title: "メールマガジンで先行案内を送る", status: "TODO", order: 1, startDate: d("2026-07-25"), dueDate: d("2026-07-31"), categoryId: c222.id, labels: ["メール", "マーケティング"] } })

  // ──────────────────────────────────────────────
  // PROJECT 3: 秋の感謝祭イベント 企画・運営（進捗 約25%）
  // ──────────────────────────────────────────────
  const p3 = await prisma.project.create({
    data: {
      name: "秋の感謝祭イベント 企画・運営",
      color: "#7c6fcd",
      description: "お客様への感謝を伝えるリアルイベントを10月に開催する。会場での体験・試食・プレゼント企画などを盛り込む。",
      targetOutcome: "来場者 150名、アンケート満足度 90%以上",
      risks: "会場の予約が取れない場合、日程変更が必要になる",
      order: 2,
    },
  })
  await prisma.projectMemo.createMany({ data: [
    { projectId: p3.id, text: "開催日の第一候補：10月18日（土）。会場は〇〇コミュニティホール（収容200名）。7/15までに仮予約を入れる必要あり。" },
    { projectId: p3.id, text: "昨年のイベント（来場者80名）の反省：受付に時間がかかった、飲み物が足りなかった。今年は事前受付制にして改善する。" },
  ]})

  const g31 = await prisma.goal.create({
    data: {
      name: "企画立案",
      description: "イベントのコンセプトと基本計画を固める",
      targetMetric: "7月末までに企画書を完成・承認",
      order: 0,
      projectId: p3.id,
    },
  })
  await prisma.goalMemo.create({ data: { goalId: g31.id, text: "テーマは「ありがとうを届ける秋のひととき」に決定。自然・温かみを意識したデコレーションにする。お子様連れも来やすいようキッズコーナーも検討中。" } })

  const c311 = await prisma.category.create({ data: { name: "コンセプト設計", order: 0, goalId: g31.id } })
  const t13 = await prisma.task.create({ data: { title: "イベントテーマ・コンセプトの決定", status: "DONE", order: 0, startDate: d("2026-06-15"), dueDate: d("2026-06-25"), categoryId: c311.id, labels: ["企画", "確認済み"] } })
  await prisma.taskWorkMemo.create({ data: { taskId: t13.id, text: "チームで話し合い「ありがとうを届ける秋のひととき」に決定。温かみのある秋らしい演出にする方向で統一。" } })

  const t14 = await prisma.task.create({ data: { title: "会場候補のリストアップ・見積もり依頼", status: "DONE", order: 1, startDate: d("2026-06-25"), dueDate: d("2026-07-05"), categoryId: c311.id, labels: ["調査", "確認済み"] } })
  await prisma.taskWorkMemo.create({ data: { taskId: t14.id, text: "3会場を比較。〇〇コミュニティホールが価格・立地・収容人数のバランスで最良。見積もり：78,000円（6時間）。" } })

  const t15 = await prisma.task.create({ data: { title: "予算計画書の作成", status: "INPROGRESS", order: 2, startDate: d("2026-07-01"), dueDate: d("2026-07-10"), categoryId: c311.id, labels: ["資料", "進行中"] } })
  await prisma.taskWorkMemo.create({ data: { taskId: t15.id, text: "会場費・装飾・飲食・印刷物などで合計 約25万円の見込み。上長への承認申請用に資料をまとめ中。" } })

  const c312 = await prisma.category.create({ data: { name: "コンテンツ計画", order: 1, goalId: g31.id } })
  const t16 = await prisma.task.create({ data: { title: "当日のタイムスケジュール作成", status: "INPROGRESS", order: 0, startDate: d("2026-07-05"), dueDate: d("2026-07-15"), categoryId: c312.id, labels: ["資料", "進行中"] } })
  await prisma.taskWorkMemo.create({ data: { taskId: t16.id, text: "13:00開場〜17:00終了の4時間構成で検討中。オープニング・体験コーナー・プレゼント抽選の3パートに分ける案。" } })

  await prisma.task.create({ data: { title: "体験コーナー・プレゼント企画の内容決定", status: "TODO", order: 1, startDate: d("2026-07-10"), dueDate: d("2026-07-20"), categoryId: c312.id, labels: ["企画"] } })

  const g32 = await prisma.goal.create({
    data: {
      name: "集客・告知",
      description: "お客様への案内と参加者を集める施策を実施する",
      targetMetric: "事前申し込み 150名",
      order: 1,
      projectId: p3.id,
    },
  })
  await prisma.goalMemo.create({ data: { goalId: g32.id, text: "告知チャネル：Instagram・LINE公式アカウント・メールマガジン・店頭チラシの4つ。過去のイベントではLINE経由が最も申し込みが多かった。" } })

  const c321 = await prisma.category.create({ data: { name: "告知物の準備", order: 0, goalId: g32.id } })
  await prisma.task.create({ data: { title: "フライヤー・案内状のデザイン", status: "TODO", order: 0, startDate: d("2026-07-20"), dueDate: d("2026-08-05"), categoryId: c321.id, labels: ["デザイン"] } })
  await prisma.task.create({ data: { title: "SNS・メルマガで告知開始", status: "TODO", order: 1, startDate: d("2026-08-01"), dueDate: d("2026-08-15"), categoryId: c321.id, labels: ["SNS", "メール"] } })

  const c322 = await prisma.category.create({ data: { name: "参加者管理", order: 1, goalId: g32.id } })
  await prisma.task.create({ data: { title: "申し込みフォームの作成・公開", status: "TODO", order: 0, startDate: d("2026-07-25"), dueDate: d("2026-08-05"), categoryId: c322.id, labels: ["設定"] } })
  await prisma.task.create({ data: { title: "申し込み状況の確認・参加者リスト管理", status: "TODO", order: 1, startDate: d("2026-08-15"), dueDate: d("2026-09-30"), categoryId: c322.id, labels: ["管理"] } })

  console.log("✅ デモデータ投入完了！")
  console.log("   📁 プロジェクト: 3件（メモ計7件）")
  console.log("   🎯 ゴール: 6件（メモ計6件）")
  console.log("   📂 カテゴリ: 12件")
  console.log("   ✅ タスク: 29件（メモ・ラベル付き）")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
