import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { id, name, projectId } = await req.json()
    const count = await prisma.goal.count({ where: { projectId } })
    const goal = await prisma.goal.create({
      data: { id, name, projectId, order: count },
    })
    return NextResponse.json(goal, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}
