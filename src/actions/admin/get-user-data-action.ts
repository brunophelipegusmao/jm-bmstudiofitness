import { apiClient } from "@/lib/api-client";
import { UserRole } from "@/types/user-roles";

type UserPayload = {
  id?: string;
  name?: string;
  userRole?: UserRole;
  role?: UserRole;
  financial?: {
    monthlyFeeValueInCents?: number;
    paymentMethod?: string;
    dueDate?: number;
  };
  personalData?: {
    email?: string;
    cpf?: string;
    bornDate?: string;
    address?: string;
    telephone?: string;
  };
};

export async function getUserDataAction(userId: string): Promise<{
  success: boolean;
  data: {
    name?: string;
    email?: string;
    telephone?: string;
    address?: string;
    cpf?: string;
    bornDate?: string;
    monthlyFeeValueInCents?: number;
    paymentMethod?: string;
    dueDate?: number;
  };
  error?: string;
}> {
  try {
    if (!userId) {
      throw new Error("ID do usuário não informado");
    }
    const user = await apiClient.get<UserPayload>(`/users/${userId}`);

    const personal = user?.personalData ?? {};

    return {
      success: true,
      data: {
        name: user?.name,
        email: personal.email,
        telephone: personal.telephone,
        address: personal.address,
        cpf: personal.cpf,
        bornDate: personal.bornDate,
        monthlyFeeValueInCents: user?.financial?.monthlyFeeValueInCents,
        paymentMethod: user?.financial?.paymentMethod,
        dueDate: user?.financial?.dueDate,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao buscar dados do usuário";
    return { success: false, data: {}, error: message };
  }
}
