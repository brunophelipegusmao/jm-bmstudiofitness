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

export function getUserFromRequestEdge(request: any) {
  console.warn("[STUB] getUserFromRequestEdge chamado");
  return null;
}
