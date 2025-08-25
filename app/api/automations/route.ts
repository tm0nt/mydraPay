import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const automationSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  url: z.string().url("URL inválida"),
  events: z.array(z.enum(["PIX_CREATED", "PIX_PAID", "BALANCE_CHANGED", "OTHER"])),
  status: z.enum(["ENABLED", "DISABLED"]).default("ENABLED"),
  headers: z.record(z.string()).optional(),
  transform: z.record(z.any()).optional(),
})

// GET /api/automations - Listar automações
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
    const status = searchParams.get("status")

    const skip = (page - 1) * limit

    const where: any = { userId: user.id }
    if (status) where.status = status

    const [automations, total] = await Promise.all([
      prisma.automationRule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          secrets: {
            select: {
              id: true,
              name: true,
              validFrom: true,
              validTo: true,
            },
          },
          deliveries: {
            select: {
              id: true,
              event: true,
              status: true,
              attempt: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          _count: {
            select: {
              deliveries: true,
            },
          },
        },
      }),
      prisma.automationRule.count({ where }),
    ])

    return NextResponse.json({
      automations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar automações:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/automations - Criar automação
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = automationSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const automation = await prisma.automationRule.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        url: validatedData.url,
        events: validatedData.events,
        status: validatedData.status,
        headers: validatedData.headers,
        transform: validatedData.transform,
      },
      include: {
        secrets: true,
        _count: {
          select: {
            deliveries: true,
          },
        },
      },
    })

    return NextResponse.json(automation, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar automação:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
