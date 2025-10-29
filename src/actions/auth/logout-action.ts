"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();

  // Remover o cookie de autenticação
  cookieStore.delete("auth-token");

  // Redirecionar para página principal
  redirect("/");
}
