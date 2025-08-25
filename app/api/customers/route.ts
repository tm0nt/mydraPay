import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const customerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  taxId: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
  product: z.string().optional(),
  amount: z.number().positive("Valor deve ser positivo"),
  payment: z.enum(["PIX", "CREDIT_CARD", "CRYPTO", "BOLETO", "OTHER"]),
  address: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/customers - Listar clientes
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
    const payment = searchParams.get("payment")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const skip = (page - 1) * limit

    const where: any = {
      userId: user.id,
      deletedAt: null,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { taxId: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search, mode: "insensitive" as const } },
      ]
    }

    if (payment) where.payment = payment
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
          meds: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
      }),
      prisma.customer.count({ where }),
    ])

    // Calcular estatísticas
    const stats = await prisma.customer.aggregate({
      where: { userId: user.id, deletedAt: null },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    })

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalCustomers: stats._count._all,
        totalAmount: stats._sum.amount || 0,
      },
    })
  } catch (error) {
    console.error("Erro ao listar clientes:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/customers - Criar cliente
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = customerSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se já existe cliente com mesmo email ou taxId
    if (validatedData.email || validatedData.taxId) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          userId: user.id,
          deletedAt: null,
          OR: [
            ...(validatedData.email ? [{ email: validatedData.email }] : []),
            ...(validatedData.taxId ? [{ taxId: validatedData.taxId }] : []),
          ],
        },
      })

      if (existingCustomer) {
        return NextResponse.json({ error: "Cliente já existe com este email ou CPF/CNPJ" }, { status: 400 })
      }
    }

    const customer = await prisma.customer.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        taxId: validatedData.taxId,
        email: validatedData.email,
        phone: validatedData.phone,
        product: validatedData.product,
        amount: validatedData.amount,
        payment: validatedData.payment,
        address: validatedData.address,
        metadata: validatedData.metadata,
      },
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

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar cliente:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
