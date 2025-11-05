"use client";

// Função principal de logout do cliente
export function clientLogout() {
  console.log("🔐 Iniciando logout do cliente...");

  // Remove todos os cookies relacionados à autenticação
  clearAuthCookies();

  // Remove dados do storage
  clearStorage();

  console.log("✅ Logout do cliente concluído");

  // Redireciona para a página inicial
  window.location.href = "/";
}

// Função para limpar todos os cookies de autenticação
export function clearAuthCookies() {
  const cookiesToClear = [
    "auth-token",
    "user",
    "session",
    "token",
    "jwt",
    "_token",
  ];

  cookiesToClear.forEach((cookieName) => {
    // Remove com diferentes caminhos para garantir limpeza completa
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
  });

  console.log("🍪 Cookies de autenticação limpos");
}

// Função para limpar storage
export function clearStorage() {
  if (typeof window !== "undefined") {
    // Limpar localStorage
    const localStorageKeys = [
      "user",
      "auth-token",
      "token",
      "session",
      "userRole",
      "userData",
    ];

    localStorageKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Limpar sessionStorage completamente
    sessionStorage.clear();

    console.log("💾 Storage limpo");
  }
}

// Função para configurar limpeza automática ao fechar a página
export function setupAutoClearOnPageClose() {
  if (typeof window === "undefined") return;

  // Limpeza ao fechar aba/janela
  const handleBeforeUnload = () => {
    console.log("🚪 Página sendo fechada - limpando cookies...");
    clearAuthCookies();
    clearStorage();
  };

  // Limpeza ao navegar para fora do site
  const handleUnload = () => {
    console.log("🌐 Saindo do site - limpando cookies...");
    clearAuthCookies();
    clearStorage();
  };

  // Limpeza quando a página perde foco por muito tempo
  let pageBlurTimeout: NodeJS.Timeout;
  const handleBlur = () => {
    pageBlurTimeout = setTimeout(
      () => {
        console.log("😴 Página inativa por muito tempo - limpando cookies...");
        clearAuthCookies();
        clearStorage();
      },
      30 * 60 * 1000,
    ); // 30 minutos
  };

  const handleFocus = () => {
    if (pageBlurTimeout) {
      clearTimeout(pageBlurTimeout);
    }
  };

  // Adicionar listeners
  window.addEventListener("beforeunload", handleBeforeUnload);
  window.addEventListener("unload", handleUnload);
  window.addEventListener("blur", handleBlur);
  window.addEventListener("focus", handleFocus);

  // Cleanup function
  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    window.removeEventListener("unload", handleUnload);
    window.removeEventListener("blur", handleBlur);
    window.removeEventListener("focus", handleFocus);
    if (pageBlurTimeout) {
      clearTimeout(pageBlurTimeout);
    }
  };
}

// Função para limpar cookies em intervalos regulares (sessão ativa)
export function setupPeriodicCookieCleanup() {
  if (typeof window === "undefined") return;

  // Verificar e limpar cookies suspeitos a cada 5 minutos
  const cleanup = setInterval(
    () => {
      // Verificar se ainda existe um token válido
      const authToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth-token="));

      if (!authToken) {
        console.log("🔍 Token não encontrado - limpando resíduos...");
        clearStorage();
      }
    },
    5 * 60 * 1000,
  ); // 5 minutos

  return () => clearInterval(cleanup);
}
