import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { StudentsTab } from "@/components/Dashboard/StudentsTab";

// Mock simples para testar
const mockStudents = [
  {
    userId: "1",
    name: "João Silva",
    userRole: "USER",
    createdAt: "2024-01-15",
    cpf: "12345678910",
    email: "joao@test.com",
    bornDate: "1990-05-15",
    address: "Rua A, 123",
    telephone: "11987654321",
    age: 34,
    monthlyFeeValueInCents: 15000,
    paymentMethod: "PIX",
    dueDate: 5,
    paid: true,
    lastPaymentDate: "2024-01-05",
    isPaymentUpToDate: true,
    formattedMonthlyFee: "R$ 150,00",
    heightCm: "180",
    weightKg: "75",
    bloodType: "O+",
    hasPracticedSports: true,
    lastExercise: "2024-01-01",
    historyDiseases: "Nenhuma",
    medications: "Nenhum",
    sportsHistory: "Futebol",
    allergies: "Nenhuma",
    injuries: "Nenhuma",
    alimentalRoutine: "Balanceada",
    diaryRoutine: "Ativa",
    useSupplements: true,
    whatSupplements: "Whey Protein",
    otherNotes: null,
    coachaObservations: null,
    coachObservationsParticular: null,
    healthUpdatedAt: "2024-01-15",
  },
];

describe("StudentsTab - Teste Simples", () => {
  it("should render correctly with one student", () => {
    render(<StudentsTab students={mockStudents} />);

    // Verifica se o input de busca existe com o placeholder correto
    expect(
      screen.getByPlaceholderText("Buscar por nome, email ou CPF..."),
    ).toBeInTheDocument();

    // Verifica se mostra a contagem de alunos encontrados (usando regex para lidar com texto quebrado)
    expect(
      screen.getByText(/1.*aluno\(s\).*encontrado\(s\)/i),
    ).toBeInTheDocument();
  });

  it("should show students by default", () => {
    render(<StudentsTab students={mockStudents} />);

    // Deve mostrar o aluno por padrão (sem necessidade de busca)
    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("joao@test.com")).toBeInTheDocument();
  });

  it("should accept search input", async () => {
    const user = userEvent.setup();

    render(<StudentsTab students={mockStudents} />);

    // Busca o input de busca
    const searchInput = screen.getByPlaceholderText(
      "Buscar por nome, email ou CPF...",
    );

    // Verifica que está vazio inicialmente
    expect(searchInput).toHaveValue("");

    // Digita algo no campo de busca
    await user.type(searchInput, "João");

    // Verifica que o texto foi digitado
    expect(searchInput).toHaveValue("João");
  });
});
