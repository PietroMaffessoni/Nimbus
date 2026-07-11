import { TrendingDown, TrendingUp } from "lucide-react";

import { listTransactions } from "@/actions/finance";
import { listCategories } from "@/actions/categories";
import { TransactionsTable } from "@/components/financeiro/transactions-table";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function FinanceiroPage() {
  const [transactions, categories] = await Promise.all([listTransactions(), listCategories()]);

  const receivable = transactions
    .filter((t) => t.type === "INCOME" && t.status !== "PAID")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const payable = transactions
    .filter((t) => t.type === "EXPENSE" && t.status !== "PAID")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Financeiro</h2>
        <p className="text-sm text-muted-foreground">Contas a pagar, a receber e seu fluxo de caixa.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total a receber</p>
              <p className="text-2xl font-semibold tracking-tight">{formatCurrency(receivable)}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total a pagar</p>
              <p className="text-2xl font-semibold tracking-tight">{formatCurrency(payable)}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <TransactionsTable transactions={transactions} categories={categories} />
    </div>
  );
}
