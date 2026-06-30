import { PrismaClient, ProductType, SaleStatus, TransactionStatus, TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function monthsAgo(months: number, day = 10) {
  const date = new Date();
  date.setDate(day);
  date.setMonth(date.getMonth() - months);
  return date;
}

async function main() {
  const existing = await prisma.organization.findFirst();
  if (existing) {
    console.log("Banco já contém dados — seed ignorado.");
    return;
  }

  const organization = await prisma.organization.create({
    data: {
      name: "Empresa Demo",
      document: "12.345.678/0001-90",
      phone: "(11) 91234-5678",
      address: "Av. Paulista, 1000 - São Paulo/SP",
    },
  });

  const passwordHash = await bcrypt.hash("demo1234", 10);
  await prisma.user.create({
    data: {
      name: "Usuário Demo",
      email: "demo@empresa.com",
      passwordHash,
      organizationId: organization.id,
    },
  });

  const customers = await Promise.all(
    [
      { name: "Ana Beatriz Souza", email: "ana.souza@cliente.com", phone: "(11) 98888-1111", document: "111.222.333-44" },
      { name: "Carlos Eduardo Lima", email: "carlos.lima@cliente.com", phone: "(11) 98888-2222", document: "222.333.444-55" },
      { name: "Mercado Bom Preço Ltda", email: "compras@bompreco.com", phone: "(11) 3322-1100", document: "33.222.111/0001-22" },
      { name: "Fernanda Oliveira", email: "fernanda.oliveira@cliente.com", phone: "(11) 98888-3333", document: "333.444.555-66" },
      { name: "Tech Solutions ME", email: "financeiro@techsolutions.com", phone: "(11) 4455-6677", document: "44.555.666/0001-77" },
      { name: "Ricardo Almeida", email: "ricardo.almeida@cliente.com", phone: "(11) 98888-4444", document: "444.555.666-77" },
    ].map((c) => prisma.customer.create({ data: { ...c, organizationId: organization.id } }))
  );

  const products = await Promise.all(
    [
      { name: "Consultoria de Negócios", description: "Hora de consultoria especializada", price: 250, type: ProductType.SERVICE },
      { name: "Manutenção Mensal", description: "Pacote de manutenção recorrente", price: 480, type: ProductType.SERVICE },
      { name: "Instalação Técnica", description: "Serviço de instalação no local", price: 320, type: ProductType.SERVICE },
      { name: "Caixa de Embalagem", description: "Caixa de papelão reforçada", price: 18.5, type: ProductType.PRODUCT },
      { name: "Etiqueta Adesiva (rolo)", description: "Rolo com 500 etiquetas", price: 35, type: ProductType.PRODUCT },
      { name: "Kit Ferramentas Básico", description: "Kit com 12 ferramentas", price: 159.9, type: ProductType.PRODUCT },
      { name: "Suporte Técnico (hora)", description: "Atendimento técnico avulso", price: 120, type: ProductType.SERVICE },
      { name: "Licença de Software Anual", description: "Licença de uso por 12 meses", price: 890, type: ProductType.PRODUCT },
    ].map((p) => prisma.product.create({ data: { ...p, organizationId: organization.id } }))
  );

  const saleDefs = [
    { customer: 0, items: [[0, 2], [4, 3]], monthsBack: 5, status: SaleStatus.PAID },
    { customer: 2, items: [[3, 20], [4, 5]], monthsBack: 5, status: SaleStatus.PAID },
    { customer: 1, items: [[1, 1]], monthsBack: 4, status: SaleStatus.PAID },
    { customer: 4, items: [[7, 1], [6, 2]], monthsBack: 4, status: SaleStatus.PAID },
    { customer: 3, items: [[5, 2]], monthsBack: 3, status: SaleStatus.PAID },
    { customer: 5, items: [[0, 4]], monthsBack: 3, status: SaleStatus.PAID },
    { customer: 2, items: [[3, 50], [4, 10]], monthsBack: 2, status: SaleStatus.PAID },
    { customer: 0, items: [[2, 1], [6, 1]], monthsBack: 1, status: SaleStatus.PAID },
    { customer: 4, items: [[1, 1], [7, 1]], monthsBack: 1, status: SaleStatus.PENDING },
    { customer: 1, items: [[0, 1]], monthsBack: 0, status: SaleStatus.PENDING },
    { customer: 5, items: [[5, 1], [3, 10]], monthsBack: 0, status: SaleStatus.DRAFT },
  ] as const;

  let number = 1;
  for (const def of saleDefs) {
    const itemsData = def.items.map(([productIdx, quantity]) => {
      const product = products[productIdx];
      const unitPrice = Number(product.price);
      return {
        productId: product.id,
        description: product.name,
        quantity,
        unitPrice,
        total: unitPrice * quantity,
      };
    });
    const total = itemsData.reduce((sum, i) => sum + i.total, 0);
    const issueDate = monthsAgo(def.monthsBack);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 15);

    const sale = await prisma.sale.create({
      data: {
        organizationId: organization.id,
        customerId: customers[def.customer].id,
        number: number++,
        status: def.status,
        issueDate,
        dueDate,
        total,
        items: { create: itemsData },
      },
    });

    if (def.status === SaleStatus.PAID) {
      await prisma.transaction.create({
        data: {
          organizationId: organization.id,
          type: TransactionType.INCOME,
          category: "Vendas",
          description: `Recebimento da venda #${sale.number}`,
          amount: total,
          dueDate,
          paidAt: dueDate,
          status: TransactionStatus.PAID,
          relatedSaleId: sale.id,
        },
      });
    } else if (def.status === SaleStatus.PENDING) {
      const isOverdue = dueDate < new Date();
      await prisma.transaction.create({
        data: {
          organizationId: organization.id,
          type: TransactionType.INCOME,
          category: "Vendas",
          description: `Recebimento da venda #${sale.number}`,
          amount: total,
          dueDate,
          status: isOverdue ? TransactionStatus.OVERDUE : TransactionStatus.PENDING,
          relatedSaleId: sale.id,
        },
      });
    }
  }

  const manualTransactions = [
    { type: TransactionType.EXPENSE, category: "Aluguel", description: "Aluguel da loja", amount: 1800, monthsBack: 2, paid: true },
    { type: TransactionType.EXPENSE, category: "Aluguel", description: "Aluguel da loja", amount: 1800, monthsBack: 1, paid: true },
    { type: TransactionType.EXPENSE, category: "Aluguel", description: "Aluguel da loja", amount: 1800, monthsBack: 0, paid: false },
    { type: TransactionType.EXPENSE, category: "Fornecedores", description: "Compra de insumos", amount: 640.5, monthsBack: 1, paid: true },
    { type: TransactionType.EXPENSE, category: "Marketing", description: "Anúncios redes sociais", amount: 350, monthsBack: 0, paid: false },
    { type: TransactionType.EXPENSE, category: "Utilidades", description: "Energia elétrica", amount: 280.75, monthsBack: 0, paid: false },
    { type: TransactionType.INCOME, category: "Outras Receitas", description: "Venda de equipamento usado", amount: 500, monthsBack: 2, paid: true },
  ];

  for (const t of manualTransactions) {
    const dueDate = monthsAgo(t.monthsBack, 20);
    await prisma.transaction.create({
      data: {
        organizationId: organization.id,
        type: t.type,
        category: t.category,
        description: t.description,
        amount: t.amount,
        dueDate,
        paidAt: t.paid ? dueDate : null,
        status: t.paid ? TransactionStatus.PAID : dueDate < new Date() ? TransactionStatus.OVERDUE : TransactionStatus.PENDING,
      },
    });
  }

  console.log("Seed concluído com sucesso.");
  console.log("Login demo: demo@empresa.com / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
