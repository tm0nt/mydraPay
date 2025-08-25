import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const levelSchema = z.object({
  code: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  order: z.number().int().positive(),
  threshold: z.number().int().min(0),
  iconUrl: z.string().url().optional(),
  color: z.string().optional(),
  rules: z.record(z.any()).optional(),
})

// GET /api/gamification/levels - Listar definições de níveis
export async function GET(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const levels = await prisma.levelDefinition.findMany({
      orderBy: { order: "asc" },
      include: {
        defaultRewards: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
          },
        },
        _count: {
          select: {
            LevelProgress: true,
          },
        },
      },
    })

    return NextResponse.json({ levels })
  } catch (error) {
    console.error("Erro ao listar níveis:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/gamification/levels - Criar definição de nível (admin only)
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = levelSchema.parse(body)

    // Verificar se código já existe
    const existingLevel = await prisma.levelDefinition.findUnique({
      where: { code: validatedData.code },
    })

    if (existingLevel) {
      return NextResponse.json({ error: "Código de nível já existe" }, { status: 400 })
    }

    // Verificar se ordem já existe
    const existingOrder = await prisma.levelDefinition.findUnique({
      where: { order: validatedData.order },
    })

    if (existingOrder) {
      return NextResponse.json({ error: "Ordem de nível já existe" }, { status: 400 })
    }

    const level = await prisma.levelDefinition.create({
      data: validatedData,
      include: {
        defaultRewards: true,
      },
    })

    return NextResponse.json(level, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar nível:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
