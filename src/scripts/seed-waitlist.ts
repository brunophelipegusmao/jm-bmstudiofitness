import { db } from "@/db";
import { waitlistTable } from "@/db/schema";

async function seedWaitlist() {
  try {
    // Limpar dados existentes
    await db.delete(waitlistTable);

    // Inserir dados de teste
    const testData = [
      {
        fullName: "Ana Carolina Silva",
        email: "ana.silva@email.com",
        whatsapp: "(21) 98765-4321",
        preferredShift: "manha",
        goal: "Perder peso e ganhar condicionamento físico",
        healthRestrictions: "Nenhuma",
        position: 1,
        status: "waiting",
      },
      {
        fullName: "Bruno Henrique Santos",
        email: "bruno.santos@email.com",
        whatsapp: "(21) 97654-3210",
        preferredShift: "tarde",
        goal: "Ganhar massa muscular",
        healthRestrictions: "Problema no joelho direito",
        position: 2,
        status: "waiting",
      },
      {
        fullName: "Carla Fernandes",
        email: "carla.fernandes@email.com",
        whatsapp: "(21) 96543-2109",
        preferredShift: "noite",
        goal: "Melhorar a saúde geral e definição muscular",
        healthRestrictions: null,
        position: 3,
        status: "waiting",
      },
      {
        fullName: "Daniel Oliveira",
        email: "daniel.oliveira@email.com",
        whatsapp: "(21) 95432-1098",
        preferredShift: "manha",
        goal: "Preparação para corridas de rua",
        healthRestrictions: "Asma leve",
        position: 4,
        status: "contacted",
      },
      {
        fullName: "Eduarda Martins",
        email: "eduarda.martins@email.com",
        whatsapp: "(21) 94321-0987",
        preferredShift: "tarde",
        goal: "Reabilitação pós-cirurgia",
        healthRestrictions: "Cirurgia no ombro esquerdo (6 meses)",
        position: 5,
        status: "waiting",
      },
      {
        fullName: "Felipe Costa",
        email: "felipe.costa@email.com",
        whatsapp: "(21) 93210-9876",
        preferredShift: "noite",
        goal: "Hipertrofia e aumento de força",
        healthRestrictions: "Nenhuma",
        position: 6,
        status: "waiting",
      },
      {
        fullName: "Gabriela Alves",
        email: "gabriela.alves@email.com",
        whatsapp: "(21) 92109-8765",
        preferredShift: "manha",
        goal: "Emagrecimento e tonificação",
        healthRestrictions: null,
        position: 7,
        status: "waiting",
      },
      {
        fullName: "Henrique Rocha",
        email: "henrique.rocha@email.com",
        whatsapp: "(21) 91098-7654",
        preferredShift: "tarde",
        goal: "Condicionamento cardiovascular",
        healthRestrictions: "Hipertensão controlada",
        position: 8,
        status: "waiting",
      },
    ];

    const result = await db.insert(waitlistTable).values(testData).returning();

    console.log(`✅ ${result.length} registros inseridos na lista de espera!`);
    console.log("\n📋 Registros criados:");
    result.forEach((entry) => {
      console.log(`  ${entry.position}. ${entry.fullName} - ${entry.status}`);
    });
  } catch (error) {
    console.error("❌ Erro ao popular lista de espera:", error);
  } finally {
    process.exit(0);
  }
}

seedWaitlist();
