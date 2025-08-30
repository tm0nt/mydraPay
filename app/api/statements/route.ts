import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  page: z.preprocess((v) => Number(v ?? "1"), z.number().int().positive()),
  limit: z.preprocess((v) => Number(v ?? "20"), z.number().int().positive()),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export async function GET(req: Request) {
  // ----------------- Autenticação -----------------
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // -------------- Busca usuário -------------------
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // -------------- Parâmetros e validação ------------
  const { searchParams } = new URL(req.url);
  const parse = querySchema.safeParse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    startDate: searchParams.get("startDate"),
    endDate: searchParams.get("endDate"),
  });
  if (!parse.success) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }
  const { page, limit, startDate, endDate } = parse.data;
  const skip = (page - 1) * limit;

  // ------------- Range obrigatório --------------
  if (!startDate || !endDate) {
    return NextResponse.json({ error: "startDate e endDate são obrigatórios" }, { status: 400 });
  }

  // --- Query agregada: 1 registro por dia, ordem crescente ---
  const statements = await prisma.$queryRawUnsafe<
    Array<{
      as_of: string,
      initial_balance: number,
      entradas: number,
      saidas: number,
      final_balance: number,
      transactions_count: number,
      variation: number
    }>
  >(
    `
    WITH days AS (
      SELECT generate_series(
        date_trunc('day', $1::timestamp),
        date_trunc('day', $2::timestamp),
        interval '1 day'
      )::date AS day
    )
    SELECT 
      d.day as as_of,
      COALESCE(
        (SELECT s."finalBalance" FROM "Statement" s
         WHERE s."userId" = $3 AND date_trunc('day', s."asOf") < d.day
         ORDER BY s."asOf" DESC LIMIT 1),
        0
      ) as initial_balance,
      SUM(CASE WHEN s."variation" > 0 THEN s."variation" ELSE 0 END) as entradas,
      SUM(CASE WHEN s."variation" < 0 THEN -s."variation" ELSE 0 END) as saidas,
      COALESCE(
        (SELECT s2."finalBalance" FROM "Statement" s2
         WHERE s2."userId" = $3 AND date_trunc('day', s2."asOf") <= d.day
         ORDER BY s2."asOf" DESC LIMIT 1),
        0
      ) as final_balance,
      COUNT(s."id") as transactions_count,
      SUM(s."variation") as variation
    FROM days d
    LEFT JOIN "Statement" s
      ON s."userId" = $3 AND date_trunc('day', s."asOf") = d.day
    GROUP BY d.day
    ORDER BY d.day ASC
    OFFSET $4 LIMIT $5
    `,
    startDate,
    endDate,
    user.id,
    skip,
    limit
  );

  // Total de dias para paginação
  const total = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `
    SELECT COUNT(*) as count FROM (
      SELECT generate_series(
        date_trunc('day', $1::timestamp),
        date_trunc('day', $2::timestamp),
        interval '1 day'
      )::date as day
    ) as all_days
    `,
    startDate,
    endDate
  );

  // Total de transações do usuário com status COMPLETED
  const totalTransacoes = await prisma.transaction.count({
    where: {
      userId: user.id,
      status: "COMPLETED"
    }
  });

  // Saldo atual do último registro listado (mais recente da lista)
  const latest = statements.length ? statements[statements.length - 1] : null;

  // --- Resposta formatada ---
  return NextResponse.json({
    statements: statements.map((s) => ({
      id: s.as_of,
      asOf: s.as_of,
      initialBalance: Number(s.initial_balance),
      entradas: Number(s.entradas) || 0,
      saidas: Number(s.saidas) || 0,
      finalBalance: Number(s.final_balance),
      variation: Number(s.variation) || 0,
      transactionsCount: Number(s.transactions_count) || 0,
    })),
    currentBalance: Number(latest?.final_balance ?? 0),
    totalTransacoesCompleted: totalTransacoes,
    pagination: {
      page,
      limit,
      total: Number(total?.[0]?.count ?? 0),
      pages: Math.ceil(Number(total?.[0]?.count ?? 0) / limit) || 1,
    },
  });
}
