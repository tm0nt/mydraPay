import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const achievementSchema = z.object({
  code: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  iconUrl: z.string().url().optional(),
  color: z.string().optional(),
  criteria: z.record(z.any()),
  rewardRefId: z.string().uuid().optional(),
})

// GET /api/gamification/achievements - Listar definições de conquistas
export async function GET(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const achievements = await prisma.achievementDefinition.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            UserAchievement: true,
          },
        },
      },
    })

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error("Erro ao listar conquistas:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/gamification/achievements - Criar definição de conquista (admin only)
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = achievementSchema.parse(body)

    // Verificar se código já existe
    const existingAchievement = await prisma.achievementDefinition.findUnique({
      where: { code: validatedData.code },
    })

    if (existingAchievement) {
      return NextResponse.json({ error: "Código de conquista já existe" }, { status: 400 })
    }

    const achievement = await prisma.achievementDefinition.create({
      data: validatedData,
    })

    return NextResponse.json(achievement, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar conquista:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
