"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { markSaleAsPaid, deleteSale } from "@/actions/sales";

export function SaleActions({ saleId, status }: { saleId: string; status: string }) {
  const router = useRouter();
  const [payLoading, setPayLoading] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  async function handleMarkPaid() {
    setPayLoading(true);
    const result = await markSaleAsPaid(saleId);
    setPayLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Venda marcada como paga.");
    router.refresh();
  }

  async function handleDelete() {
    setDeleteLoading(true);
    const result = await deleteSale(saleId);
    setDeleteLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Venda excluída.");
    router.push("/dashboard/vendas");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {status !== "PAID" && status !== "CANCELED" && (
        <Button variant="outline" onClick={handleMarkPaid} disabled={payLoading}>
          {payLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Marcar como paga
        </Button>
      )}
      <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleting(true)}>
        <Trash2 className="h-4 w-4" /> Excluir
      </Button>

      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Excluir venda"
        description="Tem certeza que deseja excluir esta venda? Lançamentos financeiros relacionados também serão removidos."
        confirmLabel="Excluir"
        loading={deleteLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
