import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

// GET /api/analytics/dashboard - Dashboard analytics resumido
export async function GET(_request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Período atual (últimos 30 dias) e anterior (30-60 dias)
    const now = new Date();
    const today = new Date(now);
    today.setHours(23, 59, 59, 999);

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Consultas paralelas: período atual e anterior
    const [
      currentTransactions,
      currentRevenueAgg,
      currentFeesAgg,
      currentCustomers,
      currentWithdrawalsAgg,
      previousTransactions,
      previousRevenueAgg,
      previousFeesAgg,
      previousCustomers,
      previousWithdrawalsAgg,
    ] = await Promise.all([
      // Período atual
      prisma.transaction.count({
        where: { userId: user.id, createdAt: { gte: thirtyDaysAgo, lte: today } },
      }),
      prisma.transaction.aggregate({
        where: { userId: user.id, status: "COMPLETED", createdAt: { gte: thirtyDaysAgo, lte: today } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId: user.id, status: "COMPLETED", createdAt: { gte: thirtyDaysAgo, lte: today } },
        _sum: { feeAmount: true },
      }),
      prisma.customer.count({
        where: { userId: user.id, deletedAt: null, createdAt: { gte: thirtyDaysAgo, lte: today } },
      }),
      prisma.withdrawal.aggregate({
        where: { userId: user.id, createdAt: { gte: thirtyDaysAgo, lte: today } },
        _sum: { amount: true },
        _count: { _all: true },
      }),

      // Período anterior (30-60 dias atrás)
      prisma.transaction.count({
        where: { userId: user.id, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
      prisma.transaction.aggregate({
        where: { userId: user.id, status: "COMPLETED", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId: user.id, status: "COMPLETED", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        _sum: { feeAmount: true },
      }),
      prisma.customer.count({
        where: { userId: user.id, deletedAt: null, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
      prisma.withdrawal.aggregate({
        where: { userId: user.id, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    // Função utilitária para variação %
    const calculateGrowth = (current: number, previous: number) => {
      if (!previous) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Transações recentes (apenas campos necessários) com conversão de Decimals
    const recent = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        status: true,
        method: true,
        amount: true,
        feeAmount: true,
        customer: { select: { name: true, email: true } },
      },
    });
    const recentTransactions = recent.map(t => ({
      ...t,
      amount: Number(t.amount ?? 0),
      feeAmount: Number(t.feeAmount ?? 0),
    }));

    // Saldo atual (último statement por asOf desc) – selecionar só campos existentes e converter Decimals
    const latestStatement = await prisma.statement.findFirst({
      where: { userId: user.id },
      orderBy: { asOf: "desc" },
      select: { finalBalance: true, pendingBalance: true, blockedBalance: true },
    });

    // Conversões para Number a partir de agregações
    const revenueCurrent = Number(currentRevenueAgg._sum.amount ?? 0);
    const revenuePrevious = Number(previousRevenueAgg._sum.amount ?? 0);
    const feesCurrent = Number(currentFeesAgg._sum.feeAmount ?? 0);
    const feesPrevious = Number(previousFeesAgg._sum.feeAmount ?? 0);
    const withdrawalsCurrent = Number(currentWithdrawalsAgg._sum.amount ?? 0);
    const withdrawalsPrevious = Number(previousWithdrawalsAgg._sum.amount ?? 0);

    // Monta resposta
    return NextResponse.json({
      summary: {
        transactions: {
          current: currentTransactions,
          previous: previousTransactions,
          growth: calculateGrowth(currentTransactions, previousTransactions),
        },
        revenue: {
          current: revenueCurrent,         // bruto (COMPLETED)
          previous: revenuePrevious,
          growth: calculateGrowth(revenueCurrent, revenuePrevious),
        },
        fees: {
          current: feesCurrent,            // total de taxas (feeAmount) no período
          previous: feesPrevious,
          growth: calculateGrowth(feesCurrent, feesPrevious),
        },
        netRevenue: {
          current: revenueCurrent - feesCurrent,   // líquido estimado (bruto - taxas)
          previous: revenuePrevious - feesPrevious,
          growth: calculateGrowth(
            revenueCurrent - feesCurrent,
            revenuePrevious - feesPrevious
          ),
        },
        customers: {
          current: currentCustomers,
          previous: previousCustomers,
          growth: calculateGrowth(currentCustomers, previousCustomers),
        },
        withdrawals: {
          current: withdrawalsCurrent,
          previous: withdrawalsPrevious,
          growth: calculateGrowth(withdrawalsCurrent, withdrawalsPrevious),
          countCurrent: currentWithdrawalsAgg._count._all,
        },
        balance: {
          current: Number(latestStatement?.finalBalance ?? 0),
          pending: Number(latestStatement?.pendingBalance ?? 0),
          blocked: Number(latestStatement?.blockedBalance ?? 0),
        },
      },
      recentTransactions,
      period: { start: thirtyDaysAgo, end: today },
    });
  } catch (error) {
    console.error("Erro ao obter dashboard analytics:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
