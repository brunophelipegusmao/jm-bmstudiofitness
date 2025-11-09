// Mock para dados de estudantes
export const mockStudentData = {
  userId: "test-user-id",
  name: "João Silva",
  email: "joao@test.com",
  cpf: "123.456.789-10",
  telephone: "(11) 99999-9999",
  address: "Rua Teste, 123",
  isPaymentUpToDate: true,
  createdAt: new Date("2023-01-01"),
  plan: "Mensal",
};

// Mock para múltiplos estudantes
export const mockStudentsData = [
  {
    ...mockStudentData,
    userId: "student-1",
    name: "João Silva",
    email: "joao@test.com",
    isPaymentUpToDate: true,
  },
  {
    ...mockStudentData,
    userId: "student-2",
    name: "Maria Santos",
    email: "maria@test.com",
    cpf: "987.654.321-00",
    isPaymentUpToDate: false,
  },
  {
    ...mockStudentData,
    userId: "student-3",
    name: "Pedro Costa",
    email: "pedro@test.com",
    cpf: "111.222.333-44",
    isPaymentUpToDate: true,
  },
];

// Mock para usuário admin
export const mockAdminUser = {
  id: "admin-1",
  email: "admin@test.com",
  name: "Admin Usuario",
  role: "admin" as const,
};

// Mock para usuário funcionário
export const mockEmployeeUser = {
  id: "employee-1",
  email: "funcionario@test.com",
  name: "Funcionário Usuario",
  role: "funcionário" as const,
};

// Mock para usuário professor
export const mockProfessorUser = {
  id: "professor-1",
  email: "professor@test.com",
  name: "Professor Usuario",
  role: "professor" as const,
};

// Mock para dados de check-in
export const mockCheckinData = {
  id: "checkin-1",
  userId: "student-1",
  timestamp: new Date(),
  location: "Estúdio Central",
};

// Helper para criar mocks de funções
export const createMockFunction = <T extends (...args: unknown[]) => unknown>(
  returnValue?: ReturnType<T>,
) => {
  return jest.fn().mockResolvedValue(returnValue);
};
