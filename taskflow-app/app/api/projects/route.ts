import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { transformProjects } from "@/lib/db-transform"

export async function GET() {
  try {
    const dbProjects = await prisma.project.findMany({
      orderBy: { order: "asc" },
      include: {
        goals: {
          orderBy: { order: "asc" },
          include: {
            categories: {
              orderBy: { order: "asc" },
              include: { tasks: { orderBy: { order: "asc" } } },
            },
          },
        },
      },
    })
    return NextResponse.json(transformProjects(dbProjects))
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, name, color } = await req.json()
    const count = await prisma.project.count()
    const project = await prisma.project.create({
      data: { id, name, color, order: count },
    })
    return NextResponse.json(project, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
