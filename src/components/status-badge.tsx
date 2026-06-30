import { Badge } from "@/components/ui/badge";

const saleStatusMap = {
  DRAFT: { label: "Rascunho", variant: "secondary" as const },
  PENDING: { label: "Pendente", variant: "warning" as const },
  PAID: { label: "Paga", variant: "success" as const },
  CANCELED: { label: "Cancelada", variant: "destructive" as const },
};

const transactionStatusMap = {
  PENDING: { label: "Pendente", variant: "warning" as const },
  PAID: { label: "Pago", variant: "success" as const },
  OVERDUE: { label: "Atrasado", variant: "destructive" as const },
};

export function SaleStatusBadge({ status }: { status: keyof typeof saleStatusMap }) {
  const { label, variant } = saleStatusMap[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function TransactionStatusBadge({ status }: { status: keyof typeof transactionStatusMap }) {
  const { label, variant } = transactionStatusMap[status];
  return <Badge variant={variant}>{label}</Badge>;
}
