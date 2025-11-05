import "@testing-library/jest-dom";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { StudentFullData } from "@/actions/admin/get-students-full-data-action";
import { StudentsTab } from "@/components/Dashboard/StudentsTab";

const mockStudentsData: StudentFullData[] = [
  {
    userId: "student-1",
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
  {
    userId: "student-2",
    name: "Maria Santos",
    userRole: "USER",
    createdAt: "2024-01-10",
    cpf: "98765432100",
    email: "maria@test.com",
    bornDate: "1985-08-20",
    address: "Rua B, 456",
    telephone: "11987654322",
    age: 39,
    monthlyFeeValueInCents: 15000,
    paymentMethod: "Cartão",
    dueDate: 10,
    paid: false,
    lastPaymentDate: "2023-12-10",
    isPaymentUpToDate: false,
    formattedMonthlyFee: "R$ 150,00",
    heightCm: "165",
    weightKg: "60",
    bloodType: "A+",
    hasPracticedSports: false,
    lastExercise: "2023-12-01",
    historyDiseases: "Hipertensão",
    medications: "Losartana",
    sportsHistory: "Nenhum",
    allergies: "Poeira",
    injuries: "Nenhuma",
    alimentalRoutine: "Regular",
    diaryRoutine: "Sedentária",
    useSupplements: false,
    whatSupplements: null,
    otherNotes: null,
    coachaObservations: null,
    coachObservationsParticular: null,
    healthUpdatedAt: "2024-01-10",
  },
  {
    userId: "student-3",
    name: "Pedro Costa",
    userRole: "USER",
    createdAt: "2024-01-20",
    cpf: "11122233344",
    email: "pedro@test.com",
    bornDate: "1992-03-10",
    address: "Rua C, 789",
    telephone: "11987654323",
    age: 32,
    monthlyFeeValueInCents: 15000,
    paymentMethod: "Dinheiro",
    dueDate: 15,
    paid: true,
    lastPaymentDate: "2024-01-15",
    isPaymentUpToDate: true,
    formattedMonthlyFee: "R$ 150,00",
    heightCm: "175",
    weightKg: "80",
    bloodType: "B+",
    hasPracticedSports: true,
    lastExercise: "2024-01-19",
    historyDiseases: "Nenhuma",
    medications: "Nenhum",
    sportsHistory: "Natação",
    allergies: "Nenhuma",
    injuries: "Lesão no joelho (2020)",
    alimentalRoutine: "Saudável",
    diaryRoutine: "Muito ativa",
    useSupplements: true,
    whatSupplements: "BCAA, Creatina",
    otherNotes: null,
    coachaObservations: null,
    coachObservationsParticular: null,
    healthUpdatedAt: "2024-01-20",
  },
];

describe("StudentsTab - Busca de Alunos", () => {
  const user = userEvent.setup();

  describe("Campo de Busca", () => {
    it("should render search input", () => {
      render(<StudentsTab students={mockStudentsData} />);

      const searchInput = screen.getByPlaceholderText(
        "Digite o nome, email ou CPF do aluno...",
      );
      expect(searchInput).toBeInTheDocument();
    });

    it("should update search term when typing", async () => {
      render(<StudentsTab students={mockStudentsData} />);

      const searchInput = screen.getByPlaceholderText(
        "Digite o nome, email ou CPF do aluno...",
      );

      await user.type(searchInput, "João");

      expect(searchInput).toHaveValue("João");
    });
  });

  describe("Resultados da Busca", () => {
    it("should show search results when typing", async () => {
      render(<StudentsTab students={mockStudentsData} />);

      const searchInput = screen.getByPlaceholderText(
        "Digite o nome, email ou CPF do aluno...",
      );

      await user.type(searchInput, "João");

      await waitFor(() => {
        expect(screen.getByText(/1 resultado encontrado/)).toBeInTheDocument();
      });
    });

    it("should filter students by name", async () => {
      render(<StudentsTab students={mockStudentsData} />);

      const searchInput = screen.getByPlaceholderText(
        "Digite o nome, email ou CPF do aluno...",
      );

      await user.type(searchInput, "João");

      await waitFor(() => {
        expect(screen.getByText("João Silva")).toBeInTheDocument();
        expect(screen.queryByText("Maria Santos")).not.toBeInTheDocument();
        expect(screen.queryByText("Pedro Costa")).not.toBeInTheDocument();
      });
    });

    it("should filter students by email", async () => {
      render(<StudentsTab students={mockStudentsData} />);

      const searchInput = screen.getByPlaceholderText(
        "Digite o nome, email ou CPF do aluno...",
      );

      await user.type(searchInput, "maria@test.com");

      await waitFor(() => {
        expect(screen.getByText("Maria Santos")).toBeInTheDocument();
        expect(screen.queryByText("João Silva")).not.toBeInTheDocument();
        expect(screen.queryByText("Pedro Costa")).not.toBeInTheDocument();
      });
    });

    it("should filter students by CPF", async () => {
      render(<StudentsTab students={mockStudentsData} />);

      const searchInput = screen.getByPlaceholderText(
        "Digite o nome, email ou CPF do aluno...",
      );

      await user.type(searchInput, "11122233344");

      await waitFor(() => {
        expect(screen.getByText("Pedro Costa")).toBeInTheDocument();
        expect(screen.queryByText("João Silva")).not.toBeInTheDocument();
        expect(screen.queryByText("Maria Santos")).not.toBeInTheDocument();
      });
    });

    it("should show correct results count", async () => {
      render(<StudentsTab students={mockStudentsData} />);

      const searchInput = screen.getByPlaceholderText(
        "Digite o nome, email ou CPF do aluno...",
      );

      await user.type(searchInput, "João");

      await waitFor(() => {
        expect(screen.getByText(/1 resultado encontrado/)).toBeInTheDocument();
      });
    });

    it("should show no results for non-matching search", async () => {
      render(<StudentsTab students={mockStudentsData} />);

      const searchInput = screen.getByPlaceholderText(
        "Digite o nome, email ou CPF do aluno...",
      );

      await user.type(searchInput, "NameThatDoesNotExist");

      await waitFor(() => {
        expect(screen.getByText(/0 resultados encontrado/)).toBeInTheDocument();
      });
    });
  });

  describe("Seleção de Aluno", () => {
    it("should select student when clicked", async () => {
      render(<StudentsTab students={mockStudentsData} />);

      const searchInput = screen.getByPlaceholderText(
        "Digite o nome, email ou CPF do aluno...",
      );
      await user.type(searchInput, "João");

      await waitFor(async () => {
        const studentCard = screen.getByText("João Silva").closest("div");
        if (studentCard && studentCard.className.includes("cursor-pointer")) {
          await user.click(studentCard);
        }
      });

      await waitFor(() => {
        expect(screen.getByText("Detalhes do Aluno")).toBeInTheDocument();
      });
    });
  });

  describe("Status de Pagamento", () => {
    it("should display payment status correctly", async () => {
      render(<StudentsTab students={mockStudentsData} />);

      const searchInput = screen.getByPlaceholderText(
        "Digite o nome, email ou CPF do aluno...",
      );

      // Teste João (em dia)
      await user.type(searchInput, "João");

      await waitFor(() => {
        const emDiaElements = screen.getAllByText("✓ Em dia");
        expect(emDiaElements.length).toBeGreaterThan(0);
      });

      // Limpar e testar Maria (atrasada)
      await user.clear(searchInput);
      await user.type(searchInput, "Maria");

      await waitFor(() => {
        expect(screen.getByText("⚠ Atrasado")).toBeInTheDocument();
      });
    });
  });

  describe("Case Insensitive Search", () => {
    it("should work with uppercase and lowercase", async () => {
      render(<StudentsTab students={mockStudentsData} />);

      const searchInput = screen.getByPlaceholderText(
        "Digite o nome, email ou CPF do aluno...",
      );

      // Teste com maiúscula
      await user.type(searchInput, "JOÃO");

      await waitFor(() => {
        expect(screen.getByText("João Silva")).toBeInTheDocument();
      });

      // Limpar e testar com minúscula
      await user.clear(searchInput);
      await user.type(searchInput, "joão");

      await waitFor(() => {
        expect(screen.getByText("João Silva")).toBeInTheDocument();
      });
    });
  });
});
