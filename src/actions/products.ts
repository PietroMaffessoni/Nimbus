"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import type { ActionResult } from "@/actions/auth";

export async function listProducts() {
  const session = await requireSession();
  return prisma.product.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { name: "asc" },
  });
}

export async function getProduct(id: string) {
  const session = await requireSession();
  return prisma.product.findFirst({
    where: { id, organizationId: session.user.organizationId },
  });
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await prisma.product.create({
    data: { ...parsed.data, organizationId: session.user.organizationId },
  });

  revalidatePath("/dashboard/produtos");
  return { success: true };
}

export async function updateProduct(id: string, input: ProductInput): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const existing = await prisma.product.findFirst({
    where: { id, organizationId: session.user.organizationId },
  });
  if (!existing) {
    return { success: false, error: "Produto não encontrado." };
  }

  await prisma.product.update({ where: { id }, data: parsed.data });

  revalidatePath("/dashboard/produtos");
  return { success: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const existing = await prisma.product.findFirst({
    where: { id, organizationId: session.user.organizationId },
  });
  if (!existing) {
    return { success: false, error: "Produto não encontrado." };
  }

  const itemsCount = await prisma.saleItem.count({ where: { productId: id } });
  if (itemsCount > 0) {
    await prisma.product.update({ where: { id }, data: { active: false } });
    revalidatePath("/dashboard/produtos");
    return { success: true };
  }

  await prisma.product.delete({ where: { id } });

  revalidatePath("/dashboard/produtos");
  return { success: true };
}
