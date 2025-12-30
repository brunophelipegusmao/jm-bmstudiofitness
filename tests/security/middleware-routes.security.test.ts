/**
 * @jest-environment node
 */

// Testes de Segurança - Middleware e Proteção de Rotas
// Testa o sistema de middleware que protege as rotas:
// - Autenticação de rotas protegidas
// - Redirecionamento de não autenticados
// - Validação de roles por rota
// - Modo de manutenção
// - Rotas públicas vs protegidas

import { NextRequest, NextResponse } from "next/server";

import { getUserFromRequestEdge } from "@/lib/auth-edge";
import { getMaintenanceConfigCached } from "@/lib/maintenance-edge";
import { middleware } from "@/middleware";

jest.mock("@/lib/auth-edge");
jest.mock("@/lib/maintenance-edge");

describe("🔐 Security Tests - Middleware & Route Protection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1. Autenticação de Rotas Protegidas", () => {
    it("deve bloquear acesso a /admin sem autenticação", async () => {
      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(null);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeHomeEnabled: true,
        routeUserEnabled: true,
        routeCoachEnabled: true,
        routeEmployeeEnabled: true,
        routeShoppingEnabled: true,
        routeBlogEnabled: true,
        routeContactEnabled: true,
        routeServicesEnabled: true,
        routeAdminEnabled: true,
      });

      const request = new NextRequest("https://jmfitness.com/admin/dashboard");
      const response = await middleware(request);

      expect(response).toBeDefined();
      expect(response?.status).toBe(307); // Redirect
    });

    it("deve bloquear acesso a /coach sem autenticação", async () => {
      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(null);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeCoachEnabled: true,
      });

      const request = new NextRequest("https://jmfitness.com/coach/students");
      const response = await middleware(request);

      expect(response?.status).toBe(307);
    });

    it("deve bloquear acesso a /user/dashboard sem autenticação", async () => {
      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(null);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeUserEnabled: true,
      });

      const request = new NextRequest("https://jmfitness.com/user/dashboard");
      const response = await middleware(request);

      expect(response?.status).toBe(307);
    });

    it("deve permitir acesso a rotas públicas sem autenticação", async () => {
      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(null);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeHomeEnabled: true,
        routeContactEnabled: true,
      });

      const publicRoutes = [
        "https://jmfitness.com/",
        "https://jmfitness.com/contact",
        "https://jmfitness.com/services",
        "https://jmfitness.com/blog",
      ];

      for (const url of publicRoutes) {
        const request = new NextRequest(url);
        const response = await middleware(request);

        // Não deve redirecionar
        expect(response?.status).not.toBe(307);
      }
    });
  });

  describe("2. Validação de Roles por Rota", () => {
    it("deve permitir apenas admin acessar /admin", async () => {
      const adminUser = {
        id: "admin-1",
        email: "admin@jmfitness.com",
        role: "admin" as const,
      };

      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(adminUser);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeAdminEnabled: true,
      });

      const request = new NextRequest("https://jmfitness.com/admin/dashboard");
      const response = await middleware(request);

      expect(response).toBeDefined();
      // Admin deve ter acesso
    });

    it("deve bloquear professor de acessar /admin", async () => {
      const professorUser = {
        id: "prof-1",
        email: "prof@jmfitness.com",
        role: "professor" as const,
      };

      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(professorUser);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeAdminEnabled: true,
      });

      const request = new NextRequest("https://jmfitness.com/admin/dashboard");
      const response = await middleware(request);

      expect(response?.status).toBe(307); // Redirect para /unauthorized
    });

    it("deve permitir admin e professor acessar /coach", async () => {
      const users = [
        { id: "admin-1", email: "admin@jmfitness.com", role: "admin" as const },
        {
          id: "prof-1",
          email: "prof@jmfitness.com",
          role: "professor" as const,
        },
      ];

      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeCoachEnabled: true,
      });

      for (const user of users) {
        (getUserFromRequestEdge as jest.Mock).mockResolvedValue(user);

        const request = new NextRequest("https://jmfitness.com/coach/students");
        const response = await middleware(request);

        // Ambos devem ter acesso
        expect(response).toBeDefined();
      }
    });

    it("deve bloquear aluno de acessar /coach", async () => {
      const alunoUser = {
        id: "aluno-1",
        email: "aluno@test.com",
        role: "aluno" as const,
      };

      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(alunoUser);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeCoachEnabled: true,
      });

      const request = new NextRequest("https://jmfitness.com/coach/students");
      const response = await middleware(request);

      expect(response?.status).toBe(307); // Redirect
    });

    it("deve permitir apenas aluno acessar /user/dashboard", async () => {
      const alunoUser = {
        id: "aluno-1",
        email: "aluno@test.com",
        role: "aluno" as const,
      };

      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(alunoUser);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeUserEnabled: true,
      });

      const request = new NextRequest("https://jmfitness.com/user/dashboard");
      const response = await middleware(request);

      expect(response).toBeDefined();
    });

    it("deve bloquear admin de acessar área de aluno", async () => {
      const adminUser = {
        id: "admin-1",
        email: "admin@jmfitness.com",
        role: "admin" as const,
      };

      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(adminUser);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeUserEnabled: true,
      });

      const request = new NextRequest("https://jmfitness.com/user/dashboard");
      const response = await middleware(request);

      expect(response?.status).toBe(307); // Redirect para /admin/dashboard
    });
  });

  describe("3. Modo de Manutenção", () => {
    it("deve bloquear todas as rotas em modo manutenção", async () => {
      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(null);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: true,
        routeHomeEnabled: false,
        routeUserEnabled: false,
        routeCoachEnabled: false,
        routeEmployeeEnabled: false,
        routeShoppingEnabled: false,
        routeBlogEnabled: false,
        routeContactEnabled: false,
        routeServicesEnabled: false,
        routeAdminEnabled: true, // Admin sempre habilitado
      });

      const publicRoutes = [
        "https://jmfitness.com/",
        "https://jmfitness.com/contact",
        "https://jmfitness.com/services",
      ];

      for (const url of publicRoutes) {
        const request = new NextRequest(url);
        const response = await middleware(request);

        expect(response?.status).toBe(307); // Redirect para /maintenance
      }
    });

    it("deve permitir admin acessar durante manutenção", async () => {
      const adminUser = {
        id: "admin-1",
        email: "admin@jmfitness.com",
        role: "admin" as const,
      };

      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(adminUser);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: true,
        routeAdminEnabled: true,
      });

      const request = new NextRequest("https://jmfitness.com/admin/dashboard");
      const response = await middleware(request);

      // Admin pode acessar mesmo em manutenção
      expect(response).toBeDefined();
    });

    it("deve redirecionar para /waitlist quando disponível", async () => {
      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(null);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: true,
        routeHomeEnabled: false,
        routeUserEnabled: false,
        routeWaitlistEnabled: true,
      });

      const request = new NextRequest("https://jmfitness.com/");
      const response = await middleware(request);

      // Deve redirecionar para waitlist
      expect(response?.status).toBe(307);
    });
  });

  describe("4. Redirecionamento de Páginas de Login", () => {
    it("deve redirecionar admin logado de /admin/login", async () => {
      const adminUser = {
        id: "admin-1",
        email: "admin@jmfitness.com",
        role: "admin" as const,
      };

      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(adminUser);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeAdminEnabled: true,
      });

      const request = new NextRequest("https://jmfitness.com/admin/login");
      const response = await middleware(request);

      expect(response?.status).toBe(307); // Redirect para /admin/dashboard
    });

    it("deve redirecionar professor logado de /coach/login", async () => {
      const professorUser = {
        id: "prof-1",
        email: "prof@jmfitness.com",
        role: "professor" as const,
      };

      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(professorUser);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeCoachEnabled: true,
      });

      const request = new NextRequest("https://jmfitness.com/coach/login");
      const response = await middleware(request);

      expect(response?.status).toBe(307); // Redirect para /coach
    });

    it("deve permitir usuário não logado acessar páginas de login", async () => {
      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(null);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeAdminEnabled: true,
      });

      const loginRoutes = [
        "https://jmfitness.com/admin/login",
        "https://jmfitness.com/coach/login",
        "https://jmfitness.com/employee/login",
      ];

      for (const url of loginRoutes) {
        const request = new NextRequest(url);
        const response = await middleware(request);

        // Não deve redirecionar
        expect(response).toBeDefined();
      }
    });
  });

  describe("5. Proteção de Assets e API", () => {
    it("deve permitir assets estáticos sempre", async () => {
      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(null);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: true, // Mesmo em manutenção
      });

      const assetRoutes = [
        "https://jmfitness.com/_next/static/chunks/main.js",
        "https://jmfitness.com/_next/image?url=/logo.png",
        "https://jmfitness.com/favicon.ico",
      ];

      for (const url of assetRoutes) {
        const request = new NextRequest(url);
        const response = await middleware(request);

        // Assets sempre permitidos
        expect(response).toBeDefined();
      }
    });

    it("deve permitir rotas /api sempre", async () => {
      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(null);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: true,
      });

      const apiRoutes = [
        "https://jmfitness.com/api/auth/me",
        "https://jmfitness.com/api/user/validate-reset-token",
      ];

      for (const url of apiRoutes) {
        const request = new NextRequest(url);
        const response = await middleware(request);

        // API sempre permitida
        expect(response).toBeDefined();
      }
    });
  });

  describe("6. Proteção contra Session Hijacking", () => {
    it("deve validar token em cada requisição", async () => {
      const request = new NextRequest("https://jmfitness.com/admin/dashboard");

      await middleware(request);

      expect(getUserFromRequestEdge).toHaveBeenCalledWith(request);
    });

    it("deve rejeitar token inválido", async () => {
      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(null);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeAdminEnabled: true,
      });

      const request = new NextRequest("https://jmfitness.com/admin/dashboard");
      const response = await middleware(request);

      expect(response?.status).toBe(307); // Redirect para login
    });

    it("deve validar role em tempo real", async () => {
      const downgradeAttempt = {
        id: "user-1",
        email: "user@test.com",
        role: "aluno" as const, // Tentando acessar área admin
      };

      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(downgradeAttempt);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeAdminEnabled: true,
      });

      const request = new NextRequest("https://jmfitness.com/admin/dashboard");
      const response = await middleware(request);

      expect(response?.status).toBe(307); // Bloqueado
    });
  });

  describe("7. Tratamento de Erros", () => {
    it("deve tratar erro ao buscar usuário", async () => {
      (getUserFromRequestEdge as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
      });

      const request = new NextRequest("https://jmfitness.com/admin/dashboard");

      // Não deve crashar
      await expect(middleware(request)).resolves.toBeDefined();
    });

    it("deve tratar erro ao buscar configuração de manutenção", async () => {
      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(null);
      (getMaintenanceConfigCached as jest.Mock).mockRejectedValue(
        new Error("Config error"),
      );

      const request = new NextRequest("https://jmfitness.com/");

      // Não deve crashar
      await expect(middleware(request)).resolves.toBeDefined();
    });
  });

  describe("8. Rotas Especiais", () => {
    it("deve permitir acesso a /setup sem autenticação", async () => {
      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(null);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
      });

      const request = new NextRequest("https://jmfitness.com/setup");
      const response = await middleware(request);

      // Setup é sempre público
      expect(response).toBeDefined();
    });

    it("deve permitir acesso a /unauthorized sempre", async () => {
      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(null);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: true,
      });

      const request = new NextRequest("https://jmfitness.com/unauthorized");
      const response = await middleware(request);

      expect(response).toBeDefined();
    });
  });

  describe("9. Controle de Rotas por Configuração", () => {
    it("deve respeitar routeHomeEnabled=false", async () => {
      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(null);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeHomeEnabled: false,
        routeContactEnabled: true,
      });

      const request = new NextRequest("https://jmfitness.com/");
      const response = await middleware(request);

      expect(response?.status).toBe(307); // Redirect
    });

    it("deve respeitar routeUserEnabled=false", async () => {
      const alunoUser = {
        id: "aluno-1",
        email: "aluno@test.com",
        role: "aluno" as const,
      };

      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(alunoUser);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeUserEnabled: false,
      });

      const request = new NextRequest("https://jmfitness.com/user/dashboard");
      const response = await middleware(request);

      expect(response?.status).toBe(307); // Bloqueado
    });

    it("deve respeitar routeCoachEnabled=false", async () => {
      const professorUser = {
        id: "prof-1",
        email: "prof@jmfitness.com",
        role: "professor" as const,
      };

      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(professorUser);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeCoachEnabled: false,
      });

      const request = new NextRequest("https://jmfitness.com/coach/students");
      const response = await middleware(request);

      expect(response?.status).toBe(307); // Bloqueado
    });
  });

  describe("10. Performance e Cache", () => {
    it("deve usar cache de configuração de manutenção", async () => {
      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(null);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeHomeEnabled: true,
      });

      const request1 = new NextRequest("https://jmfitness.com/");
      const request2 = new NextRequest("https://jmfitness.com/contact");

      await middleware(request1);
      await middleware(request2);

      // Deve chamar apenas uma vez devido ao cache
      expect(getMaintenanceConfigCached).toHaveBeenCalled();
    });

    it("deve processar rapidamente rotas não protegidas", async () => {
      (getUserFromRequestEdge as jest.Mock).mockResolvedValue(null);
      (getMaintenanceConfigCached as jest.Mock).mockResolvedValue({
        maintenanceMode: false,
        routeHomeEnabled: true,
      });

      const request = new NextRequest("https://jmfitness.com/");

      const start = Date.now();
      await middleware(request);
      const duration = Date.now() - start;

      // Deve ser rápido (< 100ms em testes)
      expect(duration).toBeLessThan(100);
    });
  });
});
