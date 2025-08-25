import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  basePrice: z.number().positive("Preço deve ser positivo").optional(),
  currency: z.enum(["BRL", "USD", "EUR"]).optional(),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/products/[id] - Obter produto específico
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

    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
      include: {
        checkouts: {
          include: {
            variants: {
              select: {
                id: true,
                name: true,
                price: true,
                active: true,
                views: true,
                conversions: true,
              },
            },
            _count: {
              select: {
                transactions: true,
              },
            },
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Erro ao obter produto:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// PUT /api/products/[id] - Atualizar produto
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Verificar se SKU já existe em outro produto (se fornecido)
    if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
      const duplicateProduct = await prisma.product.findFirst({
        where: {
          userId: user.id,
          sku: validatedData.sku,
          deletedAt: null,
          id: { not: params.id },
        },
      })

      if (duplicateProduct) {
        return NextResponse.json({ error: "SKU já existe em outro produto" }, { status: 400 })
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        _count: {
          select: {
            checkouts: true,
          },
        },
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao atualizar produto:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Soft delete do produto
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

    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    await prisma.product.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        active: false,
      },
    })

    return NextResponse.json({ message: "Produto removido com sucesso" })
  } catch (error) {
    console.error("Erro ao remover produto:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
