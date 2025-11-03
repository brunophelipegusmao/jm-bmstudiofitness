"use client";

import { useEffect, useState } from "react";

interface AdminLinkProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

interface UserData {
  role: "admin" | "professor" | "funcionario" | "aluno";
  email: string;
  name: string;
}

export function AdminLink({ className, children, onClick }: AdminLinkProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [destination, setDestination] = useState("/admin/login");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // Inclui cookies
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const userData: UserData = await response.json();

          // Determina destino baseado no role
          if (userData.role === "admin" || userData.role === "funcionario") {
            setDestination("/admin/dashboard"); // Admin ou Funcionário = vai direto para dashboard administrativo
          } else {
            // Outros roles não têm acesso à área administrativa - vai para login
            setDestination("/admin/login");
          }
        } else {
          // Não autenticado ou erro - vai para login
          setDestination("/admin/login");
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setDestination("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleClick = () => {
    if (onClick) onClick();
    if (!isLoading) {
      window.location.href = destination;
    }
  };

  return (
    <button onClick={handleClick} className={className} disabled={isLoading}>
      {children}
    </button>
  );
}
