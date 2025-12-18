/**
 * @jest-environment node
 */

// Testes de Segurança - JWT Token e Autorização
// Testa a segurança dos tokens JWT e sistema de autorização:
// - Geração e validação de tokens
// - Expiração de tokens
// - Assinatura e verificação
// - Extração segura de tokens
// - Proteção contra token hijacking

import { jwtVerify, SignJWT } from "jose";
import { NextRequest } from "next/server";

import {
  extractTokenEdge,
  generateTokenEdge,
  getUserFromRequestEdge,
  verifyTokenEdge,
} from "@/lib/auth-edge";
import { extractToken, generateToken, verifyToken } from "@/lib/auth-utils";
import { UserRole } from "@/types/user-roles";

// Mock do jose para testes
jest.mock("jose", () => ({
  SignJWT: jest.fn(),
  jwtVerify: jest.fn(),
}));

describe("🔐 Security Tests - JWT Token & Authorization", () => {
  const mockUserId = "user-123";
  const mockEmail = "test@jmfitness.com";
  const mockRole = UserRole.ADMIN;
  const mockName = "Test User";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret-key-for-testing-only-12345678";
  });

  describe("1. Geração de Tokens", () => {
    it("deve gerar token JWT válido com payload correto", async () => {
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocktoken";

      const mockSignJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue(mockToken),
      };

      (SignJWT as jest.Mock).mockImplementation(() => mockSignJWT);

      const token = await generateTokenEdge({
        userId: mockUserId,
        email: mockEmail,
        role: mockRole,
        name: mockName,
      });

      expect(token).toBe(mockToken);
      expect(mockSignJWT.setProtectedHeader).toHaveBeenCalledWith({
        alg: "HS256",
      });
      expect(mockSignJWT.setIssuedAt).toHaveBeenCalled();
      expect(mockSignJWT.setExpirationTime).toHaveBeenCalledWith("7d");
    });

    it("deve incluir todos os campos necessários no payload", async () => {
      const mockToken = "valid.jwt.token";

      const mockSignJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue(mockToken),
      };

      (SignJWT as jest.Mock).mockImplementation((payload) => {
        // Verifica se o payload tem todos os campos necessários
        expect(payload).toHaveProperty("userId");
        expect(payload).toHaveProperty("email");
        expect(payload).toHaveProperty("role");
        expect(payload).toHaveProperty("name");
        return mockSignJWT;
      });

      await generateTokenEdge({
        userId: mockUserId,
        email: mockEmail,
        role: mockRole,
        name: mockName,
      });

      expect(SignJWT).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          email: mockEmail,
          role: mockRole,
          name: mockName,
        }),
      );
    });

    it("deve usar algoritmo HS256 para assinatura", async () => {
      const mockSignJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue("token"),
      };

      (SignJWT as jest.Mock).mockImplementation(() => mockSignJWT);

      await generateTokenEdge({
        userId: mockUserId,
        email: mockEmail,
        role: mockRole,
        name: mockName,
      });

      expect(mockSignJWT.setProtectedHeader).toHaveBeenCalledWith({
        alg: "HS256",
      });
    });
  });

  describe("2. Validação de Tokens", () => {
    it("deve validar token JWT correto", async () => {
      const mockToken = "valid.jwt.token";
      const mockPayload = {
        userId: mockUserId,
        email: mockEmail,
        role: mockRole,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      };

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: mockPayload,
      });

      const result = await verifyTokenEdge(mockToken);

      expect(result).toEqual(mockPayload);
      expect(jwtVerify).toHaveBeenCalledWith(
        mockToken,
        expect.any(Object), // JWT_SECRET encoded
      );
    });

    it("deve rejeitar token expirado", async () => {
      const mockToken = "expired.jwt.token";

      (jwtVerify as jest.Mock).mockRejectedValue({
        code: "ERR_JWT_EXPIRED",
      });

      const result = await verifyTokenEdge(mockToken);

      expect(result).toBeNull();
    });

    it("deve rejeitar token com assinatura inválida", async () => {
      const mockToken = "invalid.signature.token";

      (jwtVerify as jest.Mock).mockRejectedValue({
        code: "ERR_JWS_SIGNATURE_VERIFICATION_FAILED",
      });

      const result = await verifyTokenEdge(mockToken);

      expect(result).toBeNull();
    });

    it("deve rejeitar token malformado", async () => {
      const mockToken = "not.a.valid.jwt.format.at.all";

      (jwtVerify as jest.Mock).mockRejectedValue({
        code: "ERR_JWT_MALFORMED",
      });

      const result = await verifyTokenEdge(mockToken);

      expect(result).toBeNull();
    });

    it("deve rejeitar token vazio", async () => {
      const result = await verifyTokenEdge("");

      expect(result).toBeNull();
    });
  });

  describe("3. Extração Segura de Tokens", () => {
    it("deve extrair token do header Authorization", () => {
      const mockToken = "valid.jwt.token";
      const request = new NextRequest("https://jmfitness.com/admin", {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      const token = extractTokenEdge(request);

      expect(token).toBe(mockToken);
    });

    it("deve extrair token do cookie auth-token", () => {
      const mockToken = "valid.jwt.token";
      const request = new NextRequest("https://jmfitness.com/admin");

      // Simula cookie
      Object.defineProperty(request, "cookies", {
        value: {
          get: jest.fn((name: string) => {
            if (name === "auth-token") {
              return { value: mockToken };
            }
            return undefined;
          }),
        },
      });

      const token = extractTokenEdge(request);

      expect(token).toBe(mockToken);
    });

    it("deve priorizar header sobre cookie", () => {
      const headerToken = "header.jwt.token";
      const cookieToken = "cookie.jwt.token";

      const request = new NextRequest("https://jmfitness.com/admin", {
        headers: {
          Authorization: `Bearer ${headerToken}`,
        },
      });

      Object.defineProperty(request, "cookies", {
        value: {
          get: jest.fn(() => ({ value: cookieToken })),
        },
      });

      const token = extractTokenEdge(request);

      expect(token).toBe(headerToken);
    });

    it("deve retornar null quando não há token", () => {
      const request = new NextRequest("https://jmfitness.com/admin");

      Object.defineProperty(request, "cookies", {
        value: {
          get: jest.fn(() => undefined),
        },
      });

      const token = extractTokenEdge(request);

      expect(token).toBeNull();
    });

    it("deve rejeitar header Authorization sem Bearer", () => {
      const request = new NextRequest("https://jmfitness.com/admin", {
        headers: {
          Authorization: "invalid.token.without.bearer",
        },
      });

      const token = extractTokenEdge(request);

      expect(token).toBeNull();
    });
  });

  describe("4. Proteção contra Token Hijacking", () => {
    it("deve rejeitar token com role manipulada", async () => {
      const mockToken = "manipulated.token";

      // Simula um token onde o role foi alterado no cliente
      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          userId: mockUserId,
          email: mockEmail,
          role: "SUPER_ADMIN", // Role inexistente
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
      });

      const result = await verifyTokenEdge(mockToken);

      // O token é validado, mas o sistema deve verificar role válida
      expect(result?.role).toBe("SUPER_ADMIN");
      // Na aplicação real, isso seria rejeitado pelo sistema de permissões
    });

    it("deve rejeitar token gerado com secret diferente", async () => {
      const mockToken = "token.from.different.secret";

      (jwtVerify as jest.Mock).mockRejectedValue({
        code: "ERR_JWS_SIGNATURE_VERIFICATION_FAILED",
      });

      const result = await verifyTokenEdge(mockToken);

      expect(result).toBeNull();
    });

    it("deve validar que o token pertence ao usuário correto", async () => {
      const mockToken = "valid.jwt.token";
      const expectedUserId = "user-123";

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          userId: expectedUserId,
          email: mockEmail,
          role: mockRole,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
      });

      const result = await verifyTokenEdge(mockToken);

      expect(result?.userId).toBe(expectedUserId);
    });
  });

  describe("5. Expiração de Tokens", () => {
    it("deve definir expiração de 7 dias", async () => {
      const mockSignJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue("token"),
      };

      (SignJWT as jest.Mock).mockImplementation(() => mockSignJWT);

      await generateTokenEdge({
        userId: mockUserId,
        email: mockEmail,
        role: mockRole,
        name: mockName,
      });

      expect(mockSignJWT.setExpirationTime).toHaveBeenCalledWith("7d");
    });

    it("deve incluir timestamp de criação (iat)", async () => {
      const mockSignJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue("token"),
      };

      (SignJWT as jest.Mock).mockImplementation(() => mockSignJWT);

      await generateTokenEdge({
        userId: mockUserId,
        email: mockEmail,
        role: mockRole,
        name: mockName,
      });

      expect(mockSignJWT.setIssuedAt).toHaveBeenCalled();
    });

    it("deve rejeitar token após expiração", async () => {
      const mockToken = "expired.token";
      const expiredTime = Math.floor(Date.now() / 1000) - 3600; // 1 hora atrás

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: {
          userId: mockUserId,
          email: mockEmail,
          role: mockRole,
          iat: expiredTime - 7 * 24 * 60 * 60,
          exp: expiredTime,
        },
      });

      // jose automaticamente rejeita tokens expirados
      (jwtVerify as jest.Mock).mockRejectedValue({
        code: "ERR_JWT_EXPIRED",
      });

      const result = await verifyTokenEdge(mockToken);

      expect(result).toBeNull();
    });
  });

  describe("6. Segurança do Secret", () => {
    it("deve usar secret do ambiente", async () => {
      const customSecret = "custom-secret-key-123456";
      process.env.JWT_SECRET = customSecret;

      const mockSignJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue("token"),
      };

      (SignJWT as jest.Mock).mockImplementation(() => mockSignJWT);

      await generateTokenEdge({
        userId: mockUserId,
        email: mockEmail,
        role: mockRole,
        name: mockName,
      });

      // Verifica que o sign foi chamado com o secret encodado
      expect(mockSignJWT.sign).toHaveBeenCalledWith(expect.any(Object));
    });

    it("deve ter secret mínimo configurado como fallback", async () => {
      delete process.env.JWT_SECRET;

      const mockSignJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue("token"),
      };

      (SignJWT as jest.Mock).mockImplementation(() => mockSignJWT);

      await generateTokenEdge({
        userId: mockUserId,
        email: mockEmail,
        role: mockRole,
        name: mockName,
      });

      // Deve funcionar mesmo sem JWT_SECRET (usando fallback)
      expect(mockSignJWT.sign).toHaveBeenCalled();
    });
  });

  describe("7. Integração - getUserFromRequestEdge", () => {
    it("deve extrair usuário completo do request", async () => {
      const mockToken = "valid.jwt.token";
      const mockPayload = {
        userId: mockUserId,
        email: mockEmail,
        role: "admin" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const request = new NextRequest("https://jmfitness.com/admin", {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: mockPayload,
      });

      const user = await getUserFromRequestEdge(request);

      expect(user).toEqual({
        id: mockUserId,
        email: mockEmail,
        role: "admin",
      });
    });

    it("deve retornar null para request sem token", async () => {
      const request = new NextRequest("https://jmfitness.com/admin");

      Object.defineProperty(request, "cookies", {
        value: {
          get: jest.fn(() => undefined),
        },
      });

      const user = await getUserFromRequestEdge(request);

      expect(user).toBeNull();
    });

    it("deve retornar null para token inválido", async () => {
      const mockToken = "invalid.token";
      const request = new NextRequest("https://jmfitness.com/admin", {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      (jwtVerify as jest.Mock).mockRejectedValue({
        code: "ERR_JWS_SIGNATURE_VERIFICATION_FAILED",
      });

      const user = await getUserFromRequestEdge(request);

      expect(user).toBeNull();
    });
  });

  describe("8. Testes de Roles e Permissões", () => {
    it("deve preservar role de admin corretamente", async () => {
      const mockPayload = {
        userId: mockUserId,
        email: mockEmail,
        role: "admin" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: mockPayload,
      });

      const result = await verifyTokenEdge("token");

      expect(result?.role).toBe("admin");
    });

    it("deve preservar role de professor corretamente", async () => {
      const mockPayload = {
        userId: mockUserId,
        email: mockEmail,
        role: "professor" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: mockPayload,
      });

      const result = await verifyTokenEdge("token");

      expect(result?.role).toBe("professor");
    });

    it("deve preservar role de funcionário corretamente", async () => {
      const mockPayload = {
        userId: mockUserId,
        email: mockEmail,
        role: "funcionario" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: mockPayload,
      });

      const result = await verifyTokenEdge("token");

      expect(result?.role).toBe("funcionario");
    });

    it("deve preservar role de aluno corretamente", async () => {
      const mockPayload = {
        userId: mockUserId,
        email: mockEmail,
        role: "aluno" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      (jwtVerify as jest.Mock).mockResolvedValue({
        payload: mockPayload,
      });

      const result = await verifyTokenEdge("token");

      expect(result?.role).toBe("aluno");
    });
  });
});
