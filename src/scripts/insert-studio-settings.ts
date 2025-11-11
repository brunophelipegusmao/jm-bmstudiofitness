import { db } from "@/db";
import { studioSettingsTable } from "@/db/schema";

async function insertStudioSettings() {
  try {
    // Verificar se já existe um registro
    const existing = await db.select().from(studioSettingsTable).limit(1);

    if (existing.length > 0) {
      console.log("✅ Configurações já existem:", existing[0]);
      console.log("🔍 waitlistEnabled:", existing[0].waitlistEnabled);
      return;
    }

    // Inserir configurações padrão
    const result = await db
      .insert(studioSettingsTable)
      .values({
        studioName: "JM Fitness Studio",
        email: "contato@jmfitness.com",
        phone: "(21) 98099-5749",
        address: "Rua das Flores, 123",
        city: "Rio de Janeiro",
        state: "RJ",
        zipCode: "20000-000",
        waitlistEnabled: true, // JÁ ATIVADO POR PADRÃO
      })
      .returning();

    console.log("✅ Configurações criadas com sucesso!");
    console.log("📄 Dados:", result[0]);
    console.log("🟢 waitlistEnabled:", result[0].waitlistEnabled);
  } catch (error) {
    console.error("❌ Erro ao inserir configurações:", error);
  } finally {
    process.exit(0);
  }
}

insertStudioSettings();
