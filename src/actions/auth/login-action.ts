import { cookies } from "next/headers";

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
    // Usa login com envio de tokens; como a action roda no server, gravamos cookies manualmente.
    const { accessToken, refreshToken } = await apiClient.login({
      login: email,
      password,
      mode: "admin",
    });

    const cookieStore = cookies();
    const maxAge = 60 * 60 * 24 * 7; // 7 dias
    const isProd = process.env.NEXT_PUBLIC_BASE_URL?.includes(
      "jmfitnessstudio.com.br",
    );
    const domain = isProd ? ".jmfitnessstudio.com.br" : undefined;

    cookieStore.set("accessToken", accessToken, {
      path: "/",
      maxAge,
      sameSite: "lax",
      secure: true,
      httpOnly: false,
      domain,
    });

    cookieStore.set("refreshToken", refreshToken, {
      path: "/",
      maxAge,
      sameSite: "lax",
      secure: true,
      httpOnly: false,
      domain,
    });

    return { email, error: "" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao efetuar login";
    return { email, error: message };
  }
}
