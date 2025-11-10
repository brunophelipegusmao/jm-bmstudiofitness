import crypto from "crypto";

// Interfaces para diferentes provedores de e-mail
interface EmailConfig {
  provider: string;
  from: string;
  fromName: string;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Configuração do e-mail baseada nas variáveis de ambiente
function getEmailConfig(): EmailConfig {
  return {
    provider: process.env.EMAIL_PROVIDER || "development",
    from: process.env.EMAIL_FROM || "noreply@jmfitnesstudio.com",
    fromName: process.env.EMAIL_FROM_NAME || "JM Fitness Studio",
  };
}

// Template de e-mail de confirmação
function generateConfirmationEmailTemplate(
  name: string,
  confirmationUrl: string,
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirme sua conta - JM Fitness Studio</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: #C2A537; margin: 0; font-size: 28px;">🏋️ JM Fitness Studio</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Bem-vindo(a) ao nosso time!</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #C2A537; margin-top: 0;">Olá, ${name}! 👋</h2>
        
        <p>Sua conta foi criada com sucesso! Para começar a usar todos os recursos do nosso estúdio, você precisa confirmar seus dados e criar sua senha.</p>
        
        <p><strong>⚠️ Importante:</strong> Este link expira em 24 horas.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationUrl}" style="background: #C2A537; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
            ✅ Confirmar Conta e Criar Senha
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
        <p style="word-break: break-all; background: #e9e9e9; padding: 10px; border-radius: 5px; font-size: 12px;">${confirmationUrl}</p>
      </div>
      
      <div style="background: #1a1a1a; color: #ffffff; padding: 20px; border-radius: 10px; text-align: center;">
        <h3 style="color: #C2A537; margin-top: 0;">O que acontece depois?</h3>
        <ul style="list-style: none; padding: 0; margin: 0; text-align: left;">
          <li style="margin: 10px 0;">🔐 Você criará sua senha pessoal</li>
          <li style="margin: 10px 0;">📱 Terá acesso ao seu dashboard</li>
          <li style="margin: 10px 0;">✅ Poderá fazer check-ins no estúdio</li>
          <li style="margin: 10px 0;">📊 Acompanhará seu histórico de treinos</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px; margin: 0;">
          Este e-mail foi enviado automaticamente. Se você não se cadastrou na JM Fitness Studio, pode ignorar esta mensagem.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
    JM Fitness Studio - Confirme sua conta
    
    Olá, ${name}!
    
    Sua conta foi criada com sucesso! Para começar a usar todos os recursos do nosso estúdio, você precisa confirmar seus dados e criar sua senha.
    
    Acesse o link abaixo para confirmar sua conta:
    ${confirmationUrl}
    
    ⚠️ Importante: Este link expira em 24 horas.
    
    O que acontece depois?
    - Você criará sua senha pessoal
    - Terá acesso ao seu dashboard
    - Poderá fazer check-ins no estúdio
    - Acompanhará seu histórico de treinos
    
    Se você não se cadastrou na JM Fitness Studio, pode ignorar esta mensagem.
    
    --
    JM Fitness Studio
  `;

  return { html, text };
}

// Envio com Resend (recomendado)
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
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Erro Resend:", error);
      return false;
    }

    const result = await response.json();
    console.log("✅ E-mail enviado com Resend:", result.id);
    return true;
  } catch (error) {
    console.error("Erro ao enviar com Resend:", error);
    return false;
  }
}

// Envio com SMTP (Gmail, etc.)
async function sendWithSMTP(emailData: EmailData): Promise<boolean> {
  try {
    // Aqui você instalaria o nodemailer: npm install nodemailer @types/nodemailer
    // const nodemailer = require("nodemailer");

    console.log("📧 SMTP não configurado. Para usar SMTP:");
    console.log("1. Instale: npm install nodemailer @types/nodemailer");
    console.log("2. Configure as variáveis SMTP no .env");
    console.log("3. Descomente o código SMTP nesta função");
    console.log(`E-mail seria enviado para: ${emailData.to}`);

    return false;
  } catch (error) {
    console.error("Erro SMTP:", error);
    return false;
  }
}

// Envio com SendGrid
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

    console.log("✅ E-mail enviado com SendGrid");
    return true;
  } catch (error) {
    console.error("Erro ao enviar com SendGrid:", error);
    return false;
  }
}

// Modo desenvolvimento (apenas logs)
async function sendInDevelopment(emailData: EmailData): Promise<boolean> {
  console.log("\n" + "=".repeat(60));
  console.log("📧 E-MAIL DE CONFIRMAÇÃO (MODO DESENVOLVIMENTO)");
  console.log("=".repeat(60));
  console.log(`Para: ${emailData.to}`);
  console.log(`Assunto: ${emailData.subject}`);
  console.log("---");
  console.log(emailData.text);
  console.log("=".repeat(60) + "\n");

  return true;
}

// Função principal de envio de e-mail de confirmação
export async function sendConfirmationEmail(
  email: string,
  name: string,
  token: string,
): Promise<boolean> {
  try {
    const config = getEmailConfig();
    const confirmationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/user/confirm?token=${token}`;

    const emailTemplate = generateConfirmationEmailTemplate(
      name,
      confirmationUrl,
    );

    const emailData: EmailData = {
      to: email,
      subject: "Bem-vindo(a) ao JM Fitness Studio - Confirme sua conta",
      html: emailTemplate.html,
      text: emailTemplate.text,
    };

    // Escolher provedor baseado na configuração
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
  expiration.setHours(expiration.getHours() + 24); // Token expira em 24 horas
  return expiration;
}

function generateResetPasswordEmailTemplate(name: string, resetUrl: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redefinição de Senha - JM Fitness Studio</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: #C2A537; margin: 0; font-size: 28px;">🏋️ JM Fitness Studio</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Redefinição de Senha</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h2 style="color: #C2A537; margin-top: 0;">Olá, ${name}!</h2>
        
        <p>Recebemos uma solicitação para redefinir a senha da sua conta. Se você não fez esta solicitação, pode ignorar este email.</p>
        
        <p><strong>⚠️ Importante:</strong> Este link expira em 1 hora.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #C2A537; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
            🔑 Redefinir Senha
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
        <p style="word-break: break-all; background: #e9e9e9; padding: 10px; border-radius: 5px; font-size: 12px;">${resetUrl}</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px; margin: 0;">
          Este é um email automático. Por favor, não responda.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
    JM Fitness Studio - Redefinição de Senha
    
    Olá, ${name}!
    
    Recebemos uma solicitação para redefinir a senha da sua conta. Se você não fez esta solicitação, pode ignorar este email.
    
    Acesse o link abaixo para redefinir sua senha:
    ${resetUrl}
    
    ⚠️ Importante: Este link expira em 1 hora.
    
    --
    JM Fitness Studio
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
      subject: "Redefinição de Senha - JM Fitness Studio",
      html: emailTemplate.html,
      text: emailTemplate.text,
    };

    // Escolher provedor baseado na configuração
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
    console.error("Erro ao enviar e-mail de redefinição de senha:", error);
    return false;
  }
}
