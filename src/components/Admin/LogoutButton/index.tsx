"use client";

import { LogOut, User } from "lucide-react";
import { useState } from "react";

import { logoutAction } from "@/actions/auth/logout-action";
import { Button } from "@/components/Button";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useCurrentUser();

  const handleLogout = async () => {
    if (confirm("Tem certeza que deseja sair?")) {
      setIsLoading(true);
      try {
        await logoutAction();
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        setIsLoading(false);
      }
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "professor":
        return "Professor";
      case "funcionario":
        return "Funcionário";
      default:
        return role;
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Indicador de usuário logado */}
      {!loading && user && (
        <div className="hidden items-center gap-2 text-sm text-[#C2A537] sm:flex">
          <User className="h-4 w-4" />
          <div className="text-right">
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-[#C2A537]/70">
              {getRoleLabel(user.role)}
            </div>
          </div>
        </div>
      )}

      {/* Botão de logout */}
      <Button
        onClick={handleLogout}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="border-[#C2A537] text-[#C2A537] hover:bg-[#C2A537] hover:text-black"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">
          {isLoading ? "Saindo..." : "Sair"}
        </span>
      </Button>
    </div>
  );
}
