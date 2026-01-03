"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

import { logoutAction } from "@/actions/auth/logout-action";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { showErrorToast, showSuccessToast } from "@/components/ToastProvider";
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
          setTimeout(() => {
            clientLogout();
          }, 1000);
        } else {
          showSuccessToast("Logout realizado com sucesso! Até logo! 👋");
          setTimeout(() => {
            clientLogout();
          }, 1000);
        }
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        showErrorToast("Não foi possível finalizar o logout. Tente novamente.");
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
      case "master":
        return "Master";
      case "employee":
      case "funcionario":
        return "Funcionário";
      case "professor":
        return "Professor";
      default:
        return role;
    }
  };

  return (
    <div className="flex items-center gap-3">
      {!loading && user && (
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name} size="sm" />
          <div className="text-sm text-[#C2A537]">
            <div className="font-medium">{getRoleLabel(user.role)}</div>
          </div>
        </div>
      )}

      <Button
        onClick={handleLogout}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="border-[#C2A537] text-[#C2A537] hover:bg-[#C2A537] hover:text-black"
      >
        <LogOut className="h-4 w-4" />
        <span className="ml-2">{isLoading ? "Saindo..." : "Sair"}</span>
      </Button>

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
