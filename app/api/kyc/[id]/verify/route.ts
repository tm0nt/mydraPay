import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const verifyKycSchema = z.object({
  approved: z.boolean(),
  notes: z.string().optional(),
})

// POST /api/kyc/[id]/verify - Verificar KYC
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { approved, notes } = verifyKycSchema.parse(body)

    // Verificar se KYC existe
    const kyc = await prisma.kyc.findUnique({
      where: { id: params.id },
      include: { user: true },
    })

    if (!kyc) {
      return NextResponse.json({ error: "KYC não encontrado" }, { status: 404 })
    }

    // Atualizar KYC
    const updatedKyc = await prisma.kyc.update({
      where: { id: params.id },
      data: {
        verifiedAt: new Date(),
        verifiedBy: session.user.email,
        notes,
      },
    })

    // Se aprovado, atualizar status do usuário
    if (approved) {
      await prisma.user.update({
        where: { id: kyc.userId },
        data: {
          kycApproved: true,
          canGeneratePix: true, // Habilitar PIX após KYC aprovado
        },
      })
    }

    return NextResponse.json({
      message: approved ? "KYC aprovado com sucesso" : "KYC processado",
      kyc: updatedKyc,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 })
    }
    console.error("Erro ao verificar KYC:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
