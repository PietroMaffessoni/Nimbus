import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Informe a categoria"),
  description: z.string().min(1, "Informe a descrição"),
  amount: z.coerce.number().positive("O valor deve ser maior que zero"),
  dueDate: z.string().min(1, "Informe a data de vencimento"),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
