import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { toDbStatus } from "@/lib/db-transform"
import type { Status } from "@/lib/types"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { title, status, dueDate, startDate, labels } = body
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(status !== undefined && { status: toDbStatus(status as Status) }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate.replace(/\//g, "-")) : null }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate.replace(/\//g, "-")) : null }),
        ...(labels !== undefined && { labels }),
      },
    })
    return NextResponse.json(task)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.task.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
