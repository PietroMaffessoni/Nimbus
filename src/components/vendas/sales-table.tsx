"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, ReceiptText, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { SaleStatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";

const PAGE_SIZE = 10;

interface Sale {
  id: string;
  number: number;
  total: unknown;
  status: "DRAFT" | "PENDING" | "PAID" | "CANCELED";
  issueDate: Date;
  customer: { name: string };
}

export function SalesTable({ sales }: { sales: Sale[] }) {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string>("ALL");
  const [page, setPage] = React.useState(1);

  const filtered = sales.filter((sale) => {
    const matchesSearch =
      sale.customer.name.toLowerCase().includes(search.toLowerCase()) || String(sale.number).includes(search);
    const matchesStatus = status === "ALL" || sale.status === status;
    return matchesSearch && matchesStatus;
  });
  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por cliente ou número..." className="pl-9" value={search} onChange={(e) => handleSearchChange(e.target.value)} />
          </div>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="DRAFT">Rascunho</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="PAID">Paga</SelectItem>
              <SelectItem value="CANCELED">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link href="/dashboard/vendas/nova">
            <Plus className="h-4 w-4" /> Nova venda
          </Link>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={search || status !== "ALL" ? "Nenhuma venda encontrada" : "Nenhuma venda registrada"}
          description={search || status !== "ALL" ? "Ajuste os filtros para ver mais resultados." : "Crie sua primeira venda para começar a faturar."}
          action={
            !search && status === "ALL" && (
              <Button asChild size="sm">
                <Link href="/dashboard/vendas/nova">
                  <Plus className="h-4 w-4" /> Nova venda
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Emissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((sale) => (
              <TableRow key={sale.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/dashboard/vendas/${sale.id}`} className="block font-medium text-primary">
                    #{sale.number}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/dashboard/vendas/${sale.id}`} className="block">
                    {sale.customer.name}
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

      <Pagination page={currentPage} pageSize={PAGE_SIZE} totalItems={filtered.length} onPageChange={setPage} />
    </div>
  );
}
