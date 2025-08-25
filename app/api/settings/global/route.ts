import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const globalConfigSchema = z.object({
  minPixWithdrawal: z.number().positive().optional(),
  minCryptoWithdrawal: z.number().positive().optional(),
  pixFeePercent: z.number().min(0).max(100).optional(),
  pixFeeFixed: z.number().min(0).optional(),
  creditFeePercent: z.number().min(0).max(100).optional(),
  creditFeeFixed: z.number().min(0).optional(),
  reservePercent: z.number().min(0).max(100).optional(),
  reserveFixed: z.number().min(0).optional(),
  siteName: z.string().optional(),
  siteUrl: z.string().url().optional(),
  pixAcquirerId: z.string().uuid().optional(),
  creditAcquirerId: z.string().uuid().optional(),
  cryptoAcquirerId: z.string().uuid().optional(),
  siteLogoUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  seoDefaultTitle: z.string().optional(),
  seoDefaultDescription: z.string().optional(),
  seoDefaultKeywords: z.string().optional(),
  flags: z.record(z.any()).optional(),
})

// GET /api/settings/global - Obter configurações globais
export async function GET(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const globalConfig = await prisma.globalConfig.findFirst({
      orderBy: { createdAt: "desc" },
    })

    if (!globalConfig) {
      return NextResponse.json({ error: "Configurações não encontradas" }, { status: 404 })
    }

    return NextResponse.json(globalConfig)
  } catch (error) {
    console.error("Erro ao obter configurações globais:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// PUT /api/settings/global - Atualizar configurações globais (admin only)
export async function PUT(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = globalConfigSchema.parse(body)

    // Verificar se existe configuração global
    let globalConfig = await prisma.globalConfig.findFirst()

    if (globalConfig) {
      // Atualizar existente
      globalConfig = await prisma.globalConfig.update({
        where: { id: globalConfig.id },
        data: validatedData,
      })
    } else {
      // Criar nova configuração com valores padrão
      globalConfig = await prisma.globalConfig.create({
        data: {
          minPixWithdrawal: 10,
          minCryptoWithdrawal: 50,
          pixFeePercent: 3.5,
          pixFeeFixed: 0,
          creditFeePercent: 4.5,
          creditFeeFixed: 0.39,
          reservePercent: 2,
          reserveFixed: 0,
          siteName: "AURA Dashboard",
          siteUrl: "https://aura.com",
          ...validatedData,
        },
      })
    }

    return NextResponse.json(globalConfig)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao atualizar configurações globais:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
