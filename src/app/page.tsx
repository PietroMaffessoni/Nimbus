import Link from "next/link";
import {
  ArrowRight,
  LayoutDashboard,
  Users,
  ReceiptText,
  Wallet,
  Sparkles,
  Moon,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const features = [
  {
    icon: LayoutDashboard,
    title: "Visão geral clara",
    description: "Veja faturamento, contas a pagar e a receber em um painel limpo, sem ruído.",
  },
  {
    icon: Users,
    title: "Clientes organizados",
    description: "Cadastre e encontre seus clientes em segundos, sem planilhas confusas.",
  },
  {
    icon: ReceiptText,
    title: "Vendas sem fricção",
    description: "Monte orçamentos e vendas com poucos cliques e acompanhe o status de cada uma.",
  },
  {
    icon: Wallet,
    title: "Fluxo de caixa simples",
    description: "Contas a pagar e a receber organizadas automaticamente a partir das suas vendas.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold">Nimbus</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/cadastro">
                Criar conta grátis <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container flex flex-col items-center gap-6 py-20 text-center sm:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Feito para o pequeno empresário
          </div>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            A gestão do seu negócio,{" "}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              simples assim
            </span>
          </h1>
          <p className="max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            Clientes, vendas e financeiro em um só lugar — bonito, rápido e fácil de usar
            desde o primeiro minuto. Sem complicação de ERP.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/cadastro">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Já tenho uma conta</Link>
            </Button>
          </div>
        </section>

        <section className="container pb-20 sm:pb-28">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="transition-shadow hover:shadow-lg">
                <CardContent className="flex flex-col gap-3 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container pb-24">
          <Card className="overflow-hidden">
            <CardContent className="flex flex-col items-center gap-6 p-10 text-center sm:p-16">
              <div className="flex items-center gap-4 text-muted-foreground">
                <Moon className="h-5 w-5" />
                <span className="text-sm">Tema claro e escuro</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm">Seus dados isolados por empresa</span>
              </div>
              <h2 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
                Experimente agora com dados de demonstração já populados
              </h2>
              <Button size="lg" asChild>
                <Link href="/cadastro">
                  Criar minha conta <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="container flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Nimbus. Todos os direitos reservados.</span>
          <span>Feito para pequenos negócios que merecem ferramentas modernas.</span>
        </div>
      </footer>
    </div>
  );
}
