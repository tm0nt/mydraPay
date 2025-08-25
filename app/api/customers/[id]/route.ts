import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateCustomerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  taxId: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
  product: z.string().optional(),
  amount: z.number().positive("Valor deve ser positivo").optional(),
  payment: z.enum(["PIX", "CREDIT_CARD", "CRYPTO", "BOLETO", "OTHER"]).optional(),
  address: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/customers/[id] - Obter cliente específico
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

    const customer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          include: {
            splits: true,
          },
        },
        meds: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Erro ao obter cliente:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// PUT /api/customers/[id] - Atualizar cliente
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = updateCustomerSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!existingCustomer) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Verificar se email ou taxId já existem em outro cliente
    if (validatedData.email || validatedData.taxId) {
      const duplicateCustomer = await prisma.customer.findFirst({
        where: {
          userId: user.id,
          deletedAt: null,
          id: { not: params.id },
          OR: [
            ...(validatedData.email ? [{ email: validatedData.email }] : []),
            ...(validatedData.taxId ? [{ taxId: validatedData.taxId }] : []),
          ],
        },
      })

      if (duplicateCustomer) {
        return NextResponse.json({ error: "Já existe outro cliente com este email ou CPF/CNPJ" }, { status: 400 })
      }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        transactions: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    })

    return NextResponse.json(updatedCustomer)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao atualizar cliente:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// DELETE /api/customers/[id] - Soft delete do cliente
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

    const customer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!customer) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    await prisma.customer.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({ message: "Cliente removido com sucesso" })
  } catch (error) {
    console.error("Erro ao remover cliente:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
