"use server";

import { hash } from "bcryptjs";
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
import { canCreateUserType } from "@/lib/check-permission";
import {
  generateConfirmationToken,
  getTokenExpirationDate,
  sendConfirmationEmail,
} from "@/lib/email";
import { generateSecurePassword } from "@/lib/password-utils";
import { convertToCents, isValidDueDate } from "@/lib/payment-utils";
import { UserRole } from "@/types/user-roles";

// Schema de validação para o cadastro do aluno
const cadastroAlunoSchema = z.object({
  // Dados básicos do usuário
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),

  // Dados pessoais
  cpf: z
    .string()
    .transform((val) => val.replace(/\D/g, ""))
    .pipe(z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos")),
  email: z.string().email("Email deve ter um formato válido"),
  sex: z.enum(["masculino", "feminino"]),
  bornDate: z.string().refine(
    (date) => {
      const parsedDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - parsedDate.getFullYear();
      return age >= 16 && age <= 100;
    },
    { message: "Idade deve estar entre 16 e 100 anos" },
  ),
  address: z.string().min(10, "Endereço deve ter pelo menos 10 caracteres"),
  telephone: z
    .string()
    .transform((val) => val.replace(/\D/g, ""))
    .pipe(z.string().min(10, "Telefone deve ter pelo menos 10 dígitos")),

  // Dados financeiros
  monthlyFeeValue: z
    .string()
    .transform((val) => {
      // Remove tudo exceto números e vírgula
      const cleaned = val.replace(/[^0-9,]/g, "");
      // Substitui vírgula por ponto para parseFloat
      return cleaned.replace(",", ".");
    })
    .pipe(
      z.string().refine(
        (val) => {
          const num = parseFloat(val);
          return !isNaN(num) && num >= 50 && num <= 5000;
        },
        { message: "Mensalidade deve estar entre R$ 50,00 e R$ 5.000,00" },
      ),
    ),
  paymentMethod: z.enum([
    "dinheiro",
    "pix",
    "cartao_credito",
    "cartao_debito",
    "transferencia",
  ]),
  dueDate: z.enum(["5", "10", "15"], {
    errorMap: () => ({
      message: "Selecione um dia de vencimento válido (5, 10 ou 15)",
    }),
  }),

  // Dados de saúde
  heightCm: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = parseInt(val);
        return num >= 100 && num <= 250;
      },
      { message: "Altura deve estar entre 100cm e 250cm" },
    ),
  weightKg: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = parseFloat(val);
        return num >= 30 && num <= 300;
      },
      { message: "Peso deve estar entre 30kg e 300kg" },
    ),
  bloodType: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""])
    .optional(),
  hasPracticedSports: z.boolean().optional().default(false),
  lastExercise: z.string().optional().default(""),
  historyDiseases: z.string().optional().default(""),
  medications: z.string().optional().default(""),
  sportsHistory: z.string().optional().default(""),
  allergies: z.string().optional().default(""),
  injuries: z.string().optional().default(""),
  alimentalRoutine: z.string().optional().default(""),
  diaryRoutine: z.string().optional().default(""),
  useSupplements: z.boolean().optional().default(false),
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
  createdUserId?: string;
}

export async function createAlunoAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    console.log("🔵 [CREATE ALUNO] Iniciando cadastro de aluno...");

    // 1. VERIFICAR PERMISSÕES - Apenas admin e funcionário podem criar alunos
    const permissionCheck = await canCreateUserType("aluno");

    if (!permissionCheck.allowed) {
      console.log("❌ [CREATE ALUNO] Permissão negada");
      return {
        success: false,
        message:
          permissionCheck.error ||
          "Você não tem permissão para criar alunos. Apenas administradores e funcionários podem realizar esta ação.",
      };
    }

    console.log(
      `✅ Usuário ${permissionCheck.user?.email} (${permissionCheck.user?.role}) autorizado a criar aluno`,
    );

    // Converter FormData para objeto
    const rawData = Object.fromEntries(formData.entries());
    console.log("📋 [CREATE ALUNO] Dados recebidos:", Object.keys(rawData));

    // Normalizar paymentMethod para lowercase com underscores
    if (rawData.paymentMethod) {
      const paymentMethodMap: Record<string, string> = {
        DINHEIRO: "dinheiro",
        PIX: "pix",
        CARTAO_CREDITO: "cartao_credito",
        CARTAO_DEBITO: "cartao_debito",
        TRANSFERENCIA: "transferencia",
      };
      rawData.paymentMethod =
        paymentMethodMap[rawData.paymentMethod as string] ||
        (rawData.paymentMethod as string).toLowerCase();
    }

    // Preparar dados com conversões necessárias
    const processedData = {
      ...rawData,
      monthlyFeeValue: rawData.monthlyFee,
      hasPracticedSports: rawData.hasPracticedSports === "true",
      useSupplements: rawData.useSupplements === "true",
    };

    console.log("🔄 [CREATE ALUNO] Validando dados...");
    console.log(
      "💰 [CREATE ALUNO] Valor mensalidade recebido:",
      rawData.monthlyFee,
    );
    // Validar dados
    const validatedData = cadastroAlunoSchema.parse(processedData);
    console.log("✅ [CREATE ALUNO] Dados validados com sucesso");
    console.log(
      "💰 [CREATE ALUNO] Valor mensalidade validado:",
      validatedData.monthlyFeeValue,
    );

    console.log("✅ [CREATE ALUNO] Dados validados com sucesso");

    // Verificar se CPF ou email já existem
    const existingCPF = await db
      .select()
      .from(personalDataTable)
      .where(eq(personalDataTable.cpf, validatedData.cpf))
      .limit(1);

    if (existingCPF.length > 0) {
      console.log("❌ [CREATE ALUNO] CPF já cadastrado");
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
      console.log("❌ [CREATE ALUNO] Email já cadastrado");
      return {
        success: false,
        message: "Email já cadastrado no sistema",
        errors: { email: ["Este email já está em uso"] },
      };
    }

    console.log("💾 [CREATE ALUNO] Iniciando transação no banco de dados...");
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
        sex: validatedData.sex,
        bornDate: validatedData.bornDate,
        address: validatedData.address,
        telephone: validatedData.telephone,
      });

      // 3. Criar dados financeiros
      const monthlyFeeInCents = convertToCents(
        parseFloat(validatedData.monthlyFeeValue),
      );

      await tx.insert(financialTable).values({
        userId: newUser.id,
        monthlyFeeValueInCents: monthlyFeeInCents,
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
        heightCm: validatedData.heightCm || "",
        weightKg: validatedData.weightKg || "",
        bloodType: validatedData.bloodType || "",
        hasPracticedSports: validatedData.hasPracticedSports || false,
        lastExercise: validatedData.lastExercise || "",
        historyDiseases: validatedData.historyDiseases || "",
        medications: validatedData.medications || "",
        sportsHistory: validatedData.sportsHistory || "",
        allergies: validatedData.allergies || "",
        injuries: validatedData.injuries || "",
        updatedAt: new Date().toISOString().split("T")[0],
        alimentalRoutine: validatedData.alimentalRoutine,
        diaryRoutine: validatedData.diaryRoutine,
        useSupplements: validatedData.useSupplements || false,
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

    console.log(
      "✅ [CREATE ALUNO] Transação concluída. UserId:",
      result.userId,
    );

    // 6. Enviar e-mail de confirmação (fora da transação)
    const emailSent = await sendConfirmationEmail(
      validatedData.email,
      validatedData.name,
      result.token,
    );

    if (!emailSent) {
      console.warn(
        "⚠️ [CREATE ALUNO] Falha ao enviar e-mail de confirmação, mas usuário foi criado",
      );
    } else {
      console.log("📧 [CREATE ALUNO] E-mail de confirmação enviado");
    }

    console.log("🎉 [CREATE ALUNO] Cadastro concluído com sucesso!");
    return {
      success: true,
      message:
        "Aluno cadastrado com sucesso! Um e-mail de confirmação foi enviado.",
      credentials: {
        name: validatedData.name,
        email: validatedData.email,
        password,
      },
      createdUserId: result.userId,
    };
  } catch (error) {
    console.error("❌ [CREATE ALUNO] Erro ao cadastrar aluno:", error);

    if (error instanceof z.ZodError) {
      console.error("❌ [CREATE ALUNO] Erros de validação:", error.issues);
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
