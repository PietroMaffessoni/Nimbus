"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, ReceiptText } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { SaleStatusBadge } from "@/components/status-badge";
import { getCustomerSales } from "@/actions/customers";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Sale {
  id: string;
  number: number;
  issueDate: Date;
  status: "DRAFT" | "PENDING" | "PAID" | "CANCELED";
  total: unknown;
}

export function CustomerSalesHistory({
  customerId,
  customerName,
  open,
  onOpenChange,
}: {
  customerId: string;
  customerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [sales, setSales] = React.useState<Sale[]>([]);

  React.useEffect(() => {
    if (!open) return;
    // Busca as vendas do cliente ao abrir o diálogo; setLoading aqui sincroniza
    // o estado de UI com uma requisição de rede disparada por uma prop externa (open).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getCustomerSales(customerId)
      .then(setSales)
      .finally(() => setLoading(false));
  }, [open, customerId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Histórico de vendas — {customerName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sales.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="Nenhuma venda ainda"
            description="As vendas feitas para este cliente vão aparecer aqui."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <Link href={`/dashboard/vendas/${sale.id}`} className="font-medium text-primary hover:underline">
                      #{sale.number}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(sale.issueDate)}</TableCell>
                  <TableCell>
                    <SaleStatusBadge status={sale.status} />
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(Number(sale.total))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
