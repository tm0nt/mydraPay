import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const splitSchema = z.object({
  transactionId: z.string().uuid(),
  amount: z.number().positive("Valor deve ser positivo"),
  recipientEmail: z.string().email("Email inválido"),
  metadata: z.record(z.any()).optional(),
})

// GET /api/transactions/splits - Listar splits
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
    const transactionId = searchParams.get("transactionId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const skip = (page - 1) * limit

    const where: any = {
      transaction: {
        userId: user.id,
      },
    }

    if (transactionId) {
      where.transactionId = transactionId
    }

    const [splits, total] = await Promise.all([
      prisma.transactionSplit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          transaction: {
            select: {
              id: true,
              amount: true,
              type: true,
              method: true,
              status: true,
            },
          },
        },
      }),
      prisma.transactionSplit.count({ where }),
    ])

    return NextResponse.json({
      splits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar splits:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/transactions/splits - Criar split
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = splitSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se a transação existe e pertence ao usuário
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: validatedData.transactionId,
        userId: user.id,
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
    }

    // Verificar se o valor do split não excede o valor da transação
    const existingSplits = await prisma.transactionSplit.findMany({
      where: { transactionId: validatedData.transactionId },
    })

    const totalSplits = existingSplits.reduce((sum, split) => sum + Number(split.amount), 0)
    const newTotal = totalSplits + validatedData.amount

    if (newTotal > Number(transaction.amount)) {
      return NextResponse.json({ error: "Valor total dos splits excede o valor da transação" }, { status: 400 })
    }

    const split = await prisma.transactionSplit.create({
      data: {
        transactionId: validatedData.transactionId,
        amount: validatedData.amount,
        recipientEmail: validatedData.recipientEmail,
        status: "PENDING",
        metadata: validatedData.metadata,
      },
      include: {
        transaction: {
          select: {
            id: true,
            amount: true,
            type: true,
            method: true,
            status: true,
          },
        },
      },
    })

    return NextResponse.json(split, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar split:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
