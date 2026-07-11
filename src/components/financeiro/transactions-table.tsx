"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MoreHorizontal, Plus, Repeat, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { TransactionStatusBadge } from "@/components/status-badge";
import { TransactionForm } from "@/components/financeiro/transaction-form";
import { CategoryManager } from "@/components/financeiro/category-manager";
import { markTransactionAsPaid, deleteTransaction } from "@/actions/finance";
import { formatCurrency, formatDate } from "@/lib/utils";

const PAGE_SIZE = 10;

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string;
  amount: unknown;
  dueDate: Date;
  status: "PENDING" | "PAID" | "OVERDUE";
  relatedSaleId: string | null;
  recurringGroupId: string | null;
}

interface Category {
  id: string;
  type: "INCOME" | "EXPENSE";
  name: string;
}

export function TransactionsTable({
  transactions,
  categories,
}: {
  transactions: Transaction[];
  categories: Category[];
}) {
  const router = useRouter();
  const [type, setType] = React.useState("ALL");
  const [status, setStatus] = React.useState("ALL");
  const [formOpen, setFormOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState<Transaction | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [payingId, setPayingId] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);

  const filtered = transactions.filter((t) => {
    const matchesType = type === "ALL" || t.type === type;
    const matchesStatus = status === "ALL" || t.status === status;
    return matchesType && matchesStatus;
  });
  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleTypeChange(value: string) {
    setType(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatus(value);
    setPage(1);
  }

  async function handleMarkPaid(id: string) {
    setPayingId(id);
    const result = await markTransactionAsPaid(id);
    setPayingId(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Lançamento marcado como pago.");
    router.refresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    const result = await deleteTransaction(deleting.id);
    setDeleteLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Lançamento excluído.");
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os tipos</SelectItem>
              <SelectItem value="INCOME">Receitas</SelectItem>
              <SelectItem value="EXPENSE">Despesas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="PAID">Pago</SelectItem>
              <SelectItem value="OVERDUE">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <CategoryManager categories={categories} />
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Novo lançamento
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Nenhum lançamento encontrado"
          description="Crie um lançamento manual ou ajuste os filtros."
          action={
            <Button onClick={() => setFormOpen(true)} size="sm">
              <Plus className="h-4 w-4" /> Novo lançamento
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    {t.description}
                    {t.recurringGroupId && (
                      <span title="Lançamento recorrente">
                        <Repeat className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{t.category}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(t.dueDate)}</TableCell>
                <TableCell>
                  <TransactionStatusBadge status={t.status} />
                </TableCell>
                <TableCell className={`text-right font-semibold ${t.type === "EXPENSE" ? "text-destructive" : "text-success"}`}>
                  {t.type === "EXPENSE" ? "-" : "+"}
                  {formatCurrency(Number(t.amount))}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {t.status !== "PAID" && (
                        <DropdownMenuItem onClick={() => handleMarkPaid(t.id)} disabled={payingId === t.id}>
                          <CheckCircle2 className="mr-1 h-4 w-4" /> Marcar como pago
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        disabled={!!t.relatedSaleId}
                        onClick={() => setDeleting(t)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Pagination page={currentPage} pageSize={PAGE_SIZE} totalItems={filtered.length} onPageChange={setPage} />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo lançamento</DialogTitle>
          </DialogHeader>
          <TransactionForm
            categories={categories}
            onSuccess={() => {
              setFormOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir lançamento"
        description={`Tem certeza que deseja excluir "${deleting?.description}"?`}
        confirmLabel="Excluir"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
