import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/db";
import { passwordResetTokensTable } from "@/db/reset-password-schema";

const validateTokenSchema = z.object({
  token: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar payload
    const validatedBody = validateTokenSchema.parse(body);

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

    // Se token não existir ou estiver expirado
    if (!resetToken?.[0] || resetToken[0].expiresAt < new Date()) {
      return NextResponse.json(
        {
          valid: false,
          message:
            "Este link de redefinição de senha é inválido ou já expirou. Por favor, solicite um novo link.",
        },
        { status: 400 },
      );
    }

    // Token válido
    return NextResponse.json({ valid: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, message: "Dados inválidos" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { valid: false, message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
