import "@testing-library/jest-dom";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { CreateUserForm } from "@/components/Admin/CreateUserForm";
import { UserRole } from "@/types/user-roles";

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

describe("CreateUserForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render form fields correctly", () => {
    render(<CreateUserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByText("Criar Novo Usuário")).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome Completo/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText("Senha *")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar Senha *")).toBeInTheDocument();
    expect(screen.getByLabelText(/Função/)).toBeInTheDocument();
  });

  it("should show validation errors for required fields", async () => {
    const user = userEvent.setup();
    render(<CreateUserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole("button", { name: /Criar Usuário/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Nome é obrigatório")).toBeInTheDocument();
      expect(screen.getByText("Email é obrigatório")).toBeInTheDocument();
      expect(screen.getByText("Senha é obrigatória")).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should validate password confirmation", async () => {
    const user = userEvent.setup();
    render(<CreateUserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.type(screen.getByLabelText(/Nome Completo/), "João Silva");
    await user.type(screen.getByLabelText(/Email/), "joao@test.com");
    await user.type(screen.getByLabelText("Senha *"), "123456");
    await user.type(screen.getByLabelText("Confirmar Senha *"), "654321");

    const submitButton = screen.getByRole("button", { name: /Criar Usuário/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Senhas não coincidem")).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should submit form with valid data", async () => {
    const user = userEvent.setup();
    render(<CreateUserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.type(screen.getByLabelText(/Nome Completo/), "João Silva");
    await user.type(screen.getByLabelText(/Email/), "joao@test.com");
    await user.type(screen.getByLabelText("Senha *"), "123456");
    await user.type(screen.getByLabelText("Confirmar Senha *"), "123456");

    const submitButton = screen.getByRole("button", { name: /Criar Usuário/ });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "João Silva",
        email: "joao@test.com",
        password: "123456",
        confirmPassword: "123456",
        role: UserRole.ALUNO, // valor padrão
        cpf: "",
        telephone: "",
        address: "",
        bornDate: "",
      });
    });
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<CreateUserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole("button", { name: /Cancelar/ });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("should format CPF correctly", async () => {
    const user = userEvent.setup();
    render(<CreateUserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cpfInput = screen.getByLabelText(/CPF/);
    await user.type(cpfInput, "12345678901");

    expect(cpfInput).toHaveValue("123.456.789-01");
  });
});
