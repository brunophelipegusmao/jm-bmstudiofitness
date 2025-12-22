"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = apiClient.getAccessToken();

      if (!token) {
        setLoading(false);
        return;
      }

      const profile = await apiClient.getProfile();
      setUser(profile);
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      const response = await apiClient.login({ login: email, password });
      setUser(response.user);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async function register(data: {
    email: string;
    password: string;
    name: string;
    cpf: string;
  }) {
    try {
      const response = await apiClient.register({ ...data, role: "ALUNO" });
      setUser(response.user);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  function logout() {
    apiClient.logout();
    setUser(null);
    router.push("/login");
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkAuth,
  };
}
