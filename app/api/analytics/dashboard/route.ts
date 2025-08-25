import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import prisma from "@/lib/prisma"

// GET /api/analytics/dashboard - Dashboard analytics resumido
export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
  
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

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

    // Período: últimos 30 dias
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    // Período anterior para comparação
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

    // Métricas atuais (últimos 30 dias)
    const [
      currentTransactions,
      currentRevenue,
      currentCustomers,
      currentWithdrawals,
      // Métricas do período anterior (30-60 dias atrás)
      previousTransactions,
      previousRevenue,
      previousCustomers,
      previousWithdrawals,
    ] = await Promise.all([
      // Período atual
      prisma.transaction.count({
        where: {
          userId: user.id,
          createdAt: { gte: thirtyDaysAgo, lte: today },
        },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          status: "COMPLETED",
          createdAt: { gte: thirtyDaysAgo, lte: today },
        },
        _sum: { amount: true },
      }),
      prisma.customer.count({
        where: {
          userId: user.id,
          deletedAt: null,
          createdAt: { gte: thirtyDaysAgo, lte: today },
        },
      }),
      prisma.withdrawal.aggregate({
        where: {
          userId: user.id,
          createdAt: { gte: thirtyDaysAgo, lte: today },
        },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      // Período anterior
      prisma.transaction.count({
        where: {
          userId: user.id,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          status: "COMPLETED",
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),
      prisma.customer.count({
        where: {
          userId: user.id,
          deletedAt: null,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      prisma.withdrawal.aggregate({
        where: {
          userId: user.id,
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ])

    // Calcular variações percentuais
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    // Transações recentes
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Saldo atual (último statement)
    const latestStatement = await prisma.statement.findFirst({
      where: { userId: user.id },
      orderBy: { asOf: "desc" },
    })

    return NextResponse.json({
      summary: {
        transactions: {
          current: currentTransactions,
          previous: previousTransactions,
          growth: calculateGrowth(currentTransactions, previousTransactions),
        },
        revenue: {
          current: currentRevenue._sum.amount || 0,
          previous: previousRevenue._sum.amount || 0,
          growth: calculateGrowth(Number(currentRevenue._sum.amount || 0), Number(previousRevenue._sum.amount || 0)),
        },
        customers: {
          current: currentCustomers,
          previous: previousCustomers,
          growth: calculateGrowth(currentCustomers, previousCustomers),
        },
        withdrawals: {
          current: currentWithdrawals._sum.amount || 0,
          previous: previousWithdrawals._sum.amount || 0,
          growth: calculateGrowth(
            Number(currentWithdrawals._sum.amount || 0),
            Number(previousWithdrawals._sum.amount || 0),
          ),
        },
        balance: {
          current: latestStatement?.finalBalance || 0,
          pending: latestStatement?.pendingBalance || 0,
          blocked: latestStatement?.blockedBalance || 0,
        },
      },
      recentTransactions,
      period: {
        start: thirtyDaysAgo,
        end: today,
      },
    })
  } catch (error) {
    console.error("Erro ao obter dashboard analytics:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
