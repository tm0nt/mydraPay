import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const withdrawalSchema = z.object({
  amount: z.number().positive("Valor deve ser positivo"),
  method: z.enum(["PIX", "CREDIT_CARD", "CRYPTO", "BOLETO", "OTHER"]),
  pixKeyType: z.string().optional(),
  pixKey: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/withdrawals - Listar saques
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
    const method = searchParams.get("method")

    const skip = (page - 1) * limit

    const where: any = { userId: user.id }

    if (status) where.status = status
    if (method) where.method = method

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.withdrawal.count({ where }),
    ])

    return NextResponse.json({
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar saques:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/withdrawals - Criar saque
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = withdrawalSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        settings: true,
        balance: true, // Include balance para verificação
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se usuário pode sacar
    if (!user.canWithdraw) {
      return NextResponse.json({ error: "Usuário não autorizado a sacar" }, { status: 403 })
    }

    // Verificar KYC aprovado
    if (!user.kycApproved) {
      return NextResponse.json({ error: "KYC não aprovado" }, { status: 403 })
    }

    // Obter configurações globais para limites
    const globalConfig = await prisma.globalConfig.findFirst()
    const minWithdrawal = user.settings?.minPixWithdrawal || globalConfig?.minPixWithdrawal || 10

    if (validatedData.amount < Number(minWithdrawal)) {
      return NextResponse.json({ error: `Valor mínimo para saque é R$ ${minWithdrawal}` }, { status: 400 })
    }

    // Verificar saldo disponível
    const currentBalance = user.balance?.available || 0
    if (Number(currentBalance) < validatedData.amount) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 })
    }

    // Verificar limite diário (se configurado)
    if (user.settings?.dailyWithdrawalLimit) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayWithdrawals = await prisma.withdrawal.aggregate({
        where: {
          userId: user.id,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
          status: {
            in: ["PENDING", "AUTHORIZED", "COMPLETED"],
          },
        },
        _sum: {
          amount: true,
        },
      })

      const todayTotal = Number(todayWithdrawals._sum.amount || 0)
      const dailyLimit = Number(user.settings.dailyWithdrawalLimit)

      if (todayTotal + validatedData.amount > dailyLimit) {
        return NextResponse.json(
          { error: `Limite diário de saque excedido. Limite: R$ ${dailyLimit}` },
          { status: 400 },
        )
      }
    }

    // === TRANSAÇÃO ATÔMICA PARA TODAS AS OPERAÇÕES ===
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar o withdrawal
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId: user.id,
          amount: validatedData.amount,
          method: validatedData.method,
          pixKeyType: validatedData.pixKeyType,
          pixKey: validatedData.pixKey,
          description: validatedData.description,
          status: "PENDING",
          dailyLimit: user.settings?.dailyWithdrawalLimit,
          metadata: validatedData.metadata,
        },
      })

      // 2. Atualizar balance do usuário (reduzir available, aumentar pending)
      const updatedBalance = await tx.userBalance.update({
        where: { userId: user.id },
        data: {
          available: {
            decrement: validatedData.amount
          },
          pending: {
            increment: validatedData.amount
          }
        }
      })

      // 3. Criar transação de saída
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          amount: validatedData.amount,
          currency: "BRL",
          type: "OUTGOING",
          method: validatedData.method,
          status: "PENDING",
          description: `Saque PIX - ${validatedData.description || 'Sem descrição'}`,
          payload: {
            withdrawalId: withdrawal.id,
            pixKey: validatedData.pixKey,
            pixKeyType: validatedData.pixKeyType
          },
          metadata: validatedData.metadata,
        }
      })

      // 4. Criar statement
      const statement = await tx.statement.create({
        data: {
          userId: user.id,
          asOf: new Date(),
          initialBalance: Number(currentBalance),
          variation: -Number(validatedData.amount),
          finalBalance: Number(updatedBalance.available),
          pendingBalance: Number(updatedBalance.pending),
          blockedBalance: Number(updatedBalance.blocked),
          transactionsCount: 1,
          source: "withdrawal_request"
        }
      })

      // 5. Criar notificação
      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Solicitação de saque criada",
          description: `Saque de R$ ${validatedData.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} via PIX foi solicitado e está pendente de processamento.`,
          type: "INFO",
          priority: "MEDIUM",
          url: `/financeiro/saques/${withdrawal.id}`,
          metadata: {
            withdrawalId: withdrawal.id,
            amount: validatedData.amount,
            method: validatedData.method
          }
        }
      })

      // 6. Audit entry
      await tx.auditEntry.create({
        data: {
          actorUserId: user.id,
          entity: "Withdrawal",
          entityId: withdrawal.id,
          action: "CREATE",
          after: {
            id: withdrawal.id,
            amount: validatedData.amount,
            method: validatedData.method,
            status: "PENDING"
          },
          reason: "Solicitação de saque via API"
        }
      })

      // 7. Domain event
      await tx.domainEvent.create({
        data: {
          actorUserId: user.id,
          eventName: "WITHDRAWAL_REQUESTED",
          payload: {
            withdrawalId: withdrawal.id,
            userId: user.id,
            amount: validatedData.amount,
            method: validatedData.method,
            pixKey: validatedData.pixKey
          }
        }
      })

      // 8. System log
      await tx.systemLog.create({
        data: {
          actorUserId: user.id,
          level: "INFO",
          service: "withdrawals",
          category: "request",
          message: `Saque solicitado: R$ ${validatedData.amount} via ${validatedData.method}`,
          context: {
            withdrawalId: withdrawal.id,
            amount: validatedData.amount,
            method: validatedData.method,
            pixKey: validatedData.pixKey
          }
        }
      })

      return { withdrawal, transaction, statement, updatedBalance }
    })

    return NextResponse.json({
      withdrawal: result.withdrawal,
      transaction: result.transaction,
      balance: {
        available: Number(result.updatedBalance.available),
        pending: Number(result.updatedBalance.pending),
        blocked: Number(result.updatedBalance.blocked)
      },
      message: "Saque solicitado com sucesso"
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar saque:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

