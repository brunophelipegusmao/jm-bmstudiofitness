import { jwtVerify, SignJWT } from "jose";
import { NextRequest } from "next/server";

// Configurações JWT para Edge Runtime
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    "sua-chave-secreta-jwt-aqui-mude-em-producao-123456789",
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: "admin" | "professor" | "funcionario" | "aluno";
  iat?: number;
  exp?: number;
}

// Gerar JWT token compatível com Edge Runtime
export async function generateTokenEdge(
  payload: Omit<JWTPayload, "iat" | "exp">,
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// Verificar JWT token compatível com Edge Runtime
export async function verifyTokenEdge(
  token: string,
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as "admin" | "professor" | "funcionario" | "aluno",
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error: unknown) {
    if (
      (error as { code?: string })?.code ===
      "ERR_JWS_SIGNATURE_VERIFICATION_FAILED"
    ) {
      console.log(
        "❌ Token inválido ou criado com secret diferente. Faça login novamente.",
      );
    } else {
      console.log("❌ Erro ao verificar JWT:", error?.message || error);
    }
    return null;
  }
}

// Extrair token do request (header Authorization ou cookie)
export function extractTokenEdge(request: NextRequest): string | null {
  // Tentar pegar do header Authorization
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Tentar pegar do cookie
  const tokenCookie = request.cookies.get("auth-token");
  if (tokenCookie) {
    return tokenCookie.value;
  }

  return null;
}

// Extrair usuário do request para Edge Runtime
export async function getUserFromRequestEdge(request: NextRequest): Promise<{
  role: "admin" | "professor" | "funcionario" | "aluno";
  id: string;
  email: string;
} | null> {
  const token = extractTokenEdge(request);

  if (!token) {
    console.log("🔍 Token não encontrado no request");
    return null;
  }

  const payload = await verifyTokenEdge(token);
  if (!payload) {
    console.log("🔍 Token inválido ou expirado");
    return null;
  }

  console.log("✅ Token verificado com sucesso:", {
    role: payload.role,
    email: payload.email,
    userId: payload.userId,
  });

  return {
    role: payload.role,
    id: payload.userId,
    email: payload.email,
  };
}
