import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { randomBytes, createHash } from "crypto"

const apiKeySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  scopes: z.array(z.string()),
  allowedIps: z.array(z.string()).optional(),
  description: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
})

// GET /api/api-keys - Listar API Keys do usuário
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

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        scopes: true,
        allowedIps: true,
        description: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
        revokedAt: true,
      },
    })

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error("Erro ao listar API Keys:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/api-keys - Criar nova API Key
export async function POST(request: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = apiKeySchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Gerar chave aleatória
    const rawKey = randomBytes(32).toString("hex")
    const keyHash = createHash("sha256").update(rawKey).digest("hex")

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        keyHash,
        scopes: validatedData.scopes,
        allowedIps: validatedData.allowedIps || [],
        description: validatedData.description,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
      },
      select: {
        id: true,
        name: true,
        scopes: true,
        allowedIps: true,
        description: true,
        createdAt: true,
        expiresAt: true,
      },
    })

    return NextResponse.json(
      {
        apiKey,
        key: rawKey, // Retorna a chave apenas uma vez
        message: "API Key criada com sucesso. Guarde a chave em local seguro, ela não será exibida novamente.",
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao criar API Key:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
