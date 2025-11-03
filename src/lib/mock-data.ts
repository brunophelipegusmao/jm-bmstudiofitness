// Mock data para uso em deploy sem banco de dados

export const mockStudentsData = [
  {
    userId: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    cpf: "123.456.789-01",
    telephone: "(11) 99999-1111",
    address: "Rua das Flores, 123 - São Paulo/SP",
    bornDate: "1990-05-15",
    createdAt: "2024-01-15T10:00:00Z",
    isPaymentUpToDate: true,
    shift: "Manhã",
    healthMetrics: {
      heightCm: 180,
      weightKg: 75,
      bloodType: "O+",
      updatedAt: "2024-11-01T10:00:00Z",
    },
    financial: {
      paid: true,
      monthlyFeeValueInCents: 12000,
      dueDate: 15,
      lastPaymentDate: "2024-10-15",
    },
    checkIns: [
      {
        id: "1",
        checkInDate: "2024-11-01",
        checkInTime: "08:30:00",
        method: "QR Code",
      },
      {
        id: "2",
        checkInDate: "2024-10-30",
        checkInTime: "09:15:00",
        method: "QR Code",
      },
      {
        id: "3",
        checkInDate: "2024-10-28",
        checkInTime: "08:45:00",
        method: "Manual",
      },
    ],
  },
  {
    userId: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    cpf: "987.654.321-01",
    telephone: "(11) 99999-2222",
    address: "Av. Principal, 456 - São Paulo/SP",
    bornDate: "1985-08-22",
    createdAt: "2024-02-10T14:30:00Z",
    isPaymentUpToDate: false,
    shift: "Tarde",
    healthMetrics: {
      heightCm: 165,
      weightKg: 62,
      bloodType: "A+",
      updatedAt: "2024-10-15T14:00:00Z",
    },
    financial: {
      paid: false,
      monthlyFeeValueInCents: 12000,
      dueDate: 10,
      lastPaymentDate: "2024-09-10",
    },
    checkIns: [
      {
        id: "4",
        checkInDate: "2024-10-25",
        checkInTime: "14:20:00",
        method: "QR Code",
      },
      {
        id: "5",
        checkInDate: "2024-10-23",
        checkInTime: "15:00:00",
        method: "QR Code",
      },
    ],
  },
  {
    userId: "3",
    name: "Carlos Oliveira",
    email: "carlos.oliveira@email.com",
    cpf: "456.789.123-01",
    telephone: "(11) 99999-3333",
    address: "Rua Central, 789 - São Paulo/SP",
    bornDate: "1992-12-03",
    createdAt: "2024-03-05T16:45:00Z",
    isPaymentUpToDate: true,
    shift: "Noite",
    healthMetrics: {
      heightCm: 175,
      weightKg: 80,
      bloodType: "B+",
      updatedAt: "2024-11-01T16:00:00Z",
    },
    financial: {
      paid: true,
      monthlyFeeValueInCents: 12000,
      dueDate: 5,
      lastPaymentDate: "2024-11-05",
    },
    checkIns: [
      {
        id: "6",
        checkInDate: "2024-11-01",
        checkInTime: "19:30:00",
        method: "QR Code",
      },
      {
        id: "7",
        checkInDate: "2024-10-31",
        checkInTime: "20:00:00",
        method: "Manual",
      },
      {
        id: "8",
        checkInDate: "2024-10-29",
        checkInTime: "19:45:00",
        method: "QR Code",
      },
    ],
  },
  {
    userId: "4",
    name: "Ana Costa",
    email: "ana.costa@email.com",
    cpf: "789.123.456-01",
    telephone: "(11) 99999-4444",
    address: "Rua Nova, 321 - São Paulo/SP",
    bornDate: "1988-04-18",
    createdAt: "2024-01-20T09:15:00Z",
    isPaymentUpToDate: true,
    shift: "Manhã",
    healthMetrics: {
      heightCm: 160,
      weightKg: 55,
      bloodType: "AB+",
      updatedAt: "2024-10-20T09:00:00Z",
    },
    financial: {
      paid: true,
      monthlyFeeValueInCents: 12000,
      dueDate: 20,
      lastPaymentDate: "2024-10-20",
    },
    checkIns: [
      {
        id: "9",
        checkInDate: "2024-11-01",
        checkInTime: "07:30:00",
        method: "QR Code",
      },
      {
        id: "10",
        checkInDate: "2024-10-30",
        checkInTime: "08:00:00",
        method: "QR Code",
      },
    ],
  },
  {
    userId: "5",
    name: "Pedro Ferreira",
    email: "pedro.ferreira@email.com",
    cpf: "321.654.987-01",
    telephone: "(11) 99999-5555",
    address: "Av. Secundária, 654 - São Paulo/SP",
    bornDate: "1995-07-11",
    createdAt: "2024-04-12T13:20:00Z",
    isPaymentUpToDate: false,
    shift: "Tarde",
    healthMetrics: {
      heightCm: 185,
      weightKg: 85,
      bloodType: "O-",
      updatedAt: "2024-09-12T13:00:00Z",
    },
    financial: {
      paid: false,
      monthlyFeeValueInCents: 12000,
      dueDate: 12,
      lastPaymentDate: "2024-08-12",
    },
    checkIns: [
      {
        id: "11",
        checkInDate: "2024-10-20",
        checkInTime: "16:30:00",
        method: "Manual",
      },
    ],
  },
];

// Mock data para usuário logado (simulando sessão)
export const mockCurrentUser = {
  id: "1",
  name: "João Silva",
  email: "joao.silva@email.com",
  role: "user" as const,
};

// Mock data para admin logado
export const mockCurrentAdmin = {
  id: "admin1",
  name: "Coach Silva",
  email: "coach@jmfitness.com",
  role: "admin" as const,
};

// Função para simular delay de API
export const mockApiDelay = (ms: number = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock das estatísticas do dashboard admin
export const mockDashboardStats = {
  totalStudents: mockStudentsData.length,
  studentsUpToDate: mockStudentsData.filter((s) => s.isPaymentUpToDate).length,
  studentsOverdue: mockStudentsData.filter((s) => !s.isPaymentUpToDate).length,
  totalRevenue: mockStudentsData.length * 120, // R$ 120 por aluno
  activeToday: 3,
  shiftData: [
    {
      shift: "Manhã",
      count: mockStudentsData.filter((s) => s.shift === "Manhã").length,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
    },
    {
      shift: "Tarde",
      count: mockStudentsData.filter((s) => s.shift === "Tarde").length,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
    },
    {
      shift: "Noite",
      count: mockStudentsData.filter((s) => s.shift === "Noite").length,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
    },
  ],
};

// Mock para dados do usuário individual
export const mockUserDashboardData = {
  user: {
    id: mockCurrentUser.id,
    name: mockCurrentUser.name,
  },
  personalData: {
    email: mockCurrentUser.email,
    cpf: "123.456.789-01",
    bornDate: "1990-05-15",
    address: "Rua das Flores, 123 - São Paulo/SP",
    telephone: "(11) 99999-1111",
  },
  healthMetrics: {
    heightCm: 180,
    weightKg: 75,
    bloodType: "O+",
    updatedAt: "2024-11-01T10:00:00Z",
  },
  financial: {
    paid: true,
    monthlyFeeValueInCents: 12000,
    dueDate: 15,
    lastPaymentDate: "2024-10-15",
  },
};
