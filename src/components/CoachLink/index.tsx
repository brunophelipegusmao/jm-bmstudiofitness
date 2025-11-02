"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface CoachLinkProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

interface UserData {
  role: "admin" | "professor" | "aluno";
  email: string;
  name: string;
}

export function CoachLink({ className, children, onClick }: CoachLinkProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [destination, setDestination] = useState("/coach/login");

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
          if (userData.role === "admin" || userData.role === "professor") {
            setDestination("/coach"); // Admin ou Professor = vai direto para área do coach
          } else {
            // Outros roles (aluno) não têm acesso - vai para login
            setDestination("/coach/login");
          }
        } else {
          // Não autenticado ou erro - vai para login
          setDestination("/coach/login");
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setDestination("/coach/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Mostra loading state brevemente
  if (isLoading) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link href={destination} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
