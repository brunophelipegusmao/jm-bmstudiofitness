"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { healthMetricsTable, personalDataTable, usersTable } from "@/db/schema";
import { UserRole } from "@/types/user-roles";

// Schema de validação para o cadastro do aluno
const cadastroAlunoSchema = z.object({
  // Dados básicos do usuário
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),

  // Dados pessoais
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  bornDate: z.string().refine((date) => {
    const parsedDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - parsedDate.getFullYear();
    return age >= 16 && age <= 100;
  }, "Idade deve estar entre 16 e 100 anos"),
  address: z.string().min(10, "Endereço deve ter pelo menos 10 caracteres"),
  telephone: z.string().min(10, "Telefone deve ter pelo menos 10 caracteres"),

  // Dados de saúde
  heightCm: z.string().refine((val) => {
    const num = parseInt(val);
    return num >= 100 && num <= 250;
  }, "Altura deve estar entre 100cm e 250cm"),
  weightKg: z.string().refine((val) => {
    const num = parseFloat(val);
    return num >= 30 && num <= 300;
  }, "Peso deve estar entre 30kg e 300kg"),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  hasPracticedSports: z.boolean(),
  lastExercise: z.string().min(3, "Descreva o último exercício"),
  historyDiseases: z.string(),
  medications: z.string(),
  sportsHistory: z.string(),
  allergies: z.string(),
  injuries: z.string(),
  alimentalRoutine: z.string().min(5, "Descreva sua rotina alimentar"),
  diaryRoutine: z.string().min(5, "Descreva sua rotina diária"),
  useSupplements: z.boolean(),
  whatSupplements: z.string().optional(),
  otherNotes: z.string().optional(),
});

export type CadastroAlunoFormData = z.infer<typeof cadastroAlunoSchema>;

export interface FormState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export async function createAlunoAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    // Converter FormData para objeto
    const rawData = Object.fromEntries(formData.entries());

    // Preparar dados com conversões necessárias
    const processedData = {
      ...rawData,
      hasPracticedSports: rawData.hasPracticedSports === "true",
      useSupplements: rawData.useSupplements === "true",
    };

    // Validar dados
    const validatedData = cadastroAlunoSchema.parse(processedData);

    // Verificar se CPF já existe
    const existingUser = await db
      .select()
      .from(personalDataTable)
      .where(eq(personalDataTable.cpf, validatedData.cpf))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        success: false,
        message: "CPF já cadastrado no sistema",
        errors: { cpf: ["Este CPF já está em uso"] },
      };
    }

    // Iniciar transação para criar usuário completo
    await db.transaction(async (tx) => {
      // 1. Criar usuário com role de ALUNO
      const [newUser] = await tx
        .insert(usersTable)
        .values({
          name: validatedData.name,
          userRole: UserRole.ALUNO,
          createdAt: new Date().toISOString().split("T")[0],
        })
        .returning({ id: usersTable.id });

      // 2. Criar dados pessoais
      await tx.insert(personalDataTable).values({
        userId: newUser.id,
        cpf: validatedData.cpf,
        bornDate: validatedData.bornDate,
        address: validatedData.address,
        telephone: validatedData.telephone,
      });

      // 3. Criar métricas de saúde
      await tx.insert(healthMetricsTable).values({
        userId: newUser.id,
        heightCm: validatedData.heightCm,
        weightKg: validatedData.weightKg,
        bloodType: validatedData.bloodType,
        hasPracticedSports: validatedData.hasPracticedSports,
        lastExercise: validatedData.lastExercise,
        historyDiseases: validatedData.historyDiseases,
        medications: validatedData.medications,
        sportsHistory: validatedData.sportsHistory,
        allergies: validatedData.allergies,
        injuries: validatedData.injuries,
        updatedAt: new Date().toISOString().split("T")[0],
        alimentalRoutine: validatedData.alimentalRoutine,
        diaryRoutine: validatedData.diaryRoutine,
        useSupplements: validatedData.useSupplements,
        whatSupplements: validatedData.whatSupplements || null,
        otherNotes: validatedData.otherNotes || null,
      });
    });

    return {
      success: true,
      message: "Aluno cadastrado com sucesso! Redirecionando...",
    };
  } catch (error) {
    console.error("Erro ao cadastrar aluno:", error);

    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((issue) => {
        const field = issue.path.join(".");
        if (!errors[field]) errors[field] = [];
        errors[field].push(issue.message);
      });

      return {
        success: false,
        message: "Dados inválidos. Verifique os campos destacados.",
        errors,
      };
    }

    return {
      success: false,
      message: "Erro interno do servidor. Tente novamente.",
    };
  }
}
