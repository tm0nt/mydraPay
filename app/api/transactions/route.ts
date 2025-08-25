import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const transactionSchema = z.object({
  amount: z.number().positive("Valor deve ser positivo"),
  currency: z.enum(["BRL", "USD", "EUR"]).default("BRL"),
  type: z.enum(["INCOMING", "OUTGOING"]),
  method: z.enum(["PIX", "CREDIT_CARD", "CRYPTO", "BOLETO", "OTHER"]),
  description: z.string().optional(),
  customerId: z.string().uuid().optional(),
  acquirerId: z.string().uuid().optional(),
  externalRef: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/transactions - Listar transações
export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
  
    if (!session?.user?.email) {
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
    const type = searchParams.get("type")
    const method = searchParams.get("method")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const skip = (page - 1) * limit

    const where: any = { userId: user.id }

    if (status) where.status = status
    if (type) where.type = type
    if (method) where.method = method
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          acquirer: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          splits: true,
        },
      }),
      prisma.transaction.count({ where }),
    ])

    // Calcular estatísticas
    const stats = await prisma.transaction.aggregate({
      where: { userId: user.id },
      _sum: {
        amount: true,
        feeAmount: true,
      },
      _count: {
        _all: true,
      },
    })

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalAmount: stats._sum.amount || 0,
        totalFees: stats._sum.feeAmount || 0,
        totalTransactions: stats._count._all,
      },
    })
  } catch (error) {
    console.error("Erro ao listar transações:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/transactions - Criar transação
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = transactionSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se customer existe (se fornecido)
    if (validatedData.customerId) {
      const customer = await prisma.customer.findFirst({
        where: {
          id: validatedData.customerId,
          userId: user.id,
        },
      })

      if (!customer) {
        return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
      }
    }

    // Verificar se acquirer existe (se fornecido)
    if (validatedData.acquirerId) {
      const acquirer = await prisma.acquirer.findUnique({
        where: { id: validatedData.acquirerId },
      })

      if (!acquirer || !acquirer.active) {
        return NextResponse.json({ error: "Adquirente não encontrado ou inativo" }, { status: 404 })
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: validatedData.amount,
        currency: validatedData.currency,
        type: validatedData.type,
        method: validatedData.method,
        status: "PENDING",
        description: validatedData.description,
        customerId: validatedData.customerId,
        acquirerId: validatedData.acquirerId,
        externalRef: validatedData.externalRef,
        payload: {},
        metadata: validatedData.metadata,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        acquirer: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar transação:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
