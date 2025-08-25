import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// GET /api/analytics - Obter dados analíticos
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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const period = searchParams.get("period") || "30d" // 7d, 30d, 90d, 1y

    // Definir período padrão se não fornecido
    let dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else {
      const now = new Date()
      const daysBack = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365
      const startPeriod = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
      dateFilter = {
        gte: startPeriod,
        lte: now,
      }
    }

    // Estatísticas de transações
    const transactionStats = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        createdAt: dateFilter,
      },
      _sum: {
        amount: true,
        feeAmount: true,
      },
      _count: {
        _all: true,
      },
    })

    // Transações por status
    const transactionsByStatus = await prisma.transaction.groupBy({
      by: ["status"],
      where: {
        userId: user.id,
        createdAt: dateFilter,
      },
      _count: {
        _all: true,
      },
      _sum: {
        amount: true,
      },
    })

    // Transações por método de pagamento
    const transactionsByMethod = await prisma.transaction.groupBy({
      by: ["method"],
      where: {
        userId: user.id,
        createdAt: dateFilter,
      },
      _count: {
        _all: true,
      },
      _sum: {
        amount: true,
      },
    })

    // Transações por tipo
    const transactionsByType = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId: user.id,
        createdAt: dateFilter,
      },
      _count: {
        _all: true,
      },
      _sum: {
        amount: true,
      },
    })

    // Estatísticas de clientes
    const customerStats = await prisma.customer.aggregate({
      where: {
        userId: user.id,
        deletedAt: null,
        createdAt: dateFilter,
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    })

    // Top clientes por valor
    const topCustomers = await prisma.customer.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      orderBy: {
        amount: "desc",
      },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        amount: true,
        createdAt: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    })

    // Evolução temporal (últimos 30 dias)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const dailyTransactions = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as count,
        SUM(amount)::float as total_amount,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END)::int as completed_count,
        SUM(CASE WHEN status = 'COMPLETED' THEN amount ELSE 0 END)::float as completed_amount
      FROM "Transaction"
      WHERE user_id = ${user.id}
        AND created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `

    // Estatísticas de saques
    const withdrawalStats = await prisma.withdrawal.aggregate({
      where: {
        userId: user.id,
        createdAt: dateFilter,
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    })

    return NextResponse.json({
      period,
      dateRange: {
        start: dateFilter.gte,
        end: dateFilter.lte,
      },
      transactions: {
        total: transactionStats._count._all,
        totalAmount: transactionStats._sum.amount || 0,
        totalFees: transactionStats._sum.feeAmount || 0,
        byStatus: transactionsByStatus,
        byMethod: transactionsByMethod,
        byType: transactionsByType,
        daily: dailyTransactions,
      },
      customers: {
        total: customerStats._count._all,
        totalAmount: customerStats._sum.amount || 0,
        top: topCustomers,
      },
      withdrawals: {
        total: withdrawalStats._count._all,
        totalAmount: withdrawalStats._sum.amount || 0,
      },
    })
  } catch (error) {
    console.error("Erro ao obter analytics:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
