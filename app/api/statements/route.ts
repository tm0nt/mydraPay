import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const statementSchema = z.object({
  currentBalance: z.number(),
  pendingBalance: z.number().default(0),
  blockedBalance: z.number().default(0),
  reserveBalance: z.number().default(0),
  initialBalance: z.number(),
  variation: z.number(),
  finalBalance: z.number(),
  source: z.string().optional(),
})

// GET /api/statements - Listar extratos
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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const skip = (page - 1) * limit

    const where: any = { userId: user.id }

    if (startDate || endDate) {
      where.asOf = {}
      if (startDate) where.asOf.gte = new Date(startDate)
      if (endDate) where.asOf.lte = new Date(endDate)
    }

    const [statements, total] = await Promise.all([
      prisma.statement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { asOf: "desc" },
      }),
      prisma.statement.count({ where }),
    ])

    // Obter saldo atual (último statement)
    const latestStatement = await prisma.statement.findFirst({
      where: { userId: user.id },
      orderBy: { asOf: "desc" },
    })

    return NextResponse.json({
      statements,
      currentBalance: latestStatement?.finalBalance || 0,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar extratos:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/statements - Criar extrato
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = statementSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const statement = await prisma.statement.create({
      data: {
        userId: user.id,
        currentBalance: validatedData.currentBalance,
        pendingBalance: validatedData.pendingBalance,
        blockedBalance: validatedData.blockedBalance,
        reserveBalance: validatedData.reserveBalance,
        initialBalance: validatedData.initialBalance,
        variation: validatedData.variation,
        finalBalance: validatedData.finalBalance,
        source: validatedData.source,
      },
    })

    return NextResponse.json(statement, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar extrato:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
