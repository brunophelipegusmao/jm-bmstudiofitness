"use server";

import { cookies } from "next/headers";

import { verifyTokenEdge } from "@/lib/auth-edge";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyTokenEdge(token);
    return payload;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  if (user.role !== "admin") {
    throw new Error(
      "Acesso negado. Apenas administradores podem realizar esta ação.",
    );
  }

  return user;
}
