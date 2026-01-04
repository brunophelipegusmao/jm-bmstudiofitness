import crypto from "crypto";

interface EmailConfig {
  provider: "resend" | "sendgrid" | "smtp" | "development";
  from: string;
  fromName: string;
}

export interface EmailData {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

function getEmailConfig(): EmailConfig {
  return {
    provider: (process.env.EMAIL_PROVIDER as EmailConfig["provider"]) || "development",
    from: process.env.EMAIL_FROM || "contato@jmfitnessstudio.com.br",
    fromName: process.env.EMAIL_FROM_NAME || "JM Fitness Studio",
  };
}

function generateConfirmationEmailTemplate(name: string, confirmationUrl: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Confirme sua conta - JM Fitness Studio</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: #C2A537; margin: 0; font-size: 26px;">JM Fitness Studio</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 15px;">Bem-vindo(a) ao nosso time!</p>
      </div>
      <div style="background: #f9f9f9; padding: 28px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #C2A537; margin-top: 0;">Olá, ${name}!</h2>
        <p>Sua conta foi criada com sucesso. Para começar a usar todos os recursos, confirme seus dados e crie sua senha.</p>
        <p><strong>Importante:</strong> o link expira em 24 horas.</p>
        <div style="text-align: center; margin: 26px 0;">
          <a href="${confirmationUrl}" style="background: #C2A537; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
            Confirmar conta e criar senha
          </a>
        </div>
        <p style="font-size: 13px; color: #666;">Se o botão não funcionar, copie e cole este link no navegador:</p>
        <p style="word-break: break-all; background: #e9e9e9; padding: 10px; border-radius: 6px; font-size: 12px;">${confirmationUrl}</p>
      </div>
      <div style="background: #1a1a1a; color: #ffffff; padding: 18px; border-radius: 10px; text-align: center;">
        <h3 style="color: #C2A537; margin-top: 0;">Próximos passos</h3>
        <ul style="list-style: none; padding: 0; margin: 0; text-align: left;">
          <li style="margin: 8px 0;">• Criar sua senha pessoal</li>
          <li style="margin: 8px 0;">• Acessar seu dashboard</li>
          <li style="margin: 8px 0;">• Fazer check-ins no estúdio</li>
          <li style="margin: 8px 0;">• Acompanhar histórico e progresso</li>
        </ul>
      </div>
      <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px; margin: 0;">
          Se você não se cadastrou, pode ignorar esta mensagem.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
JM Fitness Studio - Confirme sua conta

Olá, ${name}!

Sua conta foi criada com sucesso. Para começar a usar todos os recursos, confirme seus dados e crie sua senha.

Acesse o link: ${confirmationUrl}

Importante: o link expira em 24 horas.
`;

  return { html, text };
}

async function sendWithResend(emailData: EmailData): Promise<boolean> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${getEmailConfig().fromName} <${getEmailConfig().from}>`,
        to: emailData.to,
        reply_to: emailData.replyTo,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("Erro Resend:", error);
      return false;
    }

    const result = await response.json();
    console.log("Email enviado com Resend:", result.id);
    return true;
  } catch (error) {
    console.error("Erro ao enviar com Resend:", error);
    return false;
  }
}

async function sendWithSMTP(emailData: EmailData): Promise<boolean> {
  console.log("SMTP nao configurado. Configure variaveis SMTP para usar.");
  console.log(`E-mail seria enviado para: ${emailData.to}`);
  return false;
}

async function sendWithSendGrid(emailData: EmailData): Promise<boolean> {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: emailData.to }] }],
        from: {
          email: getEmailConfig().from,
          name: getEmailConfig().fromName,
        },
        reply_to: emailData.replyTo
          ? { email: emailData.replyTo, name: emailData.replyTo }
          : undefined,
        subject: emailData.subject,
        content: [
          { type: "text/html", value: emailData.html },
          { type: "text/plain", value: emailData.text },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Erro SendGrid:", response.statusText);
      return false;
    }

    console.log("Email enviado com SendGrid");
    return true;
  } catch (error) {
    console.error("Erro ao enviar com SendGrid:", error);
    return false;
  }
}

async function sendInDevelopment(emailData: EmailData): Promise<boolean> {
  console.log("\n" + "=".repeat(60));
  console.log("E-MAIL (MODO DESENVOLVIMENTO)");
  console.log("=".repeat(60));
  console.log(`Para: ${emailData.to}`);
  if (emailData.replyTo) {
    console.log(`Reply-to: ${emailData.replyTo}`);
  }
  console.log(`Assunto: ${emailData.subject}`);
  console.log("---");
  console.log(emailData.text);
  console.log("=".repeat(60) + "\n");
  return true;
}

export async function sendConfirmationEmail(
  email: string,
  name: string,
  token: string,
): Promise<boolean> {
  try {
    const config = getEmailConfig();
    const confirmationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/user/confirm?token=${token}`;

    const emailTemplate = generateConfirmationEmailTemplate(name, confirmationUrl);

    const emailData: EmailData = {
      to: email,
      subject: "Bem-vindo(a) ao JM Fitness Studio - Confirme sua conta",
      html: emailTemplate.html,
      text: emailTemplate.text,
    };

    switch (config.provider) {
      case "resend":
        return await sendWithResend(emailData);
      case "smtp":
        return await sendWithSMTP(emailData);
      case "sendgrid":
        return await sendWithSendGrid(emailData);
      case "development":
      default:
        return await sendInDevelopment(emailData);
    }
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return false;
  }
}

export function generateConfirmationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getTokenExpirationDate(): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 24);
  return expiration;
}

function generateResetPasswordEmailTemplate(name: string, resetUrl: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Redefinicao de senha - JM Fitness Studio</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: #C2A537; margin: 0; font-size: 26px;">JM Fitness Studio</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 15px;">Redefinicao de senha</p>
      </div>
      <div style="background: #f9f9f9; padding: 28px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #C2A537; margin-top: 0;">Olá, ${name}!</h2>
        <p>Recebemos uma solicitacao para redefinir a senha da sua conta. Se voce nao fez esta solicitacao, ignore este email.</p>
        <p><strong>Importante:</strong> o link expira em 1 hora.</p>
        <div style="text-align: center; margin: 26px 0;">
          <a href="${resetUrl}" style="background: #C2A537; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
            Redefinir senha
          </a>
        </div>
        <p style="font-size: 13px; color: #666;">Se o botao nao funcionar, copie e cole este link no navegador:</p>
        <p style="word-break: break-all; background: #e9e9e9; padding: 10px; border-radius: 6px; font-size: 12px;">${resetUrl}</p>
      </div>
      <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px; margin: 0;">Este e um email automatico. Nao responda.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
JM Fitness Studio - Redefinicao de senha

Olá, ${name}!

Recebemos uma solicitacao para redefinir a senha da sua conta. Se voce nao fez esta solicitacao, ignore este email.

Link para redefinir: ${resetUrl}

Importante: o link expira em 1 hora.
`;

  return { html, text };
}

export async function sendResetPasswordEmail(
  email: string,
  name: string,
  token: string,
): Promise<boolean> {
  try {
    const config = getEmailConfig();
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/user/reset-password?token=${token}`;
    const emailTemplate = generateResetPasswordEmailTemplate(name, resetUrl);

    const emailData: EmailData = {
      to: email,
      subject: "Redefinicao de Senha - JM Fitness Studio",
      html: emailTemplate.html,
      text: emailTemplate.text,
    };

    switch (config.provider) {
      case "resend":
        return await sendWithResend(emailData);
      case "smtp":
        return await sendWithSMTP(emailData);
      case "sendgrid":
        return await sendWithSendGrid(emailData);
      case "development":
      default:
        return await sendInDevelopment(emailData);
    }
  } catch (error) {
    console.error("Erro ao enviar e-mail de redefinicao de senha:", error);
    return false;
  }
}

export async function sendContactEmail(
  name: string,
  email: string,
  message: string,
  phone?: string,
): Promise<boolean> {
  const config = getEmailConfig();
  const to = process.env.CONTACT_EMAIL || config.from;

  const html = `
    <h2>Novo contato do site</h2>
    <p><strong>Nome:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${phone ? `<p><strong>Telefone:</strong> ${phone}</p>` : ""}
    <p><strong>Mensagem:</strong></p>
    <p>${message.replace(/\n/g, "<br/>")}</p>
  `;

  const text = `
Novo contato do site
Nome: ${name}
Email: ${email}
${phone ? `Telefone: ${phone}\n` : ""}Mensagem:
${message}
  `;

  const emailData: EmailData = {
    to,
    replyTo: email,
    subject: "Contato - JM Fitness Studio",
    html,
    text,
  };

  switch (config.provider) {
    case "resend":
      return await sendWithResend(emailData);
    case "smtp":
      return await sendWithSMTP(emailData);
    case "sendgrid":
      return await sendWithSendGrid(emailData);
    case "development":
    default:
      return await sendInDevelopment(emailData);
  }
}
