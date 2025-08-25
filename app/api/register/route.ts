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

    // Função para sincronizar UserSettings com GlobalConfig
    const globalConfig = await prisma.globalConfig.findFirst();
    if (!globalConfig) {
      throw new Error("GlobalConfig não configurado no banco");
    }

    await prisma.userSettings.create({
      data: {
        userId: user.id,
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
        preferredTheme: "dark", // Valor default baseado no layout
        preferredLanguage: "pt-BR", // Assumindo português como default
        timezone: "America/Sao_Paulo", // Como especificado na política do schema
        notificationEmail: true, // Ativa por default
        notificationPush: false, // Desativada por default
      },
    });

    // Registros adicionais que fazem sentido com base no schema
    // 2. Cria LevelProgress inicial para gamificação (nível 0, pontos 0)
    await prisma.levelProgress.create({
      data: {
        userId: user.id,
        points: 0,
      },
    });

    // 3. Cria Ranking inicial (posição e level 0, sem conquistas iniciais)
    await prisma.ranking.create({
      data: {
        userId: user.id,
        points: 0,
        level: 0,
        position: 0, // Posição inicial; ajuste via lógica de ranking se necessário
        achievements: [],
        rewards: [],
        challenges: [],
      },
    });

    // 4. Cria uma notificação de boas-vindas (Notification)
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Bem-vindo ao AURA Dashboard!",
        description: "Sua conta foi criada com sucesso. Complete seu KYC para desbloquear recursos.",
        type: "SUCCESS",
        priority: "MEDIUM",
        url: "/dashboard", // Link para dashboard ou ação inicial
      },
    });

    // 5. Registra um AuditEntry para o evento de criação de usuário
    await prisma.auditEntry.create({
      data: {
        actorUserId: user.id, // O próprio usuário como ator inicial
        entity: "User",
        entityId: user.id,
        action: "CREATE",
        after: { id: user.id, email: user.email }, // Estado após criação (simplificado)
        reason: "Registro de novo usuário",
      },
    });

    // 6. Registra um DomainEvent para o evento de novo usuário (para processamento assíncrono)
    await prisma.domainEvent.create({
      data: {
        actorUserId: user.id,
        eventName: "USER_CREATED",
        payload: { userId: user.id, email: email },
      },
    });

    // 7. Registra um SystemLog de info para o registro
    await prisma.systemLog.create({
      data: {
        actorUserId: user.id,
        level: "INFO",
        service: "auth",
        category: "registration",
        message: `Novo usuário registrado: ${email}`,
      },
    });

    // Retorna resposta com userId e publicKey (não retorne secretKey por segurança)
    return NextResponse.json(
      { 
        message: "Usuário criado com sucesso", 
        userId: user.id, 
        publicKey: credential.publicKey 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}
