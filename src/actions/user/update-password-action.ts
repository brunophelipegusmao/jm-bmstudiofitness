import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";

import { db } from "@/db";
import { usersTable } from "@/db/schema";

export async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Buscar o usuário
    const [user] = await db
      .select({ password: usersTable.password })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      return {
        success: false,
        message: "Usuário não encontrado",
      };
    }

    // Verificar senha atual
    const passwordMatch = await compare(currentPassword, user.password || "");
    if (!passwordMatch) {
      return {
        success: false,
        message: "Senha atual incorreta",
      };
    }

    // Hash da nova senha
    const hashedPassword = await hash(newPassword, 10);

    // Atualizar senha
    await db
      .update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.id, userId));

    return {
      success: true,
      message: "Senha atualizada com sucesso",
    };
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    return {
      success: false,
      message: "Erro ao atualizar senha",
    };
  }
}
