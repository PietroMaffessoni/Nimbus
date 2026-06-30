"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export async function getDashboardData() {
  const session = await requireSession();
  const organizationId = session.user.organizationId;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [monthIncome, receivable, payable, recentSales, upcoming, sixMonthsTransactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        organizationId,
        type: "INCOME",
        status: "PAID",
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { organizationId, type: "INCOME", status: { in: ["PENDING", "OVERDUE"] } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { organizationId, type: "EXPENSE", status: { in: ["PENDING", "OVERDUE"] } },
      _sum: { amount: true },
    }),
    prisma.sale.findMany({
      where: { organizationId },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.transaction.findMany({
      where: { organizationId, status: { in: ["PENDING", "OVERDUE"] } },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.transaction.findMany({
      where: {
        organizationId,
        status: "PAID",
        paidAt: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
      },
      select: { type: true, amount: true, paidAt: true },
    }),
  ]);

  const monthExpense = await prisma.transaction.aggregate({
    where: {
      organizationId,
      type: "EXPENSE",
      status: "PAID",
      paidAt: { gte: monthStart, lte: monthEnd },
    },
    _sum: { amount: true },
  });

  const chartBuckets: { month: string; receitas: number; despesas: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    chartBuckets.push({ month: MONTH_LABELS[ref.getMonth()], receitas: 0, despesas: 0 });
  }

  for (const t of sixMonthsTransactions) {
    if (!t.paidAt) continue;
    const diffMonths =
      (now.getFullYear() - t.paidAt.getFullYear()) * 12 + (now.getMonth() - t.paidAt.getMonth());
    const bucketIndex = 5 - diffMonths;
    if (bucketIndex < 0 || bucketIndex > 5) continue;
    if (t.type === "INCOME") {
      chartBuckets[bucketIndex].receitas += Number(t.amount);
    } else {
      chartBuckets[bucketIndex].despesas += Number(t.amount);
    }
  }

  const income = Number(monthIncome._sum.amount ?? 0);
  const expense = Number(monthExpense._sum.amount ?? 0);

  return {
    kpis: {
      monthRevenue: income,
      monthExpense: expense,
      balance: income - expense,
      receivable: Number(receivable._sum.amount ?? 0),
      payable: Number(payable._sum.amount ?? 0),
    },
    chart: chartBuckets,
    recentSales,
    upcoming,
  };
}
