// Tipos de dados de estudantes e usuários

export interface StudentFullData {
  id: string;
  name: string;
  email: string;
  cpf: string;
  telephone: string;
  sex: "masculino" | "feminino";
  bornDate: Date;
  address: string;
  role: string;
  planId: string | null;
  planName: string | null;
  planValue: number | null;
  paymentDueDay: number | null;
  active: boolean;
  deletedAt: Date | null;
  createdAt: Date;
}

export interface EmployeeData {
  id: string;
  name: string;
  email: string;
  cpf: string;
  telephone: string;
  sex: "masculino" | "feminino";
  bornDate: Date;
  address: string;
  role: string;
  active: boolean;
  deletedAt: Date | null;
  createdAt: Date;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  cpf: string;
  telephone: string;
  sex: "masculino" | "feminino";
  bornDate: Date;
  address: string;
  role: "admin" | "student" | "coach" | "employee";
  active: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckInData {
  id: string;
  userId: string;
  userName: string;
  checkInTime: Date;
  checkInBy: string | null;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  totalRevenue: number;
  pendingPayments: number;
  checkInsToday: number;
  checkInsThisMonth: number;
}
