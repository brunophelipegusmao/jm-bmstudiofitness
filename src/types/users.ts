// Tipos de dados de estudantes e usuários

export interface StudentFullData {
  id: string;
  userId: string;
  name: string;
  email: string;
  cpf: string;
  telephone: string;
  sex: "masculino" | "feminino";
  bornDate: Date | string;
  address: string;
  role: string;
  userRole?: string;
  planId: string | null;
  planName: string | null;
  planValue: number | null;
  paymentDueDay: number | null;
  active: boolean;
  deletedAt: Date | null;
  createdAt: Date | string;

  // Dados calculados
  age?: number;
  formattedMonthlyFee?: string;

  // Dados de saúde
  heightCm?: number | string;
  weightKg?: number | string;
  bloodType?: string;
  hasPracticedSports?: boolean;
  lastExercise?: string;
  sportsHistory?: string;
  historyDiseases?: string;
  medications?: string;
  allergies?: string;
  injuries?: string;
  alimentalRoutine?: string;
  diaryRoutine?: string;
  useSupplements?: boolean;
  whatSupplements?: string;
  otherNotes?: string;
  coachaObservations?: string;
  coachObservationsParticular?: string;
  healthUpdatedAt?: Date | string;

  // Dados financeiros
  monthlyFeeValueInCents?: number;
  paymentMethod?: string;
  dueDate?: number;
  paid?: boolean;
  isPaymentUpToDate?: boolean;
  lastPaymentDate?: Date | string | null;
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
