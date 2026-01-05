import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  if (!to) {
    throw new Error('E-mail de destino não informado');
  }

  const from =
    process.env.EMAIL_FROM ??
    process.env.SMTP_USER ??
    'no-reply@jmfitnessstudio.com.br';

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });
}
