import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";

/**
 * API route para executar a migration dos campos de manutenção
 * Acesse: /api/migrations/maintenance
 */
export async function POST() {
  try {
    console.log("🔄 Executando migration de campos de manutenção...");

    // Adiciona campo maintenance_mode
    await db.execute(sql`
      ALTER TABLE tb_studio_settings 
      ADD COLUMN IF NOT EXISTS maintenance_mode boolean DEFAULT false NOT NULL
    `);

    // Adiciona campo maintenance_redirect_url
    await db.execute(sql`
      ALTER TABLE tb_studio_settings 
      ADD COLUMN IF NOT EXISTS maintenance_redirect_url text DEFAULT '/waitlist'
    `);

    console.log("✅ Migration executada com sucesso!");

    return NextResponse.json({
      success: true,
      message: "Campos de manutenção adicionados com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro ao executar migration:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao executar migration",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
