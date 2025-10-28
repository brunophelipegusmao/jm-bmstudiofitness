// Middleware para proteger rotas baseado em roles de usuário

import { NextRequest, NextResponse } from "next/server";

import { UserRole } from "@/types/user-roles";

// Definir as rotas protegidas e seus requisitos
const protectedRoutes: Record<string, UserRole[]> = {
  "/cadastro": [UserRole.ADMIN, UserRole.PROFESSOR], // Apenas admin e professor podem cadastrar alunos
  "/admin": [UserRole.ADMIN], // Apenas admin pode acessar área administrativa
  "/professor": [UserRole.ADMIN, UserRole.PROFESSOR], // Admin e professor podem acessar área do professor
};

// Mock de função para obter usuário da sessão (você deve implementar com seu sistema de auth)
function getUserFromRequest(
  request: NextRequest,
): { role: UserRole; id: string } | null {
  // TODO: Implementar busca do usuário da sessão/JWT
  // Por enquanto, retornando null para demonstrar a estrutura
  const authHeader = request.headers.get("authorization");
  const sessionCookie = request.cookies.get("session");

  // Exemplo de implementação (você deve adaptar ao seu sistema de auth):
  if (authHeader || sessionCookie) {
    // Aqui você faria a validação do JWT/sessão e retornaria:
    // return { role: UserRole.ADMIN, id: "user-id" };
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar se a rota atual é protegida
  const requiredRoles = protectedRoutes[pathname];

  if (!requiredRoles) {
    // Rota não protegida, permitir acesso
    return NextResponse.next();
  }

  // Obter usuário da sessão
  const user = getUserFromRequest(request);

  if (!user) {
    // Usuário não autenticado, redirecionar para login
    const loginUrl = new URL("/user/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar se o usuário tem permissão para acessar a rota
  if (!requiredRoles.includes(user.role)) {
    // Usuário não autorizado
    const unauthorizedUrl = new URL("/unauthorized", request.url);
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Usuário autorizado, permitir acesso
  return NextResponse.next();
}

// Configurar em quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
