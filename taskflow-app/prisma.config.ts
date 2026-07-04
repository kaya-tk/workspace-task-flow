import path from "node:path"
import { readFileSync } from "node:fs"
import { defineConfig } from "prisma/config"

// Prisma CLIは.env.localを自動で読まないため手動でロードする
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
} catch {
  // .env.localが存在しない場合はスキップ
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
})
