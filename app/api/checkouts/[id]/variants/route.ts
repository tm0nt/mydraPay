import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const variantSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  trafficShare: z.number().int().min(0).max(100).default(50),
  active: z.boolean().default(true),
  price: z.number().positive("Preço deve ser positivo").optional(),
  currency: z.enum(["BRL", "USD", "EUR"]).optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  bannerUrl: z.string().url().optional(),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  layout: z.record(z.any()).optional(),
  fields: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/checkouts/[id]/variants - Listar variantes do checkout
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

    // Verificar se checkout pertence ao usuário
    const checkout = await prisma.checkout.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!checkout) {
      return NextResponse.json({ error: "Checkout não encontrado" }, { status: 404 })
    }

    const variants = await prisma.checkoutVariant.findMany({
      where: { checkoutId: params.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    })

    return NextResponse.json({ variants })
  } catch (error) {
    console.error("Erro ao listar variantes:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/checkouts/[id]/variants - Criar variante
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = variantSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se checkout pertence ao usuário
    const checkout = await prisma.checkout.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!checkout) {
      return NextResponse.json({ error: "Checkout não encontrado" }, { status: 404 })
    }

    // Verificar se soma dos trafficShare não excede 100%
    const existingVariants = await prisma.checkoutVariant.findMany({
      where: { checkoutId: params.id },
    })

    const totalTrafficShare = existingVariants.reduce((sum, variant) => sum + variant.trafficShare, 0)

    if (totalTrafficShare + validatedData.trafficShare > 100) {
      return NextResponse.json({ error: "Soma do tráfego das variantes não pode exceder 100%" }, { status: 400 })
    }

    const variant = await prisma.checkoutVariant.create({
      data: {
        checkoutId: params.id,
        name: validatedData.name,
        trafficShare: validatedData.trafficShare,
        active: validatedData.active,
        price: validatedData.price,
        currency: validatedData.currency,
        primaryColor: validatedData.primaryColor,
        secondaryColor: validatedData.secondaryColor,
        bannerUrl: validatedData.bannerUrl,
        headline: validatedData.headline,
        subheadline: validatedData.subheadline,
        layout: validatedData.layout,
        fields: validatedData.fields,
        metadata: validatedData.metadata,
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    })

    return NextResponse.json(variant, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar variante:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
