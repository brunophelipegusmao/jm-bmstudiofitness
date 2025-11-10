import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { updatePassword } from "@/actions/user/update-password-action";
import { auth } from "@/lib/auth";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Não autorizado" },
        { status: 401 },
      );
    }

    // Validar corpo da requisição
    const body = await req.json();
    const validatedData = changePasswordSchema.parse(body);

    // Atualizar senha
    const result = await updatePassword(
      session.user.id,
      validatedData.currentPassword,
      validatedData.newPassword,
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Dados inválidos" },
        { status: 400 },
      );
    }

    console.error("Erro ao alterar senha:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
