import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  phone: z.string().optional(),
  type: z.enum(["INDIVIDUAL", "COMPANY"]).optional(),
  taxId: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
  canGeneratePix: z.boolean().optional(),
  canWithdraw: z.boolean().optional(),
  kycApproved: z.boolean().optional(),
})

// GET /api/users/[id] - Obter usuário específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        settings: true,
        kycs: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        apiKeys: {
          select: {
            id: true,
            name: true,
            scopes: true,
            createdAt: true,
            lastUsedAt: true,
            expiresAt: true,
            revokedAt: true,
          },
        },
        allowedIps: true,
        levelProgress: {
          include: {
            currentLevel: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Remover dados sensíveis
    const { passwordHash, ...safeUser } = user

    return NextResponse.json(safeUser)
  } catch (error) {
    console.error("Erro ao obter usuário:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// PUT /api/users/[id] - Atualizar usuário
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se taxId já existe (se fornecido e diferente do atual)
    if (validatedData.taxId && validatedData.taxId !== existingUser.taxId) {
      const existingTaxId = await prisma.user.findUnique({
        where: { taxId: validatedData.taxId },
      })

      if (existingTaxId) {
        return NextResponse.json({ error: "CPF/CNPJ já cadastrado" }, { status: 400 })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        type: true,
        taxId: true,
        avatarUrl: true,
        isActive: true,
        canGeneratePix: true,
        canWithdraw: true,
        kycApproved: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao atualizar usuário:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Soft delete do usuário
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    await prisma.user.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    })

    return NextResponse.json({ message: "Usuário removido com sucesso" })
  } catch (error) {
    console.error("Erro ao remover usuário:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
