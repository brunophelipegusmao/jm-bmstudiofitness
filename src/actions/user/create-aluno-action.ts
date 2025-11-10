"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  financialTable,
  healthMetricsTable,
  paymentMethodOptions,
  personalDataTable,
  userConfirmationTokensTable,
  usersTable,
} from "@/db/schema";
import {
  generateConfirmationToken,
  getTokenExpirationDate,
  sendConfirmationEmail,
} from "@/lib/email";
import { convertToCents, isValidDueDate } from "@/lib/payment-utils";
import { generateSecurePassword } from "@/lib/password-utils";
import { hash } from "bcryptjs";
import { UserRole } from "@/types/user-roles";

// Schema de validação para o cadastro do aluno
const cadastroAlunoSchema = z.object({
  // Dados básicos do usuário
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),

  // Dados pessoais
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
  email: z.string().email("Email deve ter um formato válido"),
  bornDate: z.string().refine((date) => {
    const parsedDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - parsedDate.getFullYear();
    return age >= 16 && age <= 100;
  }, "Idade deve estar entre 16 e 100 anos"),
  address: z.string().min(10, "Endereço deve ter pelo menos 10 caracteres"),
  telephone: z.string().min(10, "Telefone deve ter pelo menos 10 caracteres"),

  // Dados financeiros
  monthlyFeeValue: z.string().refine((val) => {
    const num = parseFloat(val);
    return num >= 50 && num <= 1000;
  }, "Mensalidade deve estar entre R$ 50,00 e R$ 1.000,00"),
  paymentMethod: z.enum([
    "dinheiro",
    "pix",
    "cartao_credito",
    "cartao_debito",
    "transferencia",
  ]),
  dueDate: z.string().refine((val) => {
    const day = parseInt(val);
    return isValidDueDate(day);
  }, "Data de vencimento deve estar entre os dias 1 e 10"),

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
  credentials?: {
    name: string;
    email: string;
    password: string;
  };
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

    // Verificar se CPF ou email já existem
    const existingCPF = await db
      .select()
      .from(personalDataTable)
      .where(eq(personalDataTable.cpf, validatedData.cpf))
      .limit(1);

    if (existingCPF.length > 0) {
      return {
        success: false,
        message: "CPF já cadastrado no sistema",
        errors: { cpf: ["Este CPF já está em uso"] },
      };
    }

    const existingEmail = await db
      .select()
      .from(personalDataTable)
      .where(eq(personalDataTable.email, validatedData.email))
      .limit(1);

    if (existingEmail.length > 0) {
      return {
        success: false,
        message: "Email já cadastrado no sistema",
        errors: { email: ["Este email já está em uso"] },
      };
    }

    // Iniciar transação para criar usuário completo
    const password = generateSecurePassword();
    const hashedPassword = await hash(password, 10);

    const result = await db.transaction(async (tx) => {
      // 1. Criar usuário com role de ALUNO e senha gerada
      const [newUser] = await tx
        .insert(usersTable)
        .values({
          name: validatedData.name,
          userRole: UserRole.ALUNO,
          password: hashedPassword,
          createdAt: new Date().toISOString().split("T")[0],
        })
        .returning({ id: usersTable.id });

      // 2. Criar dados pessoais
      await tx.insert(personalDataTable).values({
        userId: newUser.id,
        cpf: validatedData.cpf,
        email: validatedData.email,
        bornDate: validatedData.bornDate,
        address: validatedData.address,
        telephone: validatedData.telephone,
      });

      // 3. Criar dados financeiros
      await tx.insert(financialTable).values({
        userId: newUser.id,
        monthlyFeeValueInCents: convertToCents(
          parseFloat(validatedData.monthlyFeeValue),
        ),
        paymentMethod: validatedData.paymentMethod,
        dueDate: parseInt(validatedData.dueDate),
        paid: false, // Novo aluno sempre começa com pendência
        lastPaymentDate: null,
        updatedAt: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString().split("T")[0],
      });

      // 4. Criar métricas de saúde
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

      // 5. Criar token de confirmação
      const confirmationToken = generateConfirmationToken();
      await tx.insert(userConfirmationTokensTable).values({
        userId: newUser.id,
        token: confirmationToken,
        expiresAt: getTokenExpirationDate(),
        used: false,
      });

      return { userId: newUser.id, token: confirmationToken };
    });

    // 6. Enviar e-mail de confirmação (fora da transação)
    const emailSent = await sendConfirmationEmail(
      validatedData.email,
      validatedData.name,
      result.token,
    );

    if (!emailSent) {
      console.warn(
        "Falha ao enviar e-mail de confirmação, mas usuário foi criado",
      );
    }

    return {
      success: true,
      message:
        "Aluno cadastrado com sucesso! Um e-mail de confirmação foi enviado.",
      credentials: {
        name: validatedData.name,
        email: validatedData.email,
        password,
      },
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
