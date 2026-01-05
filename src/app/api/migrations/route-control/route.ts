import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";

/**
 * API para adicionar colunas de controle de rotas
 */
export async function POST() {
  try {
    // Adiciona as colunas se não existirem
    await db.execute(sql`
      ALTER TABLE tb_studio_settings 
      ADD COLUMN IF NOT EXISTS route_user_enabled BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS route_coach_enabled BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS route_employee_enabled BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS route_shopping_enabled BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS route_blog_enabled BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS route_events_enabled BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS route_services_enabled BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS route_contact_enabled BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS route_waitlist_enabled BOOLEAN NOT NULL DEFAULT true;
    `);

    return NextResponse.json({
      success: true,
      message: "Colunas de controle de rotas adicionadas com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao adicionar colunas:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao executar migração",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
