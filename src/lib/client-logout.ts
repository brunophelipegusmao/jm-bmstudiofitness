"use client";

export function clientLogout() {
  // Remove o cookie de autenticação
  document.cookie =
    "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // Remove possíveis dados do localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    localStorage.removeItem("auth-token");
    sessionStorage.clear();
  }

  // Redireciona para a página inicial
  window.location.href = "/";
}
