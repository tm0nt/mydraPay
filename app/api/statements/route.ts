import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  page: z.preprocess((v) => Number(v ?? "1"), z.number().int().positive()),
  limit: z.preprocess((v) => Number(v ?? "20"), z.number().int().positive()),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function GET(req: Request) {
  /* ------------------------- autenticação ------------------------- */
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  /* -------------------------- usuário ----------------------------- */
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  /* ------------------------ parâmetros ---------------------------- */
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

  /* ------------------------- filtro ------------------------------- */
  const where: any = { userId: user.id };
  if (startDate || endDate) {
    where.asOf = {};
    if (startDate) where.asOf.gte = new Date(startDate);
    if (endDate)   where.asOf.lte = new Date(endDate);
  }

  /* ------------- consulta + total + saldo atual ------------------- */
  const [statements, total, latest] = await prisma.$transaction([
    prisma.statement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { asOf: "desc" },
      select: {
        id: true,
        asOf: true,
        initialBalance: true,
        variation: true,
        finalBalance: true,
        transactionsCount: true,
      },
    }),
    prisma.statement.count({ where }),
    prisma.statement.findFirst({
      where: { userId: user.id },
      orderBy: { asOf: "desc" },
      select: { finalBalance: true },
    }),
  ]);

  /* ----------- transformar Decimal -> Number para JSON ------------ */
  const mapped = statements.map((s) => ({
    ...s,
    initialBalance: Number(s.initialBalance),
    variation:      Number(s.variation),
    finalBalance:   Number(s.finalBalance),
  }));

  return NextResponse.json({
    statements: mapped,
    currentBalance: Number(latest?.finalBalance ?? 0),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  });
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
