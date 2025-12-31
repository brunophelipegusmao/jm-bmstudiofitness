import { apiClient } from "@/lib/api-client";

export type LoginFormState = {
  email: string;
  error: string;
};

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    return { email, error: "Informe email e senha" };
  }

  try {
    await apiClient.post("/auth/login", { email, password });
    return { email, error: "" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao efetuar login";
    return { email, error: message };
  }
}
