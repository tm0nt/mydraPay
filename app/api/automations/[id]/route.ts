import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateAutomationSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  url: z.string().url("URL inválida").optional(),
  events: z.array(z.enum(["PIX_CREATED", "PIX_PAID", "BALANCE_CHANGED", "OTHER"])).optional(),
  status: z.enum(["ENABLED", "DISABLED"]).optional(),
  headers: z.record(z.string()).optional(),
  transform: z.record(z.any()).optional(),
})

// GET /api/automations/[id] - Obter automação específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const automation = await prisma.automationRule.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        secrets: {
          select: {
            id: true,
            name: true,
            validFrom: true,
            validTo: true,
          },
        },
        deliveries: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: {
          select: {
            deliveries: true,
          },
        },
      },
    })

    if (!automation) {
      return NextResponse.json({ error: "Automação não encontrada" }, { status: 404 })
    }

    return NextResponse.json(automation)
  } catch (error) {
    console.error("Erro ao obter automação:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// PUT /api/automations/[id] - Atualizar automação
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = updateAutomationSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const existingAutomation = await prisma.automationRule.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingAutomation) {
      return NextResponse.json({ error: "Automação não encontrada" }, { status: 404 })
    }

    const updatedAutomation = await prisma.automationRule.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        secrets: {
          select: {
            id: true,
            name: true,
            validFrom: true,
            validTo: true,
          },
        },
        _count: {
          select: {
            deliveries: true,
          },
        },
      },
    })

    return NextResponse.json(updatedAutomation)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao atualizar automação:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// DELETE /api/automations/[id] - Remover automação
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const automation = await prisma.automationRule.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!automation) {
      return NextResponse.json({ error: "Automação não encontrada" }, { status: 404 })
    }

    await prisma.automationRule.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Automação removida com sucesso" })
  } catch (error) {
    console.error("Erro ao remover automação:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
