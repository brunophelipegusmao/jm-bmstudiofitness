import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/db";
import { passwordResetTokensTable } from "@/db/reset-password-schema";
import { usersTable } from "@/db/schema";

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar payload
    const validatedBody = resetPasswordSchema.parse(body);

    // Buscar token no banco
    const resetToken = await db
      .select()
      .from(passwordResetTokensTable)
      .where(
        and(
          eq(passwordResetTokensTable.token, validatedBody.token),
          eq(passwordResetTokensTable.used, false),
        ),
      )
      .limit(1);

    const token = resetToken?.[0];

    // Se token não existir, estiver expirado ou não tiver usuário associado
    if (!token || token.expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Este link de redefinição de senha é inválido ou já expirou. Por favor, solicite um novo link.",
        },
        { status: 400 },
      );
    }

    // Atualizar senha do usuário
    const hashedPassword = await bcrypt.hash(validatedBody.newPassword, 10);

    await db.transaction(async (tx) => {
      // Atualizar senha
      await tx
        .update(usersTable)
        .set({
          password: hashedPassword,
        })
        .where(eq(usersTable.id, token.userId));

      // Marcar token como usado
      await tx
        .update(passwordResetTokensTable)
        .set({
          used: true,
        })
        .where(eq(passwordResetTokensTable.id, token.id));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Dados inválidos" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
