import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// GET /api/gamification/ranking - Obter ranking global
export async function GET(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Ranking baseado no progresso de níveis
    const ranking = await prisma.levelProgress.findMany({
      take: limit,
      orderBy: [{ points: "desc" }, { updatedAt: "asc" }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        currentLevel: {
          select: {
            id: true,
            name: true,
            iconUrl: true,
            color: true,
          },
        },
      },
    })

    // Adicionar posição no ranking
    const rankedUsers = ranking.map((entry, index) => ({
      position: index + 1,
      user: entry.user,
      points: entry.points,
      level: entry.currentLevel,
      updatedAt: entry.updatedAt,
    }))

    return NextResponse.json({ ranking: rankedUsers })
  } catch (error) {
    console.error("Erro ao obter ranking:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
