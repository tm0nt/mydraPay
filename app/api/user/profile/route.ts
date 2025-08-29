import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(_request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    // Dados principais do usuário, notificações, gamificação e KYC
    const userRow = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        type: true,
        taxId: true,
        avatarUrl: true,
        isActive: true,
        canGeneratePix: true,
        canWithdraw: true,
        kycApproved: true,
        createdAt: true,
        updatedAt: true,
        kycs: { select: { id: true, type: true, verifiedAt: true, notes: true } },
        notifications: { select: { id: true, title: true, type: true, isRead: true, createdAt: true } },
        levelProgress: { select: { points: true, updatedAt: true } },
        Ranking: { select: { points: true, level: true, position: true } }
      },
    });

    if (!userRow) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Configurações do usuário
    const settingsRow = await prisma.userSettings.findUnique({
      where: { userId: userRow.id },
      select: {
        preferredTheme: true,
        preferredLanguage: true,
        timezone: true,
        notificationEmail: true,
        notificationPush: true,
        minPixWithdrawal: true,
        minCryptoWithdrawal: true,
        minPixWithdrawalTax: true,
        minCryptoWithdrawalTax: true,
        dailyWithdrawalLimit: true,
        pixAcquirerId: true,
        creditAcquirerId: true,
        cryptoAcquirerId: true,
        pixFeePercent: true,
        pixFeeFixed: true,
        creditFeePercent: true,
        creditFeeFixed: true,
        reservePercent: true,
        reserveFixed: true,
        customLogoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Saldo atual UserBalance
    const balanceRow = await prisma.userBalance.findUnique({
      where: { userId: userRow.id },
      select: {
        updatedAt: true,
        currency: true,
        available: true,
        pending: true,
        blocked: true,
      },
    });

    const balance = {
      updatedAt: balanceRow?.updatedAt ?? null,
      currency: balanceRow?.currency ?? "BRL",
      current: Number(balanceRow?.available ?? 0),
      pending: Number(balanceRow?.pending ?? 0),
      blocked: Number(balanceRow?.blocked ?? 0),
    };

    // Data de hoje para filtrar transações do dia
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Conversão/estatísticas rápidas de transações + novos dados de INCOMING
    const [
      totalGenerated,
      totalPaid,
      totalChargebacks,
      pixGenerated,
      pixPaid,
      creditGenerated,
      creditPaid,
      boletoGenerated,
      boletoPaid,
      // NOVOS: Total de transações INCOMING COMPLETED
      incomingCompletedCount,
      // NOVOS: Soma dos valores das transações INCOMING COMPLETED (total)
      incomingCompletedSum,
      // NOVO: Soma dos valores das transações INCOMING COMPLETED HOJE
      incomingTodaySum,
    ] = await prisma.$transaction([
      prisma.transaction.count({ where: { userId: userRow.id } }),
      prisma.transaction.count({ where: { userId: userRow.id, status: "COMPLETED" } }),
      prisma.transaction.count({ where: { userId: userRow.id, status: "CHARGEBACK" } }),
      prisma.transaction.count({ where: { userId: userRow.id, method: "PIX" } }),
      prisma.transaction.count({ where: { userId: userRow.id, method: "PIX", status: "COMPLETED" } }),
      prisma.transaction.count({ where: { userId: userRow.id, method: "CREDIT_CARD" } }),
      prisma.transaction.count({ where: { userId: userRow.id, method: "CREDIT_CARD", status: "COMPLETED" } }),
      prisma.transaction.count({ where: { userId: userRow.id, method: "BOLETO" } }),
      prisma.transaction.count({ where: { userId: userRow.id, method: "BOLETO", status: "COMPLETED" } }),
      
      // NOVO: Conta transações INCOMING COMPLETED (total)
      prisma.transaction.count({ 
        where: { 
          userId: userRow.id, 
          status: "COMPLETED", 
          type: "INCOMING" 
        } 
      }),
      
      // NOVO: Soma valores das transações INCOMING COMPLETED (total)
      prisma.transaction.aggregate({
        where: { 
          userId: userRow.id, 
          status: "COMPLETED", 
          type: "INCOMING" 
        },
        _sum: { amount: true }
      }),

      // NOVO: Soma valores das transações INCOMING COMPLETED HOJE
      prisma.transaction.aggregate({
        where: { 
          userId: userRow.id, 
          status: "COMPLETED", 
          type: "INCOMING",
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        },
        _sum: { amount: true }
      }),
    ]);

    const percent = (num: number, denom: number) =>
      denom === 0 ? 0 : Number(((num / denom) * 100).toFixed(2));

    const conversionRates = {
      general: percent(totalPaid, totalGenerated),
      pix: percent(pixPaid, pixGenerated),
      creditCard: percent(creditPaid, creditGenerated),
      boleto: percent(boletoPaid, boletoGenerated),
      chargebackRate: percent(totalChargebacks, totalGenerated),
    };

    // CAMPOS atualizados na resposta
    const incomingStats = {
      totalIncomingCompleted: incomingCompletedCount,
      totalIncomingAmount: Number(incomingCompletedSum._sum.amount ?? 0), // Faturamento total
      todayIncomingAmount: Number(incomingTodaySum._sum.amount ?? 0),     // Recebido hoje
    };

    // NOVO: Busca configurações globais do sistema
    const globalConfig = await prisma.globalConfig.findFirst({
      select: {
        contactEmail: true,
        whatsappNumber: true,
        whatsappGroupLink: true,
        siteName: true,
        siteUrl: true,
        siteLogoUrl: true,
        faviconUrl: true,
        seoDefaultTitle: true,
        seoDefaultDescription: true,
        seoDefaultKeywords: true,
      },
    });

    return NextResponse.json(
      {
        user: userRow,
        settings: settingsRow ?? null,
        balance,
        conversionRates,
        incomingStats, // <-- NOVO campo com as estatísticas de INCOMING
        globalConfig: globalConfig ?? null, // <-- NOVO campo com configurações globais
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("Erro ao obter profile:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}


/* =================== ROTA PUT COM AUDITORIA =================== */
// Atualiza o perfil e registra no AuditEntry
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, taxId: true, phone: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verificar restrições de campos
    if (user.taxId && body.taxId) {
      return NextResponse.json({ error: "CPF/CNPJ não pode ser alterado após cadastro" }, { status: 403 });
    }
    if (user.phone && body.phone) {
      return NextResponse.json({ error: "Telefone não pode ser alterado após cadastro" }, { status: 403 });
    }

    // Monta objeto de atualização
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.phone) updateData.phone = body.phone;
    if (body.taxId) updateData.taxId = body.taxId;

    // Guarda antes e depois para auditoria
    const before = { name: user.name, phone: user.phone, taxId: user.taxId };
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // AUDIT: registra edit no AuditEntry
    await prisma.auditEntry.create({
      data: {
        actorUserId: user.id,
        entity: "User",
        entityId: user.id,
        action: "UPDATE",
        before,
        after: { name: updated.name, phone: updated.phone, taxId: updated.taxId },
        reason: "Atualização de perfil via PUT",
      },
    });

    return NextResponse.json({ message: "Perfil atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
