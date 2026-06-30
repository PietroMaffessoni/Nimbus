import { LayoutDashboard, Users, Package, ReceiptText, Wallet, Settings } from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard/clientes", label: "Clientes", icon: Users },
  { href: "/dashboard/produtos", label: "Produtos & Serviços", icon: Package },
  { href: "/dashboard/vendas", label: "Vendas", icon: ReceiptText },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];
