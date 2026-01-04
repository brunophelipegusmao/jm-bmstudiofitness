import { NextResponse } from "next/server";
import { z } from "zod";

import { sendContactEmail } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(5),
  token: z.string().min(1),
  phone: z.string().optional(),
});

async function verifyRecaptcha(token: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.warn("RECAPTCHA_SECRET_KEY nao configurada");
    return false;
  }

  try {
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = (await response.json()) as { success: boolean };
    return !!data.success;
  } catch (error) {
    console.error("Erro ao validar reCAPTCHA:", error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Dados invalidos" },
        { status: 400 },
      );
    }

    const { name, email, message, token, phone } = parsed.data;
    const captchaOk = await verifyRecaptcha(token);

    if (!captchaOk) {
      return NextResponse.json(
        { success: false, error: "Falha na validacao do reCAPTCHA" },
        { status: 400 },
      );
    }

    const sent = await sendContactEmail(name, email, message, phone);

    if (!sent) {
      return NextResponse.json(
        { success: false, error: "Nao foi possivel enviar o email" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no envio de contato:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno" },
      { status: 500 },
    );
  }
}
