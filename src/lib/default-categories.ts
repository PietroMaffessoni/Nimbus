import type { CategoryInput } from "@/lib/validations/category";

export const DEFAULT_CATEGORIES: CategoryInput[] = [
  { type: "INCOME", name: "Vendas" },
  { type: "INCOME", name: "Serviços" },
  { type: "INCOME", name: "Outras Receitas" },
  { type: "EXPENSE", name: "Aluguel" },
  { type: "EXPENSE", name: "Fornecedores" },
  { type: "EXPENSE", name: "Marketing" },
  { type: "EXPENSE", name: "Utilidades" },
  { type: "EXPENSE", name: "Folha de Pagamento" },
  { type: "EXPENSE", name: "Outras Despesas" },
];
