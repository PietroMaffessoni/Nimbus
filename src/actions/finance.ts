"use server";

import { randomUUID } from "crypto";
import { addDays, addMonths, addYears } from "date-fns";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { transactionSchema, type TransactionInput } from "@/lib/validations/transaction";
import type { ActionResult } from "@/actions/auth";

function nextOccurrenceDate(baseDate: Date, recurrence: TransactionInput["recurrence"], index: number) {
  if (recurrence === "WEEKLY") return addDays(baseDate, 7 * index);
  if (recurrence === "YEARLY") return addYears(baseDate, index);
  return addMonths(baseDate, index);
}

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
  const baseDueDate = new Date(data.dueDate);
  const occurrenceCount = data.recurrence === "NONE" ? 1 : data.occurrences;
  const recurringGroupId = data.recurrence === "NONE" ? null : randomUUID();

  await prisma.transaction.createMany({
    data: Array.from({ length: occurrenceCount }, (_, index) => ({
      organizationId: session.user.organizationId,
      type: data.type,
      category: data.category,
      description: data.description,
      amount: data.amount,
      dueDate: nextOccurrenceDate(baseDueDate, data.recurrence, index),
      status: index === 0 ? data.status : ("PENDING" as const),
      paidAt: index === 0 && data.status === "PAID" ? new Date() : null,
      recurringGroupId,
    })),
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
