/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// STUB TEMPORÁRIO - Edge runtime auth
// TODO: Implementar autenticação no edge quando necessário

export function isAuthenticated() {
  console.warn("[STUB] isAuthenticated chamado");
  return false;
}

export function getUser() {
  console.warn("[STUB] getUser chamado");
  return null;
}

export function getUserFromRequestEdge(_request: Request) {
  console.warn("[STUB] getUserFromRequestEdge chamado");
  return null;
}
