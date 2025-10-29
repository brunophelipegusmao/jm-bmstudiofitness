// Middleware para proteger rotas baseado em roles de usuário

import { NextRequest, NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth-utils";
import { UserRole } from "@/types/user-roles";

// Definir as rotas protegidas e seus requisitos
const protectedRoutes: Record<string, UserRole[]> = {
  "/cadastro": [UserRole.ADMIN, UserRole.PROFESSOR], // Apenas admin e professor podem cadastrar alunos
  "/admin": [UserRole.ADMIN], // Apenas admin pode acessar área administrativa
  "/admin/dashboard": [UserRole.ADMIN], // Dashboard admin
  "/admin/pagamentos": [UserRole.ADMIN], // Pagamentos admin
  "/admin/checkins": [UserRole.ADMIN, UserRole.PROFESSOR], // Admin e professor podem ver check-ins
  "/coach": [UserRole.ADMIN, UserRole.PROFESSOR], // Admin e professor podem acessar área do coach
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("🔍 Middleware - Pathname:", pathname);

  // Permitir acesso às rotas de login
  if (pathname === "/admin/login" || pathname === "/user/login") {
    console.log("✅ Permitindo acesso à rota de login");
    return NextResponse.next();
  }

  // Verificar se a rota atual é protegida
  const requiredRoles = protectedRoutes[pathname];

  if (!requiredRoles) {
    console.log("✅ Rota não protegida, permitindo acesso");
    // Rota não protegida, permitir acesso
    return NextResponse.next();
  }

  console.log("🔒 Rota protegida, verificando autenticação...");

  // Obter usuário da sessão JWT
  const user = getUserFromRequest(request);

  console.log("👤 Usuário encontrado:", !!user);
  if (user) {
    console.log("📋 Dados do usuário:", { role: user.role, email: user.email });
  }

  if (!user) {
    console.log("❌ Redirecionando para login");
    // Usuário não autenticado, redirecionar para login
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar se o usuário tem permissão para acessar a rota
  if (!requiredRoles.includes(user.role)) {
    console.log("❌ Usuário sem permissão para esta rota");
    // Usuário não autorizado
    const unauthorizedUrl = new URL("/unauthorized", request.url);
    return NextResponse.redirect(unauthorizedUrl);
  }

  console.log("✅ Usuário autorizado, permitindo acesso");
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
  runtime: "nodejs", // Forçar uso do Node.js runtime
};
