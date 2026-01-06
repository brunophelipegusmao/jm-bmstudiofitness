"use client";

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api-client";

interface UserInfo {
  id?: string;
  name: string;
  email: string;
  role: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Prefer header-based chamada com tokens do apiClient (independe de cookie domain)
        const profile = await apiClient.getProfile();
        setUser(profile as UserInfo);
        return;
      } catch (error) {
        console.error(
          "Erro ao buscar informações do usuário via apiClient:",
          error,
        );

        // Fallback: tenta rota local que lê cookie accessToken
        try {
          const response = await fetch("/api/auth/me");
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        } catch (fallbackError) {
          console.error("Erro no fallback /api/auth/me:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return { user, loading };
}
