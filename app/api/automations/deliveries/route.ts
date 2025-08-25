import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// GET /api/automations/deliveries - Listar entregas de automação
export async function GET(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const ruleId = searchParams.get("ruleId")
    const status = searchParams.get("status")
    const event = searchParams.get("event")

    const skip = (page - 1) * limit

    const where: any = { userId: user.id }

    if (ruleId) where.ruleId = ruleId
    if (status) where.status = status
    if (event) where.event = event

    const [deliveries, total] = await Promise.all([
      prisma.automationDelivery.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          rule: {
            select: {
              id: true,
              name: true,
              url: true,
            },
          },
        },
      }),
      prisma.automationDelivery.count({ where }),
    ])

    return NextResponse.json({
      deliveries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar entregas:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
