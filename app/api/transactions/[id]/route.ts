import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateTransactionSchema = z.object({
  status: z.enum(["PENDING", "AUTHORIZED", "COMPLETED", "FAILED", "REFUNDED", "CANCELED", "CHARGEBACK"]).optional(),
  feeAmount: z.number().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/transactions/[id] - Obter transação específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        acquirer: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        splits: {
          include: {
            transaction: {
              select: {
                id: true,
                amount: true,
              },
            },
          },
        },
        checkout: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Erro ao obter transação:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// PUT /api/transactions/[id] - Atualizar transação
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = updateTransactionSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: params.id },
      data: validatedData,
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

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao atualizar transação:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
