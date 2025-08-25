import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"



export async function GET() {
    const session = await getServerSession(authOptions)
  
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }


  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userSettings: true,
        notifications: {
          where: { read: false },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        transactions: {
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Calculate today's revenue from transactions
    const todayRevenue = user.transactions.reduce((sum, transaction) => {
      return sum + (transaction.status === "APPROVED" ? Number(transaction.amount) : 0)
    }, 0)

    // Get blocked amount from MEDs
    const blockedAmount = await prisma.med.aggregate({
      where: {
        userId: user.id,
        status: "PENDING",
      },
      _sum: {
        amount: true,
      },
    })

    // Get total revenue
    const totalRevenue = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        status: "APPROVED",
      },
      _sum: {
        amount: true,
      },
    })

    const overview = {
      id: user.id,
      name: user.name,
      email: user.email,
      balance: Number(user.balance || 0),
      revenueToday: todayRevenue,
      blockedAmount: Number(blockedAmount._sum.amount || 0),
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      userSettings: user.userSettings,
      notifications: user.notifications,
    }

    return NextResponse.json(overview)
  } catch (error) {
    console.error("Erro ao carregar overview:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
