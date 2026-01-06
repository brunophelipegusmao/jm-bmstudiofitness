/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API Client para integracao com Backend NestJS
 * Base URL: http://localhost:3001/api
 */

const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function resolveBaseUrl() {
  // Em navegador, preferimos URL absoluta via env; caso contrário, usamos o backend padrão (evita depender de proxy /api).
  if (typeof window !== "undefined") {
    if (
      process.env.NEXT_PUBLIC_API_URL &&
      /^https?:\/\//.test(process.env.NEXT_PUBLIC_API_URL)
    ) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    return DEFAULT_API_URL;
  }

  // Em SSR/Node, respeita variaveis de ambiente ou fallback local
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
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
  private serverTokensLoaded = false;

  constructor(baseUrl: string = resolveBaseUrl()) {
    this.baseUrl = baseUrl;

    // Carregar tokens do localStorage ao inicializar
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken");
      this.refreshToken = localStorage.getItem("refreshToken");
    }
  }

  /**
   * Em ambiente server (SSR/actions), tenta carregar tokens dos cookies uma vez.
   * Ignora erros quando o contexto Next.js não estiver disponível (ex.: scripts).
   */
  private async ensureServerTokens() {
    if (typeof window !== "undefined" || this.serverTokensLoaded) return;

    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      this.accessToken =
        this.accessToken || cookieStore.get("accessToken")?.value || null;
      this.refreshToken =
        this.refreshToken || cookieStore.get("refreshToken")?.value || null;
      this.serverTokensLoaded = true;
    } catch (error) {
      // Em execução fora do App Router não há cookies(); apenas segue sem tokens.
      this.serverTokensLoaded = true;
    }
  }

  /**
   * Salva tokens no localStorage e na instancia
   */
  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      const hostname = window.location.hostname;
      const isProductionDomain = hostname.includes("jmfitnessstudio.com.br");
      const cookieParts = [
        `accessToken=${accessToken}`,
        "path=/",
        `max-age=${60 * 60 * 24 * 7}`,
      ];

      if (isProductionDomain) {
        cookieParts.push(
          "domain=.jmfitnessstudio.com.br",
          "secure",
          "samesite=lax",
        );
      }

      document.cookie = cookieParts.join("; ");
    }
  }

  /**
   * Remove tokens do localStorage e da instancia
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      const hostname = window.location.hostname;
      const isProductionDomain = hostname.includes("jmfitnessstudio.com.br");
      const cookieParts = [
        "accessToken=;",
        "path=/",
        "expires=Thu, 01 Jan 1970 00:00:00 GMT",
      ];

      if (isProductionDomain) {
        cookieParts.push(
          "domain=.jmfitnessstudio.com.br",
          "secure",
          "samesite=lax",
        );
      }

      document.cookie = cookieParts.join("; ");
    }
  }

  /**
   * Obtem o access token atual
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
   * Metodo principal para fazer requisicoes a API
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    await this.ensureServerTokens();
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    // Adiciona token de autenticacao se disponivel
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
          headers["Authorization"] = `Bearer ${this.accessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        } else {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new Error("Sessao expirada");
        }
      }

      if (!response.ok) {
        const text = await response.text();
        try {
          const error: ApiError = JSON.parse(text);
          throw new Error(error.message || "Erro na requisicao");
        } catch {
          if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
            throw new Error(
              "A API retornou HTML. Verifique se o backend está rodando e se NEXT_PUBLIC_API_URL aponta para ele.",
            );
          }
          throw new Error(
            `Erro na requisicao (status ${response.status}): ${text.slice(0, 200)}`,
          );
        }
      }

      const text = await response.text();
      try {
        return JSON.parse(text) as T;
      } catch {
        if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
          throw new Error(
            "A API retornou HTML em vez de JSON. Verifique NEXT_PUBLIC_API_URL e o backend.",
          );
        }
        throw new Error(
          `Resposta da API não é JSON válido (status ${response.status}). Conteúdo: ${text.slice(0, 200)}`,
        );
      }
    } catch (error) {
      console.error("Erro na requisicao:", error);
      throw error;
    }
  }

  /**
   * Requisicao para binarios (PDF, etc)
   */
  async requestBinary(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ArrayBuffer> {
    await this.ensureServerTokens();
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401 && this.refreshToken) {
      const renewed = await this.refreshAccessToken();
      if (renewed) {
        headers["Authorization"] = `Bearer ${this.accessToken}`;
        response = await fetch(url, { ...options, headers });
      }
    }

    if (!response.ok) {
      let message = "Erro na requisicao";
      try {
        const err = await response.json();
        message = (err as ApiError).message ?? message;
      } catch {
        /* ignore */
      }
      throw new Error(message);
    }

    return await response.arrayBuffer();
  }

  /** GET */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  /** POST */
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

  /** PATCH */
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

  /** PUT */
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

  /** DELETE */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }

  // ========== AUTH ENDPOINTS ==========

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

  async login(data: {
    login: string;
    password: string;
    mode?: "master" | "admin";
  }): Promise<TokenResponse> {
    const response = await this.post<TokenResponse>("/auth/login", data);
    this.setTokens(response.accessToken, response.refreshToken);
    return response;
  }

  async getProfile(): Promise<TokenResponse["user"]> {
    return this.get("/auth/me");
  }

  logout() {
    this.clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  // ... demais metodos preservados ...

  async listUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.get(`/users?${queryParams}`);
  }

  async getUserById(id: string) {
    return this.get(`/users/${id}`);
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    cpf: string;
    role: string;
  }) {
    return this.post("/users", data);
  }

  async updateUser(id: string, data: any) {
    return this.patch(`/users/${id}`, data);
  }

  async changePassword(
    id: string,
    data: { currentPassword: string; newPassword: string },
  ) {
    return this.patch(`/users/${id}/password`, data);
  }

  async deleteUser(id: string) {
    return this.delete(`/users/${id}`);
  }

  // FINANCIAL

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

  async createFinancial(data: {
    userId: string;
    amount: number;
    dueDate: string;
    description?: string;
    type?: string;
  }) {
    return this.post("/financial", data);

  async markAsPaid(
    id: string,
    data: {
      paymentDate: string;
      paymentMethod?: string;
    },
  ) {
    return this.post(`/financial/${id}/mark-paid`, data);
  }

  async getMonthlyReport(year: number, month: number) {
    return this.get(`/financial/report/${year}/${month}`);
  }

  // CHECK-INS

  async listCheckIns(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.get(`/check-ins?${queryParams}`);
  }

  async createCheckIn(data: { userId: string; checkInBy?: string }) {
    return this.post("/check-ins", data);
  }

  async getTodayCheckIns() {
    return this.get("/check-ins/today");
  }

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

  async getUserCheckInStats(userId: string) {
    return this.get(`/check-ins/user/${userId}/stats`);
  }

  // STUDENTS

  async listStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.get(`/students?${queryParams}`);
  }

  async getStudentById(id: string) {
    return this.get(`/students/${id}`);
  }

  async getStudentHealth(id: string) {
    return this.get(`/students/${id}/health`);
  }

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

  async updateHealthMetrics(id: string, data: any) {
    return this.patch(`/students/${id}/health`, data);
  }

  async addPublicObservation(id: string, data: { observation: string }) {
    return this.post(`/students/${id}/observations`, data);
  }

  async addPrivateObservation(id: string, data: { observation: string }) {
    return this.post(`/students/${id}/observations/private`, data);
  }

  // WEBHOOKS

  async getWebhooksStatus() {
    return this.get("/n8n-webhooks/status");
  }

  async testWebhook() {
    return this.post("/n8n-webhooks/test");
  }
}

export const apiClient = new ApiClient();
export type { ApiError, TokenResponse };
