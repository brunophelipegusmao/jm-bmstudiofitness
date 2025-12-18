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
    "refresh-token",
    "session-id",
  ];

  cookiesToClear.forEach((cookieName) => {
    // Remove com diferentes caminhos e domínios para garantir limpeza completa
    const expiresDate = "Thu, 01 Jan 1970 00:00:00 UTC";

    // Variações de path e domain para cobrir todos os casos
    document.cookie = `${cookieName}=; expires=${expiresDate}; path=/;`;
    document.cookie = `${cookieName}=; expires=${expiresDate}; path=/; domain=${window.location.hostname};`;
    document.cookie = `${cookieName}=; expires=${expiresDate}; path=/; domain=.${window.location.hostname};`;
    document.cookie = `${cookieName}=; expires=${expiresDate}; path=/; SameSite=Lax;`;
    document.cookie = `${cookieName}=; expires=${expiresDate}; path=/; SameSite=Strict;`;

    // Remove também sem especificar domain
    document.cookie = `${cookieName}=; expires=${expiresDate}; path=/; SameSite=Lax; Secure;`;
  });

  console.log("🍪 Cookies de autenticação limpos:", cookiesToClear.join(", "));
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

  // Limpeza ao fechar aba/janela - PRIORIDADE MÁXIMA
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    console.log("🚪 Navegador sendo fechado - limpando tokens JWT...");

    // Limpa imediatamente de forma síncrona
    clearAuthCookies();
    clearStorage();

    // Envia beacon para o servidor notificar o logout
    try {
      navigator.sendBeacon(
        "/api/auth/logout",
        JSON.stringify({ reason: "browser_close" }),
      );
    } catch (error) {
      console.error("Erro ao enviar beacon:", error);
    }
  };

  // Limpeza ao navegar para fora do site
  const handleUnload = () => {
    console.log("🌐 Saindo do site - limpando tokens...");
    clearAuthCookies();
    clearStorage();
  };

  // Limpeza quando a página fica inativa por muito tempo (30 minutos)
  let pageBlurTimeout: NodeJS.Timeout;
  const handleBlur = () => {
    pageBlurTimeout = setTimeout(
      () => {
        console.log("😴 Sessão inativa - limpando tokens por segurança...");
        clearAuthCookies();
        clearStorage();
        // Redireciona para login após inatividade
        window.location.href = "/?reason=inactivity";
      },
      30 * 60 * 1000,
    ); // 30 minutos
  };

  const handleFocus = () => {
    if (pageBlurTimeout) {
      clearTimeout(pageBlurTimeout);
    }
  };

  // Limpeza ao esconder a página (mobile)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log("📱 Página oculta - preparando limpeza...");
      // Aguarda 1 minuto antes de limpar (caso seja apenas mudança de aba)
      setTimeout(() => {
        if (document.hidden) {
          console.log("🧹 Limpando tokens após página oculta...");
          clearAuthCookies();
        }
      }, 60000); // 1 minuto
    }
  };

  // Adicionar todos os listeners
  window.addEventListener("beforeunload", handleBeforeUnload);
  window.addEventListener("unload", handleUnload);
  window.addEventListener("blur", handleBlur);
  window.addEventListener("focus", handleFocus);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  console.log("✅ Limpeza automática de tokens configurada");
  console.log("📌 Tokens serão limpos ao:");
  console.log("   - Fechar o navegador");
  console.log("   - Fechar a aba");
  console.log("   - Inatividade de 30 minutos");
  console.log("   - Página oculta por 1 minuto (mobile)");

  // Cleanup function
  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    window.removeEventListener("unload", handleUnload);
    window.removeEventListener("blur", handleBlur);
    window.removeEventListener("focus", handleFocus);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
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
