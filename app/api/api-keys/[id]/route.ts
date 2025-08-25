import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// DELETE /api/api-keys/[id] - Revogar API Key
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

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!apiKey) {
      return NextResponse.json({ error: "API Key não encontrada" }, { status: 404 })
    }

    await prisma.apiKey.update({
      where: { id: params.id },
      data: {
        revokedAt: new Date(),
      },
    })

    return NextResponse.json({ message: "API Key revogada com sucesso" })
  } catch (error) {
    console.error("Erro ao revogar API Key:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
