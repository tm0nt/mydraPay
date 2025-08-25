import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

// Schema de validação para criação/atualização de usuário
const userSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  type: z.enum(["INDIVIDUAL", "COMPANY"]),
  taxId: z.string().optional(),
  avatarUrl: z.string().url().optional(),
})

const updateUserSchema = userSchema.partial()

// GET /api/users - Listar usuários (apenas para admins)
export async function GET(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { taxId: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar usuários:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/users - Criar usuário (admin only)
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = userSchema.parse(body)

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    // Verificar se taxId já existe (se fornecido)
    if (validatedData.taxId) {
      const existingTaxId = await prisma.user.findUnique({
        where: { taxId: validatedData.taxId },
      })

      if (existingTaxId) {
        return NextResponse.json({ error: "CPF/CNPJ já cadastrado" }, { status: 400 })
      }
    }

    const user = await prisma.user.create({
      data: {
        ...validatedData,
        passwordHash: "", // Será definido pelo usuário no primeiro login
        isActive: true,
        canGeneratePix: false,
        canWithdraw: false,
        kycApproved: false,
      },
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
        createdAt: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
