import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest) {
  try {
    const { ids } = await req.json()
    await Promise.all(
      (ids as string[]).map((id, index) =>
        prisma.category.update({ where: { id }, data: { order: index } })
      )
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to reorder categories" }, { status: 500 })
  }
}
