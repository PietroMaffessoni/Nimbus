import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string().optional().or(z.literal("")),
  description: z.string().min(1, "Informe a descrição do item"),
  quantity: z.coerce.number().positive("Quantidade deve ser maior que zero"),
  unitPrice: z.coerce.number().nonnegative("Preço inválido"),
});

export const saleSchema = z.object({
  customerId: z.string().min(1, "Selecione um cliente"),
  issueDate: z.string().min(1, "Informe a data de emissão"),
  dueDate: z.string().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PENDING", "PAID", "CANCELED"]),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(saleItemSchema).min(1, "Adicione pelo menos um item"),
});

export type SaleInput = z.infer<typeof saleSchema>;
export type SaleItemInput = z.infer<typeof saleItemSchema>;
