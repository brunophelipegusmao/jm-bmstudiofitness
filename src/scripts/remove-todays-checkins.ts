import { eq } from "drizzle-orm";

import { db } from "@/db";
import { checkInTable } from "@/db/schema";

async function main() {
  try {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0]; // Formato YYYY-MM-DD

    console.log("Removendo check-ins de hoje...");

    const result = await db
      .delete(checkInTable)
      .where(eq(checkInTable.checkInDate, todayString))
      .returning();

    console.log(`✅ ${result.length} check-ins foram removidos com sucesso!`);

    // Forçar a finalização do script
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao remover check-ins:", error);
    process.exit(1);
  }
}

// Executar o script
console.log("Iniciando limpeza dos check-ins...");
main();
