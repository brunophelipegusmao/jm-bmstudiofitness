import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { UserCard } from "@/components/Admin/UserCard";
import { User } from "@/types/user";
import { UserRole } from "@/types/user-roles";

const mockUser: User = {
  id: "1",
  name: "João Silva",
  email: "joao@test.com",
  role: UserRole.ALUNO,
  cpf: "123.456.789-01",
  telephone: "(11) 99999-9999",
  address: "Rua Teste, 123",
  bornDate: "1990-01-01",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  isActive: true,
};

const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();

describe("UserCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render user information correctly", () => {
    render(
      <UserCard user={mockUser} onEdit={mockOnEdit} onDelete={mockOnDelete} />,
    );

    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("📧 joao@test.com")).toBeInTheDocument();
    expect(screen.getByText("🆔 CPF: 123.456.789-01")).toBeInTheDocument();
    expect(screen.getByText("📱 (11) 99999-9999")).toBeInTheDocument();
    expect(screen.getByText("📍 Rua Teste, 123")).toBeInTheDocument();
    expect(screen.getByText("Aluno")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("should show actions menu when more button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <UserCard user={mockUser} onEdit={mockOnEdit} onDelete={mockOnDelete} />,
    );

    const moreButton = screen.getByRole("button");
    await user.click(moreButton);

    expect(screen.getByText("Editar")).toBeInTheDocument();
    expect(screen.getByText("Excluir")).toBeInTheDocument();
  });

  it("should call onEdit when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <UserCard user={mockUser} onEdit={mockOnEdit} onDelete={mockOnDelete} />,
    );

    const moreButton = screen.getByRole("button");
    await user.click(moreButton);

    const editButton = screen.getByText("Editar");
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });

  it("should call onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <UserCard user={mockUser} onEdit={mockOnEdit} onDelete={mockOnDelete} />,
    );

    const moreButton = screen.getByRole("button");
    await user.click(moreButton);

    const deleteButton = screen.getByText("Excluir");
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockUser);
  });

  it("should render correctly for admin user", () => {
    const adminUser: User = {
      ...mockUser,
      role: UserRole.ADMIN,
    };

    render(
      <UserCard user={adminUser} onEdit={mockOnEdit} onDelete={mockOnDelete} />,
    );

    expect(screen.getByText("Administrador")).toBeInTheDocument();
  });

  it("should render correctly for inactive user", () => {
    const inactiveUser: User = {
      ...mockUser,
      isActive: false,
    };

    render(
      <UserCard
        user={inactiveUser}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByText("Inativo")).toBeInTheDocument();
  });
});
