import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// GET /api/gamification/user/rewards - Listar recompensas do usuário
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
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const skip = (page - 1) * limit

    const where: any = { userId: user.id }
    if (status) where.status = status

    const [rewards, total] = await Promise.all([
      prisma.userReward.findMany({
        where,
        skip,
        take: limit,
        orderBy: { grantedAt: "desc" },
        include: {
          reward: {
            select: {
              id: true,
              code: true,
              name: true,
              description: true,
              type: true,
              data: true,
            },
          },
        },
      }),
      prisma.userReward.count({ where }),
    ])

    return NextResponse.json({
      rewards,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar recompensas do usuário:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
