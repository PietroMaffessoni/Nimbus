import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Informe o nome do produto/serviço"),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().positive("O preço deve ser maior que zero"),
  type: z.enum(["PRODUCT", "SERVICE"]),
  active: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;
