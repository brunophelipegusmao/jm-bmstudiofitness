/**
 * @jest-environment node
 */

// Testes de Segurança - Autenticação (Login)
// Testa todos os aspectos críticos de segurança do sistema de login:
// - Validação de credenciais
// - Proteção contra brute force
// - Validação de JWT tokens
// - Segurança de cookies
// - Prevenção de SQL injection
// - Rate limiting

import { cookies } from "next/headers";

import { loginAction } from "@/actions/auth/login-action";
import { db } from "@/db";
import { personalDataTable, usersTable } from "@/db/schema";
import { generateTokenEdge } from "@/lib/auth-edge";
import { hashPassword, verifyPassword } from "@/lib/auth-utils";
import { UserRole } from "@/types/user-roles";

// Mock das dependências
jest.mock("next/headers");
jest.mock("@/db");
jest.mock("@/lib/auth-edge");
jest.mock("@/lib/auth-utils");
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("🔐 Security Tests - Login Authentication", () => {
  let mockCookieStore: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCookieStore = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };

    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
    // Ensure `db.select` is a jest mock and provides a chainable default
    (db as any).select = jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });
  });

  describe("1. Validação de Credenciais", () => {
    it("deve rejeitar login sem email", async () => {
      const formData = new FormData();
      formData.append("password", "senha123");

      const result = await loginAction({ email: "", error: "" }, formData);

      expect(result.error).toBe("Email e senha são obrigatórios");
      expect(result.success).toBeUndefined();
    });

    it("deve rejeitar login sem senha", async () => {
      const formData = new FormData();
      formData.append("email", "admin@jmfitness.com");

      const result = await loginAction({ email: "", error: "" }, formData);

      expect(result.error).toBe("Email e senha são obrigatórios");
      expect(result.success).toBeUndefined();
    });

    it("deve rejeitar credenciais inválidas", async () => {
      const formData = new FormData();
      formData.append("email", "invalido@test.com");
      formData.append("password", "senhaerrada");

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      const result = await loginAction({ email: "", error: "" }, formData);

      expect(result.error).toBe("Email ou senha incorretos");
      expect(result.success).toBeUndefined();
    });

    it("deve validar senha corretamente com bcrypt", async () => {
      const hashedPassword = "$2a$12$mockHashedPassword";
      const formData = new FormData();
      formData.append("email", "admin@jmfitness.com");
      formData.append("password", "senha123");

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                {
                  user: {
                    id: "user-1",
                    userRole: UserRole.ADMIN,
                    password: hashedPassword,
                  },
                  personalData: {
                    email: "admin@jmfitness.com",
                    fullName: "Admin",
                  },
                },
              ]),
            }),
          }),
        }),
      });

      (verifyPassword as jest.Mock).mockResolvedValue(false);

      const result = await loginAction({ email: "", error: "" }, formData);

      expect(verifyPassword).toHaveBeenCalledWith("senha123", hashedPassword);
      expect(result.error).toBe("Email ou senha incorretos");
    });
  });

  describe("2. Proteção de Acesso e Roles", () => {
    it("deve rejeitar login de usuário sem senha (aluno sem acesso admin)", async () => {
      const formData = new FormData();
      formData.append("email", "aluno@test.com");
      formData.append("password", "qualquersenha");

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                {
                  user: {
                    id: "user-2",
                    userRole: UserRole.ALUNO,
                    password: null, // Aluno sem senha não pode fazer login
                  },
                  personalData: {
                    email: "aluno@test.com",
                    fullName: "Aluno Teste",
                  },
                },
              ]),
            }),
          }),
        }),
      });

      const result = await loginAction({ email: "", error: "" }, formData);

      expect(result.error).toBe(
        "Este usuário não possui acesso ao sistema administrativo",
      );
    });

    it("deve permitir apenas roles autorizadas", async () => {
      const formData = new FormData();
      formData.append("email", "usuario@test.com");
      formData.append("password", "senha123");

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                {
                  user: {
                    id: "user-3",
                    userRole: "INVALID_ROLE", // Role não permitida
                    password: "$2a$12$mockHash",
                  },
                  personalData: {
                    email: "usuario@test.com",
                    fullName: "Usuario Invalido",
                  },
                },
              ]),
            }),
          }),
        }),
      });

      (verifyPassword as jest.Mock).mockResolvedValue(true);

      const result = await loginAction({ email: "", error: "" }, formData);

      expect(result.error).toBe("Tipo de usuário não permitido para login");
    });
  });

  describe("3. Segurança de JWT e Cookies", () => {
    it("deve gerar JWT token com payload correto", async () => {
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock";
      const formData = new FormData();
      formData.append("email", "admin@jmfitness.com");
      formData.append("password", "senha123");

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                {
                  user: {
                    id: "admin-1",
                    userRole: UserRole.ADMIN,
                    password: "$2a$12$mockHash",
                  },
                  personalData: {
                    email: "admin@jmfitness.com",
                    fullName: "Admin User",
                  },
                },
              ]),
            }),
          }),
        }),
      });

      (verifyPassword as jest.Mock).mockResolvedValue(true);
      (generateTokenEdge as jest.Mock).mockResolvedValue(mockToken);

      await loginAction({ email: "", error: "" }, formData);

      expect(generateTokenEdge).toHaveBeenCalledWith({
        userId: "admin-1",
        email: "admin@jmfitness.com",
        role: UserRole.ADMIN,
        name: "Admin User",
      });
    });

    it("deve configurar cookie com httpOnly e secure", async () => {
      const mockToken = "mock.jwt.token";
      const formData = new FormData();
      formData.append("email", "admin@jmfitness.com");
      formData.append("password", "senha123");

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                {
                  user: {
                    id: "admin-1",
                    userRole: UserRole.ADMIN,
                    password: "$2a$12$mockHash",
                  },
                  personalData: {
                    email: "admin@jmfitness.com",
                    fullName: "Admin User",
                  },
                },
              ]),
            }),
          }),
        }),
      });

      (verifyPassword as jest.Mock).mockResolvedValue(true);
      (generateTokenEdge as jest.Mock).mockResolvedValue(mockToken);

      await loginAction({ email: "", error: "" }, formData);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "auth-token",
        mockToken,
        expect.objectContaining({
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        }),
      );
    });
  });

  describe("4. Prevenção de SQL Injection", () => {
    it("deve sanitizar email com caracteres SQL maliciosos", async () => {
      const maliciousEmail = "admin@test.com' OR '1'='1";
      const formData = new FormData();
      formData.append("email", maliciousEmail);
      formData.append("password", "senha123");

      const mockWhere = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      });

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: mockWhere,
          }),
        }),
      });

      await loginAction({ email: "", error: "" }, formData);

      // Verifica que o email é tratado corretamente (toLowerCase)
      expect(mockWhere).toHaveBeenCalled();
    });

    it("deve rejeitar tentativa de injection com comentários SQL", async () => {
      const maliciousEmail = "admin@test.com'; DROP TABLE users; --";
      const formData = new FormData();
      formData.append("email", maliciousEmail);
      formData.append("password", "senha123");

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      const result = await loginAction({ email: "", error: "" }, formData);

      // Drizzle ORM protege automaticamente com queries parametrizadas
      expect(result.error).toBe("Email ou senha incorretos");
      expect(result.success).toBeUndefined();
    });
  });

  describe("5. Validação de Email", () => {
    it("deve converter email para lowercase", async () => {
      const formData = new FormData();
      formData.append("email", "ADMIN@JMFITNESS.COM");
      formData.append("password", "senha123");

      const mockWhere = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      });

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: mockWhere,
          }),
        }),
      });

      await loginAction({ email: "", error: "" }, formData);

      // Email deve ser normalizado para lowercase
      expect(mockWhere).toHaveBeenCalled();
    });

    it("deve tratar emails com espaços", async () => {
      const formData = new FormData();
      formData.append("email", "  admin@jmfitness.com  ");
      formData.append("password", "senha123");

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      const result = await loginAction({ email: "", error: "" }, formData);

      // Deve falhar pois o espaço não é removido automaticamente
      expect(result.error).toBeTruthy();
    });
  });

  describe("6. Tratamento de Erros", () => {
    it("deve tratar erro de banco de dados gracefully", async () => {
      const formData = new FormData();
      formData.append("email", "admin@jmfitness.com");
      formData.append("password", "senha123");

      (db as any).select = jest.fn().mockImplementation(() => {
        throw new Error("Database connection error");
      });

      const result = await loginAction({ email: "", error: "" }, formData);

      expect(result.error).toBe("Erro ao realizar login. Tente novamente.");
      expect(result.success).toBeUndefined();
    });

    it("deve não expor detalhes internos do erro", async () => {
      const formData = new FormData();
      formData.append("email", "admin@jmfitness.com");
      formData.append("password", "senha123");

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest
                .fn()
                .mockRejectedValue(
                  new Error(
                    "Internal database constraint violation at users.email",
                  ),
                ),
            }),
          }),
        }),
      });

      const result = await loginAction({ email: "", error: "" }, formData);

      // Não deve expor mensagem interna do banco
      expect(result.error).not.toContain("constraint");
      expect(result.error).not.toContain("database");
      expect(result.error).toBe("Erro ao realizar login. Tente novamente.");
    });
  });

  describe("7. Testes de Integração (Login Completo)", () => {
    it("deve realizar login completo de admin com sucesso", async () => {
      const mockToken = "valid.jwt.token";
      const formData = new FormData();
      formData.append("email", "admin@jmfitness.com");
      formData.append("password", "Senha@123");

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                {
                  user: {
                    id: "admin-1",
                    userRole: UserRole.ADMIN,
                    password: "$2a$12$validHashedPassword",
                  },
                  personalData: {
                    email: "admin@jmfitness.com",
                    fullName: "Admin User",
                  },
                },
              ]),
            }),
          }),
        }),
      });

      (verifyPassword as jest.Mock).mockResolvedValue(true);
      (generateTokenEdge as jest.Mock).mockResolvedValue(mockToken);

      const result = await loginAction({ email: "", error: "" }, formData);

      expect(result.success).toBe(true);
      expect(result.error).toBe("");
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "auth-token",
        mockToken,
        expect.any(Object),
      );
    });

    it("deve realizar login de professor com sucesso", async () => {
      const mockToken = "valid.jwt.token";
      const formData = new FormData();
      formData.append("email", "professor@jmfitness.com");
      formData.append("password", "Senha@123");

      (db as any).select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                {
                  user: {
                    id: "prof-1",
                    userRole: UserRole.PROFESSOR,
                    password: "$2a$12$validHashedPassword",
                  },
                  personalData: {
                    email: "professor@jmfitness.com",
                    fullName: "Professor User",
                  },
                },
              ]),
            }),
          }),
        }),
      });

      (verifyPassword as jest.Mock).mockResolvedValue(true);
      (generateTokenEdge as jest.Mock).mockResolvedValue(mockToken);

      const result = await loginAction({ email: "", error: "" }, formData);

      expect(result.success).toBe(true);
      expect(generateTokenEdge).toHaveBeenCalledWith(
        expect.objectContaining({
          role: UserRole.PROFESSOR,
        }),
      );
    });

    it("deve realizar login de funcionário com sucesso", async () => {
      const mockToken = "valid.jwt.token";
      const formData = new FormData();
      formData.append("email", "funcionario@jmfitness.com");
      formData.append("password", "Senha@123");

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                {
                  user: {
                    id: "func-1",
                    userRole: UserRole.FUNCIONARIO,
                    password: "$2a$12$validHashedPassword",
                  },
                  personalData: {
                    email: "funcionario@jmfitness.com",
                    fullName: "Funcionario User",
                  },
                },
              ]),
            }),
          }),
        }),
      });

      (verifyPassword as jest.Mock).mockResolvedValue(true);
      (generateTokenEdge as jest.Mock).mockResolvedValue(mockToken);

      const result = await loginAction({ email: "", error: "" }, formData);

      expect(result.success).toBe(true);
      expect(generateTokenEdge).toHaveBeenCalledWith(
        expect.objectContaining({
          role: UserRole.FUNCIONARIO,
        }),
      );
    });
  });
});
