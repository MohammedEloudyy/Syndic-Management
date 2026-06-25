import { lazy, Suspense, memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useDashboardOverview } from "@/features/dashboard/hooks/useDashboardOverview";
import { useAuth } from "@/features/auth/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  DoorOpen,
  Users,
  CreditCard,
  Wallet,
  Loader2,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import StatsCard from "@/features/dashboard/components/StatsCard";

const LazyCharts = lazy(() => import("@/features/dashboard/components/DashboardCharts"));

function ChartSkeleton() {
  return (
    <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground border rounded-2xl bg-card/50">
      <Loader2 className="h-5 w-5 animate-spin mr-2" />
      Chargement de l'analyse...
    </div>
  );
}

const StatsCards = memo(function StatsCards({ stats, trends }) {
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
          trend={trends.revenue}
          className="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
        />
        <StatsCard
          label="Total Dépenses"
          value={`${stats.finances.expenses.toLocaleString()} MAD`}
          icon={Wallet}
          trend={trends.expenses}
          className="bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400"
        />
        <StatsCard
          label="Balance Net"
          value={`${stats.finances.balance.toLocaleString()} MAD`}
          icon={TrendingUp}
          trend={trends.balance}
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
  const { user } = useAuth();
  const navigate = useNavigate();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return "Bonne nuit";
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  }, []);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date());
  }, []);

  const chartData = useMemo(() => {
    if (!overview?.charts) return [];
    return overview.charts.map(item => ({
      name: item.month,
      Revenue: item.paiements,
      Expenses: item.depenses,
      Balance: item.paiements - item.depenses
    }));
  }, [overview?.charts]);

  const trends = useMemo(() => {
    if (!overview?.charts || overview.charts.length < 2) {
      return { revenue: 0, expenses: 0, balance: 0 };
    }
    const charts = overview.charts;
    const current = charts[charts.length - 1];
    const previous = charts[charts.length - 2];

    const currentRevenue = current.paiements ?? 0;
    const previousRevenue = previous.paiements ?? 0;
    const revenueTrend = previousRevenue !== 0
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : 0;

    const currentExpenses = current.depenses ?? 0;
    const previousExpenses = previous.depenses ?? 0;
    const expensesTrend = previousExpenses !== 0
      ? Math.round(((currentExpenses - previousExpenses) / previousExpenses) * 100)
      : 0;

    const currentBalance = currentRevenue - currentExpenses;
    const previousBalance = previousRevenue - previousExpenses;
    const balanceTrend = previousBalance !== 0
      ? Math.round(((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100)
      : 0;

    return {
      revenue: revenueTrend,
      expenses: expensesTrend,
      balance: balanceTrend,
    };
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
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{formattedDate}</div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
            {greeting}, <span className="text-blue-600 dark:text-blue-400">{user?.name || "Gérant"}</span> 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Bienvenue dans votre espace de gestion Syndic Pro.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard/annuel")}
            className="flex items-center gap-2 px-4 py-2 bg-background border shadow-sm rounded-2xl text-xs font-bold text-foreground cursor-pointer hover:bg-muted/50 transition-all duration-300"
          >
            <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Rapport Annuel
          </button>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-background border shadow-sm rounded-2xl text-xs font-semibold text-foreground h-8 select-none">
            <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
            Live Monitor
          </div>
        </div>
      </div>

      {/* Quick Actions Shortcuts */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Raccourcis rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/dashboard/immeubles")}
            className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:bg-muted/40 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Immeubles</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Gérer les immeubles</div>
            </div>
          </button>
          
          <button
            onClick={() => navigate("/dashboard/residents")}
            className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:bg-muted/40 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Résidents</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Copropriétaires</div>
            </div>
          </button>

          <button
            onClick={() => navigate("/dashboard/paiements")}
            className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:bg-muted/40 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Paiements</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Suivre les cotisations</div>
            </div>
          </button>

          <button
            onClick={() => navigate("/dashboard/depenses")}
            className="flex items-center gap-4 p-4 rounded-2xl border bg-card hover:bg-muted/40 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group cursor-pointer"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-600/10 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Dépenses</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Suivre les charges</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Stats Cards Grid */}
      <StatsCards stats={overview.stats} trends={trends} />

      {/* Charts Section with Recent Activities Feed */}
      <Suspense fallback={<ChartSkeleton />}>
        <LazyCharts 
          stats={overview.stats} 
          chartData={chartData} 
          recentActivities={overview.recent_activities} 
        />
      </Suspense>
    </div>
  );
}
