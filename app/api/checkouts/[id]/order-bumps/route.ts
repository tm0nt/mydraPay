import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const orderBumpSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  price: z.number().positive("Preço deve ser positivo"),
  currency: z.enum(["BRL", "USD", "EUR"]).default("BRL"),
  productRefId: z.string().uuid().optional(),
  iconUrl: z.string().url().optional(),
  highlightColor: z.string().optional(),
  position: z.number().int().min(1).default(1),
  active: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
})

// GET /api/checkouts/[id]/order-bumps - Listar order bumps
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

    const orderBumps = await prisma.checkoutOrderBump.findMany({
      where: { checkoutId: params.id },
      orderBy: { position: "asc" },
    })

    return NextResponse.json({ orderBumps })
  } catch (error) {
    console.error("Erro ao listar order bumps:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/checkouts/[id]/order-bumps - Criar order bump
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = orderBumpSchema.parse(body)

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

    const orderBump = await prisma.checkoutOrderBump.create({
      data: {
        checkoutId: params.id,
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        currency: validatedData.currency,
        productRefId: validatedData.productRefId,
        iconUrl: validatedData.iconUrl,
        highlightColor: validatedData.highlightColor,
        position: validatedData.position,
        active: validatedData.active,
        metadata: validatedData.metadata,
      },
    })

    return NextResponse.json(orderBump, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar order bump:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
