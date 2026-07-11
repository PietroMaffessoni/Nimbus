"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { saleSchema, type SaleInput } from "@/lib/validations/sale";
import type { ActionResult } from "@/actions/auth";

export async function listSales() {
  const session = await requireSession();
  return prisma.sale.findMany({
    where: { organizationId: session.user.organizationId },
    include: { customer: true, items: true },
    orderBy: { number: "desc" },
  });
}

export async function getSale(id: string) {
  const session = await requireSession();
  return prisma.sale.findFirst({
    where: { id, organizationId: session.user.organizationId },
    include: { customer: true, organization: true, items: { include: { product: true } } },
  });
}

function calculateItemsTotal(items: SaleInput["items"]) {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

async function syncSaleTransaction(
  tx: Prisma.TransactionClient,
  saleId: string,
  organizationId: string,
  status: SaleInput["status"],
  total: number,
  dueDate: Date,
  saleNumber: number
) {
  const existing = await tx.transaction.findFirst({ where: { relatedSaleId: saleId } });

  if (status === "PAID") {
    if (existing) {
      await tx.transaction.update({
        where: { id: existing.id },
        data: { amount: total, status: "PAID", paidAt: existing.paidAt ?? new Date(), dueDate },
      });
    } else {
      await tx.transaction.create({
        data: {
          organizationId,
          type: "INCOME",
          category: "Vendas",
          description: `Recebimento da venda #${saleNumber}`,
          amount: total,
          dueDate,
          paidAt: new Date(),
          status: "PAID",
          relatedSaleId: saleId,
        },
      });
    }
  } else if (status === "PENDING") {
    const computedStatus = dueDate < new Date() ? "OVERDUE" : "PENDING";
    if (existing) {
      await tx.transaction.update({
        where: { id: existing.id },
        data: { amount: total, status: computedStatus, paidAt: null, dueDate },
      });
    } else {
      await tx.transaction.create({
        data: {
          organizationId,
          type: "INCOME",
          category: "Vendas",
          description: `Recebimento da venda #${saleNumber}`,
          amount: total,
          dueDate,
          status: computedStatus,
          relatedSaleId: saleId,
        },
      });
    }
  } else if (existing) {
    await tx.transaction.delete({ where: { id: existing.id } });
  }
}

export async function createSale(input: SaleInput): Promise<ActionResult & { id?: string }> {
  const session = await requireSession();
  const parsed = saleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const data = parsed.data;
  const customer = await prisma.customer.findFirst({
    where: { id: data.customerId, organizationId: session.user.organizationId },
  });
  if (!customer) {
    return { success: false, error: "Cliente inválido." };
  }

  const total = calculateItemsTotal(data.items) - data.discount;
  const dueDate = data.dueDate ? new Date(data.dueDate) : new Date(data.issueDate);

  const saleId = await prisma.$transaction(async (tx) => {
    const last = await tx.sale.findFirst({
      where: { organizationId: session.user.organizationId },
      orderBy: { number: "desc" },
      select: { number: true },
    });
    const number = (last?.number ?? 0) + 1;

    const sale = await tx.sale.create({
      data: {
        organizationId: session.user.organizationId,
        customerId: data.customerId,
        number,
        status: data.status,
        issueDate: new Date(data.issueDate),
        dueDate,
        notes: data.notes || null,
        discount: data.discount,
        total,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId || null,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
    });

    if (data.status === "PAID" || data.status === "PENDING") {
      await syncSaleTransaction(tx, sale.id, session.user.organizationId, data.status, total, dueDate, number);
    }

    return sale.id;
  });

  revalidatePath("/dashboard/vendas");
  revalidatePath("/dashboard/financeiro");
  revalidatePath("/dashboard");
  return { success: true, id: saleId };
}

export async function updateSale(id: string, input: SaleInput): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = saleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const existing = await prisma.sale.findFirst({
    where: { id, organizationId: session.user.organizationId },
  });
  if (!existing) {
    return { success: false, error: "Venda não encontrada." };
  }

  const data = parsed.data;
  const customer = await prisma.customer.findFirst({
    where: { id: data.customerId, organizationId: session.user.organizationId },
  });
  if (!customer) {
    return { success: false, error: "Cliente inválido." };
  }

  const total = calculateItemsTotal(data.items) - data.discount;
  const dueDate = data.dueDate ? new Date(data.dueDate) : new Date(data.issueDate);

  await prisma.$transaction(async (tx) => {
    await tx.saleItem.deleteMany({ where: { saleId: id } });
    await tx.sale.update({
      where: { id },
      data: {
        customerId: data.customerId,
        status: data.status,
        issueDate: new Date(data.issueDate),
        dueDate,
        notes: data.notes || null,
        discount: data.discount,
        total,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId || null,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
    });

    await syncSaleTransaction(tx, id, session.user.organizationId, data.status, total, dueDate, existing.number);
  });

  revalidatePath("/dashboard/vendas");
  revalidatePath("/dashboard/financeiro");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function markSaleAsPaid(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const sale = await prisma.sale.findFirst({
    where: { id, organizationId: session.user.organizationId },
  });
  if (!sale) {
    return { success: false, error: "Venda não encontrada." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.sale.update({ where: { id }, data: { status: "PAID" } });
    await syncSaleTransaction(
      tx,
      id,
      session.user.organizationId,
      "PAID",
      Number(sale.total),
      sale.dueDate ?? sale.issueDate,
      sale.number
    );
  });

  revalidatePath("/dashboard/vendas");
  revalidatePath("/dashboard/financeiro");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function duplicateSale(id: string): Promise<ActionResult & { id?: string }> {
  const session = await requireSession();
  const existing = await prisma.sale.findFirst({
    where: { id, organizationId: session.user.organizationId },
    include: { items: true },
  });
  if (!existing) {
    return { success: false, error: "Venda não encontrada." };
  }

  const newSaleId = await prisma.$transaction(async (tx) => {
    const last = await tx.sale.findFirst({
      where: { organizationId: session.user.organizationId },
      orderBy: { number: "desc" },
      select: { number: true },
    });
    const number = (last?.number ?? 0) + 1;

    const sale = await tx.sale.create({
      data: {
        organizationId: session.user.organizationId,
        customerId: existing.customerId,
        number,
        status: "DRAFT",
        issueDate: new Date(),
        discount: existing.discount,
        total: existing.total,
        notes: existing.notes,
        items: {
          create: existing.items.map((item) => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
    });

    return sale.id;
  });

  revalidatePath("/dashboard/vendas");
  return { success: true, id: newSaleId };
}

export async function deleteSale(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const existing = await prisma.sale.findFirst({
    where: { id, organizationId: session.user.organizationId },
  });
  if (!existing) {
    return { success: false, error: "Venda não encontrada." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.transaction.deleteMany({ where: { relatedSaleId: id } });
    await tx.saleItem.deleteMany({ where: { saleId: id } });
    await tx.sale.delete({ where: { id } });
  });

  revalidatePath("/dashboard/vendas");
  revalidatePath("/dashboard/financeiro");
  revalidatePath("/dashboard");
  return { success: true };
}
