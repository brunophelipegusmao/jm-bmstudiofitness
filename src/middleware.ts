import { NextRequest, NextResponse } from "next/server";

import { getUserFromRequestEdge } from "@/lib/auth-edge";
import { UserRole } from "@/types/user-roles";

// Rotas protegidas que requerem autenticação
const protectedPaths = ["/admin", "/coach"];

// Rotas públicas dentro das áreas protegidas (não requerem autenticação)
const publicPaths = ["/admin/login", "/coach/login"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Redireciona /admin exato para /admin/login (mesmo se autenticado)
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Redireciona /coach exato para /coach/login (mesmo se autenticado)
  if (pathname === "/coach") {
    return NextResponse.redirect(new URL("/coach/login", request.url));
  }

  // Verifica se é uma rota pública
  const isPublic = publicPaths.some((path) => pathname === path);

  if (isPublic) {
    return NextResponse.next();
  }

  // Verifica se a rota está protegida
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Verifica autenticação usando Edge Runtime
  const user = await getUserFromRequestEdge(request);

  if (!user) {
    console.log("❌ Usuário não autenticado, redirecionando para login");

    // Redireciona para o login apropriado baseado na área acessada
    if (pathname.startsWith("/coach")) {
      return NextResponse.redirect(new URL("/coach/login", request.url));
    } else {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Verifica permissões por rota e papel do usuário

  // Área administrativa - apenas admins
  if (pathname.startsWith("/admin")) {
    if (user.role !== UserRole.ADMIN) {
      console.log(
        "❌ Usuário não é admin, redirecionando para área apropriada",
      );

      if (user.role === UserRole.PROFESSOR) {
        // Professor tentando acessar admin - redireciona para área do coach
        return NextResponse.redirect(new URL("/coach", request.url));
      } else {
        // Outros usuários - acesso negado
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  // Área do coach - apenas professores e admins
  if (pathname.startsWith("/coach") && pathname !== "/coach/login") {
    if (![UserRole.ADMIN, UserRole.PROFESSOR].includes(user.role as UserRole)) {
      console.log("❌ Usuário sem permissão para área de coach");
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/coach/:path*"],
};
