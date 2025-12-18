"use server";

import { sql } from "drizzle-orm";

import { db } from "@/db";

/**
 * Testa a conexão com o banco de dados
 */
export async function testDatabaseConnection() {
  try {
    // Tenta fazer uma query simples
    await db.execute(sql`SELECT 1`);

    return {
      success: true,
      message: "Conexão com banco de dados estabelecida com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao conectar ao banco:", error);

    // Verifica tipos específicos de erro
    if (error && typeof error === "object" && "code" in error) {
      const pgError = error as { code?: string; message?: string };

      if (pgError.code === "28P01") {
        return {
          success: false,
          error: "❌ Falha de autenticação",
          details: "Usuário ou senha incorretos no DATABASE_URL",
          solution: "Verifique o usuário e senha no arquivo .env.local",
        };
      }

      if (pgError.code === "3D000") {
        return {
          success: false,
          error: "❌ Banco de dados não existe",
          details: "O banco especificado não foi encontrado",
          solution: "Crie o banco de dados usando: createdb jm_fitness_studio",
        };
      }

      if (pgError.code === "ECONNREFUSED") {
        return {
          success: false,
          error: "❌ Conexão recusada",
          details: "Não foi possível conectar ao PostgreSQL",
          solution: "Verifique se o PostgreSQL está rodando: pg_ctl status",
        };
      }
    }

    return {
      success: false,
      error: "❌ Erro desconhecido",
      details: error instanceof Error ? error.message : String(error),
      solution: "Verifique os logs do servidor para mais detalhes",
    };
  }
}

/**
 * Obtém informações sobre a configuração do banco
 */
export async function getDatabaseInfo() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      configured: false,
      message: "DATABASE_URL não configurada",
    };
  }

  try {
    // Extrai informações da URL (sem expor a senha)
    const url = new URL(databaseUrl);

    return {
      configured: true,
      host: url.hostname,
      port: url.port || "5432",
      database: url.pathname.slice(1),
      username: url.username,
      // Não retorna a senha por segurança
    };
  } catch (error) {
    return {
      configured: false,
      message: "DATABASE_URL mal formatada",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
