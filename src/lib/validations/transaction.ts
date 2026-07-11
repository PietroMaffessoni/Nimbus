import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Informe a categoria"),
  description: z.string().min(1, "Informe a descrição"),
  amount: z.coerce.number().positive("O valor deve ser maior que zero"),
  dueDate: z.string().min(1, "Informe a data de vencimento"),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]),
  recurrence: z.enum(["NONE", "WEEKLY", "MONTHLY", "YEARLY"]),
  occurrences: z.coerce.number().int().min(1, "Mínimo de 1 repetição").max(60, "Máximo de 60 repetições"),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
