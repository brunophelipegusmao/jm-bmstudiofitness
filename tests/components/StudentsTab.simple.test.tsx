import "@testing-library/jest-dom";

import { render, screen, waitFor } from "@testing-library/react";
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

    expect(
      screen.getByPlaceholderText("Digite o nome, email ou CPF do aluno..."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Total de alunos cadastrados: 1"),
    ).toBeInTheDocument();
  });

  it("should not show students without search", () => {
    render(<StudentsTab students={mockStudents} />);

    // Não deve mostrar o aluno sem busca
    expect(screen.queryByText("João Silva")).not.toBeInTheDocument();
  });

  it("should show student after search", async () => {
    const user = userEvent.setup();
    render(<StudentsTab students={mockStudents} />);

    const searchInput = screen.getByPlaceholderText(
      "Digite o nome, email ou CPF do aluno...",
    );
    await user.type(searchInput, "João");

    await waitFor(() => {
      expect(screen.getByText("João Silva")).toBeInTheDocument();
    });
  });
});
