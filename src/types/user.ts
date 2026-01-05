import { UserRole } from "./user-roles";

export type { UserRole } from "./user-roles";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cpf?: string;
  telephone?: string;
  address?: string;
  bornDate?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  sex?: "masculino" | "feminino";
  cpf?: string;
  telephone?: string;
  address?: string;
  bornDate?: string;
}

export interface UpdateUserData {
  id: string;
  name?: string;
  email?: string;
  role?: UserRole;
  cpf?: string;
  telephone?: string;
  address?: string;
  bornDate?: string;
  isActive?: boolean;
}

export const USER_ROLES: Record<UserRole, string> = {
  [UserRole.MASTER]: "Master",
  [UserRole.ADMIN]: "Administrador",
  [UserRole.FUNCIONARIO]: "Funcionário",
  [UserRole.PROFESSOR]: "Professor",
  [UserRole.ALUNO]: "Aluno",
} as const;

export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.MASTER]:
    "Acesso total ao sistema, pode alternar entre perfis master/admin",
  [UserRole.ADMIN]:
    "Acesso total ao sistema, pode gerenciar usuários e configurações",
  [UserRole.FUNCIONARIO]:
    "Acesso ao sistema de gestão, pode gerenciar alunos e relatórios",
  [UserRole.PROFESSOR]: "Acesso aos alunos designados e sistema de treinos",
  [UserRole.ALUNO]: "Acesso limitado aos próprios dados e treinos",
} as const;
