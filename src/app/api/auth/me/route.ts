import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { personalDataTable,usersTable } from "@/db/schema";
import { getUserFromRequestEdge } from "@/lib/auth-edge";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authUser = await getUserFromRequestEdge(request);
    
    if (!authUser) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // Buscar dados completos do usuário
    const user = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        role: usersTable.userRole,
        email: personalDataTable.email,
      })
      .from(usersTable)
      .leftJoin(personalDataTable, eq(usersTable.id, personalDataTable.userId))
      .where(eq(usersTable.id, authUser.id))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const userData = user[0];
    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      email: userData.email || authUser.email,
      role: userData.role,
    });
  } catch (error) {
    console.error("Erro ao buscar informações do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
