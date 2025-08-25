import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  sku: z.string().optional(),
  basePrice: z.number().positive("Preço deve ser positivo").optional(),
  currency: z.enum(["BRL", "USD", "EUR"]).default("BRL"),
  images: z.array(z.string().url()).default([]),
  tags: z.array(z.string()).default([]),
  active: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
})

// GET /api/products - Listar produtos
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
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const active = searchParams.get("active")
    const tag = searchParams.get("tag")

    const skip = (page - 1) * limit

    const where: any = {
      userId: user.id,
      deletedAt: null,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { sku: { contains: search, mode: "insensitive" as const } },
      ]
    }

    if (active !== null) where.active = active === "true"
    if (tag) where.tags = { has: tag }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          checkouts: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
            take: 3,
          },
          _count: {
            select: {
              checkouts: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar produtos:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/products - Criar produto
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = productSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se SKU já existe (se fornecido)
    if (validatedData.sku) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          userId: user.id,
          sku: validatedData.sku,
          deletedAt: null,
        },
      })

      if (existingProduct) {
        return NextResponse.json({ error: "SKU já existe" }, { status: 400 })
      }
    }

    const product = await prisma.product.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        description: validatedData.description,
        sku: validatedData.sku,
        basePrice: validatedData.basePrice,
        currency: validatedData.currency,
        images: validatedData.images,
        tags: validatedData.tags,
        active: validatedData.active,
        metadata: validatedData.metadata,
      },
      include: {
        _count: {
          select: {
            checkouts: true,
          },
        },
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar produto:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
