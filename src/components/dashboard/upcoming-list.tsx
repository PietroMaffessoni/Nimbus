import { CalendarClock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionStatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TransactionRow {
  id: string;
  description: string;
  amount: unknown;
  type: "INCOME" | "EXPENSE";
  status: "PENDING" | "PAID" | "OVERDUE";
  dueDate: Date;
}

export function UpcomingList({ transactions }: { transactions: TransactionRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos vencimentos</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <EmptyState icon={CalendarClock} title="Tudo em dia" description="Não há contas pendentes no momento." />
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.description}</p>
                  <p className="text-xs text-muted-foreground">Vence em {formatDate(t.dueDate)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className={`text-sm font-semibold ${t.type === "EXPENSE" ? "text-destructive" : "text-success"}`}>
                    {t.type === "EXPENSE" ? "-" : "+"}
                    {formatCurrency(Number(t.amount))}
                  </span>
                  <TransactionStatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
