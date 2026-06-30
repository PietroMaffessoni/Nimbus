import { listSales } from "@/actions/sales";
import { SalesTable } from "@/components/vendas/sales-table";

export default async function VendasPage() {
  const sales = await listSales();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Vendas</h2>
        <p className="text-sm text-muted-foreground">Acompanhe orçamentos e vendas em um só lugar.</p>
      </div>
      <SalesTable sales={sales} />
    </div>
  );
}
