"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/contexts/AuthContext";

const AdminPage = () => {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Se jÁ estiver autenticado, vá direto para o dashboard
    if (!loading && isAuthenticated) {
      router.replace("/admin/dashboard");
      return;
    }

    // Fallback: se houver cookie de accessToken, também segue para dashboard
    if (typeof document !== "undefined") {
      const hasCookie = document.cookie
        .split(";")
        .map((c) => c.trim())
        .some((c) => c.startsWith("accessToken="));
      if (hasCookie) {
        router.replace("/admin/dashboard");
        return;
      }
    }

    // Caso não esteja autenticado, envia para login
    router.replace("/admin/login");
  }, [isAuthenticated, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-lg text-[#C2A537]">Redirecionando para login...</div>
    </div>
  );
};

export default AdminPage;
