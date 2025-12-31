"use server";

import { apiClient } from "@/lib/api-client";

export interface FormState {
  success: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  credentials?: {
    name?: string;
    email?: string;
    password?: string;
  };
  createdUserId?: string;
}

export async function createAlunoAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const payload = Object.fromEntries(formData.entries());
    const result = await apiClient.post("/students", payload);
    return {
      success: true,
      message: "Aluno criado com sucesso",
      credentials: {
        name: (payload.name as string) || undefined,
        email: (payload.email as string) || undefined,
        password:
          (result as unknown as { generatedPassword?: string })?.generatedPassword ??
          undefined,
      },
      createdUserId:
        (result as unknown as { userId?: string })?.userId ??
        (result as unknown as { id?: string })?.id,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar aluno";
    return { success: false, message, error: message };
  }
}
