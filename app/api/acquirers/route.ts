import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const acquirerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.string().min(1, "Função é obrigatória"),
  endpoint: z.string().url("URL inválida"),
  publicToken: z.string().min(1, "Token público é obrigatório"),
  privateToken: z.string().min(1, "Token privado é obrigatório"),
  active: z.boolean().default(true),
  timeoutMs: z.number().optional(),
  retryPolicy: z.record(z.any()).optional(),
})

// GET /api/acquirers - Listar adquirentes
export async function GET(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get("active")
    const role = searchParams.get("role")

    const where: any = {}

    if (active !== null) where.active = active === "true"
    if (role) where.role = role

    const acquirers = await prisma.acquirer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        role: true,
        endpoint: true,
        publicToken: true,
        active: true,
        timeoutMs: true,
        createdAt: true,
        updatedAt: true,
        // Não retornar privateToken por segurança
      },
    })

    return NextResponse.json({ acquirers })
  } catch (error) {
    console.error("Erro ao listar adquirentes:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/acquirers - Criar adquirente (admin only)
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = acquirerSchema.parse(body)

    // Verificar se já existe um adquirente com mesmo nome e role
    const existingAcquirer = await prisma.acquirer.findUnique({
      where: {
        name_role: {
          name: validatedData.name,
          role: validatedData.role,
        },
      },
    })

    if (existingAcquirer) {
      return NextResponse.json({ error: "Já existe um adquirente com este nome e função" }, { status: 400 })
    }

    const acquirer = await prisma.acquirer.create({
      data: validatedData,
      select: {
        id: true,
        name: true,
        role: true,
        endpoint: true,
        publicToken: true,
        active: true,
        timeoutMs: true,
        createdAt: true,
      },
    })

    return NextResponse.json(acquirer, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar adquirente:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
