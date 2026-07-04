import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest) {
  try {
    const { ids } = await req.json() as { ids: string[] }
    await prisma.$transaction(
      ids.map((id, order) => prisma.goal.update({ where: { id }, data: { order } }))
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to reorder goals" }, { status: 500 })
  }
}
