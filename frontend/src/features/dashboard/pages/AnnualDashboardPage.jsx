import { useState, useMemo, memo } from "react";
import { useAnnualOverview } from "@/features/dashboard/hooks/useAnnualOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Wallet,
  CreditCard,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTheme } from "@/components/common/ThemeProvider";

// ── Year Selector ──────────────────────────────────────────
const YearSelector = memo(function YearSelector({ year, onChange }) {
  const currentYear = new Date().getFullYear();
  const canGoForward = year < currentYear;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-9 p-0 rounded-xl"
        onClick={() => onChange(year - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2 px-4 py-2 bg-background border shadow-sm rounded-2xl min-w-[120px] justify-center">
        <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-bold text-foreground">{year}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-9 p-0 rounded-xl"
        onClick={() => onChange(year + 1)}
        disabled={!canGoForward}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
});

// ── Annual Stats Cards ─────────────────────────────────────
const AnnualStatsCards = memo(function AnnualStatsCards({ stats, comparison }) {
  if (!stats) return null;

  const cards = [
    {
      label: "Recettes Annuelles",
      value: `${stats.revenue.toLocaleString()} MAD`,
      icon: CreditCard,
      change: comparison?.revenue_change_percent,
      colorClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
      iconBg: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
    },
    {
      label: "Dépenses Annuelles",
      value: `${stats.expenses.toLocaleString()} MAD`,
      icon: Wallet,
      change: comparison?.expense_change_percent,
      invertChange: true,
      colorClass: "bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400",
      iconBg: "bg-orange-600/10 text-orange-700 dark:text-orange-400",
    },
    {
      label: "Balance Nette",
      value: `${stats.balance.toLocaleString()} MAD`,
      icon: TrendingUp,
      colorClass: cn(
        stats.balance >= 0
          ? "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400"
          : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
      ),
      iconBg: cn(
        stats.balance >= 0
          ? "bg-blue-600/10 text-blue-700 dark:text-blue-400"
          : "bg-red-600/10 text-red-700 dark:text-red-400"
      ),
    },
    {
      label: "Total Paiements",
      value: stats.total_payments,
      icon: BarChart3,
      colorClass: "bg-violet-500/10 border-violet-500/20 text-violet-700 dark:text-violet-400",
      iconBg: "bg-violet-600/10 text-violet-700 dark:text-violet-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const hasChange = card.change !== undefined && card.change !== null;
        const isPositive = card.invertChange ? card.change <= 0 : card.change >= 0;

        return (
          <div
            key={card.label}
            className={cn(
              "rounded-2xl border px-5 py-4 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02]",
              card.colorClass
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("flex size-10 items-center justify-center rounded-xl", card.iconBg)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold leading-none">{card.value}</div>
                  <div className="mt-1.5 text-xs font-medium opacity-80">{card.label}</div>
                </div>
              </div>
              {hasChange && (
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold",
                  isPositive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(card.change)}%
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

// ── Monthly Breakdown Chart ────────────────────────────────
const MonthlyBreakdownChart = memo(function MonthlyBreakdownChart({ data }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gridColor = isDark ? "#1e293b" : "#f1f5f9";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const cursorColor = isDark ? "rgba(255,255,255,0.05)" : "#f8fafc";

  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] flex items-center justify-center text-muted-foreground">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: textColor, fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: textColor, fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            cursor={{ fill: cursorColor }}
            contentStyle={{
              backgroundColor: tooltipBg,
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            }}
            formatter={(value) => [`${value.toLocaleString()} MAD`]}
          />
          <Legend iconType="circle" />
          <Bar dataKey="revenue" name="Recettes" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
          <Bar dataKey="expenses" name="Dépenses" fill="#f97316" radius={[6, 6, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

// ── Balance Trend Area Chart ───────────────────────────────
const BalanceTrendChart = memo(function BalanceTrendChart({ data }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gridColor = isDark ? "#1e293b" : "#f1f5f9";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";

  if (!data || data.length === 0) return null;

  return (
    <div className="h-[250px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: textColor, fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: textColor, fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            }}
            formatter={(value) => [`${value.toLocaleString()} MAD`, "Balance"]}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#balanceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

// ── Expense Categories Pie ─────────────────────────────────
const CATEGORY_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
];

const ExpenseCategoriesChart = memo(function ExpenseCategoriesChart({ categories }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        Aucune dépense enregistrée
      </div>
    );
  }

  const total = categories.reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="flex flex-col items-center">
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
          <PieChart>
            <Pie
              data={categories}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="total"
              nameKey="category"
              stroke="none"
            >
              {categories.map((_, index) => (
                <Cell key={`cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
              formatter={(value) => [`${value.toLocaleString()} MAD`]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full mt-2 space-y-2">
        {categories.map((cat, index) => {
          const percentage = total > 0 ? Math.round((cat.total / total) * 100) : 0;
          return (
            <div key={cat.category} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                />
                <span className="text-muted-foreground truncate">{cat.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{cat.count} ops</span>
                <span className="font-bold text-foreground">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ── Payment Status Cards ───────────────────────────────────
const PaymentStatusSection = memo(function PaymentStatusSection({ paymentStatus }) {
  if (!paymentStatus) return null;

  const statusConfig = [
    { color: "bg-emerald-500", textColor: "text-emerald-700 dark:text-emerald-400", bgLight: "bg-emerald-50 dark:bg-emerald-950/30" },
    { color: "bg-blue-500", textColor: "text-blue-700 dark:text-blue-400", bgLight: "bg-blue-50 dark:bg-blue-950/30" },
    { color: "bg-amber-500", textColor: "text-amber-700 dark:text-amber-400", bgLight: "bg-amber-50 dark:bg-amber-950/30" },
  ];

  const total = paymentStatus.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {paymentStatus.map((s, i) => {
          const width = total > 0 ? (s.value / total) * 100 : 0;
          return (
            <div
              key={s.name}
              className={cn("h-full transition-all duration-500", statusConfig[i]?.color)}
              style={{ width: `${width}%` }}
            />
          );
        })}
      </div>
      {/* Labels */}
      <div className="space-y-2">
        {paymentStatus.map((s, i) => {
          const percentage = total > 0 ? Math.round((s.value / total) * 100) : 0;
          return (
            <div
              key={s.name}
              className={cn("flex items-center justify-between p-2.5 rounded-xl", statusConfig[i]?.bgLight)}
            >
              <div className="flex items-center gap-2">
                <div className={cn("h-2.5 w-2.5 rounded-full", statusConfig[i]?.color)} />
                <span className={cn("text-sm font-medium", statusConfig[i]?.textColor)}>{s.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{s.value}</span>
                <span className="text-[10px] text-muted-foreground font-semibold">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ── Monthly Details Table ──────────────────────────────────
const MonthlyDetailsTable = memo(function MonthlyDetailsTable({ data }) {
  if (!data || data.length === 0) return null;

  // Calculate cumulative balance
  let cumulative = 0;
  const withCumulative = data.map((m) => {
    cumulative += m.balance;
    return { ...m, cumulative };
  });

  return (
    <div className="space-y-2">
      {withCumulative.map((m) => (
        <div
          key={m.month}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
        >
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{m.month}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Mois {m.month_number}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground font-semibold">RECETTES</div>
              <div className="text-sm text-emerald-600 font-bold">
                {m.revenue > 0 ? `+${m.revenue.toLocaleString()}` : "0"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground font-semibold">DÉPENSES</div>
              <div className="text-sm text-orange-600 font-bold">
                {m.expenses > 0 ? `-${m.expenses.toLocaleString()}` : "0"}
              </div>
            </div>
            <div className="text-right w-28">
              <div className="text-[10px] text-muted-foreground font-semibold">BALANCE</div>
              <Badge
                variant={m.balance >= 0 ? "emerald" : "danger"}
                className="text-[10px]"
              >
                {m.balance >= 0 ? "+" : ""}{m.balance.toLocaleString()} MAD
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

// ── YoY Comparison Card ────────────────────────────────────
const YearComparisonCard = memo(function YearComparisonCard({ comparison, currentYear }) {
  if (!comparison) return null;

  const items = [
    {
      label: "Recettes",
      current: comparison.previous_revenue + (comparison.previous_revenue * comparison.revenue_change_percent / 100),
      previous: comparison.previous_revenue,
      change: comparison.revenue_change_percent,
    },
    {
      label: "Dépenses",
      current: comparison.previous_expenses + (comparison.previous_expenses * comparison.expense_change_percent / 100),
      previous: comparison.previous_expenses,
      change: comparison.expense_change_percent,
      invertChange: true,
    },
  ];

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isPositive = item.invertChange ? item.change <= 0 : item.change >= 0;
        return (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold",
                isPositive ? "text-emerald-600" : "text-red-600"
              )}>
                {item.change === 0 ? (
                  <Minus className="h-3 w-3" />
                ) : isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {item.change > 0 ? "+" : ""}{item.change}%
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex-1">
                <div className="text-[10px] text-muted-foreground font-semibold">{comparison.previous_year}</div>
                <div className="font-medium text-muted-foreground">{item.previous.toLocaleString()} MAD</div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground/50" />
              <div className="flex-1 text-right">
                <div className="text-[10px] text-muted-foreground font-semibold">{currentYear}</div>
                <div className="font-bold text-foreground">{Math.round(item.current).toLocaleString()} MAD</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

// ── Main Page ──────────────────────────────────────────────
export default function AnnualDashboardPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { data, loading, error } = useAnnualOverview(selectedYear);

  if (loading && !data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="font-medium">Chargement du rapport annuel...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
          <p className="text-red-700 font-semibold">Erreur de chargement du rapport annuel.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-red-600 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-fade-in max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Rapport Annuel
          </h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble financière — Année {selectedYear}
          </p>
        </div>
        <YearSelector year={selectedYear} onChange={setSelectedYear} />
      </div>

      {/* Stats Cards */}
      {data?.stats && (
        <AnnualStatsCards stats={data.stats} comparison={data.comparison} />
      )}

      {/* Charts Row: Bar + Balance Trend */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Flux Financier Mensuel — {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyBreakdownChart data={data?.monthly_breakdown} />
          </CardContent>
        </Card>
      </div>

      {/* Balance Trend + Categories + Payment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-modern lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Évolution de la Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BalanceTrendChart data={data?.monthly_breakdown} />
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Catégories de Dépenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseCategoriesChart categories={data?.expense_categories} />
          </CardContent>
        </Card>
      </div>

      {/* Payment Status + YoY Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Statut des Paiements</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentStatusSection paymentStatus={data?.stats?.payment_status} />
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              Comparaison {data?.comparison?.previous_year} → {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <YearComparisonCard comparison={data?.comparison} currentYear={selectedYear} />
          </CardContent>
        </Card>

        <Card className="card-modern lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Résumé Annuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                  {data?.stats?.balance?.toLocaleString() ?? "0"} MAD
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">Balance Nette {selectedYear}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    {data?.stats?.revenue?.toLocaleString() ?? "0"}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold">RECETTES (MAD)</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                  <div className="text-lg font-bold text-orange-700 dark:text-orange-400">
                    {data?.stats?.expenses?.toLocaleString() ?? "0"}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold">DÉPENSES (MAD)</div>
                </div>
              </div>

              {data?.stats && data.stats.revenue > 0 && (
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <div className="text-sm font-medium text-muted-foreground">Taux d'épargne</div>
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round(((data.stats.revenue - data.stats.expenses) / data.stats.revenue) * 100)}%
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Details Table */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Détails Mensuels — {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyDetailsTable data={data?.monthly_breakdown} />
        </CardContent>
      </Card>
    </div>
  );
}
