import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const rewardSchema = z.object({
  code: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  type: z.string().min(1, "Tipo é obrigatório"),
  data: z.record(z.any()).optional(),
  expiresAfterDays: z.number().int().positive().optional(),
  unlockRules: z.record(z.any()).optional(),
})

// GET /api/gamification/rewards - Listar definições de recompensas
export async function GET(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const rewards = await prisma.rewardDefinition.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            UserReward: true,
          },
        },
      },
    })

    return NextResponse.json({ rewards })
  } catch (error) {
    console.error("Erro ao listar recompensas:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/gamification/rewards - Criar definição de recompensa (admin only)
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = rewardSchema.parse(body)

    // Verificar se código já existe
    const existingReward = await prisma.rewardDefinition.findUnique({
      where: { code: validatedData.code },
    })

    if (existingReward) {
      return NextResponse.json({ error: "Código de recompensa já existe" }, { status: 400 })
    }

    const reward = await prisma.rewardDefinition.create({
      data: validatedData,
    })

    return NextResponse.json(reward, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar recompensa:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
