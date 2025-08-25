import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const userSettingsSchema = z.object({
  minPixWithdrawal: z.number().positive().optional(),
  minCryptoWithdrawal: z.number().positive().optional(),
  dailyWithdrawalLimit: z.number().positive().optional(),
  pixAcquirerId: z.string().uuid().optional(),
  creditAcquirerId: z.string().uuid().optional(),
  cryptoAcquirerId: z.string().uuid().optional(),
  preferredTheme: z.enum(["dark", "light", "system"]).optional(),
  preferredLanguage: z.string().optional(),
  timezone: z.string().optional(),
  notificationEmail: z.boolean().optional(),
  notificationPush: z.boolean().optional(),
  customSeoTitle: z.string().optional(),
  customSeoDescription: z.string().optional(),
  customSeoKeywords: z.string().optional(),
  customLogoUrl: z.string().url().optional(),
  flags: z.record(z.any()).optional(),
})

// GET /api/settings/user - Obter configurações do usuário
export async function GET(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        settings: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(user.settings)
  } catch (error) {
    console.error("Erro ao obter configurações do usuário:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// PUT /api/settings/user - Atualizar configurações do usuário
export async function PUT(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = userSettingsSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const userSettings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: validatedData,
      create: {
        userId: user.id,
        ...validatedData,
      },
    })

    return NextResponse.json(userSettings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao atualizar configurações do usuário:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
