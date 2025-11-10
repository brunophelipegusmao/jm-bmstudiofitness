import { eq } from "drizzle-orm";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getCurrentUser(request: Request) {
  // Obter token da requisição
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  try {
    // Validar token e buscar usuário
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        role: usersTable.userRole,
      })
      .from(usersTable)
      .where(eq(usersTable.token, token))
      .limit(1);

    return user;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
}
