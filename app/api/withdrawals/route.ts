import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const withdrawalSchema = z.object({
  pix_key_type: z.string().min(1),
  pix_key: z.string().min(1),
  value: z.number().positive(),
});

export async function POST(request: Request) {
  // Autenticação NextAuth (server session)
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = withdrawalSchema.parse(body);

    // Busca credencial do usuário (credencial: { publicKey, secretKey })
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { credential: true },
    });

    if (!user?.credential?.publicKey || !user.credential.secretKey) {
      return NextResponse.json({ error: "Credenciais não configuradas" }, { status: 403 });
    }

    const authRaw = `${user.credential.publicKey}:${user.credential.secretKey}`;
    const authBase64 = Buffer.from(authRaw).toString("base64");

    // Monta o body para API externa
    const externalBody = {
      pix_key_type: validatedData.pix_key_type,
      pix_key: validatedData.pix_key,
      value: validatedData.value,
    };

    // Faz a requisição para o serviço externo
    const apiRes = await fetch("https://api.mydrapay.com/v1/transfers", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authBase64}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(externalBody),
    });

    if (apiRes.status === 200) {
      return NextResponse.json({ message: "Saque solicitado com sucesso!" }, { status: 200 });
    }

    // Mensagem de erro do serviço externo
    let errorMsg = "Erro ao solicitar saque";
    try {
      const errData = await apiRes.json();
      errorMsg = errData.error ?? JSON.stringify(errData);
    } catch { /* ignora erro de parse json */ }

    return NextResponse.json({ error: errorMsg }, { status: apiRes.status });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: "Dados inválidos",
        details: error.errors,
      }, { status: 400 });
    }
    console.error("Erro ao solicitar saque:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
