# Checklist de lançamento — Nimbus

Checklist para transformar o MVP atual em um produto que outras empresas possam usar (e pagar por ele) com segurança. Organizado por prioridade: comece do topo.

## 1. Bloqueadores de produção (antes de qualquer empresa real usar)

- [x] **Recuperação de senha** ("esqueci minha senha") com envio de e-mail e token de expiração
- [x] **Verificação de e-mail** no cadastro (evita contas com e-mail falso/typos)
- [x] **Provedor de e-mail transacional** — implementado via SMTP genérico (Nodemailer) + Mailhog local; basta trocar as env vars por um provedor real em produção
- [x] **Atualizar Next.js e NextAuth** — atualizado para Next.js 16 + React 19. `next-auth` permanece na v4 (v5/Auth.js segue em beta há anos, sem release estável); resolve a maioria dos CVEs do `npm audit`. Risco residual aceito: vulnerabilidade de `uuid` trazida transitivamente pelo `next-auth@4` sem correção disponível na v4 — uso real do `next-auth` não aciona o vetor do CVE (não passa `buf` customizado)
- [ ] **Gerar segredos de produção reais** — `NEXTAUTH_SECRET` único e forte (nunca reaproveitar o do `.env.example`), credenciais de banco fortes
- [ ] **Hospedagem definitiva** — Vercel, Railway, ou VPS com Docker Compose (o setup atual já é compatível)
- [ ] **Banco de dados gerenciado com backup automático** (Neon, Supabase, RDS, Railway Postgres) — hoje os dados vivem só no volume Docker local
- [ ] **Domínio próprio + HTTPS** (certificado automático via Vercel/Railway ou Caddy/Traefik se for VPS)
- [ ] **Rate limiting no login e no cadastro** (evita força bruta e spam de contas)
- [ ] **Monitoramento de erros** (Sentry ou similar) — hoje um erro em produção passa despercebido
- [ ] **Alerta de uptime** (UptimeRobot, Better Uptime ou nativo da hospedagem escolhida)
- [ ] **Rotina de backup do banco testada** (não basta existir backup — teste a restauração pelo menos uma vez)

## 2. Antes de cobrar de alguém

- [ ] **Planos e cobrança recorrente** — integração com gateway de pagamento (Stripe, ou nacional como Asaas/Pagar.me/Iugu)
- [ ] **Trial e limites por plano** (nº de vendas, usuários, etc.)
- [ ] **Múltiplos usuários por empresa** — o schema já suporta (`User` pertence a `Organization`), falta o fluxo de convite de membros
- [ ] **Papéis e permissões** (ex: dono vs. colaborador com acesso limitado ao financeiro)
- [ ] **Página de preços** na landing page
- [ ] **E-mails transacionais de conta**: boas-vindas, confirmação de pagamento, cobrança recusada, aviso de vencimento

## 3. Jurídico e compliance

- [ ] **Termos de Uso**
- [ ] **Política de Privacidade** (LGPD — você vai armazenar dados de clientes de terceiros dentro de cada empresa)
- [ ] **Contrato de processamento de dados** se for oferecer para empresas maiores
- [ ] **Exclusão de conta e dados** (direito ao esquecimento da LGPD) — hoje não existe fluxo de "excluir minha empresa e todos os dados"
- [ ] **CNPJ e emissão de nota fiscal** para você cobrar seus clientes

## 4. Recomendado, mas não bloqueador

- [ ] Página de status do sistema (status.nimbus.com ou similar)
- [ ] Analytics de produto (PostHog, Plausible) para entender uso real
- [ ] Onboarding guiado no primeiro login (tour rápido pelas telas)
- [ ] Canal de suporte (e-mail dedicado, chat tipo Crisp/Intercom)
- [ ] Ambiente de staging separado do de produção
- [ ] CI (rodar `typecheck`, `lint`, `build` automaticamente a cada push)
- [ ] Testes automatizados nas regras de negócio mais sensíveis (cálculo de vendas, geração de lançamentos financeiros)

## 5. Roadmap de produto (longo prazo, não bloqueia lançamento)

- [ ] Controle de estoque
- [ ] Emissão de NF-e
- [ ] Relatórios avançados e exportação (CSV/PDF)
- [ ] Integrações de pagamento para os clientes do seu cliente (cobrar os clientes deles)
- [ ] App mobile ou PWA

---

**Como priorizar na prática:** valide o produto com um punhado de empresas parceiras (beta fechado) usando só a seção 1 resolvida — cobre manualmente por fora se quiser. Só invista pesado nas seções 2 e 3 quando tiver confirmação de que empresas reais usam e querem pagar.
