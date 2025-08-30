import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Buscar usuário pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Sempre retorna sucesso por segurança (não revela se e-mail existe)
    const response = { 
      message: "Se o e-mail existir, você receberá um link de recuperação." 
    };

    if (!user) {
      return NextResponse.json(response);
    }

    // Gerar token seguro
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Definir expiração (15 minutos)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Salvar token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: expiresAt,
      },
    });

    // Enviar e-mail
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "E-mail inválido" },
        { status: 400 }
      );
    }

    console.error("Erro ao processar solicitação de reset:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
