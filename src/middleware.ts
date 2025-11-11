import { NextRequest, NextResponse } from "next/server";

import { getUserFromRequestEdge } from "@/lib/auth-edge";

// Rotas protegidas que requerem autenticação
const protectedPaths = [
  "/admin",
  "/coach",
  "/employee",
  "/user/cadastro",
  "/cadastro",
  "/user/dashboard",
  "/user/health",
  "/user/check-ins",
];

// Rotas públicas dentro das áreas protegidas (não requerem autenticação)
const publicPaths = [
  "/admin/login",
  "/coach/login",
  "/employee/login",
  "/user/login",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  console.log(`🔍 Middleware v2 - Verificando rota: ${pathname}`);

  // Verifica se a rota está protegida primeiro
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    console.log(`✅ Rota não protegida permitida: ${pathname}`);
    return NextResponse.next();
  }

  console.log(`🔒 Rota protegida detectada: ${pathname}`);

  // Verifica autenticação usando Edge Runtime
  const user = await getUserFromRequestEdge(request);

  // Verifica se é uma rota pública (login)
  const isPublic = publicPaths.some((path) => pathname === path);

  if (isPublic) {
    // Se é página de login mas usuário já está logado, redireciona
    if (user) {
      console.log(
        `🔄 Usuário logado tentou acessar login ${pathname}, redirecionando`,
      );

      if (pathname === "/admin/login") {
        if (user.role === "admin") {
          return NextResponse.redirect(
            new URL("/admin/dashboard", request.url),
          );
        } else if (user.role === "funcionario") {
          return NextResponse.redirect(
            new URL("/employee/dashboard", request.url),
          );
        } else {
          return NextResponse.redirect(new URL("/coach", request.url));
        }
      } else if (pathname === "/employee/login") {
        if (user.role === "funcionario") {
          return NextResponse.redirect(
            new URL("/employee/dashboard", request.url),
          );
        } else if (user.role === "admin") {
          return NextResponse.redirect(
            new URL("/admin/dashboard", request.url),
          );
        } else {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      } else if (pathname === "/coach/login") {
        return NextResponse.redirect(new URL("/coach", request.url));
      } else if (pathname === "/user/login") {
        if (user.role === "aluno") {
          return NextResponse.redirect(new URL("/user/dashboard", request.url));
        } else if (user.role === "admin") {
          return NextResponse.redirect(
            new URL("/admin/dashboard", request.url),
          );
        } else if (user.role === "professor") {
          return NextResponse.redirect(new URL("/coach", request.url));
        } else if (user.role === "funcionario") {
          return NextResponse.redirect(
            new URL("/employee/dashboard", request.url),
          );
        }
      }
    }
    // Se não está logado, permite acesso à página de login
    console.log(`✅ Rota pública permitida: ${pathname}`);
    return NextResponse.next();
  }

  if (!user) {
    console.log("❌ Usuário não autenticado, redirecionando para login");

    // Redireciona para o login apropriado baseado na área acessada
    if (pathname.startsWith("/coach")) {
      console.log("🔄 Redirecionando para /coach/login");
      return NextResponse.redirect(new URL("/coach/login", request.url));
    } else if (pathname.startsWith("/employee")) {
      console.log("🔄 Redirecionando para /employee/login");
      return NextResponse.redirect(new URL("/employee/login", request.url));
    } else if (pathname.startsWith("/admin")) {
      console.log("🔄 Redirecionando para /admin/login");
      return NextResponse.redirect(new URL("/admin/login", request.url));
    } else if (
      pathname.startsWith("/user/dashboard") ||
      pathname.startsWith("/user/health") ||
      pathname.startsWith("/user/check-ins")
    ) {
      console.log("🔄 Redirecionando para /user/login");
      return NextResponse.redirect(new URL("/user/login", request.url));
    } else {
      // Para outras rotas protegidas, usa admin login como padrão
      console.log("🔄 Redirecionando para /admin/login (padrão)");
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  console.log(`✅ Usuário autenticado:`, {
    role: user.role,
    email: user.email,
    path: pathname,
  });

  // Usuario autenticado - agora verificar redirecionamentos e permissões

  // Redireciona /admin exato para /admin/dashboard se autenticado
  if (pathname === "/admin") {
    if (user.role === "admin") {
      console.log("🔄 Redirecionando para /admin/dashboard");
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else if (user.role === "funcionario") {
      console.log(
        "🔄 Funcionário tentando acessar /admin, redirecionando para /employee/dashboard",
      );
      return NextResponse.redirect(new URL("/employee/dashboard", request.url));
    } else {
      // Não tem permissão para área administrativa, redireciona conforme papel
      console.log(
        "🔄 Usuário sem permissão para área administrativa, redirecionando",
      );

      if (user.role === "professor") {
        return NextResponse.redirect(new URL("/coach", request.url));
      } else {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  // Redireciona /employee exato para /employee/dashboard se autenticado
  if (pathname === "/employee") {
    if (user.role === "funcionario") {
      console.log("🔄 Redirecionando para /employee/dashboard");
      return NextResponse.redirect(new URL("/employee/dashboard", request.url));
    } else {
      // Não tem permissão para área de funcionário
      console.log(
        "🔄 Usuário sem permissão para área de funcionário, redirecionando",
      );

      if (user.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else if (user.role === "professor") {
        return NextResponse.redirect(new URL("/coach", request.url));
      } else {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  // Redireciona /coach exato para /coach (página principal) se autenticado
  if (pathname === "/coach") {
    if (["admin", "professor"].includes(user.role)) {
      // Usuário tem permissão, apenas continua (não redireciona)
      console.log("✅ Usuário autorizado para /coach");
      return NextResponse.next();
    } else {
      // Não tem permissão para área de coach
      console.log("❌ Usuário sem permissão para /coach");
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Verifica permissões por rota e papel do usuário

  // Área administrativa - apenas admins (funcionários vão para /employee)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (user.role !== "admin") {
      console.log("❌ Usuário sem permissão para área administrativa", {
        userRole: user.role,
        expectedRole: "admin",
      });

      if (user.role === "funcionario") {
        // Funcionário tentando acessar admin - redireciona para área de employee
        return NextResponse.redirect(
          new URL("/employee/dashboard", request.url),
        );
      } else if (user.role === "professor") {
        // Professor tentando acessar admin - redireciona para área do coach
        return NextResponse.redirect(new URL("/coach", request.url));
      } else {
        // Outros usuários - acesso negado
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  // Área de funcionário - apenas funcionários
  if (pathname.startsWith("/employee") && pathname !== "/employee/login") {
    if (user.role !== "funcionario") {
      console.log("❌ Usuário sem permissão para área de funcionário", {
        userRole: user.role,
        expectedRole: "funcionario",
      });

      if (user.role === "admin") {
        // Admin tentando acessar employee - redireciona para área de admin
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else if (user.role === "professor") {
        // Professor tentando acessar employee - redireciona para área do coach
        return NextResponse.redirect(new URL("/coach", request.url));
      } else {
        // Outros usuários - acesso negado
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  // Área do coach - apenas professores e admins
  if (pathname.startsWith("/coach") && pathname !== "/coach/login") {
    if (!["admin", "professor"].includes(user.role)) {
      console.log("❌ Usuário sem permissão para área de coach", {
        userRole: user.role,
      });
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Rota de cadastro de alunos - professores, funcionários e admins
  if (pathname === "/user/cadastro" || pathname === "/cadastro") {
    if (!["admin", "professor", "funcionario"].includes(user.role)) {
      console.log("❌ Usuário sem permissão para cadastro de alunos", {
        userRole: user.role,
      });
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Área do aluno - apenas alunos
  if (
    (pathname.startsWith("/user/dashboard") ||
      pathname.startsWith("/user/health") ||
      pathname.startsWith("/user/check-ins")) &&
    pathname !== "/user/login"
  ) {
    if (user.role !== "aluno") {
      console.log(
        "❌ Usuário não é aluno, redirecionando para área apropriada",
        {
          userRole: user.role,
          expectedRole: "aluno",
        },
      );

      if (user.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else if (user.role === "professor") {
        return NextResponse.redirect(new URL("/coach", request.url));
      } else {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  console.log("✅ Usuário autenticado e autorizado:", {
    role: user.role,
    email: user.email,
    path: pathname,
  });

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/coach/:path*",
    "/employee/:path*",
    "/user/cadastro",
    "/cadastro",
    "/user/dashboard",
    "/user/health/:path*",
    "/user/check-ins/:path*",
  ],
};
