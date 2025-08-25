import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// POST /api/gamification/user/rewards/[id]/claim - Resgatar recompensa
export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    const userReward = await prisma.userReward.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        reward: true,
      },
    })

    if (!userReward) {
      return NextResponse.json({ error: "Recompensa não encontrada" }, { status: 404 })
    }

    if (userReward.status !== "CLAIMABLE") {
      return NextResponse.json({ error: "Recompensa não pode ser resgatada" }, { status: 400 })
    }

    // Verificar se não expirou
    if (userReward.expiresAt && userReward.expiresAt < new Date()) {
      await prisma.userReward.update({
        where: { id: params.id },
        data: { status: "EXPIRED" },
      })
      return NextResponse.json({ error: "Recompensa expirada" }, { status: 400 })
    }

    const claimedReward = await prisma.userReward.update({
      where: { id: params.id },
      data: {
        status: "CLAIMED",
        claimedAt: new Date(),
      },
      include: {
        reward: true,
      },
    })

    return NextResponse.json({
      reward: claimedReward,
      message: "Recompensa resgatada com sucesso!",
    })
  } catch (error) {
    console.error("Erro ao resgatar recompensa:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
