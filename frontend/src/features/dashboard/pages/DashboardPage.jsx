import { lazy, Suspense, memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useDashboardOverview } from "@/features/dashboard/hooks/useDashboardOverview";
import { Building2, DoorOpen, Users, CreditCard, Wallet, Loader2, TrendingUp } from "lucide-react";
import StatsCard from "@/features/dashboard/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const LazyCharts = lazy(() => import("@/features/dashboard/components/DashboardCharts"));

function ChartSkeleton() {
  return (
    <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin mr-2" />
      Chargement de l'analyse...
    </div>
  );
}

const StatsCards = memo(function StatsCards({ stats }) {
  if (!stats) return null;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          label="Immeubles"
          value={stats.counts.buildings}
          icon={Building2}
          description="Total des bâtiments gérés"
        />
        <StatsCard
          label="Appartements"
          value={stats.counts.apartments}
          icon={DoorOpen}
          description="Unités enregistrées"
        />
        <StatsCard
          label="Résidents"
          value={stats.counts.residents}
          icon={Users}
          description="Total des copropriétaires"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatsCard
          label="Total Recettes"
          value={`${stats.finances.revenue.toLocaleString()} MAD`}
          icon={CreditCard}
          className="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
        />
        <StatsCard
          label="Total Dépenses"
          value={`${stats.finances.expenses.toLocaleString()} MAD`}
          icon={Wallet}
          className="bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400"
        />
        <StatsCard
          label="Balance Net"
          value={`${stats.finances.balance.toLocaleString()} MAD`}
          icon={TrendingUp}
          className={cn(
            stats.finances.balance >= 0 
              ? "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400" 
              : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
          )}
        />
      </div>
    </div>
  );
});


export default function DashboardPage() {
  const { overview, loading, error } = useDashboardOverview();

  const chartData = useMemo(() => {
    if (!overview?.charts) return [];
    return overview.charts.map(item => ({
      name: item.month,
      Revenue: item.paiements,
      Expenses: item.depenses,
      Balance: item.paiements - item.depenses
    }));
  }, [overview?.charts]);

  if (loading && !overview) return (
    <div className="flex min-h-[400px] items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      <span className="font-medium">Chargement des données orchestrées...</span>
    </div>
  );

  if (error && !overview) return (
    <div className="p-6">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
        <p className="text-red-700 font-semibold">Erreur de communication avec le serveur.</p>
        <button onClick={() => window.location.reload()} className="text-sm text-red-600 underline">Réessayer</button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-8 animate-fade-in max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Espace de gestion Syndic Pro</p>
        </div>
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-background border shadow-sm rounded-2xl text-sm font-semibold text-foreground">
          <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
          Live Architecture Ready
        </div>
      </div>

      <StatsCards stats={overview.stats} />

      <Suspense fallback={<ChartSkeleton />}>
        <LazyCharts stats={overview.stats} chartData={chartData} />
      </Suspense>
    </div>
  );
}
