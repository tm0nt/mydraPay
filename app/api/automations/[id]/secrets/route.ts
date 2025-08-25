import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { randomBytes, createHash } from "crypto"

const secretSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  validTo: z.string().datetime().optional(),
})

// GET /api/automations/[id]/secrets - Listar secrets da automação
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

    // Verificar se a automação pertence ao usuário
    const automation = await prisma.automationRule.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!automation) {
      return NextResponse.json({ error: "Automação não encontrada" }, { status: 404 })
    }

    const secrets = await prisma.webhookSecret.findMany({
      where: { ruleId: params.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        validFrom: true,
        validTo: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ secrets })
  } catch (error) {
    console.error("Erro ao listar secrets:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/automations/[id]/secrets - Criar secret para automação
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = secretSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se a automação pertence ao usuário
    const automation = await prisma.automationRule.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!automation) {
      return NextResponse.json({ error: "Automação não encontrada" }, { status: 404 })
    }

    // Gerar secret aleatório
    const rawSecret = randomBytes(32).toString("hex")
    const secretHash = createHash("sha256").update(rawSecret).digest("hex")

    const secret = await prisma.webhookSecret.create({
      data: {
        ruleId: params.id,
        name: validatedData.name,
        secretHash,
        validTo: validatedData.validTo ? new Date(validatedData.validTo) : null,
      },
      select: {
        id: true,
        name: true,
        validFrom: true,
        validTo: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        secret,
        secretKey: rawSecret, // Retorna apenas uma vez
        message: "Secret criado com sucesso. Guarde a chave em local seguro, ela não será exibida novamente.",
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar secret:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
