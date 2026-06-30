import { TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";

import { getDashboardData } from "@/actions/dashboard";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { UpcomingList } from "@/components/dashboard/upcoming-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const { kpis, chart, recentSales, upcoming } = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Faturamento do mês" value={kpis.monthRevenue} icon={TrendingUp} tone="success" />
        <KpiCard label="Despesas do mês" value={kpis.monthExpense} icon={TrendingDown} tone="destructive" />
        <KpiCard label="A receber" value={kpis.receivable} icon={Clock} tone="warning" />
        <KpiCard label="Saldo do mês" value={kpis.balance} icon={Wallet} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Receitas e despesas — últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={chart} />
          </CardContent>
        </Card>
        <UpcomingList transactions={upcoming} />
      </div>

      <RecentSales sales={recentSales} />
    </div>
  );
}
