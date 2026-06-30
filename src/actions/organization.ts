"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import {
  organizationSchema,
  passwordSchema,
  profileSchema,
  type OrganizationInput,
  type PasswordInput,
  type ProfileInput,
} from "@/lib/validations/organization";
import type { ActionResult } from "@/actions/auth";

export async function getOrganizationSettings() {
  const session = await requireSession();
  const [organization, user] = await Promise.all([
    prisma.organization.findUniqueOrThrow({ where: { id: session.user.organizationId } }),
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
  ]);

  return { organization, user };
}

export async function updateOrganization(input: OrganizationInput): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = organizationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await prisma.organization.update({
    where: { id: session.user.organizationId },
    data: parsed.data,
  });

  revalidatePath("/dashboard/configuracoes");
  return { success: true };
}

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing && existing.id !== session.user.id) {
    return { success: false, error: "Este e-mail já está em uso." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, email: normalizedEmail },
  });

  revalidatePath("/dashboard/configuracoes");
  return { success: true };
}

export async function updatePassword(input: PasswordInput): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return { success: false, error: "Usuário não encontrado." };
  }

  const isValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!isValid) {
    return { success: false, error: "Senha atual incorreta." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}
