"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";

export function useUserRole() {
  const { user, loading } = useCurrentUser();

  return {
    user,
    loading,
    isAdmin: user?.role === "admin",
    isProfessor: user?.role === "professor",
    isFuncionario: user?.role === "funcionario",
    isAluno: user?.role === "aluno",
    // Helpers para permissões específicas
    canAccessAdminArea: user?.role === "admin" || user?.role === "funcionario",
    canAccessFinancial: user?.role === "admin" || user?.role === "funcionario",
    canCreateUsers:
      user?.role === "admin" ||
      user?.role === "professor" ||
      user?.role === "funcionario",
    canAccessCoachArea: user?.role === "admin" || user?.role === "professor",
    // Só admin tem acesso total (pode deletar, configurações avançadas, etc.)
    hasFullAccess: user?.role === "admin",
  };
}
