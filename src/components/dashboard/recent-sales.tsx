import Link from "next/link";
import { ReceiptText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SaleStatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SaleRow {
  id: string;
  number: number;
  total: unknown;
  status: "DRAFT" | "PENDING" | "PAID" | "CANCELED";
  issueDate: Date;
  customer: { name: string };
}

export function RecentSales({ sales }: { sales: SaleRow[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vendas recentes</CardTitle>
        <Link href="/dashboard/vendas" className="text-xs font-medium text-primary hover:underline">
          Ver todas
        </Link>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <EmptyState icon={ReceiptText} title="Nenhuma venda ainda" description="Suas vendas mais recentes vão aparecer aqui." />
        ) : (
          <div className="divide-y divide-border">
            {sales.map((sale) => (
              <Link
                key={sale.id}
                href={`/dashboard/vendas/${sale.id}`}
                className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/40 -mx-2 px-2 rounded-lg"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{sale.customer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Venda #{sale.number} · {formatDate(sale.issueDate)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-semibold">{formatCurrency(Number(sale.total))}</span>
                  <SaleStatusBadge status={sale.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
