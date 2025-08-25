import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const medSchema = z.object({
  customerId: z.string().uuid(),
  amount: z.number().positive("Valor deve ser positivo"),
  reason: z.string().min(1, "Motivo é obrigatório"),
  status: z.string().default("PENDING"),
  response: z.record(z.any()).default({}),
  expiresAt: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/meds - Listar MEDs
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
    const customerId = searchParams.get("customerId")
    const status = searchParams.get("status")

    const skip = (page - 1) * limit

    const where: any = {
      customer: {
        userId: user.id,
      },
    }

    if (customerId) where.customerId = customerId
    if (status) where.status = status

    const [meds, total] = await Promise.all([
      prisma.med.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              taxId: true,
            },
          },
        },
      }),
      prisma.med.count({ where }),
    ])

    return NextResponse.json({
      meds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar MEDs:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/meds - Criar MED
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = medSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o cliente existe e pertence ao usuário
    const customer = await prisma.customer.findFirst({
      where: {
        id: validatedData.customerId,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!customer) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    const med = await prisma.med.create({
      data: {
        customerId: validatedData.customerId,
        amount: validatedData.amount,
        reason: validatedData.reason,
        status: validatedData.status,
        response: validatedData.response,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        metadata: validatedData.metadata,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            taxId: true,
          },
        },
      },
    })

    return NextResponse.json(med, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar MED:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
