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

/* -----------------------------  TYPE EXPORTS ------------------------------- */
/*  Opcional: exporte para reutilizar no front.                                */
export type { WebhookEvent };
export { WEBHOOK_EVENTS };
