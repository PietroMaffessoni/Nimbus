"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { customerSchema, type CustomerInput } from "@/lib/validations/customer";
import type { ActionResult } from "@/actions/auth";

export async function listCustomers() {
  const session = await requireSession();
  return prisma.customer.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { name: "asc" },
  });
}

export async function getCustomer(id: string) {
  const session = await requireSession();
  return prisma.customer.findFirst({
    where: { id, organizationId: session.user.organizationId },
  });
}

export async function getCustomerSales(customerId: string) {
  const session = await requireSession();
  return prisma.sale.findMany({
    where: { customerId, organizationId: session.user.organizationId },
    orderBy: { number: "desc" },
  });
}

export async function createCustomer(input: CustomerInput): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await prisma.customer.create({
    data: { ...parsed.data, organizationId: session.user.organizationId },
  });

  revalidatePath("/dashboard/clientes");
  return { success: true };
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const existing = await prisma.customer.findFirst({
    where: { id, organizationId: session.user.organizationId },
  });
  if (!existing) {
    return { success: false, error: "Cliente não encontrado." };
  }

  await prisma.customer.update({ where: { id }, data: parsed.data });

  revalidatePath("/dashboard/clientes");
  return { success: true };
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const existing = await prisma.customer.findFirst({
    where: { id, organizationId: session.user.organizationId },
  });
  if (!existing) {
    return { success: false, error: "Cliente não encontrado." };
  }

  const salesCount = await prisma.sale.count({ where: { customerId: id } });
  if (salesCount > 0) {
    return { success: false, error: "Não é possível excluir um cliente com vendas associadas." };
  }

  await prisma.customer.delete({ where: { id } });

  revalidatePath("/dashboard/clientes");
  return { success: true };
}
