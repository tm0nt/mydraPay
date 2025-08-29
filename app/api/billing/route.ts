import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week";

    // Calcular data inicial
    const now = new Date();
    let startDate: Date;
    let groupBy: string;
    let dateFormat: string;

    switch (period) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 6); // Últimos 7 dias
        groupBy = "day"; // Agrupar por dia
        dateFormat = "EEE"; // Seg, Ter, etc.
        break;
      case "month":
        startDate = new Date(now);
        startDate.setDate(1); // Início do mês atual
        startDate.setMonth(startDate.getMonth() - 1); // Mês anterior para incluir ~30 dias
        groupBy = "week"; // Agrupar por semana (Sem 1, Sem 2, etc.)
        dateFormat = "'Sem 'W"; // Sem 1, Sem 2, etc.
        break;
      case "year":
        startDate = new Date(now);
        startDate.setMonth(0, 1); // Início do ano
        startDate.setFullYear(startDate.getFullYear() - 1); // Ano anterior para incluir 12 meses
        groupBy = "month"; // Agrupar por mês (Jan, Fev, etc.)
        dateFormat = "MMM"; // Jan, Fev, etc.
        break;
      default:
        return NextResponse.json({ error: "Período inválido" }, { status: 400 });
    }

    // Consulta raw com date_trunc para agrupamento
    const aggregates = await prisma.$queryRaw`
      SELECT
        to_char(date_trunc(${groupBy}, t."createdAt"), ${dateFormat}) AS name,
        COALESCE(SUM(CASE WHEN t.type = 'INCOMING' THEN t.amount ELSE 0 END), 0) AS entradas,
        COALESCE(SUM(CASE WHEN t.type = 'OUTGOING' THEN t.amount ELSE 0 END), 0) AS saidas,
        date_trunc(${groupBy}, t."createdAt") AS truncated
      FROM "Transaction" t
      WHERE t."userId" = ${user.id}
        AND t.status = 'COMPLETED'
        AND t."createdAt" >= ${startDate}
      GROUP BY truncated, name
      ORDER BY truncated ASC;
    ` as Array<{ name: string; entradas: number; saidas: number; truncated: Date }>;

    return NextResponse.json(aggregates);
  } catch (error) {
    console.error("Erro ao obter dados de billing:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}