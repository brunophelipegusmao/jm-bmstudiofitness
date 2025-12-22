import { NextRequest, NextResponse } from "next/server";

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
  "/setup",
  "/setup/check-database",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Permite assets estáticos e API sempre
  const isAssetOrApi =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".");

  if (isAssetOrApi) {
    return NextResponse.next();
  }

  // Verifica se está em rota pública
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Verifica se está em rota protegida
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  );

  if (isProtectedPath) {
    // Verifica se tem token de autenticação
    const accessToken = request.cookies.get("accessToken")?.value;

    if (!accessToken) {
      // Redireciona para login apropriado baseado no path
      let loginUrl = "/user/login";
      if (pathname.startsWith("/admin")) {
        loginUrl = "/admin/login";
      } else if (pathname.startsWith("/coach")) {
        loginUrl = "/coach/login";
      } else if (pathname.startsWith("/employee")) {
        loginUrl = "/employee/login";
      }

      return NextResponse.redirect(new URL(loginUrl, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
