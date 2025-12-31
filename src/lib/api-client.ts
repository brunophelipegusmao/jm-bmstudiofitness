/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API Client para integração com Backend NestJS
 * Base URL: http://localhost:3001/api
 */

const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function resolveBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }

  return DEFAULT_API_URL;
}

interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string = resolveBaseUrl()) {
    this.baseUrl = baseUrl;

    // Carregar tokens do localStorage ao inicializar
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken");
      this.refreshToken = localStorage.getItem("refreshToken");
    }
  }

  /**
   * Salva tokens no localStorage e na instância
   */
  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      // Mantém cookie simples para middleware de rota (não seguro para produção, mas evita redirecionar logado)
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${
        60 * 60 * 24 * 7
      }`;
    }
  }

  /**
   * Remove tokens do localStorage e da instância
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      document.cookie =
        "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  /**
   * Obtém o access token atual
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Renova o access token usando o refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return false;
      }

      const data: TokenResponse = await response.json();
      this.setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Método principal para fazer requisições à API
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    // Adiciona token de autenticação se disponível
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // Se receber 401, tenta renovar o token
      if (response.status === 401 && this.refreshToken) {
        const renewed = await this.refreshAccessToken();

        if (renewed) {
          // Tenta fazer a requisição novamente com o novo token
          headers["Authorization"] = `Bearer ${this.accessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        } else {
          // Se não conseguiu renovar, redireciona para login
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new Error("Sessão expirada");
        }
      }

      // Se ainda assim não for ok, lança erro
      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message || "Erro na requisição");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro na requisição:", error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }

  // ========== AUTH ENDPOINTS ==========

  /**
   * Registra novo usuário
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
    cpf: string;
    role?: string;
  }): Promise<TokenResponse> {
    const response = await this.post<TokenResponse>("/auth/register", data);
    this.setTokens(response.accessToken, response.refreshToken);
    return response;
  }

  /**
   * Faz login
   */
  async login(data: {
    login: string;
    password: string;
  }): Promise<TokenResponse> {
    const response = await this.post<TokenResponse>("/auth/login", data);
    this.setTokens(response.accessToken, response.refreshToken);
    return response;
  }

  /**
   * Obtém perfil do usuário atual
   */
  async getProfile(): Promise<TokenResponse["user"]> {
    return this.get("/auth/me");
  }

  /**
   * Faz logout (limpa tokens localmente)
   */
  logout() {
    this.clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  // ========== USERS ENDPOINTS ==========

  /**
   * Lista usuários (paginado)
   */
  async listUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.get(`/users?${queryParams}`);
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: string) {
    return this.get(`/users/${id}`);
  }

  /**
   * Cria novo usuário
   */
  async createUser(data: {
    email: string;
    password: string;
    name: string;
    cpf: string;
    role: string;
  }) {
    return this.post("/users", data);
  }

  /**
   * Atualiza usuário
   */
  async updateUser(id: string, data: any) {
    return this.patch(`/users/${id}`, data);
  }

  /**
   * Altera senha do usuário
   */
  async changePassword(
    id: string,
    data: {
      currentPassword: string;
      newPassword: string;
    },
  ) {
    return this.patch(`/users/${id}/password`, data);
  }

  /**
   * Deleta usuário (soft delete)
   */
  async deleteUser(id: string) {
    return this.delete(`/users/${id}`);
  }

  // ========== FINANCIAL ENDPOINTS ==========

  /**
   * Lista registros financeiros
   */
  async listFinancial(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.get(`/financial?${queryParams}`);
  }

  /**
   * Cria registro financeiro
   */
  async createFinancial(data: {
    userId: string;
    amount: number;
    dueDate: string;
    description?: string;
    type?: string;
  }) {
    return this.post("/financial", data);
  }

  /**
   * Marca pagamento como pago
   */
  async markAsPaid(
    id: string,
    data: {
      paymentDate: string;
      paymentMethod?: string;
    },
  ) {
    return this.post(`/financial/${id}/mark-paid`, data);
  }

  /**
   * Obtém relatório mensal
   */
  async getMonthlyReport(year: number, month: number) {
    return this.get(`/financial/report/${year}/${month}`);
  }

  // ========== CHECK-INS ENDPOINTS ==========

  /**
   * Lista check-ins
   */
  async listCheckIns(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.get(`/check-ins?${queryParams}`);
  }

  /**
   * Cria check-in
   */
  async createCheckIn(data: { userId: string; checkInBy?: string }) {
    return this.post("/check-ins", data);
  }

  /**
   * Dashboard de check-ins de hoje
   */
  async getTodayCheckIns() {
    return this.get("/check-ins/today");
  }

  /**
   * Histórico de check-ins do usuário
   */
  async getUserCheckInHistory(
    userId: string,
    params?: {
      page?: number;
      limit?: number;
    },
  ) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.get(`/check-ins/user/${userId}/history?${queryParams}`);
  }

  /**
   * Estatísticas de check-in do usuário
   */
  async getUserCheckInStats(userId: string) {
    return this.get(`/check-ins/user/${userId}/stats`);
  }

  // ========== STUDENTS ENDPOINTS ==========

  /**
   * Lista alunos
   */
  async listStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.get(`/students?${queryParams}`);
  }

  /**
   * Busca dados do aluno
   */
  async getStudentById(id: string) {
    return this.get(`/students/${id}`);
  }

  /**
   * Busca métricas de saúde do aluno
   */
  async getStudentHealth(id: string) {
    return this.get(`/students/${id}/health`);
  }

  /**
   * Cria métricas de saúde
   */
  async createHealthMetrics(data: {
    userId: string;
    weight?: number;
    height?: number;
    bodyFat?: number;
    muscleMass?: number;
    measuredAt?: string;
  }) {
    return this.post("/students/health", data);
  }

  /**
   * Atualiza métricas de saúde
   */
  async updateHealthMetrics(id: string, data: any) {
    return this.patch(`/students/${id}/health`, data);
  }

  /**
   * Adiciona observação pública
   */
  async addPublicObservation(
    id: string,
    data: {
      observation: string;
    },
  ) {
    return this.post(`/students/${id}/observations`, data);
  }

  /**
   * Adiciona observação privada
   */
  async addPrivateObservation(
    id: string,
    data: {
      observation: string;
    },
  ) {
    return this.post(`/students/${id}/observations/private`, data);
  }

  // ========== N8N WEBHOOKS ENDPOINTS ==========

  /**
   * Verifica status dos webhooks
   */
  async getWebhooksStatus() {
    return this.get("/n8n-webhooks/status");
  }

  /**
   * Testa conectividade do webhook
   */
  async testWebhook() {
    return this.post("/n8n-webhooks/test");
  }
}

// Instância única do API client
export const apiClient = new ApiClient();

// Export tipos úteis
export type { ApiError, TokenResponse };
