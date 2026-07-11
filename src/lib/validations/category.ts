import { z } from "zod";

export const categorySchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  name: z.string().min(1, "Informe o nome da categoria").max(40, "Nome muito longo"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
