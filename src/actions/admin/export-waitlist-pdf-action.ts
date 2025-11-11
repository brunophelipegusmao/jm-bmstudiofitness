"use server";

import { adminGuard } from "@/lib/auth-utils";

import { getWaitlistAdminAction } from "./waitlist-actions";

/**
 * Gera um PDF da lista de espera
 * Apenas admin pode executar
 */
export async function exportWaitlistPdfAction() {
  try {
    // Verificar permissão de admin
    await adminGuard();

    // Buscar dados da lista de espera
    const result = await getWaitlistAdminAction();

    if (!result.success || !result.data) {
      return {
        success: false,
        error: "Erro ao buscar dados da lista de espera",
      };
    }

    const waitlist = result.data;

    // Mapear status para português
    const statusMap = {
      waiting: "Aguardando",
      contacted: "Contatado",
      enrolled: "Matriculado",
      cancelled: "Cancelado",
    };

    // Mapear turnos para português
    const shiftMap = {
      manha: "Manhã",
      tarde: "Tarde",
      noite: "Noite",
    };

    // Preparar dados formatados
    const formattedData = waitlist.map((entry) => ({
      position: entry.position,
      fullName: entry.fullName,
      email: entry.email,
      whatsapp: entry.whatsapp,
      preferredShift: shiftMap[entry.preferredShift as keyof typeof shiftMap],
      goal: entry.goal,
      healthRestrictions: entry.healthRestrictions || "Nenhuma",
      status: statusMap[entry.status as keyof typeof statusMap],
      createdAt: new Date(entry.createdAt).toLocaleDateString("pt-BR"),
    }));

    return {
      success: true,
      data: formattedData,
    };
  } catch (error) {
    console.error("Erro ao exportar PDF:", error);
    return {
      success: false,
      error: "Erro ao exportar lista de espera em PDF",
    };
  }
}
