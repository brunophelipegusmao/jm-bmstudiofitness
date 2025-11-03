"use client";

import { useUserRole } from "@/hooks/useUserRole";

interface RoleBasedContentProps {
  children: React.ReactNode;
  roles: ("admin" | "professor" | "funcionario" | "aluno")[];
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
}

export function RoleBasedContent({
  children,
  roles,
  fallback = null,
  loading = null,
}: RoleBasedContentProps) {
  const { user, loading: isLoading } = useUserRole();

  if (isLoading) {
    return loading || <div>Carregando...</div>;
  }

  if (
    !user ||
    !roles.includes(
      user.role as "admin" | "professor" | "funcionario" | "aluno",
    )
  ) {
    return fallback;
  }

  return <>{children}</>;
}

// Componentes específicos para cada papel
export function AdminOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleBasedContent roles={["admin"]} fallback={fallback}>
      {children}
    </RoleBasedContent>
  );
}

export function FuncionarioOrAdmin({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleBasedContent roles={["admin", "funcionario"]} fallback={fallback}>
      {children}
    </RoleBasedContent>
  );
}

export function ProfessorOrAdmin({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleBasedContent roles={["admin", "professor"]} fallback={fallback}>
      {children}
    </RoleBasedContent>
  );
}

export function StaffMembers({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleBasedContent
      roles={["admin", "professor", "funcionario"]}
      fallback={fallback}
    >
      {children}
    </RoleBasedContent>
  );
}
