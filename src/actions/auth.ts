"use server";

import { randomBytes, createHash } from "node:crypto";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mailer";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";
import {
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type SignUpInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

export type ActionResult = { success: true } | { success: false; error: string };

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora
const VERIFICATION_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora
const VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000; // 1 minuto

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getBaseUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

async function issueVerificationToken(userId: string, email: string) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  await prisma.$transaction(async (tx) => {
    await tx.emailVerificationToken.deleteMany({ where: { userId, usedAt: null } });
    await tx.emailVerificationToken.create({ data: { userId, tokenHash, expiresAt } });
  });

  const verifyUrl = `${getBaseUrl()}/verificar-email?token=${rawToken}`;
  await sendVerificationEmail(email, verifyUrl);
}

export async function signUp(input: SignUpInput): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { organizationName, name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    return { success: false, error: "Já existe uma conta com este e-mail." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: organizationName },
    });

    await tx.financeCategory.createMany({
      data: DEFAULT_CATEGORIES.map((category) => ({ ...category, organizationId: organization.id })),
    });

    return tx.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        organizationId: organization.id,
      },
    });
  });

  await issueVerificationToken(user.id, user.email);

  return { success: true };
}

export async function requestPasswordReset(input: ForgotPasswordInput): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Sempre retorna sucesso, exista ou não o e-mail, para não permitir enumeração de contas.
  if (!user) {
    return { success: true };
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await tx.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });
  });

  const resetUrl = `${getBaseUrl()}/redefinir-senha?token=${rawToken}`;

  await sendPasswordResetEmail(user.email, resetUrl);

  return { success: true };
}

export async function resetPassword(input: ResetPasswordInput): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const tokenHash = hashToken(parsed.data.token);
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { success: false, error: "Link inválido ou expirado. Solicite uma nova redefinição de senha." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: resetToken.userId }, data: { passwordHash } });
    await tx.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } });
  });

  return { success: true };
}

export async function verifyEmail(token: string): Promise<ActionResult> {
  const tokenHash = hashToken(token);
  const verificationToken = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

  if (!verificationToken || verificationToken.usedAt || verificationToken.expiresAt < new Date()) {
    return { success: false, error: "Link inválido ou expirado. Solicite um novo e-mail de confirmação." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: verificationToken.userId }, data: { emailVerified: new Date() } });
    await tx.emailVerificationToken.update({ where: { id: verificationToken.id }, data: { usedAt: new Date() } });
  });

  return { success: true };
}

export async function resendVerificationEmail(): Promise<ActionResult> {
  const session = await requireSession();

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  if (user.emailVerified) {
    return { success: true };
  }

  const lastToken = await prisma.emailVerificationToken.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  if (lastToken && Date.now() - lastToken.createdAt.getTime() < VERIFICATION_RESEND_COOLDOWN_MS) {
    return { success: false, error: "Aguarde um minuto antes de solicitar um novo e-mail." };
  }

  await issueVerificationToken(user.id, user.email);

  return { success: true };
}
