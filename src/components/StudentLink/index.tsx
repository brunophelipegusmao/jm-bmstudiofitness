"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface StudentLinkProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

interface UserData {
  role: "admin" | "professor" | "funcionario" | "aluno";
  email: string;
  name: string;
}

export function StudentLink({
  className,
  children,
  onClick,
}: StudentLinkProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [destination, setDestination] = useState("/user/login");

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
          if (userData.role === "aluno") {
            setDestination("/user/dashboard"); // Aluno = vai direto para dashboard
          } else {
            // Outros roles (admin, professor, funcionario) não têm acesso - vai para login
            setDestination("/user/login");
          }
        } else {
          // Não autenticado ou erro - vai para login
          setDestination("/user/login");
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        setDestination("/user/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link href={destination} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
