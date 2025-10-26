import "dotenv/config";

import { drizzle } from "drizzle-orm/postgres-js";

// ✅ ajuste o caminho do schema aqui:
import {
  financialTable,
  healthMetricsTable,
  personalDataTable,
  usersTable,
} from "./schema"; // <- caminho relativo correto

// ---- conexões ----
const connectionString = process.env.DATABASE_URL!;
const db = drizzle(connectionString);

async function main() {
  // Seed simples e idempotente: vamos limpar apenas estes registros para evitar conflito de UNIQUE
  // (se preferir, remova o truncate e trate duplicidades por email/CPF)
  await db.delete(financialTable);
  await db.delete(healthMetricsTable);
  await db.delete(personalDataTable);
  await db.delete(usersTable);

  // 1) Users
  const users = await db
    .insert(usersTable)
    .values([
      { name: "Ana Souza", createdAt: "2025-10-01" },
      { name: "Bruno Lima", createdAt: "2025-10-02" },
      { name: "Carla Mendes", createdAt: "2025-10-03" },
    ])
    .returning({ id: usersTable.id, name: usersTable.name });

  const [ana, bruno, carla] = users;

  // 2) Personal Data (1–1, user_id UNIQUE)
  await db.insert(personalDataTable).values([
    {
      userId: ana.id,
      cpf: "12345678901", // 11 chars
      bornDate: "1996-02-14",
      address: "Rua Alfa, 100 - São Paulo/SP",
      telephone: "+55 11 98888-0001",
    },
    {
      userId: bruno.id,
      cpf: "23456789012",
      bornDate: "1992-10-03",
      address: "Rua Beta, 200 - São Paulo/SP",
      telephone: "+55 11 98888-0002",
    },
    {
      userId: carla.id,
      cpf: "34567890123",
      bornDate: "1989-07-20",
      address: "Rua Gama, 300 - São Paulo/SP",
      telephone: "+55 11 98888-0003",
    },
  ]);

  // 3) Health Metrics (1–1, user_id UNIQUE)
  await db.insert(healthMetricsTable).values([
    {
      userId: ana.id,
      heightCm: "168",
      weightKg: "62.5",
      bloodType: "A+",
      hasPracticedSports: true,
      lastExercise: "Caminhada leve (2x/semana)",
      historyDiseases: "Sem histórico relevante",
      medications: "Nenhum",
      sportsHistory: "Natação na adolescência",
      allergies: "Nenhuma",
      injuries: "Nenhuma",
      updatedAt: "2025-10-20",
      alimentalRoutine: "Dieta balanceada, foco em proteínas",
      diaryRoutine: "Trabalho sedentário; treino 3x/semana",
      useSupplements: false,
      whatSupplements: null,
      otherNotes: "Objetivo: reduzir 3kg em 8 semanas",
    },
    {
      userId: bruno.id,
      heightCm: "180",
      weightKg: "84.2",
      bloodType: "O-",
      hasPracticedSports: true,
      lastExercise: "Musculação (PPL)",
      historyDiseases: "Asma leve na infância",
      medications: "Nenhum",
      sportsHistory: "Futebol amador aos fins de semana",
      allergies: "Poeira",
      injuries: "Desconforto no cotovelo direito",
      updatedAt: "2025-10-20",
      alimentalRoutine: "Hiperproteica, leve superávit calórico",
      diaryRoutine: "Trabalho híbrido; treino 4x/semana",
      useSupplements: true,
      whatSupplements: "Whey protein",
      otherNotes: "Foco em hipertrofia",
    },
    {
      userId: carla.id,
      heightCm: "162",
      weightKg: "58.3",
      bloodType: "B+",
      hasPracticedSports: false,
      lastExercise: "Alongamentos em casa",
      historyDiseases: "Sem histórico relevante",
      medications: "Nenhum",
      sportsHistory: "—",
      allergies: "Nenhuma",
      injuries: "—",
      updatedAt: "2025-10-20",
      alimentalRoutine: "Déficit leve para perda de gordura",
      diaryRoutine: "Rotina ativa moderada; caminhada diária",
      useSupplements: false,
      whatSupplements: null,
      otherNotes: "Foco em condicionamento",
    },
  ]);

  // 4) Financial (N–1, pode ter múltiplas linhas por user)
  await db.insert(financialTable).values([
    {
      userId: ana.id,
      monthlyFeeValueInCents: 19990, // R$ 199,90
      dueDate: 5,
      paid: false,
      updatedAt: "2025-10-20",
      createdAt: "2025-10-01",
    },
    {
      userId: bruno.id,
      monthlyFeeValueInCents: 16990, // R$ 169,90
      dueDate: 10,
      paid: true,
      updatedAt: "2025-10-20",
      createdAt: "2025-10-02",
    },
    {
      userId: carla.id,
      monthlyFeeValueInCents: 19990,
      dueDate: 12,
      paid: false,
      updatedAt: "2025-10-20",
      createdAt: "2025-10-03",
    },
  ]);

  console.log("✅ Seed concluído com 3 usuários.");
}

main().catch((err) => {
  console.error("❌ Seed falhou:", err);
  process.exit(1);
});
