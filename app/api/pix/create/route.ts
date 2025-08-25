// app/api/pix/create/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";

const BodySchema = z.object({
  amount: z.number().int().positive(), // em centavos
  cpf: z.string().min(11),
  nome: z.string().min(3),
  telefone: z.string().min(8),
  email: z.string().email(),
});

export async function POST(req: Request) {
  // 1) Sessão (App Router)
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // 2) Body mínimo
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  // 3) Usário e credenciais
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const cred = await prisma.credential.findUnique({
    where: { userId: user.id },
    select: { publicKey: true, secretKey: true },
  });
  if (!cred?.publicKey || !cred?.secretKey) {
    return NextResponse.json({ error: "Credencial não encontrada" }, { status: 401 });
  }

  // 4) Authorization: Basic base64(public:secret)
  const basic = Buffer.from(`${cred.publicKey}:${cred.secretKey}`).toString("base64");

  // 5) Payload para o provedor (mantém formato e campos esperados)
  const externalId = `ext-${randomUUID()}`;
const providerPayload = {
  amount: body.amount,
  method: "pix",
  external_id: externalId,
  customer: {
    name: body.nome,
    email: body.email,
    phone: body.telefone,
    document: {
      type: "CPF",
      value: body.cpf,
    },
  },
  delivery: {
    street: "Avenida General Afonseca",
    number: "1475",
    complement: "casa",
    district: "Manejo",
    city: "Resende",
    state: "RJ",
    country: "Brasil",
    postal_code: "27520174"
  },
  products: [
    { name: "PIX Gerado", price: body.amount, quantity: 1, type: "digital" },
  ],
};


  // 6) Chamada ao endpoint externo
  const url = "https://api.mydrapay.com/v1/payment/pix";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(providerPayload),
  });

  // 7) Erro do provedor
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json(
      { error: "Falha ao criar PIX", details: detail || res.statusText },
      { status: 502 }
    );
  }

  // 8) Resposta no mesmo formato exibido (inclui qrcode e pix quando existirem)
  const data = await res.json().catch(() => ({} as any));

  // Alguns provedores retornam copypaste dentro de data.pix ou em copypaste de nível superior
  const qrcode =
    data?.qrcode ??
    data?.pix?.qrcode ??
    null;

  const copypaste =
    data?.pix ??
    data?.copypaste ??
    data?.pix?.copypaste ??
    null;

  // Mantém o shape demonstrado (id, amount, method, customer, qrcode, pix)
  return NextResponse.json({
    id: data?.id ?? null,
    amount: data?.amount ?? body.amount,
    method: data?.method ?? "pix",
    customer: {
      name: providerPayload.customer.name,
      email: providerPayload.customer.email,
      phone: providerPayload.customer.phone,
      document: providerPayload.customer.document,
    },
    qrcode,
    pix: copypaste,
  });
}
