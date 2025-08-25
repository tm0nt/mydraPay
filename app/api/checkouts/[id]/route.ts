import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const updateCheckoutSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  slug: z
    .string()
    .min(1, "Slug é obrigatório")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens")
    .optional(),
  status: z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
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
  timerEnabled: z.boolean().optional(),
  timerType: z.enum(["COUNTDOWN_FIXED", "EVERGREEN"]).optional(),
  timerEndsAt: z.string().datetime().optional(),
  timerDurationSec: z.number().int().positive().optional(),
  layout: z.record(z.any()).optional(),
  fields: z.record(z.any()).optional(),
  seo: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/checkouts/[id] - Obter checkout específico
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

    const checkout = await prisma.checkout.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
      include: {
        product: true,
        variants: {
          orderBy: { createdAt: "desc" },
        },
        orderBumps: {
          orderBy: { position: "asc" },
        },
        upsells: {
          orderBy: { position: "asc" },
        },
        downsells: {
          orderBy: { position: "asc" },
        },
        transactions: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!checkout) {
      return NextResponse.json({ error: "Checkout não encontrado" }, { status: 404 })
    }

    return NextResponse.json(checkout)
  } catch (error) {
    console.error("Erro ao obter checkout:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// PUT /api/checkouts/[id] - Atualizar checkout
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = updateCheckoutSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const existingCheckout = await prisma.checkout.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!existingCheckout) {
      return NextResponse.json({ error: "Checkout não encontrado" }, { status: 404 })
    }

    // Verificar se slug já existe em outro checkout (se fornecido)
    if (validatedData.slug && validatedData.slug !== existingCheckout.slug) {
      const duplicateCheckout = await prisma.checkout.findUnique({
        where: { slug: validatedData.slug },
      })

      if (duplicateCheckout) {
        return NextResponse.json({ error: "Slug já existe" }, { status: 400 })
      }
    }

    const updatedCheckout = await prisma.checkout.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        timerEndsAt: validatedData.timerEndsAt ? new Date(validatedData.timerEndsAt) : undefined,
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

    return NextResponse.json(updatedCheckout)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao atualizar checkout:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// DELETE /api/checkouts/[id] - Soft delete do checkout
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

    await prisma.checkout.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        status: "ARCHIVED",
      },
    })

    return NextResponse.json({ message: "Checkout removido com sucesso" })
  } catch (error) {
    console.error("Erro ao remover checkout:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
