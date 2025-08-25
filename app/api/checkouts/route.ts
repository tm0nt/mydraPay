import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const checkoutSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z
    .string()
    .min(1, "Slug é obrigatório")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]).default("ACTIVE"),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  guaranteeBadge: z.string().optional(),
  testimonials: z.record(z.any()).optional(),
  faq: z.record(z.any()).optional(),
  timerEnabled: z.boolean().default(false),
  timerType: z.enum(["COUNTDOWN_FIXED", "EVERGREEN"]).optional(),
  timerEndsAt: z.string().datetime().optional(),
  timerDurationSec: z.number().int().positive().optional(),
  layout: z.record(z.any()).optional(),
  fields: z.record(z.any()).optional(),
  seo: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/checkouts - Listar checkouts
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
    const status = searchParams.get("status")
    const productId = searchParams.get("productId")

    const skip = (page - 1) * limit

    const where: any = {
      userId: user.id,
      deletedAt: null,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { slug: { contains: search, mode: "insensitive" as const } },
        { headline: { contains: search, mode: "insensitive" as const } },
      ]
    }

    if (status) where.status = status
    if (productId) where.productId = productId

    const [checkouts, total] = await Promise.all([
      prisma.checkout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              basePrice: true,
              currency: true,
            },
          },
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
              variants: true,
              orderBumps: true,
              upsells: true,
              downsells: true,
            },
          },
        },
      }),
      prisma.checkout.count({ where }),
    ])

    return NextResponse.json({
      checkouts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar checkouts:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/checkouts - Criar checkout
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = checkoutSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se produto existe e pertence ao usuário
    const product = await prisma.product.findFirst({
      where: {
        id: validatedData.productId,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Verificar se slug já existe
    const existingCheckout = await prisma.checkout.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingCheckout) {
      return NextResponse.json({ error: "Slug já existe" }, { status: 400 })
    }

    const checkout = await prisma.checkout.create({
      data: {
        userId: user.id,
        productId: validatedData.productId,
        name: validatedData.name,
        slug: validatedData.slug,
        status: validatedData.status,
        primaryColor: validatedData.primaryColor,
        secondaryColor: validatedData.secondaryColor,
        accentColor: validatedData.accentColor,
        logoUrl: validatedData.logoUrl,
        bannerUrl: validatedData.bannerUrl,
        headline: validatedData.headline,
        subheadline: validatedData.subheadline,
        guaranteeBadge: validatedData.guaranteeBadge,
        testimonials: validatedData.testimonials,
        faq: validatedData.faq,
        timerEnabled: validatedData.timerEnabled,
        timerType: validatedData.timerType,
        timerEndsAt: validatedData.timerEndsAt ? new Date(validatedData.timerEndsAt) : null,
        timerDurationSec: validatedData.timerDurationSec,
        layout: validatedData.layout,
        fields: validatedData.fields,
        seo: validatedData.seo,
        metadata: validatedData.metadata,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            currency: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            variants: true,
          },
        },
      },
    })

    return NextResponse.json(checkout, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar checkout:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
