import { listCustomers } from "@/actions/customers";
import { CustomersTable } from "@/components/clientes/customers-table";

export default async function ClientesPage() {
  const customers = await listCustomers();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Clientes</h2>
        <p className="text-sm text-muted-foreground">Gerencie as pessoas e empresas que compram de você.</p>
      </div>
      <CustomersTable customers={customers} />
    </div>
  );
}
