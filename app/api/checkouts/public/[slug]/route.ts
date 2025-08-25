import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/checkouts/public/[slug] - Obter checkout público por slug
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const checkout = await prisma.checkout.findUnique({
      where: {
        slug: params.slug,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            basePrice: true,
            currency: true,
            images: true,
            tags: true,
          },
        },
        variants: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            trafficShare: true,
            price: true,
            currency: true,
            primaryColor: true,
            secondaryColor: true,
            bannerUrl: true,
            headline: true,
            subheadline: true,
            layout: true,
            fields: true,
          },
        },
        orderBumps: {
          where: { active: true },
          orderBy: { position: "asc" },
        },
        upsells: {
          where: { active: true },
          orderBy: { position: "asc" },
        },
        downsells: {
          where: { active: true },
          orderBy: { position: "asc" },
        },
      },
    })

    if (!checkout || checkout.status !== "ACTIVE" || checkout.deletedAt) {
      return NextResponse.json({ error: "Checkout não encontrado ou inativo" }, { status: 404 })
    }

    // Incrementar views nas variantes (A/B testing)
    if (checkout.variants.length > 0) {
      // Selecionar variante baseada no traffic share
      const totalShare = checkout.variants.reduce((sum, variant) => sum + variant.trafficShare, 0)
      const random = Math.random() * totalShare
      let currentShare = 0

      for (const variant of checkout.variants) {
        currentShare += variant.trafficShare
        if (random <= currentShare) {
          // Incrementar view da variante selecionada
          await prisma.checkoutVariant.update({
            where: { id: variant.id },
            data: { views: { increment: 1 } },
          })
          break
        }
      }
    }

    return NextResponse.json(checkout)
  } catch (error) {
    console.error("Erro ao obter checkout público:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
