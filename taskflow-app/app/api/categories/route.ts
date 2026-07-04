import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { id, name, goalId } = await req.json()
    const count = await prisma.category.count({ where: { goalId } })
    const category = await prisma.category.create({
      data: { id, name, goalId, order: count },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
