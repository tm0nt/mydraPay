import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const kycSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(["PASSPORT", "NATIONAL_ID", "DRIVER_LICENSE", "COMPANY_REGISTRATION", "TAX_CARD", "PARTNER_DOCUMENT"]),
  fileFront: z.string().url().optional(),
  fileBack: z.string().url().optional(),
  selfieUrl: z.string().url().optional(),
})

// GET /api/kyc - Listar KYCs
export async function GET(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const skip = (page - 1) * limit

    const where = userId ? { userId } : {}

    const [kycs, total] = await Promise.all([
      prisma.kyc.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.kyc.count({ where }),
    ])

    return NextResponse.json({
      kycs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar KYCs:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/kyc - Criar KYC
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = kycSchema.parse(body)

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const kyc = await prisma.kyc.create({
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(kyc, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar KYC:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
