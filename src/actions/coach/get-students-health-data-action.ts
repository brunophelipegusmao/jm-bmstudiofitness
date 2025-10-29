"use server";

import { and, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { healthMetricsTable, personalDataTable, usersTable } from "@/db/schema";
import { UserRole } from "@/types/user-roles";

export interface StudentHealthData {
  // Dados básicos do usuário
  userId: string;
  name: string;
  createdAt: string;

  // Dados pessoais básicos (sem dados sensíveis)
  cpf: string;
  email: string;
  bornDate: string;
  age: number;

  // Dados de saúde completos
  heightCm: string;
  weightKg: string;
  bloodType: string;
  hasPracticedSports: boolean;
  lastExercise: string;
  historyDiseases: string;
  medications: string;
  sportsHistory: string;
  allergies: string;
  injuries: string;
  alimentalRoutine: string;
  diaryRoutine: string;
  useSupplements: boolean;
  whatSupplements: string | null;
  otherNotes: string | null;
  coachObservations: string | null;
  coachObservationsParticular: string | null;
  healthUpdatedAt: string;
}

export async function getStudentsHealthDataAction(
  searchTerm?: string,
): Promise<StudentHealthData[]> {
  try {
    // Base query para buscar apenas alunos
    let whereCondition = eq(usersTable.userRole, UserRole.ALUNO);

    // Se houver termo de busca, adicionar filtros
    if (searchTerm && searchTerm.trim() !== "") {
      const searchCondition = or(
        ilike(usersTable.name, `%${searchTerm}%`),
        ilike(personalDataTable.cpf, `%${searchTerm.replace(/\D/g, "")}%`),
        ilike(personalDataTable.email, `%${searchTerm}%`),
      );

      if (searchCondition) {
        whereCondition = and(whereCondition, searchCondition)!;
      }
    }

    const results = await db
      .select({
        // Dados básicos do usuário
        userId: usersTable.id,
        name: usersTable.name,
        createdAt: usersTable.createdAt,

        // Dados pessoais básicos
        cpf: personalDataTable.cpf,
        email: personalDataTable.email,
        bornDate: personalDataTable.bornDate,

        // Dados de saúde
        heightCm: healthMetricsTable.heightCm,
        weightKg: healthMetricsTable.weightKg,
        bloodType: healthMetricsTable.bloodType,
        hasPracticedSports: healthMetricsTable.hasPracticedSports,
        lastExercise: healthMetricsTable.lastExercise,
        historyDiseases: healthMetricsTable.historyDiseases,
        medications: healthMetricsTable.medications,
        sportsHistory: healthMetricsTable.sportsHistory,
        allergies: healthMetricsTable.allergies,
        injuries: healthMetricsTable.injuries,
        alimentalRoutine: healthMetricsTable.alimentalRoutine,
        diaryRoutine: healthMetricsTable.diaryRoutine,
        useSupplements: healthMetricsTable.useSupplements,
        whatSupplements: healthMetricsTable.whatSupplements,
        otherNotes: healthMetricsTable.otherNotes,
        coachObservations: healthMetricsTable.coachaObservations,
        coachObservationsParticular:
          healthMetricsTable.coachObservationsParticular,
        healthUpdatedAt: healthMetricsTable.updatedAt,
      })
      .from(usersTable)
      .innerJoin(personalDataTable, eq(usersTable.id, personalDataTable.userId))
      .innerJoin(
        healthMetricsTable,
        eq(usersTable.id, healthMetricsTable.userId),
      )
      .where(whereCondition)
      .orderBy(usersTable.name);

    return results.map((row) => {
      const birthDate = new Date(row.bornDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      return {
        userId: row.userId,
        name: row.name,
        createdAt: row.createdAt.toString(),
        cpf: row.cpf,
        email: row.email,
        bornDate: row.bornDate.toString(),
        age,
        heightCm: row.heightCm,
        weightKg: row.weightKg,
        bloodType: row.bloodType,
        hasPracticedSports: row.hasPracticedSports,
        lastExercise: row.lastExercise,
        historyDiseases: row.historyDiseases,
        medications: row.medications,
        sportsHistory: row.sportsHistory,
        allergies: row.allergies,
        injuries: row.injuries,
        alimentalRoutine: row.alimentalRoutine,
        diaryRoutine: row.diaryRoutine,
        useSupplements: row.useSupplements,
        whatSupplements: row.whatSupplements,
        otherNotes: row.otherNotes,
        coachObservations: row.coachObservations,
        coachObservationsParticular: row.coachObservationsParticular,
        healthUpdatedAt: row.healthUpdatedAt.toString(),
      };
    });
  } catch (error) {
    console.error("Erro ao buscar dados de saúde dos alunos:", error);
    throw new Error("Falha ao carregar dados dos alunos");
  }
}
