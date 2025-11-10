import crypto from "crypto";
import { and, eq } from "drizzle-orm";
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
    await sendResetPasswordEmail(validatedBody.email, user.name, token);

    return NextResponse.json({ success: true });
  } catch (error) {
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
