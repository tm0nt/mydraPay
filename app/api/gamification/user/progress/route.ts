import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// GET /api/gamification/user/progress - Obter progresso do usuário
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

    const progress = await prisma.levelProgress.findUnique({
      where: { userId: user.id },
      include: {
        currentLevel: {
          include: {
            defaultRewards: true,
          },
        },
      },
    })

    // Se não existe progresso, criar com nível inicial
    if (!progress) {
      const firstLevel = await prisma.levelDefinition.findFirst({
        orderBy: { order: "asc" },
      })

      const newProgress = await prisma.levelProgress.create({
        data: {
          userId: user.id,
          currentLevelId: firstLevel?.id,
          points: 0,
        },
        include: {
          currentLevel: {
            include: {
              defaultRewards: true,
            },
          },
        },
      })

      return NextResponse.json(newProgress)
    }

    // Verificar se deve subir de nível
    const nextLevel = await prisma.levelDefinition.findFirst({
      where: {
        threshold: { lte: progress.points },
        order: { gt: progress.currentLevel?.order || 0 },
      },
      orderBy: { order: "asc" },
    })

    if (nextLevel && nextLevel.id !== progress.currentLevelId) {
      // Atualizar nível
      const updatedProgress = await prisma.levelProgress.update({
        where: { userId: user.id },
        data: { currentLevelId: nextLevel.id },
        include: {
          currentLevel: {
            include: {
              defaultRewards: true,
            },
          },
        },
      })

      // Conceder recompensas do novo nível
      if (nextLevel.defaultRewards.length > 0) {
        await Promise.all(
          nextLevel.defaultRewards.map((reward) =>
            prisma.userReward.create({
              data: {
                userId: user.id,
                rewardId: reward.id,
                status: "CLAIMABLE",
                correlationId: `level-up-${nextLevel.id}`,
              },
            }),
          ),
        )
      }

      return NextResponse.json(updatedProgress)
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Erro ao obter progresso:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/gamification/user/progress - Adicionar pontos ao usuário
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { points, reason } = body

    if (!points || points <= 0) {
      return NextResponse.json({ error: "Pontos devem ser positivos" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Atualizar pontos
    const progress = await prisma.levelProgress.upsert({
      where: { userId: user.id },
      update: {
        points: { increment: points },
      },
      create: {
        userId: user.id,
        points: points,
      },
      include: {
        currentLevel: true,
      },
    })

    return NextResponse.json({
      progress,
      message: `${points} pontos adicionados${reason ? ` por: ${reason}` : ""}`,
    })
  } catch (error) {
    console.error("Erro ao adicionar pontos:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
