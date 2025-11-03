// Middleware e helpers para controle de acesso baseado em roles

import {
  getAllowedFields,
  hasPermission,
  PermissionContext,
  UserRole,
} from "./user-roles";

export class AccessControlError extends Error {
  constructor(
    message: string,
    public code: string = "ACCESS_DENIED",
  ) {
    super(message);
    this.name = "AccessControlError";
  }
}

export interface UserSession {
  id: string;
  role: UserRole;
  name: string;
}

export class PermissionChecker {
  constructor(private user: UserSession) {}

  // Verifica se o usuário pode realizar uma ação em um recurso
  can(action: string, resource: string, context?: PermissionContext): boolean {
    const permissionContext: PermissionContext = {
      userId: this.user.id,
      userType: this.user.role,
      ...context,
    };

    return hasPermission(this.user.role, resource, action, permissionContext);
  }

  // Verifica permissão e lança erro se não autorizado
  authorize(
    action: string,
    resource: string,
    context?: PermissionContext,
  ): void {
    if (!this.can(action, resource, context)) {
      throw new AccessControlError(
        `Usuário ${this.user.role} não tem permissão para ${action} em ${resource}`,
        "INSUFFICIENT_PERMISSIONS",
      );
    }
  }

  // Verifica se pode acessar dados de outro usuário
  canAccessUserData(targetUserId: string): boolean {
    if (this.user.role === UserRole.ADMIN) return true;
    if (this.user.role === UserRole.PROFESSOR) return true;
    if (this.user.role === UserRole.FUNCIONARIO) return true;
    return this.user.id === targetUserId; // Aluno só pode acessar próprios dados
  }

  // Obtém campos que o usuário pode visualizar
  getAllowedFieldsForResource(resource: string): string[] | null {
    return getAllowedFields(this.user.role, resource);
  }

  // Filtra dados baseado nas permissões do usuário
  filterSensitiveData<T extends Record<string, unknown>>(
    data: T,
    resource: string,
  ): Partial<T> {
    const excludedFields = this.getAllowedFieldsForResource(resource);

    if (!excludedFields) return data; // Se null, todos os campos são permitidos

    const filteredData = { ...data };
    excludedFields.forEach((field) => {
      delete filteredData[field];
    });

    return filteredData;
  }

  // Verifica se é admin
  isAdmin(): boolean {
    return this.user.role === UserRole.ADMIN;
  }

  // Verifica se é professor
  isProfessor(): boolean {
    return this.user.role === UserRole.PROFESSOR;
  }

  // Verifica se é funcionário
  isFuncionario(): boolean {
    return this.user.role === UserRole.FUNCIONARIO;
  }

  // Verifica se é aluno
  isAluno(): boolean {
    return this.user.role === UserRole.ALUNO;
  }
}

// Helper para criar checker de permissões
export function createPermissionChecker(user: UserSession): PermissionChecker {
  return new PermissionChecker(user);
}

// Decorador para verificar permissões em métodos (para uso futuro)
// Nota: Para usar este decorador, a classe deve ter uma propriedade permissionChecker
export function RequirePermission(action: string, resource: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (
      this: { permissionChecker: PermissionChecker },
      ...args: unknown[]
    ) {
      if (!this.permissionChecker) {
        throw new AccessControlError("PermissionChecker não inicializado");
      }

      this.permissionChecker.authorize(action, resource);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Tipos para facilitar o uso
export type PermissionAction = "create" | "read" | "update" | "delete";
export type ResourceType =
  | "users"
  | "personalData"
  | "healthMetrics"
  | "financial"
  | "coachObservationsParticular";

// Constantes para facilitar o uso
export const ACTIONS = {
  CREATE: "create" as PermissionAction,
  READ: "read" as PermissionAction,
  UPDATE: "update" as PermissionAction,
  DELETE: "delete" as PermissionAction,
} as const;

export const RESOURCES = {
  USERS: "users" as ResourceType,
  PERSONAL_DATA: "personalData" as ResourceType,
  HEALTH_METRICS: "healthMetrics" as ResourceType,
  FINANCIAL: "financial" as ResourceType,
  COACH_OBSERVATIONS: "coachObservationsParticular" as ResourceType,
} as const;
