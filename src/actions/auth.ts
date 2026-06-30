"use server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";

export type ActionResult = { success: true } | { success: false; error: string };

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

  await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: organizationName },
    });

    await tx.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        organizationId: organization.id,
      },
    });
  });

  return { success: true };
}
