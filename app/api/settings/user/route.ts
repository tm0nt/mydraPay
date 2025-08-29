// app/api/settings/user/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

/* ---------------------------------  CONSTS  -------------------------------- */

const WEBHOOK_EVENTS = [
  "PAYMENT_CREATED",
  "PAYMENT_PAID",
  "WITHDRAWAL_REQUESTED",
  "WITHDRAWAL_PAID",
] as const;

type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

/* -----------------------------  ZOD SCHEMAS  ------------------------------- */

const userSettingsSchema = z.object({
  minPixWithdrawal: z.number().positive().optional(),
  minCryptoWithdrawal: z.number().positive().optional(),
  dailyWithdrawalLimit: z.number().positive().optional(),
  pixAcquirerId: z.string().uuid().optional(),
  creditAcquirerId: z.string().uuid().optional(),
  cryptoAcquirerId: z.string().uuid().optional(),
  preferredTheme: z.enum(["dark", "light", "system"]).optional(),
  preferredLanguage: z.string().optional(),
  timezone: z.string().optional(),
  notificationEmail: z.boolean().optional(),
  notificationPush: z.boolean().optional(),
  customSeoTitle: z.string().optional(),
  customSeoDescription: z.string().optional(),
  customSeoKeywords: z.string().optional(),
  customLogoUrl: z.string().url().optional(),
  flags: z.record(z.any()).optional(),
});

const allowedIpSchema = z.object({
  action: z.literal("addIp"),
  cidr: z.string(),
  note: z.string().optional(),
});

const webhookSchema = z.object({
  action: z.literal("addWebhook"),
  url: z.string().url(),
  events: z.array(z.enum(WEBHOOK_EVENTS)),
});

// NOVOS SCHEMAS PARA DELETE
const deleteIpSchema = z.object({
  action: z.literal("deleteIp"),
  ipId: z.string().uuid(),
});

const deleteWebhookSchema = z.object({
  action: z.literal("deleteWebhook"),
  webhookId: z.string().uuid(),
});

const deleteCredentialSchema = z.object({
  action: z.literal("deleteCredential"),
});

/* ------------------------  GET – USER CONFIG ENDPOINT ----------------------- */

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        settings: true,
        credential: true,
        allowedIps: true,
        webhookUsers: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      settings: user.settings,
      credential: user.credential,
      allowedIps: user.allowedIps,
      webhooks: user.webhookUsers,
    });
  } catch (err) {
    console.error("Erro ao obter dados do usuário:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

/* -------------------------  PUT – UPDATE / CREATE -------------------------- */

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    /* ---------- Adicionar IP ---------- */
    const ipParse = allowedIpSchema.safeParse(body);
    if (ipParse.success) {
      const { cidr, note } = ipParse.data;
      const allowedIp = await prisma.allowedIp.create({
        data: { userId: user.id, cidr, note },
      });
      return NextResponse.json(allowedIp);
    }

    /* -------- Adicionar Webhook -------- */
    const webhookParse = webhookSchema.safeParse(body);
    if (webhookParse.success) {
      const { url, events } = webhookParse.data;
      const webhook = await prisma.webhookUser.create({
        data: { userId: user.id, url, events },
      });
      return NextResponse.json(webhook);
    }

    /* -------- Atualizar UserSettings -------- */
    const validated = userSettingsSchema.parse(body);
    const userSettings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: validated,
      create: { userId: user.id, ...validated },
    });

    return NextResponse.json(userSettings);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: err.errors }, { status: 400 });
    }
    console.error("Erro ao atualizar dados do usuário:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

/* -------------------------  DELETE – REMOVER RECURSOS --------------------- */

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    /* ---------- Deletar IP Permitido ---------- */
    const deleteIpParse = deleteIpSchema.safeParse(body);
    if (deleteIpParse.success) {
      const { ipId } = deleteIpParse.data;
      
      // Verificar se o IP pertence ao usuário
      const allowedIp = await prisma.allowedIp.findFirst({
        where: { id: ipId, userId: user.id },
      });

      if (!allowedIp) {
        return NextResponse.json({ error: "IP não encontrado" }, { status: 404 });
      }

      await prisma.allowedIp.delete({ where: { id: ipId } });
      
      return NextResponse.json({ message: "IP removido com sucesso" });
    }

    /* ---------- Deletar Webhook ---------- */
    const deleteWebhookParse = deleteWebhookSchema.safeParse(body);
    if (deleteWebhookParse.success) {
      const { webhookId } = deleteWebhookParse.data;
      
      // Verificar se o webhook pertence ao usuário
      const webhook = await prisma.webhookUser.findFirst({
        where: { id: webhookId, userId: user.id },
      });

      if (!webhook) {
        return NextResponse.json({ error: "Webhook não encontrado" }, { status: 404 });
      }

      await prisma.webhookUser.delete({ where: { id: webhookId } });
      
      return NextResponse.json({ message: "Webhook removido com sucesso" });
    }

    /* ---------- Deletar Credencial API ---------- */
    const deleteCredentialParse = deleteCredentialSchema.safeParse(body);
    if (deleteCredentialParse.success) {
      // Verificar se existe credencial do usuário
      const credential = await prisma.credential.findFirst({
        where: { userId: user.id },
      });

      if (!credential) {
        return NextResponse.json({ error: "Credencial não encontrada" }, { status: 404 });
      }

      await prisma.credential.delete({ where: { id: credential.id } });
      
      return NextResponse.json({ message: "Credencial removida com sucesso" });
    }

    return NextResponse.json({ error: "Ação não reconhecida" }, { status: 400 });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos", details: err.errors }, { status: 400 });
    }
    console.error("Erro ao deletar recurso:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

/* -----------------------------  TYPE EXPORTS ------------------------------- */

export type { WebhookEvent };
export { WEBHOOK_EVENTS };
