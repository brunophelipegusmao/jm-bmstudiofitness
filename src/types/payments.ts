// Tipos relacionados a pagamentos

export interface StudentPaymentData {
  id: string;
  name: string;
  email: string;
  telephone: string;
  planName: string;
  planValue: number;
  paid: boolean;
  paymentDate?: Date | null;
  dueDate: Date;
  lateDate?: Date | null;
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
}
