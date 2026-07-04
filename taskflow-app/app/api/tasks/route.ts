import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { id, title, categoryId } = await req.json()
    const count = await prisma.task.count({ where: { categoryId } })
    const task = await prisma.task.create({
      data: { id, title, categoryId, order: count, status: "TODO" },
    })
    return NextResponse.json(task, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
