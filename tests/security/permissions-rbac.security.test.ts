/**
 * @jest-environment node
 */

// Testes de Segurança - Sistema de Permissões (RBAC)
// Testa o controle de acesso baseado em roles:
// - Verificação de permissões por recurso e ação
// - Validação de hierarquia de roles
// - Proteção contra privilege escalation
// - Guards de admin e professor
// - Contexto de permissões (próprio vs outros)

import { cookies } from "next/headers";

import { verifyTokenEdge } from "@/lib/auth-edge";
import { getCurrentUser,requireAdmin } from "@/lib/auth-server";
import { verifyToken } from "@/lib/auth-utils";
import { canCreateUserType,checkPermission } from "@/lib/check-permission";
import { UserRole } from "@/types/user-roles";

jest.mock("next/headers");
jest.mock("@/lib/auth-utils");
jest.mock("@/lib/auth-edge");

describe("🔐 Security Tests - Permission System (RBAC)", () => {
  let mockCookieStore: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCookieStore = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };

    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
  });

  describe("1. Autenticação de Usuário", () => {
    it("deve rejeitar requisição sem token", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const result = await checkPermission("users", "read");

      expect(result.allowed).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe("Usuário não autenticado");
    });

    it("deve rejeitar token inválido", async () => {
      mockCookieStore.get.mockReturnValue({ value: "invalid.token" });
      (verifyToken as jest.Mock).mockReturnValue(null);

      const result = await checkPermission("users", "read");

      expect(result.allowed).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe("Token inválido ou expirado");
    });

    it("deve rejeitar token sem userId", async () => {
      mockCookieStore.get.mockReturnValue({ value: "token" });
      (verifyToken as jest.Mock).mockReturnValue({
        email: "test@test.com",
        role: UserRole.ADMIN,
        // userId ausente
      });

      const result = await checkPermission("users", "read");

      expect(result.allowed).toBe(false);
      expect(result.error).toBe("Token inválido ou expirado");
    });
  });

  describe("2. Permissões de Admin", () => {
    const adminToken = {
      userId: "admin-1",
      email: "admin@jmfitness.com",
      role: UserRole.ADMIN,
    };

    beforeEach(() => {
      mockCookieStore.get.mockReturnValue({ value: "valid-token" });
      (verifyToken as jest.Mock).mockReturnValue(adminToken);
    });

    it("deve permitir admin ler usuários", async () => {
      const result = await checkPermission("users", "read");

      expect(result.allowed).toBe(true);
      expect(result.user?.role).toBe(UserRole.ADMIN);
      expect(result.error).toBeUndefined();
    });

    it("deve permitir admin criar usuários", async () => {
      const result = await checkPermission("users", "create");

      expect(result.allowed).toBe(true);
    });

    it("deve permitir admin atualizar usuários", async () => {
      const result = await checkPermission("users", "update");

      expect(result.allowed).toBe(true);
    });

    it("deve permitir admin deletar usuários", async () => {
      const result = await checkPermission("users", "delete");

      expect(result.allowed).toBe(true);
    });

    it("deve permitir admin acessar métricas de saúde", async () => {
      const result = await checkPermission("healthMetrics", "read");

      expect(result.allowed).toBe(true);
    });

    it("deve permitir admin acessar dados financeiros", async () => {
      const result = await checkPermission("financial", "read");

      expect(result.allowed).toBe(true);
    });

    it("deve permitir admin gerenciar configurações", async () => {
      const result = await checkPermission("settings", "update");

      expect(result.allowed).toBe(true);
    });

    it("deve permitir admin criar outros admins", async () => {
      const result = await canCreateUserType("admin");

      expect(result.allowed).toBe(true);
    });
  });

  describe("3. Permissões de Professor", () => {
    const professorToken = {
      userId: "prof-1",
      email: "prof@jmfitness.com",
      role: UserRole.PROFESSOR,
    };

    beforeEach(() => {
      mockCookieStore.get.mockReturnValue({ value: "valid-token" });
      (verifyToken as jest.Mock).mockReturnValue(professorToken);
    });

    it("deve permitir professor ler alunos", async () => {
      const result = await checkPermission("users", "read");

      expect(result.allowed).toBe(true);
    });

    it("deve permitir professor criar alunos", async () => {
      const result = await checkPermission("users", "create", {
        targetUserType: "aluno",
      });

      expect(result.allowed).toBe(true);
    });

    it("deve permitir professor atualizar alunos", async () => {
      const result = await checkPermission("users", "update", {
        targetUserType: "aluno",
      });

      expect(result.allowed).toBe(true);
    });

    it("deve permitir professor acessar métricas de saúde", async () => {
      const result = await checkPermission("healthMetrics", "read");

      expect(result.allowed).toBe(true);
    });

    it("deve permitir professor criar métricas de saúde", async () => {
      const result = await checkPermission("healthMetrics", "create");

      expect(result.allowed).toBe(true);
    });

    it("deve NEGAR professor deletar alunos", async () => {
      const result = await checkPermission("users", "delete");

      expect(result.allowed).toBe(false);
      expect(result.error).toBe(
        "Você não tem permissão para realizar esta ação",
      );
    });

    it("deve NEGAR professor acessar dados financeiros", async () => {
      const result = await checkPermission("financial", "read");

      expect(result.allowed).toBe(false);
    });

    it("deve NEGAR professor criar admin", async () => {
      const result = await canCreateUserType("admin");

      expect(result.allowed).toBe(false);
    });

    it("deve NEGAR professor criar professor", async () => {
      const result = await canCreateUserType("professor");

      expect(result.allowed).toBe(false);
    });
  });

  describe("4. Permissões de Funcionário", () => {
    const funcionarioToken = {
      userId: "func-1",
      email: "func@jmfitness.com",
      role: UserRole.FUNCIONARIO,
    };

    beforeEach(() => {
      mockCookieStore.get.mockReturnValue({ value: "valid-token" });
      (verifyToken as jest.Mock).mockReturnValue(funcionarioToken);
    });

    it("deve permitir funcionário ler alunos", async () => {
      const result = await checkPermission("users", "read");

      expect(result.allowed).toBe(true);
    });

    it("deve permitir funcionário criar alunos", async () => {
      const result = await checkPermission("users", "create", {
        targetUserType: "aluno",
      });

      expect(result.allowed).toBe(true);
    });

    it("deve permitir funcionário gerenciar check-ins", async () => {
      const result = await checkPermission("checkIns", "create");

      expect(result.allowed).toBe(true);
    });

    it("deve NEGAR funcionário acessar métricas de saúde", async () => {
      const result = await checkPermission("healthMetrics", "read");

      expect(result.allowed).toBe(false);
    });

    it("deve NEGAR funcionário deletar alunos", async () => {
      const result = await checkPermission("users", "delete");

      expect(result.allowed).toBe(false);
    });

    it("deve NEGAR funcionário acessar dados financeiros", async () => {
      const result = await checkPermission("financial", "read");

      expect(result.allowed).toBe(false);
    });

    it("deve NEGAR funcionário criar funcionários", async () => {
      const result = await canCreateUserType("funcionario");

      expect(result.allowed).toBe(false);
    });
  });

  describe("5. Permissões de Aluno", () => {
    const alunoToken = {
      userId: "aluno-1",
      email: "aluno@test.com",
      role: UserRole.ALUNO,
    };

    beforeEach(() => {
      mockCookieStore.get.mockReturnValue({ value: "valid-token" });
      (verifyToken as jest.Mock).mockReturnValue(alunoToken);
    });

    it("deve permitir aluno ler próprios dados", async () => {
      const result = await checkPermission("users", "read", {
        targetUserId: "aluno-1",
      });

      expect(result.allowed).toBe(true);
    });

    it("deve permitir aluno atualizar próprios dados", async () => {
      const result = await checkPermission("users", "update", {
        targetUserId: "aluno-1",
        targetUserType: "aluno",
      });

      expect(result.allowed).toBe(true);
    });

    it("deve permitir aluno ler próprias métricas de saúde", async () => {
      const result = await checkPermission("healthMetrics", "read", {
        targetUserId: "aluno-1",
      });

      expect(result.allowed).toBe(true);
    });

    it("deve NEGAR aluno ler dados de outros alunos", async () => {
      const result = await checkPermission("users", "read", {
        targetUserId: "outro-aluno-123",
      });

      expect(result.allowed).toBe(false);
    });

    it("deve NEGAR aluno criar usuários", async () => {
      const result = await checkPermission("users", "create");

      expect(result.allowed).toBe(false);
    });

    it("deve NEGAR aluno deletar qualquer usuário", async () => {
      const result = await checkPermission("users", "delete");

      expect(result.allowed).toBe(false);
    });

    it("deve NEGAR aluno acessar dados financeiros", async () => {
      const result = await checkPermission("financial", "read");

      expect(result.allowed).toBe(false);
    });

    it("deve NEGAR aluno acessar métricas de outros alunos", async () => {
      const result = await checkPermission("healthMetrics", "read", {
        targetUserId: "outro-aluno-456",
      });

      expect(result.allowed).toBe(false);
    });
  });

  describe("6. Privilege Escalation Protection", () => {
    it("deve NEGAR professor tentar se tornar admin", async () => {
      const professorToken = {
        userId: "prof-1",
        email: "prof@jmfitness.com",
        role: UserRole.PROFESSOR,
      };

      mockCookieStore.get.mockReturnValue({ value: "valid-token" });
      (verifyToken as jest.Mock).mockReturnValue(professorToken);

      const result = await checkPermission("users", "update", {
        targetUserId: "prof-1",
        targetUserType: "admin", // Tentando se promover
      });

      expect(result.allowed).toBe(false);
    });

    it("deve NEGAR funcionário criar professor", async () => {
      const funcionarioToken = {
        userId: "func-1",
        email: "func@jmfitness.com",
        role: UserRole.FUNCIONARIO,
      };

      mockCookieStore.get.mockReturnValue({ value: "valid-token" });
      (verifyToken as jest.Mock).mockReturnValue(funcionarioToken);

      const result = await canCreateUserType("professor");

      expect(result.allowed).toBe(false);
    });

    it("deve NEGAR aluno modificar role", async () => {
      const alunoToken = {
        userId: "aluno-1",
        email: "aluno@test.com",
        role: UserRole.ALUNO,
      };

      mockCookieStore.get.mockReturnValue({ value: "valid-token" });
      (verifyToken as jest.Mock).mockReturnValue(alunoToken);

      const result = await checkPermission("users", "update", {
        targetUserId: "aluno-1",
        targetUserType: "admin",
      });

      expect(result.allowed).toBe(false);
    });
  });

  describe("7. Admin Guard", () => {
    it("deve permitir acesso para admin", async () => {
      const adminToken = {
        userId: "admin-1",
        email: "admin@jmfitness.com",
        role: "admin" as const,
      };

      mockCookieStore.get.mockReturnValue({ value: "valid-token" });
      (verifyTokenEdge as jest.Mock).mockResolvedValue(adminToken);

      await expect(requireAdmin()).resolves.toEqual(adminToken);
    });

    it("deve rejeitar acesso para não-admin", async () => {
      const professorToken = {
        userId: "prof-1",
        email: "prof@jmfitness.com",
        role: "professor" as const,
      };

      mockCookieStore.get.mockReturnValue({ value: "valid-token" });
      (verifyTokenEdge as jest.Mock).mockResolvedValue(professorToken);

      await expect(requireAdmin()).rejects.toThrow(
        "Acesso negado. Apenas administradores podem realizar esta ação.",
      );
    });

    it("deve rejeitar quando não há usuário autenticado", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      await expect(requireAdmin()).rejects.toThrow("Usuário não autenticado");
    });
  });

  describe("8. Contexto de Permissões", () => {
    it("deve respeitar contexto de targetUserId", async () => {
      const alunoToken = {
        userId: "aluno-1",
        email: "aluno@test.com",
        role: UserRole.ALUNO,
      };

      mockCookieStore.get.mockReturnValue({ value: "valid-token" });
      (verifyToken as jest.Mock).mockReturnValue(alunoToken);

      // Pode acessar próprios dados
      const ownResult = await checkPermission("users", "read", {
        targetUserId: "aluno-1",
      });
      expect(ownResult.allowed).toBe(true);

      // Não pode acessar dados de outros
      const otherResult = await checkPermission("users", "read", {
        targetUserId: "aluno-2",
      });
      expect(otherResult.allowed).toBe(false);
    });

    it("deve respeitar contexto de targetUserType", async () => {
      const professorToken = {
        userId: "prof-1",
        email: "prof@jmfitness.com",
        role: UserRole.PROFESSOR,
      };

      mockCookieStore.get.mockReturnValue({ value: "valid-token" });
      (verifyToken as jest.Mock).mockReturnValue(professorToken);

      // Pode criar aluno
      const alunoResult = await checkPermission("users", "create", {
        targetUserType: "aluno",
      });
      expect(alunoResult.allowed).toBe(true);

      // Não pode criar admin
      const adminResult = await checkPermission("users", "create", {
        targetUserType: "admin",
      });
      expect(adminResult.allowed).toBe(false);
    });
  });

  describe("9. Tratamento de Erros", () => {
    it("deve tratar erro de verificação de token", async () => {
      mockCookieStore.get.mockReturnValue({ value: "token" });
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error("Token verification failed");
      });

      const result = await checkPermission("users", "read");

      expect(result.allowed).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe("Erro ao verificar permissões");
    });

    it("deve tratar erro ao buscar cookies", async () => {
      (cookies as jest.Mock).mockRejectedValue(new Error("Cookie error"));

      const result = await checkPermission("users", "read");

      expect(result.allowed).toBe(false);
      expect(result.error).toBe("Erro ao verificar permissões");
    });
  });

  describe("10. Validação de Recursos e Ações", () => {
    const adminToken = {
      userId: "admin-1",
      email: "admin@jmfitness.com",
      role: UserRole.ADMIN,
    };

    beforeEach(() => {
      mockCookieStore.get.mockReturnValue({ value: "valid-token" });
      (verifyToken as jest.Mock).mockReturnValue(adminToken);
    });

    it("deve validar recurso 'users'", async () => {
      const result = await checkPermission("users", "read");
      expect(result.allowed).toBe(true);
    });

    it("deve validar recurso 'healthMetrics'", async () => {
      const result = await checkPermission("healthMetrics", "read");
      expect(result.allowed).toBe(true);
    });

    it("deve validar recurso 'financial'", async () => {
      const result = await checkPermission("financial", "read");
      expect(result.allowed).toBe(true);
    });

    it("deve validar recurso 'settings'", async () => {
      const result = await checkPermission("settings", "update");
      expect(result.allowed).toBe(true);
    });

    it("deve validar ação 'create'", async () => {
      const result = await checkPermission("users", "create");
      expect(result.allowed).toBe(true);
    });

    it("deve validar ação 'read'", async () => {
      const result = await checkPermission("users", "read");
      expect(result.allowed).toBe(true);
    });

    it("deve validar ação 'update'", async () => {
      const result = await checkPermission("users", "update");
      expect(result.allowed).toBe(true);
    });

    it("deve validar ação 'delete'", async () => {
      const result = await checkPermission("users", "delete");
      expect(result.allowed).toBe(true);
    });
  });
});
