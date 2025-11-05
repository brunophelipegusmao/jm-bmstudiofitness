"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  financialTable,
  healthMetricsTable,
  personalDataTable,
  usersTable,
} from "@/db/schema";
import { UserRole } from "@/types/user-roles";

export interface CreateStudentData {
  // Dados básicos
  name: string;
  
  // Dados pessoais
  cpf: string;
  email: string;
  bornDate: string;
  address: string;
  telephone: string;

  // Dados de saúde
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
  whatSupplements?: string;
  otherNotes?: string;

  // Dados financeiros
  monthlyFeeValueInCents: number;
  paymentMethod: string;
  dueDate: number;
}

export interface UpdateStudentData extends CreateStudentData {
  userId: string;
  coachaObservations?: string;
  coachObservationsParticular?: string;
}

export async function createStudent(data: CreateStudentData) {
  try {
    // Verificar se CPF já existe
    const existingCpf = await db
      .select()
      .from(personalDataTable)
      .where(eq(personalDataTable.cpf, data.cpf.replace(/\D/g, "")))
      .limit(1);

    if (existingCpf.length > 0) {
      throw new Error("CPF já cadastrado no sistema");
    }

    // Verificar se email já existe
    const existingEmail = await db
      .select()
      .from(personalDataTable)
      .where(eq(personalDataTable.email, data.email))
      .limit(1);

    if (existingEmail.length > 0) {
      throw new Error("Email já cadastrado no sistema");
    }

    // Criar usuário
    const [user] = await db
      .insert(usersTable)
      .values({
        name: data.name,
        userRole: UserRole.ALUNO,
      })
      .returning();

    // Criar dados pessoais
    await db.insert(personalDataTable).values({
      userId: user.id,
      cpf: data.cpf.replace(/\D/g, ""),
      email: data.email,
      bornDate: data.bornDate,
      address: data.address,
      telephone: data.telephone,
    });

    // Criar dados de saúde
    await db.insert(healthMetricsTable).values({
      userId: user.id,
      heightCm: data.heightCm,
      weightKg: data.weightKg,
      bloodType: data.bloodType,
      hasPracticedSports: data.hasPracticedSports,
      lastExercise: data.lastExercise,
      historyDiseases: data.historyDiseases,
      medications: data.medications,
      sportsHistory: data.sportsHistory,
      allergies: data.allergies,
      injuries: data.injuries,
      alimentalRoutine: data.alimentalRoutine,
      diaryRoutine: data.diaryRoutine,
      useSupplements: data.useSupplements,
      whatSupplements: data.whatSupplements || "",
      otherNotes: data.otherNotes || "",
    });

    // Criar dados financeiros
    await db.insert(financialTable).values({
      userId: user.id,
      monthlyFeeValueInCents: data.monthlyFeeValueInCents,
      paymentMethod: data.paymentMethod,
      dueDate: data.dueDate,
      paid: false,
    });

    revalidatePath("/admin");
    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Error creating student:", error);
    throw new Error(
      error instanceof Error ? error.message : "Erro ao cadastrar aluno"
    );
  }
}

export async function updateStudent(data: UpdateStudentData) {
  try {
    // Verificar se o usuário existe
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, data.userId))
      .limit(1);

    if (existingUser.length === 0) {
      throw new Error("Aluno não encontrado");
    }

    // Verificar se CPF já existe em outro usuário
    const existingCpf = await db
      .select()
      .from(personalDataTable)
      .where(eq(personalDataTable.cpf, data.cpf.replace(/\D/g, "")))
      .limit(1);

    if (existingCpf.length > 0 && existingCpf[0].userId !== data.userId) {
      throw new Error("CPF já cadastrado para outro aluno");
    }

    // Verificar se email já existe em outro usuário
    const existingEmail = await db
      .select()
      .from(personalDataTable)
      .where(eq(personalDataTable.email, data.email))
      .limit(1);

    if (existingEmail.length > 0 && existingEmail[0].userId !== data.userId) {
      throw new Error("Email já cadastrado para outro aluno");
    }

    // Atualizar dados do usuário
    await db
      .update(usersTable)
      .set({ name: data.name })
      .where(eq(usersTable.id, data.userId));

    // Atualizar dados pessoais
    await db
      .update(personalDataTable)
      .set({
        cpf: data.cpf.replace(/\D/g, ""),
        email: data.email,
        bornDate: data.bornDate,
        address: data.address,
        telephone: data.telephone,
      })
      .where(eq(personalDataTable.userId, data.userId));

    // Atualizar dados de saúde
    await db
      .update(healthMetricsTable)
      .set({
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        bloodType: data.bloodType,
        hasPracticedSports: data.hasPracticedSports,
        lastExercise: data.lastExercise,
        historyDiseases: data.historyDiseases,
        medications: data.medications,
        sportsHistory: data.sportsHistory,
        allergies: data.allergies,
        injuries: data.injuries,
        alimentalRoutine: data.alimentalRoutine,
        diaryRoutine: data.diaryRoutine,
        useSupplements: data.useSupplements,
        whatSupplements: data.whatSupplements || "",
        otherNotes: data.otherNotes || "",
        coachaObservations: data.coachaObservations || "",
        coachObservationsParticular: data.coachObservationsParticular || "",
        updatedAt: new Date().toISOString().split("T")[0],
      })
      .where(eq(healthMetricsTable.userId, data.userId));

    // Atualizar dados financeiros
    await db
      .update(financialTable)
      .set({
        monthlyFeeValueInCents: data.monthlyFeeValueInCents,
        paymentMethod: data.paymentMethod,
        dueDate: data.dueDate,
      })
      .where(eq(financialTable.userId, data.userId));

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating student:", error);
    throw new Error(
      error instanceof Error ? error.message : "Erro ao atualizar aluno"
    );
  }
}

export async function deleteStudent(userId: string) {
  try {
    // Verificar se o usuário existe
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      throw new Error("Aluno não encontrado");
    }

    // Excluir em ordem (devido às foreign keys)
    await db.delete(healthMetricsTable).where(eq(healthMetricsTable.userId, userId));
    await db.delete(financialTable).where(eq(financialTable.userId, userId));
    await db.delete(personalDataTable).where(eq(personalDataTable.userId, userId));
    await db.delete(usersTable).where(eq(usersTable.id, userId));

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting student:", error);
    throw new Error(
      error instanceof Error ? error.message : "Erro ao excluir aluno"
    );
  }
}

export async function updateStudentPaymentStatus(userId: string, paid: boolean, paymentDate?: string) {
  try {
    const updateData: { paid: boolean; lastPaymentDate?: string } = { paid };
    
    if (paid && paymentDate) {
      updateData.lastPaymentDate = paymentDate;
    }

    await db
      .update(financialTable)
      .set(updateData)
      .where(eq(financialTable.userId, userId));

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw new Error("Erro ao atualizar status de pagamento");
  }
}