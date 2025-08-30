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

    const now = new Date();
    let startDate: Date, endDate: Date, sqlInterval: string, dateTruncUnit: string, labelSql: string;
    endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    switch (period) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        sqlInterval = "1 day";
        dateTruncUnit = "day";
        labelSql = "'Dy'";
        break;
      case "month":
        startDate = new Date(now);
        startDate.setDate(1);
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        sqlInterval = "1 week";
        dateTruncUnit = "week";
        labelSql = "'Sem 'W'";
        break;
      case "year":
        startDate = new Date(now);
        startDate.setMonth(0, 1);
        startDate.setFullYear(now.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        sqlInterval = "1 month";
        dateTruncUnit = "month";
        labelSql = "'Mon'";
        break;
      default:
        return NextResponse.json({ error: "Período inválido" }, { status: 400 });
    }

    const rows = await prisma.$queryRawUnsafe(
      `
      SELECT
        to_char(d::date, ${labelSql}) AS name,
        COALESCE(SUM(CASE WHEN t.type = 'INCOMING' THEN t.amount ELSE 0 END), 0)::int AS entradas,
        COALESCE(SUM(CASE WHEN t.type = 'OUTGOING' THEN t.amount ELSE 0 END), 0)::int AS saidas,
        d::date
      FROM
        generate_series($1::date, $2::date, INTERVAL '${sqlInterval}') d
      LEFT JOIN "Transaction" t
        ON date_trunc('${dateTruncUnit}', t."createdAt") = d::date
        AND t."userId" = $3
        AND t.status = 'COMPLETED'
      GROUP BY d
      ORDER BY d ASC;
      `,
      startDate,
      endDate,
      user.id
    );

    const data = rows.map((row: any) => ({
      name: row.name,
      Entradas: Number(row.entradas),
      Saidas: Number(row.saidas),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao obter dados de billing:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
