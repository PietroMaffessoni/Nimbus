"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";
import type { ActionResult } from "@/actions/auth";

export async function listCategories() {
  const session = await requireSession();
  return prisma.financeCategory.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(input: CategoryInput): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const existing = await prisma.financeCategory.findFirst({
    where: { organizationId: session.user.organizationId, type: parsed.data.type, name: parsed.data.name },
  });
  if (existing) {
    return { success: false, error: "Essa categoria já existe." };
  }

  await prisma.financeCategory.create({
    data: {
      organizationId: session.user.organizationId,
      type: parsed.data.type,
      name: parsed.data.name,
    },
  });

  revalidatePath("/dashboard/financeiro");
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const existing = await prisma.financeCategory.findFirst({
    where: { id, organizationId: session.user.organizationId },
  });
  if (!existing) {
    return { success: false, error: "Categoria não encontrada." };
  }

  await prisma.financeCategory.delete({ where: { id } });

  revalidatePath("/dashboard/financeiro");
  return { success: true };
}
