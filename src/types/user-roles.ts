// Tipos de usuários e suas permissões no sistema

export enum UserRole {
  ADMIN = "admin",
  PROFESSOR = "professor",
  FUNCIONARIO = "funcionario",
  ALUNO = "aluno",
}

export interface PermissionConditions {
  userType?: string;
  targetUserType?: string;
  ownData?: boolean;
  excludeFields?: string[];
}

export interface PermissionContext {
  userId?: string;
  targetUserId?: string;
  userType?: string;
  targetUserType?: string;
}

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: PermissionConditions;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

// Definição das permissões por tipo de usuário
export const USER_PERMISSIONS: RolePermissions[] = [
  {
    role: UserRole.ADMIN,
    description: "Acesso total ao sistema",
    permissions: [
      {
        resource: "users",
        actions: ["create", "read", "update", "delete"],
      },
      {
        resource: "personalData",
        actions: ["create", "read", "update", "delete"],
      },
      {
        resource: "healthMetrics",
        actions: ["create", "read", "update", "delete"],
      },
      {
        resource: "financial",
        actions: ["create", "read", "update", "delete"],
      },
      {
        resource: "coachObservationsParticular",
        actions: ["create", "read", "update", "delete"],
      },
    ],
  },
  {
    role: UserRole.PROFESSOR,
    description: "Acesso aos dados dos alunos, exceto financeiros",
    permissions: [
      {
        resource: "users",
        actions: ["read"],
        conditions: { userType: "aluno" },
      },
      {
        resource: "personalData",
        actions: ["create", "read", "update"],
        conditions: { targetUserType: "aluno" },
      },
      {
        resource: "healthMetrics",
        actions: ["create", "read", "update"],
        conditions: { targetUserType: "aluno" },
      },
      {
        resource: "financial",
        actions: [], // Sem acesso aos dados financeiros
      },
      {
        resource: "coachObservationsParticular",
        actions: ["create", "read", "update"],
        conditions: { targetUserType: "aluno" },
      },
    ],
  },
  {
    role: UserRole.FUNCIONARIO,
    description:
      "Acesso parcial ao sistema - gerenciamento de alunos e financeiro",
    permissions: [
      {
        resource: "users",
        actions: ["create", "read", "update"],
        conditions: { targetUserType: "aluno" },
      },
      {
        resource: "personalData",
        actions: ["create", "read", "update"],
        conditions: { targetUserType: "aluno" },
      },
      {
        resource: "healthMetrics",
        actions: ["create", "read", "update"],
        conditions: {
          targetUserType: "aluno",
          excludeFields: ["coachObservationsParticular"],
        },
      },
      {
        resource: "financial",
        actions: ["create", "read", "update"],
        conditions: { targetUserType: "aluno" },
      },
      {
        resource: "coachObservationsParticular",
        actions: [], // Sem acesso às observações particulares do coach
      },
    ],
  },
  {
    role: UserRole.ALUNO,
    description: "Visualização dos próprios dados, edição limitada",
    permissions: [
      {
        resource: "users",
        actions: ["read"],
        conditions: { ownData: true },
      },
      {
        resource: "personalData",
        actions: ["read", "update"],
        conditions: { ownData: true },
      },
      {
        resource: "healthMetrics",
        actions: ["read"],
        conditions: {
          ownData: true,
          excludeFields: ["coachObservationsParticular"],
        },
      },
      {
        resource: "financial",
        actions: ["read"],
        conditions: { ownData: true },
      },
      {
        resource: "coachObservationsParticular",
        actions: [], // Não pode ver observações particulares do coach
      },
    ],
  },
];

// Helper functions para verificar permissões
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string,
  context?: PermissionContext,
): boolean {
  const rolePermissions = USER_PERMISSIONS.find((rp) => rp.role === userRole);
  if (!rolePermissions) return false;

  const resourcePermission = rolePermissions.permissions.find(
    (p) => p.resource === resource,
  );
  if (!resourcePermission) return false;

  if (!resourcePermission.actions.includes(action)) return false;

  // Verificar condições se existirem
  if (resourcePermission.conditions && context) {
    return checkConditions(resourcePermission.conditions, context);
  }

  return true;
}

export function checkConditions(
  conditions: PermissionConditions,
  context: PermissionContext,
): boolean {
  return Object.entries(conditions).every(([key, value]) => {
    if (key === "ownData") {
      return context.userId === context.targetUserId;
    }
    if (key === "userType") {
      return context.userType === value;
    }
    if (key === "targetUserType") {
      return context.targetUserType === value;
    }
    if (key === "excludeFields") {
      return true; // excludeFields é tratado separadamente
    }
    return false;
  });
}

// Função para obter campos permitidos para visualização
export function getAllowedFields(
  userRole: UserRole,
  resource: string,
): string[] | null {
  const rolePermissions = USER_PERMISSIONS.find((rp) => rp.role === userRole);
  if (!rolePermissions) return null;

  const resourcePermission = rolePermissions.permissions.find(
    (p) => p.resource === resource,
  );
  if (!resourcePermission) return null;

  if (!resourcePermission.actions.includes("read")) return null;

  // Se há campos excluídos nas condições
  if (resourcePermission.conditions?.excludeFields) {
    return resourcePermission.conditions.excludeFields;
  }

  return null; // null significa todos os campos são permitidos
}
