// Tipos relacionados a pagamentos

export interface StudentPaymentData {
  id: string;
  userId?: string;
  name: string;
  email: string;
  cpf?: string;
  telephone: string;
  planName: string;
  planValue: number;
  paid: boolean;
  isUpToDate?: boolean;
  paymentDate?: Date | null;
  lastPaymentDate?: Date | null;
  dueDate: Date | number;
  lateDate?: Date | null;
  monthlyFeeValueInCents?: number;
  formattedValue?: string;
}

export interface PaymentReport {
  month: string;
  year: number;
  totalStudents: number;
  paidStudents: number;
  pendingStudents: number;
  totalRevenue: number;
  pendingRevenue: number;
  students: StudentPaymentData[];
}

export interface FinancialReportData {
  period: string;
  totalRevenue: number;
  pendingRevenue: number;
  paidCount: number;
  pendingCount: number;
  payments: StudentPaymentData[];
  overview?: {
    totalStudents: number;
    activeStudents: number;
    totalRevenue: string;
    pendingPayments: string;
    monthlyGrowth: number;
    paymentRate: number;
  };
  recentPayments?: Array<{
    studentName: string;
    amount: string;
    date: string;
    status: "paid" | "pending" | "late";
  }>;
  monthlyData?: Array<{
    month: string;
    revenue: number;
    students: number;
  }>;
}
