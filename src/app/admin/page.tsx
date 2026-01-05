"use client";

import { Dumbbell } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-black text-[#C2A537]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full border-2 border-[#C2A537]/20" />
          <div className="absolute inset-2 rounded-full border border-[#C2A537]/40 blur-[1px]" />
          <Dumbbell className="h-10 w-10 animate-bounce" strokeWidth={1.75} />
        </div>
        <span className="sr-only">Redirecionando para login...</span>
      </div>
    </div>
  );
};

export default AdminPage;
