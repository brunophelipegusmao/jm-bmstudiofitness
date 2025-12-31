export interface EdgeAuthUser {
  id: string;
  email?: string;
  role?: string;
}

function getBaseApiUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://localhost:3001/api"
  );
}

function parseAccessTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "").trim();
  }

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const tokenCookie = cookies.find((c) => c.startsWith("accessToken="));
  return tokenCookie ? tokenCookie.split("=")[1] : null;
}

async function fetchUserWithToken(
  accessToken: string,
): Promise<EdgeAuthUser | null> {
  try {
    const res = await fetch(`${getBaseApiUrl()}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    const id = data.id || data.userId || data.user?.id;
    if (!id) return null;

    return {
      id,
      email: data.email || data.user?.email,
      role: data.role || data.userRole || data.user?.role,
    };
  } catch (error) {
    console.error("[auth-edge] Failed to fetch user:", error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser();
  return !!user;
}

export async function getUser(): Promise<EdgeAuthUser | null> {
  if (typeof window === "undefined") return null;

  const accessToken =
    localStorage.getItem("accessToken") ||
    document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("accessToken="))
      ?.split("=")[1];

  if (!accessToken) return null;
  return fetchUserWithToken(accessToken);
}

export async function getUserFromRequestEdge(
  request: Request,
): Promise<EdgeAuthUser | null> {
  const token = parseAccessTokenFromRequest(request);
  if (!token) return null;
  return fetchUserWithToken(token);
}
