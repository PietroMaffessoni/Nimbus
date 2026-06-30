import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { listCustomers } from "@/actions/customers";
import { listProducts } from "@/actions/products";
import { SaleForm } from "@/components/vendas/sale-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

export default async function NovaVendaPage() {
  const [customers, products] = await Promise.all([listCustomers(), listProducts()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/vendas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Nova venda</h2>
          <p className="text-sm text-muted-foreground">Monte um orçamento ou venda para um cliente.</p>
        </div>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Cadastre um cliente primeiro"
          description="Você precisa de pelo menos um cliente cadastrado para criar uma venda."
          action={
            <Button asChild size="sm">
              <Link href="/dashboard/clientes">Ir para Clientes</Link>
            </Button>
          }
        />
      ) : (
        <SaleForm customers={customers} products={products} />
      )}
    </div>
  );
}
