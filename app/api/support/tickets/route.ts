import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const ticketSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  message: z.string().min(1, "Mensagem é obrigatória"),
  priority: z.number().int().min(1).max(5).default(3),
  tags: z.array(z.string()).default([]),
})

// GET /api/support/tickets - Listar tickets de suporte
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
    const priority = searchParams.get("priority")

    const skip = (page - 1) * limit

    const where: any = { userId: user.id }

    if (status) where.status = status
    if (priority) where.priority = Number.parseInt(priority)

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.supportTicket.count({ where }),
    ])

    // Estatísticas dos tickets
    const stats = await prisma.supportTicket.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: {
        _all: true,
      },
    })

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    })
  } catch (error) {
    console.error("Erro ao listar tickets:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/support/tickets - Criar ticket de suporte
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = ticketSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        message: validatedData.message,
        priority: validatedData.priority,
        tags: validatedData.tags,
        status: "OPEN",
      },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar ticket:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
