import { NextResponse } from "next/server"
import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

const SETTINGS_PATH = join(process.cwd(), "settings.json")

function readSettings() {
  try {
    return JSON.parse(readFileSync(SETTINGS_PATH, "utf-8"))
  } catch {
    return { showProjectSplash: true }
  }
}

export async function GET() {
  return NextResponse.json(readSettings())
}

export async function PATCH(req: Request) {
  const updates = await req.json()
  const current = readSettings()
  const next = { ...current, ...updates }
  writeFileSync(SETTINGS_PATH, JSON.stringify(next, null, 2))
  return NextResponse.json(next)
}
