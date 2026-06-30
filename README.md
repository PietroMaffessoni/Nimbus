# Nimbus — Gestão simples para pequenas empresas

MVP de um SaaS de gestão empresarial focado em ser **simples, bonito e agradável de usar**. Não é um ERP completo — é um conjunto enxuto de funcionalidades muito bem executadas: clientes, produtos/serviços, vendas e fluxo de caixa, com um dashboard claro do dia a dia do negócio.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- TailwindCSS + componentes no estilo [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- [Prisma ORM](https://www.prisma.io/) + PostgreSQL
- [NextAuth.js](https://next-auth.js.org/) (Credentials + JWT)
- React Hook Form + Zod
- Recharts, next-themes (tema claro/escuro), sonner (toasts)
- Docker & Docker Compose

## Funcionalidades

- **Autenticação multi-empresa**: cada conta pertence a uma empresa (organização); os dados são isolados por empresa.
- **Dashboard**: faturamento do mês, despesas, contas a receber, saldo, gráfico dos últimos 6 meses, vendas recentes e próximos vencimentos.
- **Clientes**: cadastro completo com busca.
- **Produtos & Serviços**: catálogo com preço, tipo e status.
- **Vendas**: criação com múltiplos itens, cálculo automático de total, status (rascunho, pendente, paga, cancelada). Ao marcar uma venda como paga, um lançamento financeiro é criado automaticamente.
- **Financeiro**: contas a pagar e a receber, lançamentos manuais, filtros por tipo/status.
- **Configurações**: dados da empresa, perfil do usuário, senha e tema (claro/escuro/sistema).

## Rodando localmente com Docker (recomendado)

Pré-requisitos: [Docker](https://www.docker.com/) e Docker Compose.

```bash
cp .env.example .env
docker compose up --build
```

A aplicação sobe em **http://localhost:3000**. Na primeira execução, as migrations do banco são aplicadas automaticamente e o banco é populado com dados de demonstração.

**Login de demonstração:**

- E-mail: `demo@empresa.com`
- Senha: `demo1234`

Para parar: `docker compose down`. Para apagar também os dados do banco: `docker compose down -v`.

## Rodando localmente sem Docker (desenvolvimento)

Pré-requisitos: Node.js 20+, um PostgreSQL acessível.

```bash
cp .env.example .env
# edite o DATABASE_URL em .env para apontar para o seu Postgres local

npm install
npm run prisma:migrate   # cria as tabelas
npm run prisma:seed      # popula dados de demonstração (opcional)
npm run dev
```

A aplicação fica disponível em http://localhost:3000.

### Scripts úteis

| Comando                  | Descrição                                   |
| ------------------------- | -------------------------------------------- |
| `npm run dev`             | Inicia o servidor de desenvolvimento         |
| `npm run build`           | Build de produção                            |
| `npm run start`           | Inicia o build de produção                   |
| `npm run typecheck`       | Checagem de tipos TypeScript                 |
| `npm run prisma:studio`   | Abre o Prisma Studio para inspecionar o banco |
| `npm run prisma:migrate`  | Cria/aplica migrations em desenvolvimento     |

## Arquitetura

```
src/
  app/                 Rotas (App Router): landing, login, cadastro e /dashboard/*
  actions/             Server Actions (regras de negócio, sempre filtradas por organização)
  components/
    ui/                Componentes de base (estilo shadcn/ui)
    layout/             Sidebar, topbar, navegação, alternância de tema
    dashboard/, clientes/, produtos/, vendas/, financeiro/, configuracoes/
  lib/                 Prisma client, auth (NextAuth), validações Zod, utilitários
prisma/
  schema.prisma        Modelo de dados
  seed.ts               Dados de demonstração
```

Cada usuário pertence a uma `Organization`. Todas as consultas e mutações em `src/actions/*` filtram explicitamente por `organizationId` da sessão atual, garantindo isolamento entre empresas (multi-tenant).

## Roadmap (fora do escopo deste MVP)

- Múltiplos usuários por empresa com permissões
- Controle de estoque
- Emissão de nota fiscal (NF-e)
- Relatórios avançados e exportação
- Integrações de pagamento

## Variáveis de ambiente

Veja `.env.example`. Em produção, gere um `NEXTAUTH_SECRET` forte, por exemplo com `openssl rand -base64 32`.
