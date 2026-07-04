import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ memoId: string }> }) {
  try {
    const { memoId } = await params
    await prisma.goalMemo.delete({ where: { id: memoId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to delete memo" }, { status: 500 })
  }
}
