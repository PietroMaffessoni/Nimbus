import { saleStatusMap } from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SalePrintViewProps {
  sale: {
    number: number;
    status: keyof typeof saleStatusMap;
    issueDate: Date;
    dueDate: Date | null;
    discount: unknown;
    total: unknown;
    notes: string | null;
    customer: {
      name: string;
      email: string | null;
      phone: string | null;
      document: string | null;
      address: string | null;
    };
    items: {
      id: string;
      description: string;
      quantity: unknown;
      unitPrice: unknown;
      total: unknown;
    }[];
  };
  organization: {
    name: string;
    document: string | null;
    phone: string | null;
    address: string | null;
  };
}

export function SalePrintView({ sale, organization }: SalePrintViewProps) {
  const discount = Number(sale.discount);
  const itemsSubtotal = sale.items.reduce((sum, item) => sum + Number(item.total), 0);

  return (
    <div className="hidden print:block">
      <div className="flex items-start justify-between border-b border-gray-300 pb-4">
        <div>
          <p className="text-lg font-semibold text-gray-900">{organization.name}</p>
          {organization.document && <p className="text-xs text-gray-600">CNPJ/CPF: {organization.document}</p>}
          {organization.phone && <p className="text-xs text-gray-600">{organization.phone}</p>}
          {organization.address && <p className="text-xs text-gray-600">{organization.address}</p>}
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">Venda #{sale.number}</p>
          <p className="text-xs text-gray-600">Status: {saleStatusMap[sale.status].label}</p>
          <p className="text-xs text-gray-600">Emissão: {formatDate(sale.issueDate)}</p>
          {sale.dueDate && <p className="text-xs text-gray-600">Vencimento: {formatDate(sale.dueDate)}</p>}
        </div>
      </div>

      <div className="mt-4 border-b border-gray-300 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Cliente</p>
        <p className="text-sm font-medium text-gray-900">{sale.customer.name}</p>
        {sale.customer.document && <p className="text-xs text-gray-600">Documento: {sale.customer.document}</p>}
        {sale.customer.email && <p className="text-xs text-gray-600">{sale.customer.email}</p>}
        {sale.customer.phone && <p className="text-xs text-gray-600">{sale.customer.phone}</p>}
        {sale.customer.address && <p className="text-xs text-gray-600">{sale.customer.address}</p>}
      </div>

      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-300 text-left text-xs uppercase tracking-wide text-gray-500">
            <th className="py-2">Descrição</th>
            <th className="py-2 text-right">Qtd.</th>
            <th className="py-2 text-right">Preço unit.</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-2 text-gray-900">{item.description}</td>
              <td className="py-2 text-right text-gray-700">{Number(item.quantity)}</td>
              <td className="py-2 text-right text-gray-700">{formatCurrency(item.unitPrice as number)}</td>
              <td className="py-2 text-right text-gray-900">{formatCurrency(item.total as number)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <div className="w-56">
          {discount > 0 && (
            <>
              <div className="flex justify-between py-1 text-sm text-gray-700">
                <span>Subtotal</span>
                <span>{formatCurrency(itemsSubtotal)}</span>
              </div>
              <div className="flex justify-between py-1 text-sm text-gray-700">
                <span>Desconto</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between border-t border-gray-300 py-2 text-sm font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(sale.total as number)}</span>
          </div>
        </div>
      </div>

      {sale.notes && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Observações</p>
          <p className="text-sm text-gray-700">{sale.notes}</p>
        </div>
      )}
    </div>
  );
}
