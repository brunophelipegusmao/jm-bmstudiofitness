import "dotenv/config";

import { drizzle } from "drizzle-orm/postgres-js";

import { hashPassword } from "../lib/auth-utils";
import { UserRole } from "../types/user-roles";
import {
  checkInTable,
  financialTable,
  healthMetricsTable,
  personalDataTable,
  usersTable,
} from "./schema";

// ---- conexões ----
const connectionString = process.env.DATABASE_URL!;
const db = drizzle(connectionString);

async function main() {
  // Limpar dados existentes
  await db.delete(checkInTable);
  await db.delete(financialTable);
  await db.delete(healthMetricsTable);
  await db.delete(personalDataTable);
  await db.delete(usersTable);

  // 1) Criar usuários com diferentes roles e senhas
  const adminPassword = await hashPassword("admin123"); // Senha: admin123
  const professorPassword = await hashPassword("prof123"); // Senha: prof123
  const funcionarioPassword = await hashPassword("func123"); // Senha: func123
  const alunoPassword = await hashPassword("aluno123"); // Senha: aluno123

  const users = await db
    .insert(usersTable)
    .values([
      {
        name: "João Silva",
        userRole: UserRole.ADMIN,
        password: adminPassword,
        createdAt: "2025-01-15",
      },
      {
        name: "Maria Santos",
        userRole: UserRole.PROFESSOR,
        password: professorPassword,
        createdAt: "2025-02-01",
      },
      {
        name: "Carlos Silva",
        userRole: UserRole.FUNCIONARIO,
        password: funcionarioPassword,
        createdAt: "2025-02-15",
      },
      {
        name: "Ana Costa",
        userRole: UserRole.ALUNO,
        password: null, // Alunos não têm senha
        createdAt: "2025-09-15",
      },
      {
        name: "Bruno Lima",
        userRole: UserRole.ALUNO,
        password: alunoPassword, // Aluno com senha para teste
        createdAt: "2025-10-02",
      },
      {
        name: "Carla Mendes",
        userRole: UserRole.ALUNO,
        password: null,
        createdAt: "2025-10-10",
      },
      {
        name: "Daniel Oliveira",
        userRole: UserRole.ALUNO,
        password: null,
        createdAt: "2025-10-15",
      },
    ])
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      userRole: usersTable.userRole,
    });

  const [admin, professor, funcionario, ana, bruno, carla, daniel] = users;

  // 2) Dados pessoais - incluindo email obrigatório
  await db.insert(personalDataTable).values([
    {
      userId: admin.id,
      cpf: "11111111111",
      email: "admin@bmstudio.com",
      bornDate: "1985-05-20",
      address: "Rua Administração, 1 - São Paulo/SP",
      telephone: "+55 11 99999-0001",
    },
    {
      userId: professor.id,
      cpf: "22222222222",
      email: "maria.professor@bmstudio.com",
      bornDate: "1990-03-15",
      address: "Rua dos Professores, 200 - São Paulo/SP",
      telephone: "+55 11 99999-0002",
    },
    {
      userId: ana.id,
      cpf: "12345678901",
      email: "ana.costa@email.com",
      bornDate: "1996-02-14",
      address: "Rua das Flores, 100 - São Paulo/SP",
      telephone: "+55 11 98888-0001",
    },
    {
      userId: bruno.id,
      cpf: "23456789012",
      email: "bruno.lima@email.com",
      bornDate: "1992-10-03",
      address: "Rua dos Atletas, 200 - São Paulo/SP",
      telephone: "+55 11 98888-0002",
    },
    {
      userId: carla.id,
      cpf: "34567890123",
      email: "carla.mendes@email.com",
      bornDate: "1989-07-20",
      address: "Rua da Saúde, 300 - São Paulo/SP",
      telephone: "+55 11 98888-0003",
    },
    {
      userId: daniel.id,
      cpf: "45678901234",
      email: "daniel.oliveira@email.com",
      bornDate: "1995-12-08",
      address: "Rua do Fitness, 400 - São Paulo/SP",
      telephone: "+55 11 98888-0004",
    },
  ]);

  // 3) Métricas de saúde apenas para alunos
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
      whatSupplements: "Whey protein, Creatina",
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
      sportsHistory: "Iniciante na musculação",
      allergies: "Nenhuma",
      injuries: "Nenhuma",
      updatedAt: "2025-10-20",
      alimentalRoutine: "Déficit leve para perda de gordura",
      diaryRoutine: "Rotina ativa moderada; caminhada diária",
      useSupplements: false,
      whatSupplements: null,
      otherNotes: "Foco em condicionamento físico",
    },
    {
      userId: daniel.id,
      heightCm: "175",
      weightKg: "70.8",
      bloodType: "AB+",
      hasPracticedSports: true,
      lastExercise: "Crossfit (3x/semana)",
      historyDiseases: "Sem histórico relevante",
      medications: "Nenhum",
      sportsHistory: "Basquete na escola, crossfit há 2 anos",
      allergies: "Amendoim",
      injuries: "Lesão no joelho (recuperado)",
      updatedAt: "2025-10-20",
      alimentalRoutine: "Balanced diet, high protein",
      diaryRoutine: "Trabalho presencial; treino intenso 5x/semana",
      useSupplements: true,
      whatSupplements: "Whey protein, BCAA, Pré-treino",
      otherNotes: "Atleta amador, foco em performance",
    },
  ]);

  // 4) Dados financeiros apenas para alunos - incluindo paymentMethod obrigatório
  await db.insert(financialTable).values([
    {
      userId: ana.id,
      monthlyFeeValueInCents: 19990, // R$ 199,90
      paymentMethod: "pix",
      dueDate: 5,
      paid: false,
      lastPaymentDate: null,
      updatedAt: "2025-10-20",
      createdAt: "2025-09-15",
    },
    {
      userId: bruno.id,
      monthlyFeeValueInCents: 16990, // R$ 169,90 (desconto)
      paymentMethod: "cartao_debito",
      dueDate: 10,
      paid: true,
      lastPaymentDate: "2025-10-10",
      updatedAt: "2025-10-20",
      createdAt: "2025-10-02",
    },
    {
      userId: carla.id,
      monthlyFeeValueInCents: 19990,
      paymentMethod: "transferencia",
      dueDate: 15,
      paid: false,
      lastPaymentDate: null,
      updatedAt: "2025-10-20",
      createdAt: "2025-10-10",
    },
    {
      userId: daniel.id,
      monthlyFeeValueInCents: 24990, // R$ 249,90 (plano premium)
      paymentMethod: "cartao_credito",
      dueDate: 8,
      paid: true,
      lastPaymentDate: "2025-10-08",
      updatedAt: "2025-10-20",
      createdAt: "2025-10-15",
    },
  ]);

  // 5) Check-ins diversos para simular frequência
  const checkInsData = [
    // Ana - manhã
    {
      userId: ana.id,
      checkInDate: "2025-10-25",
      checkInTime: "07:30",
      checkInTimestamp: new Date("2025-10-25T07:30:00.000Z"),
      method: "email",
      identifier: "ana.costa@email.com",
    },
    {
      userId: ana.id,
      checkInDate: "2025-10-23",
      checkInTime: "08:00",
      checkInTimestamp: new Date("2025-10-23T08:00:00.000Z"),
      method: "cpf",
      identifier: "12345678901",
    },
    {
      userId: ana.id,
      checkInDate: "2025-10-21",
      checkInTime: "07:45",
      checkInTimestamp: new Date("2025-10-21T07:45:00.000Z"),
      method: "email",
      identifier: "ana.costa@email.com",
    },

    // Bruno - tarde
    {
      userId: bruno.id,
      checkInDate: "2025-10-25",
      checkInTime: "15:30",
      checkInTimestamp: new Date("2025-10-25T15:30:00.000Z"),
      method: "email",
      identifier: "bruno.lima@email.com",
    },
    {
      userId: bruno.id,
      checkInDate: "2025-10-24",
      checkInTime: "14:45",
      checkInTimestamp: new Date("2025-10-24T14:45:00.000Z"),
      method: "cpf",
      identifier: "23456789012",
    },
    {
      userId: bruno.id,
      checkInDate: "2025-10-23",
      checkInTime: "16:00",
      checkInTimestamp: new Date("2025-10-23T16:00:00.000Z"),
      method: "email",
      identifier: "bruno.lima@email.com",
    },
    {
      userId: bruno.id,
      checkInDate: "2025-10-22",
      checkInTime: "15:15",
      checkInTimestamp: new Date("2025-10-22T15:15:00.000Z"),
      method: "cpf",
      identifier: "23456789012",
    },
    {
      userId: bruno.id,
      checkInDate: "2025-10-20",
      checkInTime: "16:30",
      checkInTimestamp: new Date("2025-10-20T16:30:00.000Z"),
      method: "email",
      identifier: "bruno.lima@email.com",
    },

    // Carla - noite
    {
      userId: carla.id,
      checkInDate: "2025-10-25",
      checkInTime: "19:00",
      checkInTimestamp: new Date("2025-10-25T19:00:00.000Z"),
      method: "email",
      identifier: "carla.mendes@email.com",
    },
    {
      userId: carla.id,
      checkInDate: "2025-10-23",
      checkInTime: "20:15",
      checkInTimestamp: new Date("2025-10-23T20:15:00.000Z"),
      method: "cpf",
      identifier: "34567890123",
    },
    {
      userId: carla.id,
      checkInDate: "2025-10-21",
      checkInTime: "19:30",
      checkInTimestamp: new Date("2025-10-21T19:30:00.000Z"),
      method: "email",
      identifier: "carla.mendes@email.com",
    },

    // Daniel - manhã e tarde (frequente)
    {
      userId: daniel.id,
      checkInDate: "2025-10-25",
      checkInTime: "06:30",
      checkInTimestamp: new Date("2025-10-25T06:30:00.000Z"),
      method: "cpf",
      identifier: "45678901234",
    },
    {
      userId: daniel.id,
      checkInDate: "2025-10-24",
      checkInTime: "14:00",
      checkInTimestamp: new Date("2025-10-24T14:00:00.000Z"),
      method: "email",
      identifier: "daniel.oliveira@email.com",
    },
    {
      userId: daniel.id,
      checkInDate: "2025-10-23",
      checkInTime: "06:45",
      checkInTimestamp: new Date("2025-10-23T06:45:00.000Z"),
      method: "cpf",
      identifier: "45678901234",
    },
    {
      userId: daniel.id,
      checkInDate: "2025-10-22",
      checkInTime: "14:30",
      checkInTimestamp: new Date("2025-10-22T14:30:00.000Z"),
      method: "email",
      identifier: "daniel.oliveira@email.com",
    },
    {
      userId: daniel.id,
      checkInDate: "2025-10-21",
      checkInTime: "07:00",
      checkInTimestamp: new Date("2025-10-21T07:00:00.000Z"),
      method: "cpf",
      identifier: "45678901234",
    },
    {
      userId: daniel.id,
      checkInDate: "2025-10-20",
      checkInTime: "15:00",
      checkInTimestamp: new Date("2025-10-20T15:00:00.000Z"),
      method: "email",
      identifier: "daniel.oliveira@email.com",
    },
  ];

  await db.insert(checkInTable).values(checkInsData);

  console.log("✅ Seed concluído com sucesso!");
  console.log("📊 Dados criados:");
  console.log(`  - 1 Administrador: ${admin.name}`);
  console.log(`  - 1 Professor: ${professor.name}`);
  console.log(
    `  - 4 Alunos: ${ana.name}, ${bruno.name}, ${carla.name}, ${daniel.name}`,
  );
  console.log(
    `  - ${checkInsData.length} check-ins distribuídos por manhã, tarde e noite`,
  );
  console.log(
    "  - Dados financeiros variados (alguns pagos, outros pendentes)",
  );
  console.log("  - Métricas de saúde completas para todos os alunos");
}

main().catch((err) => {
  console.error("❌ Seed falhou:", err);
  process.exit(1);
});
