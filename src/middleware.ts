import { NextRequest, NextResponse } from "next/server";

type RouteSettings = {
  maintenanceMode: boolean;
  maintenanceRedirectUrl?: string;
  routeHomeEnabled?: boolean;
  routeUserEnabled?: boolean;
  routeCoachEnabled?: boolean;
  routeEmployeeEnabled?: boolean;
  routeShoppingEnabled?: boolean;
  routeBlogEnabled?: boolean;
  routeServicesEnabled?: boolean;
  routeContactEnabled?: boolean;
  routeWaitlistEnabled?: boolean;
};

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

const publicPaths = [
  "/admin/login",
  "/coach/login",
  "/employee/login",
  "/user/login",
  "/setup",
  "/setup/check-database",
];

async function fetchRouteSettings(
  request: NextRequest,
): Promise<RouteSettings | null> {
  try {
    const response = await fetch(
      new URL("/api/settings/routes", request.nextUrl.origin),
      {
        cache: "no-store",
        headers: { "x-from-middleware": "1" },
      },
    );

    if (!response.ok) return null;
    return (await response.json()) as RouteSettings;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAssetOrApi =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".");

  if (isAssetOrApi) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const routeSettings = await fetchRouteSettings(request);

  if (routeSettings?.maintenanceMode) {
    const isAdminArea = pathname.startsWith("/admin");
    const isMaintenancePage = pathname.startsWith("/maintenance");
    const redirectTarget = routeSettings.maintenanceRedirectUrl || "/maintenance";

    if (!isAdminArea && !isMaintenancePage) {
      const routeFlags: Array<{ prefix: string; enabled: boolean }> = [
        { prefix: "/", enabled: routeSettings.routeHomeEnabled ?? false },
        { prefix: "/user", enabled: routeSettings.routeUserEnabled ?? false },
        { prefix: "/coach", enabled: routeSettings.routeCoachEnabled ?? false },
        {
          prefix: "/employee",
          enabled: routeSettings.routeEmployeeEnabled ?? false,
        },
        {
          prefix: "/shopping",
          enabled: routeSettings.routeShoppingEnabled ?? false,
        },
        { prefix: "/blog", enabled: routeSettings.routeBlogEnabled ?? false },
        {
          prefix: "/services",
          enabled: routeSettings.routeServicesEnabled ?? false,
        },
        {
          prefix: "/contact",
          enabled: routeSettings.routeContactEnabled ?? false,
        },
        {
          prefix: "/waitlist",
          enabled: routeSettings.routeWaitlistEnabled ?? false,
        },
      ];

      const match = routeFlags.find(({ prefix }) =>
        prefix === "/" ? pathname === "/" : pathname.startsWith(prefix),
      );

      const isRouteAllowed = match ? match.enabled : false;

      if (!isRouteAllowed) {
        return NextResponse.redirect(new URL(redirectTarget, request.url));
      }
    }
  }

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  if (isPublicPath) {
    return NextResponse.next();
  }

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  );

  if (isProtectedPath && !accessToken) {
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
