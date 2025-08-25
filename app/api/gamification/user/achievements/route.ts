import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// GET /api/gamification/user/achievements - Listar conquistas do usuário
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

    const achievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      orderBy: { unlockedAt: "desc" },
      include: {
        achievement: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            iconUrl: true,
            color: true,
          },
        },
      },
    })

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error("Erro ao listar conquistas do usuário:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
