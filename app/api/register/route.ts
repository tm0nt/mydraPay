// app/api/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/utils/hash";
import crypto from "crypto"; // Import nativo do Node.js para geração de chaves seguras

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Email já cadastrado" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Cria o usuário principal
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        type: "INDIVIDUAL",
        isActive: true,
        canGeneratePix: false,
        canWithdraw: false,
        kycApproved: false,
      },
    });

    // Gera chaves seguras para Credential (iniciando com pub_ e secret_)
    const publicKey = `pub_${crypto.randomBytes(32).toString("hex")}`;
    const secretKey = `secret_${crypto.randomBytes(32).toString("hex")}`;

    // Cria o registro de Credential associado ao usuário (one-to-one)
    const credential = await prisma.credential.create({
      data: {
        userId: user.id,
        publicKey,
        secretKey,
      },
    });

    // Sincroniza UserSettings com GlobalConfig
    const globalConfig = await prisma.globalConfig.findFirst();
    if (!globalConfig) {
      throw new Error("GlobalConfig não configurado no banco");
    }

    await prisma.userSettings.create({
      data: {
        userId: user.id,
        minPixWithdrawalTax: globalConfig.minPixWithdrawalTax,
        minCryptoWithdrawalTax: globalConfig.minCryptoWithdrawalTax,
        minPixWithdrawal: globalConfig.minPixWithdrawal,
        minCryptoWithdrawal: globalConfig.minCryptoWithdrawal,
        pixFeePercent: globalConfig.pixFeePercent,
        pixFeeFixed: globalConfig.pixFeeFixed,
        creditFeePercent: globalConfig.creditFeePercent,
        creditFeeFixed: globalConfig.creditFeeFixed,
        reservePercent: globalConfig.reservePercent,
        reserveFixed: globalConfig.reserveFixed,
        pixAcquirerId: globalConfig.pixAcquirerId,
        creditAcquirerId: globalConfig.creditAcquirerId,
        cryptoAcquirerId: globalConfig.cryptoAcquirerId,
        preferredTheme: "dark",
        preferredLanguage: "pt-BR",
        timezone: "America/Sao_Paulo",
        notificationEmail: true,
        notificationPush: false,
      },
    });

    // Cria UserBalance inicial
    await prisma.userBalance.create({
      data: {
        userId: user.id,
        currency: "BRL",
        available: 0,
        pending: 0,
        blocked: 0,
      },
    });

    // (Opcional) AllowedIp padrão para registro inicial ou onboarding de IP seguro
    await prisma.allowedIp.create({
      data: {
        userId: user.id,
        cidr: "0.0.0.0/0",
        note: "Default",
      },
    });

    // Sincroniza UserAcquirerConfig com GlobalConfig
    if (globalConfig.pixAcquirerId) {
      await prisma.userAcquirerConfig.create({
        data: { userId: user.id, acquirerId: globalConfig.pixAcquirerId, active: true, priority: 1 },
      });
    }
    if (globalConfig.creditAcquirerId) {
      await prisma.userAcquirerConfig.create({
        data: { userId: user.id, acquirerId: globalConfig.creditAcquirerId, active: true, priority: 2 },
      });
    }
    if (globalConfig.cryptoAcquirerId) {
      await prisma.userAcquirerConfig.create({
        data: { userId: user.id, acquirerId: globalConfig.cryptoAcquirerId, active: true, priority: 3 },
      });
    }

    // Cria placeholder KYC
    await prisma.kyc.create({
      data: {
        userId: user.id,
        type: "NATIONAL_ID",
      },
    });

    // Cria LevelProgress inicial para gamificação (nível 0, pontos 0)
    await prisma.levelProgress.create({
      data: {
        userId: user.id,
        points: 0,
      },
    });

    // Cria Ranking inicial
    await prisma.ranking.create({
      data: {
        userId: user.id,
        points: 0,
        level: 0,
        position: 0,
        achievements: [],
        rewards: [],
        challenges: [],
      },
    });

    // Cria notificação de boas-vindas
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Bem-vindo!",
        description: "Sua conta foi criada com sucesso. Complete seu KYC para desbloquear recursos.",
        type: "SUCCESS",
        priority: "MEDIUM",
        url: "/dashboard",
      },
    });

    // Registra um AuditEntry para o evento de criação de usuário
    await prisma.auditEntry.create({
      data: {
        actorUserId: user.id,
        entity: "User",
        entityId: user.id,
        action: "CREATE",
        after: { id: user.id, email: user.email },
        reason: "Registro de novo usuário",
      },
    });

    // Registra um DomainEvent para o evento de novo usuário
    await prisma.domainEvent.create({
      data: {
        actorUserId: user.id,
        eventName: "USER_CREATED",
        payload: { userId: user.id, email: email },
      },
    });

    // Registra um SystemLog de info para o registro
    await prisma.systemLog.create({
      data: {
        actorUserId: user.id,
        level: "INFO",
        service: "auth",
        category: "registration",
        message: `Novo usuário registrado: ${email}`,
      },
    });

    // Atualiza estatísticas em Analytic
    const lastAnalytics = await prisma.analytic.findFirst({ orderBy: { createdAt: "desc" } });
    await prisma.analytic.create({
      data: {
        sessions: lastAnalytics ? lastAnalytics.sessions + 1 : 1,
        users: lastAnalytics ? lastAnalytics.users + 1 : 1,
        pixGenerated: lastAnalytics ? lastAnalytics.pixGenerated : 0,
        pixPaid: lastAnalytics ? lastAnalytics.pixPaid : 0,
        creditPaid: lastAnalytics ? lastAnalytics.creditPaid : 0,
        creditError: lastAnalytics ? lastAnalytics.creditError : 0,
        rejections: lastAnalytics ? lastAnalytics.rejections : 0,
      },
    });

    // Resposta final segura
    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        userId: user.id,
        publicKey: credential.publicKey,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}
