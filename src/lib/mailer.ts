import nodemailer from "nodemailer";

const globalForMailer = globalThis as unknown as { mailer?: nodemailer.Transporter };

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
}

export const mailer = globalForMailer.mailer ?? createTransporter();

if (process.env.NODE_ENV !== "production") {
  globalForMailer.mailer = mailer;
}

function emailLayout({
  title,
  message,
  buttonLabel,
  buttonUrl,
  footnote,
}: {
  title: string;
  message: string;
  buttonLabel: string;
  buttonUrl: string;
  footnote: string;
}) {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #18181b;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
        <div style="width: 32px; height: 32px; border-radius: 8px; background: #4F46E5; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">N</div>
        <span style="font-size: 15px; font-weight: 600;">Nimbus</span>
      </div>
      <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 12px;">${title}</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #52525b; margin: 0 0 24px;">${message}</p>
      <a href="${buttonUrl}" style="display: inline-block; background: #4F46E5; color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 8px;">
        ${buttonLabel}
      </a>
      <p style="font-size: 12px; line-height: 1.6; color: #a1a1aa; margin: 24px 0 0;">${footnote}</p>
    </div>
  `;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const from = process.env.EMAIL_FROM ?? "Nimbus <nao-responda@nimbus.local>";

  await mailer.sendMail({
    from,
    to,
    subject: "Redefina sua senha — Nimbus",
    html: emailLayout({
      title: "Redefinir sua senha",
      message:
        "Recebemos uma solicitação para redefinir a senha da sua conta no Nimbus. Clique no botão abaixo para escolher uma nova senha. Este link expira em 1 hora.",
      buttonLabel: "Redefinir senha",
      buttonUrl: resetUrl,
      footnote:
        "Se você não solicitou essa alteração, pode ignorar este e-mail com segurança — sua senha continua a mesma.",
    }),
  });
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  const from = process.env.EMAIL_FROM ?? "Nimbus <nao-responda@nimbus.local>";

  await mailer.sendMail({
    from,
    to,
    subject: "Confirme seu e-mail — Nimbus",
    html: emailLayout({
      title: "Confirme seu e-mail",
      message:
        "Falta pouco! Clique no botão abaixo para confirmar seu e-mail e garantir que você não perca nenhuma comunicação importante sobre sua conta. Este link expira em 1 hora.",
      buttonLabel: "Confirmar e-mail",
      buttonUrl: verifyUrl,
      footnote: "Se você não criou uma conta no Nimbus, pode ignorar este e-mail com segurança.",
    }),
  });
}
