import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getSale } from "@/actions/sales";
import { listCustomers } from "@/actions/customers";
import { listProducts } from "@/actions/products";
import { SaleForm } from "@/components/vendas/sale-form";
import { SaleActions } from "@/components/vendas/sale-actions";
import { SaleStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateForInput } from "@/lib/utils";

export default async function VendaDetailPage({ params }: { params: { id: string } }) {
  const [sale, customers, products] = await Promise.all([getSale(params.id), listCustomers(), listProducts()]);

  if (!sale) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/vendas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Venda #{sale.number}</h2>
            <SaleStatusBadge status={sale.status} />
          </div>
        </div>
        <SaleActions saleId={sale.id} status={sale.status} />
      </div>

      <SaleForm
        saleId={sale.id}
        customers={customers}
        products={products}
        defaultValues={{
          customerId: sale.customerId,
          issueDate: formatDateForInput(sale.issueDate),
          dueDate: sale.dueDate ? formatDateForInput(sale.dueDate) : "",
          status: sale.status,
          notes: sale.notes ?? "",
          items: sale.items.map((item) => ({
            productId: item.productId ?? "",
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          })),
        }}
      />
    </div>
  );
}
