// app/api/user/kyc/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/auth";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid"; // Instale uuid: npm install uuid @types/uuid

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verificar se KYC já foi enviado (apenas uma vez)
    const existingKyc = await prisma.kyc.findFirst({ where: { userId: user.id } });
    if (existingKyc) {
      return NextResponse.json({ error: "KYC já enviado, não pode ser alterado" }, { status: 403 });
    }

    const formData = await request.formData();
    const fileFront = formData.get("fileFront") as File | null;
    const fileBack = formData.get("fileBack") as File | null;
    const selfie = formData.get("selfie") as File | null;
    const type = formData.get("type") as string; // ex.: 'PASSPORT', do enum KycType

    if (!fileFront || !type) {
      return NextResponse.json({ error: "Dados obrigatórios ausentes" }, { status: 400 });
    }

    // Diretório de upload (exemplo local; use S3 em produção)
    const uploadDir = path.join(process.cwd(), "public/kyc_uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Salvar arquivos
    const saveFile = async (file: File | null, suffix: string) => {
      if (!file) return null;
      const extension = path.extname(file.name);
      const fileName = `${uuidv4()}${suffix}${extension}`;
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      return `/kyc_uploads/${fileName}`;
    };

    const frontUrl = await saveFile(fileFront, "-front");
    const backUrl = await saveFile(fileBack, "-back");
    const selfieUrl = await saveFile(selfie, "-selfie");

    // Criar registro KYC
    await prisma.kyc.create({
      data: {
        userId: user.id,
        type,
        fileFront: frontUrl,
        fileBack: backUrl,
        selfieUrl: selfieUrl,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ message: "KYC enviado com sucesso" });
  } catch (error) {
    console.error("Erro ao enviar KYC:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
