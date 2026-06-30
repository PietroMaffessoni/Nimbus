"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { transactionSchema, type TransactionInput } from "@/lib/validations/transaction";
import type { ActionResult } from "@/actions/auth";

export async function listTransactions() {
  const session = await requireSession();
  return prisma.transaction.findMany({
    where: { organizationId: session.user.organizationId },
    include: { relatedSale: true },
    orderBy: { dueDate: "desc" },
  });
}

export async function createTransaction(input: TransactionInput): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const data = parsed.data;
  await prisma.transaction.create({
    data: {
      organizationId: session.user.organizationId,
      type: data.type,
      category: data.category,
      description: data.description,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      status: data.status,
      paidAt: data.status === "PAID" ? new Date() : null,
    },
  });

  revalidatePath("/dashboard/financeiro");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function markTransactionAsPaid(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const existing = await prisma.transaction.findFirst({
    where: { id, organizationId: session.user.organizationId },
  });
  if (!existing) {
    return { success: false, error: "Lançamento não encontrado." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id },
      data: { status: "PAID", paidAt: new Date() },
    });

    if (existing.relatedSaleId) {
      await tx.sale.update({ where: { id: existing.relatedSaleId }, data: { status: "PAID" } });
    }
  });

  revalidatePath("/dashboard/financeiro");
  revalidatePath("/dashboard/vendas");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const existing = await prisma.transaction.findFirst({
    where: { id, organizationId: session.user.organizationId },
  });
  if (!existing) {
    return { success: false, error: "Lançamento não encontrado." };
  }
  if (existing.relatedSaleId) {
    return { success: false, error: "Este lançamento é gerado por uma venda e não pode ser excluído diretamente." };
  }

  await prisma.transaction.delete({ where: { id } });

  revalidatePath("/dashboard/financeiro");
  revalidatePath("/dashboard");
  return { success: true };
}
