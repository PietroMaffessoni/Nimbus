-- CreateTable
CREATE TABLE "finance_categories" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finance_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "finance_categories_organizationId_idx" ON "finance_categories"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "finance_categories_organizationId_type_name_key" ON "finance_categories"("organizationId", "type", "name");

-- AddForeignKey
ALTER TABLE "finance_categories" ADD CONSTRAINT "finance_categories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: dá às organizações já existentes o mesmo conjunto de categorias
-- que antes era fixo no código (src/components/financeiro/transaction-form.tsx),
-- para que nada mude visualmente até o usuário editar suas categorias.
INSERT INTO "finance_categories" ("id", "organizationId", "type", "name", "createdAt")
SELECT gen_random_uuid()::text, o."id", cat.type::"TransactionType", cat.name, CURRENT_TIMESTAMP
FROM "organizations" o
CROSS JOIN (
    VALUES
        ('INCOME', 'Vendas'),
        ('INCOME', 'Serviços'),
        ('INCOME', 'Outras Receitas'),
        ('EXPENSE', 'Aluguel'),
        ('EXPENSE', 'Fornecedores'),
        ('EXPENSE', 'Marketing'),
        ('EXPENSE', 'Utilidades'),
        ('EXPENSE', 'Folha de Pagamento'),
        ('EXPENSE', 'Outras Despesas')
) AS cat(type, name)
ON CONFLICT DO NOTHING;
