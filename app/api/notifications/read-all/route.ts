import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

// POST /api/notifications/read-all - Marcar todas as notificações como lidas
export async function POST(request: Request) {
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

    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: { isRead: true },
    })

    return NextResponse.json({
      message: "Todas as notificações foram marcadas como lidas",
      count: result.count,
    })
  } catch (error) {
    console.error("Erro ao marcar todas as notificações como lidas:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
