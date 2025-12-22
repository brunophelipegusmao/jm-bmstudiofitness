// STUB TEMPORÁRIO - Client-side logout
// TODO: Usar useAuth().logout() do contexto

export async function clientLogout() {
  console.warn("[STUB] clientLogout chamado. Use useAuth().logout()");
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    window.location.href = "/";
  }
}

export function setupAutoClearOnPageClose() {
  console.warn("[STUB] setupAutoClearOnPageClose - não implementado ainda");
  return () => {}; // cleanup function
}

export function setupPeriodicCookieCleanup() {
  console.warn("[STUB] setupPeriodicCookieCleanup - não implementado ainda");
  return () => {}; // cleanup function
}
