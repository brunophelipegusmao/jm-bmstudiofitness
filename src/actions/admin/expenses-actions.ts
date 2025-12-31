import type { Expense } from "@/components/Admin/ExpenseManager/types";
import { apiClient } from "@/lib/api-client";
import type { ExpenseCategory } from "@/types/expense-categories";

const validCategories: ExpenseCategory[] = [
  "energia",
  "agua",
  "aluguel",
  "internet",
  "telefone",
  "manutencao",
  "material_limpeza",
  "material_escritorio",
  "equipamentos",
  "marketing",
  "seguranca",
  "seguros",
  "impostos",
  "salarios",
  "outros",
];

export interface CreateExpenseInput {
  description: string;
  category: ExpenseCategory;
  amountInCents: number;
  dueDate: string; // yyyy-MM-dd
  paymentMethod?: string;
  notes?: string;
  attachment?: string | null;
}

export type UpdateExpenseInput = Partial<CreateExpenseInput> & {
  paid?: boolean;
  paymentDate?: string | null;
};

type ExpenseApi = {
  id: string;
  description: string;
  category: ExpenseCategory | string;
  amountInCents: number;
  expenseDate: string;
  paymentMethod?: string | null;
  notes?: string | null;
  receipt?: string | null;
  attachment?: string | null;
  createdAt?: string;
  paid?: boolean;
  paymentDate?: string | null;
};

function normalizeCategory(category: string | ExpenseCategory): ExpenseCategory {
  return validCategories.includes(category as ExpenseCategory)
    ? (category as ExpenseCategory)
    : "outros";
}

function mapExpense(apiExpense: ExpenseApi): Expense {
  return {
    id: apiExpense.id,
    description: apiExpense.description,
    category: normalizeCategory(apiExpense.category),
    amountInCents: apiExpense.amountInCents,
    dueDate: apiExpense.expenseDate,
    paid: false,
    paymentDate: null,
    paymentMethod: apiExpense.paymentMethod ?? "",
    recurrent: false,
    notes: apiExpense.notes ?? null,
    attachment: apiExpense.receipt ?? apiExpense.attachment ?? null,
    createdAt: apiExpense.createdAt ?? new Date().toISOString(),
  };
}

export async function createExpenseAction(input: CreateExpenseInput) {
  try {
    const payload = {
      description: input.description,
      category: input.category,
      amountInCents: input.amountInCents,
      expenseDate: input.dueDate,
      paymentMethod: input.paymentMethod,
      notes: input.notes,
      receipt: input.attachment,
    };

    const expense = await apiClient.post<ExpenseApi>("/expenses", payload);
    return { success: true, expense: mapExpense(expense), error: undefined };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar despesa";
    return { success: false, message, error: message };
  }
}

export async function updateExpenseAction(
  payload: { id: string } & UpdateExpenseInput,
) {
  try {
    const { id, ...input } = payload;
    const requestPayload: Partial<ExpenseApi> = {};
    if (input.description !== undefined)
      requestPayload.description = input.description;
    if (input.category !== undefined) requestPayload.category = input.category;
    if (input.amountInCents !== undefined)
      requestPayload.amountInCents = input.amountInCents;
    if (input.dueDate !== undefined) requestPayload.expenseDate = input.dueDate;
    if (input.paymentMethod !== undefined)
      requestPayload.paymentMethod = input.paymentMethod;
    if (input.notes !== undefined) requestPayload.notes = input.notes;
    if (input.attachment !== undefined)
      requestPayload.receipt = input.attachment;
    if (input.paid !== undefined) requestPayload.paid = input.paid;
    if (input.paymentDate !== undefined)
      requestPayload.paymentDate = input.paymentDate;

    const expense = await apiClient.patch<ExpenseApi>(
      `/expenses/${id}`,
      requestPayload,
    );
    return { success: true, expense: mapExpense(expense), error: undefined };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar despesa";
    return { success: false, message, error: message };
  }
}

export async function deleteExpenseAction(id: string) {
  try {
    await apiClient.delete(`/expenses/${id}`);
    return { success: true, error: undefined };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao deletar despesa";
    return { success: false, message, error: message };
  }
}

export async function getExpensesAction() {
  try {
    const expenses = await apiClient.get<ExpenseApi[]>("/expenses");
    return {
      expenses: Array.isArray(expenses)
        ? expenses.map((expense) => mapExpense(expense))
        : [],
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao carregar despesas";
    return { error: message, expenses: [] as Expense[] };
  }
}
