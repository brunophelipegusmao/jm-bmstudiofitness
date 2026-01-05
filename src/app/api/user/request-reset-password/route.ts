import crypto from "crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/db";
import { passwordResetTokensTable } from "@/db/reset-password-schema";
import { personalDataTable, usersTable } from "@/db/schema";
import { sendResetPasswordEmail } from "@/lib/email";

const requestResetSchema = z.object({
  email: z.string().email("Email inválido"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar payload
    const validatedBody = requestResetSchema.parse(body);

    // Buscar usuário pelo email
    const personalData = await db
      .select()
      .from(personalDataTable)
      .where(eq(personalDataTable.email, validatedBody.email))
      .limit(1);

    if (!personalData?.[0]) {
      // Não retornar erro para evitar enumeration de emails
      return NextResponse.json({ success: true });
    }

    const userData = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, personalData[0].userId))
      .limit(1);

    if (!userData?.[0]) {
      // Não retornar erro para evitar enumeration de emails
      return NextResponse.json({ success: true });
    }

    const user = userData[0];

    // Gerar token aleatório
    const token = crypto.randomBytes(32).toString("hex");

    // Calcular data de expiração (24 horas)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Salvar token
    await db.insert(passwordResetTokensTable).values({
      userId: user.id,
      token,
      expiresAt,
      used: false,
    });

    // Enviar email
    try {
      const sent = await sendResetPasswordEmail(validatedBody.email, user.name, token);
      if (!sent) {
        console.error("Falha ao enviar e-mail de redefinição (SMTP/config).");
        return NextResponse.json(
          { success: false, message: "Não foi possível enviar o e-mail de redefinição." },
          { status: 500 },
        );
      }
    } catch (err) {
      console.error("Erro ao enviar e-mail de redefinição:", err);
      return NextResponse.json(
        { success: false, message: "Não foi possível enviar o e-mail de redefinição." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro em /api/user/request-reset-password:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Email inválido" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
