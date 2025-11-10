"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { passwordResetTokensTable } from "@/db/reset-password-schema";
import { personalDataTable } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { sendResetPasswordEmail } from "@/lib/email";

export async function requestPasswordReset(
  email: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Buscar o usuário pelo email nos dados pessoais
    const [user] = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
      })
      .from(usersTable)
      .leftJoin(personalDataTable, eq(usersTable.id, personalDataTable.userId))
      .where(eq(personalDataTable.email, email))
      .limit(1);

    if (!user) {
      return { success: false, message: "Email não encontrado" };
    }

    // Gerar token único
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expira em 1 hora

    // Salvar token no banco
    await db.insert(passwordResetTokensTable).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // Enviar email com link para redefinir senha
    await sendResetPasswordEmail(email, user.name, token);

    return {
      success: true,
      message: "Email de recuperação enviado com sucesso",
    };
  } catch (error) {
    console.error("Erro ao solicitar redefinição de senha:", error);
    return { success: false, message: "Erro interno do servidor" };
  }
}
