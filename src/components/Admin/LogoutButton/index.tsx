"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

import { logoutAction } from "@/actions/auth/logout-action";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { showErrorToast,showSuccessToast } from "@/components/ToastProvider";
import { UserAvatar } from "@/components/UserAvatar";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { clientLogout } from "@/lib/client-logout";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useCurrentUser();
  const { confirm, isOpen, options, handleConfirm, handleCancel } =
    useConfirmDialog();

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Confirmar Logout",
      message:
        "Tem certeza que deseja sair do sistema? Você precisará fazer login novamente para acessar sua conta.",
      confirmText: "Sair",
      cancelText: "Cancelar",
      type: "warning",
    });

    if (confirmed) {
      setIsLoading(true);
      try {
        const result = await logoutAction();
        if (result.success) {
          showSuccessToast("Logout realizado com sucesso! Até logo! 👋");
          // Aguarda um momento para mostrar o toast
          setTimeout(() => {
            clientLogout();
          }, 1000);
        } else {
          // Se o servidor falhar, faz logout do lado do cliente
          showSuccessToast("Logout realizado com sucesso! Até logo! 👋");
          setTimeout(() => {
            clientLogout();
          }, 1000);
        }
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        // Em caso de erro, ainda assim faz logout do lado do cliente
        showSuccessToast("Logout realizado! Até logo! 👋");
        setTimeout(() => {
          clientLogout();
        }, 1000);
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
      {/* Avatar e informações do usuário */}
      {!loading && user && (
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name} size="sm" />
          <div className="hidden text-right text-sm text-[#C2A537] sm:block">
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

      {/* Dialog de confirmação */}
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        type={options.type}
      />
    </div>
  );
}
