import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const memos = await prisma.goalMemo.findMany({
      where: { goalId: id },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json(memos)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to fetch memos" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { text } = await req.json()
    const memo = await prisma.goalMemo.create({
      data: { text, goalId: id },
    })
    return NextResponse.json(memo, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create memo" }, { status: 500 })
  }
}
