import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateTicketSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").optional(),
  message: z.string().min(1, "Mensagem é obrigatória").optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  reply: z.string().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string()).optional(),
})

// GET /api/support/tickets/[id] - Obter ticket específico
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

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket não encontrado" }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Erro ao obter ticket:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// PUT /api/support/tickets/[id] - Atualizar ticket
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = updateTicketSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const existingTicket = await prisma.supportTicket.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingTicket) {
      return NextResponse.json({ error: "Ticket não encontrado" }, { status: 404 })
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao atualizar ticket:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// DELETE /api/support/tickets/[id] - Remover ticket
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

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket não encontrado" }, { status: 404 })
    }

    await prisma.supportTicket.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Ticket removido com sucesso" })
  } catch (error) {
    console.error("Erro ao remover ticket:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
