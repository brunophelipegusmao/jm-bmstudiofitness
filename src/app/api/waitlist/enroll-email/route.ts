import crypto from "crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/db";
import { passwordResetTokensTable } from "@/db/reset-password-schema";
import { personalDataTable, usersTable } from "@/db/schema";
import { getTokenExpirationDate, sendEnrollmentEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const personal = await db
      .select()
      .from(personalDataTable)
      .where(eq(personalDataTable.email, data.email))
      .limit(1);

    if (!personal[0]) {
      return NextResponse.json({ success: true });
    }

    const userRow = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, personal[0].userId))
      .limit(1);

    if (!userRow[0]) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = getTokenExpirationDate();

    await db.insert(passwordResetTokensTable).values({
      userId: userRow[0].id,
      token,
      expiresAt,
      used: false,
    });

    const studioAddress =
      process.env.STUDIO_ADDRESS ||
      "JM Fitness Studio - Consulte nosso site para o endereco";

    const sent = await sendEnrollmentEmail(
      data.email,
      data.name || userRow[0].name,
      token,
      studioAddress,
    );

    if (!sent) {
      return NextResponse.json(
        {
          success: false,
          message: "Nao foi possivel enviar o e-mail de matricula",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro em /api/waitlist/enroll-email:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Dados invalidos" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Erro interno" },
      { status: 500 },
    );
  }
}
