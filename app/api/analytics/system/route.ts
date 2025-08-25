import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const analyticSchema = z.object({
  sessions: z.number().int().min(0),
  users: z.number().int().min(0),
  pixGenerated: z.number().int().min(0),
  pixPaid: z.number().int().min(0),
  creditPaid: z.number().int().min(0),
  creditError: z.number().int().min(0),
  rejections: z.number().int().min(0),
  avgPixTimeSec: z.number().int().optional(),
  trafficSources: z.string().optional(),
  technology: z.string().optional(),
})

// GET /api/analytics/system - Obter analytics do sistema (admin only)
export async function GET(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const skip = (page - 1) * limit

    const where: any = {}

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [analytics, total] = await Promise.all([
      prisma.analytic.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.analytic.count({ where }),
    ])

    return NextResponse.json({
      analytics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao obter analytics do sistema:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/analytics/system - Criar entrada de analytics (sistema interno)
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = analyticSchema.parse(body)

    const analytic = await prisma.analytic.create({
      data: validatedData,
    })

    return NextResponse.json(analytic, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar analytics:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
