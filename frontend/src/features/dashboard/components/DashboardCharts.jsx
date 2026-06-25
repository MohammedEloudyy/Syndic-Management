import { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { useTheme } from "@/components/common/ThemeProvider";
import { TrendingUp, TrendingDown, BarChart3, Activity, Clock, CreditCard, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// ── Custom Tooltip ─────────────────────────────────────────
function CustomTooltip({ active, payload, label, isDark, suffix = " MAD" }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className={cn(
      "rounded-2xl px-4 py-3 shadow-xl border-none min-w-[180px]",
      isDark ? "bg-slate-900/95 text-slate-100" : "bg-white/95 text-slate-900",
      "backdrop-blur-lg"
    )}>
      <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs font-medium">{entry.name}</span>
          </div>
          <span className="text-xs font-bold">{Number(entry.value).toLocaleString()}{suffix}</span>
        </div>
      ))}
    </div>
  );
}

// ── Recent Activity Item ───────────────────────────────────
function ActivityItem({ activity }) {
  const statusColors = {
    payé: "bg-emerald-500",
    en_attente: "bg-blue-500",
    en_retard: "bg-amber-500",
  };
  const statusLabels = {
    payé: "Payé",
    en_attente: "En attente",
    en_retard: "En retard",
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border group">
      <div className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl",
        "bg-blue-600/10 text-blue-600 dark:text-blue-400",
        "group-hover:scale-105 transition-transform duration-200"
      )}>
        <CreditCard className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground truncate">{activity.title}</div>
        <div className="text-xs text-muted-foreground truncate">{activity.subtitle}</div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className={cn(
          "h-2 w-2 rounded-full",
          statusColors[activity.status] || "bg-gray-400"
        )} title={statusLabels[activity.status] || activity.status} />
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{activity.date}</span>
      </div>
    </div>
  );
}

/**
 * DashboardCharts — Premium layout with:
 * - Area chart for financial trends
 * - Donut chart for payment distribution
 * - Monthly performance table
 * - Recent activities feed
 */
const DashboardCharts = memo(function DashboardCharts({ stats, chartData, recentActivities }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  
  const distribution = stats?.payment_distribution || [];
  const chartDataFinal = chartData || [];
  const activities = recentActivities || [];
  
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";
  const textColor = isDark ? "#94a3b8" : "#64748b";

  // Compute current month balance trend
  const lastTwo = chartDataFinal.slice(-2);
  const currentBalance = lastTwo[1]?.Balance ?? 0;
  const previousBalance = lastTwo[0]?.Balance ?? 0;
  const balanceTrend = previousBalance !== 0
    ? Math.round(((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* 1. Full-width Area + Bar Chart */}
      <Card className="card-modern overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Flux Financier Mensuel
            </CardTitle>
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold",
              balanceTrend >= 0
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {balanceTrend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {balanceTrend >= 0 ? "+" : ""}{balanceTrend}% ce mois
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[380px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
              <AreaChart data={chartDataFinal} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: textColor, fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "16px", fontSize: "12px", fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="Revenue"
                  name="Recettes"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: isDark ? "#0f172a" : "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="Expenses"
                  name="Dépenses"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  fill="url(#expenseGradient)"
                  dot={{ r: 4, fill: "#f97316", strokeWidth: 2, stroke: isDark ? "#0f172a" : "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. Grid: Pie (1/3) + Activities (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <Card className="card-modern lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Statut des paiements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
                  <PieChart>
                    <Pie
                      data={distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={82}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      animationBegin={200}
                      animationDuration={800}
                    >
                      {distribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={['#10b981', '#3b82f6', '#f59e0b'][index % 3]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomTooltip isDark={isDark} suffix="" />}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {distribution.reduce((s, d) => s + d.value, 0)}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total</div>
                  </div>
                </div>
              </div>

              <div className="w-full mt-2 space-y-1.5">
                {distribution.map((entry, index) => {
                  const total = distribution.reduce((acc, curr) => acc + curr.value, 0);
                  const percentage = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                  const colors = ['#10b981', '#3b82f6', '#f59e0b'];
                  const bgColors = [
                    "bg-emerald-50 dark:bg-emerald-950/30",
                    "bg-blue-50 dark:bg-blue-950/30",
                    "bg-amber-50 dark:bg-amber-950/30",
                  ];

                  return (
                    <div
                      key={entry.name}
                      className={cn(
                        "flex items-center justify-between text-sm p-2.5 rounded-xl transition-colors",
                        bgColors[index % 3]
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: colors[index % 3] }} />
                        <span className="font-medium text-foreground">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-semibold">{entry.value}</span>
                        <span className="font-bold text-foreground">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="card-modern lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Activités Récentes
              </CardTitle>
              <button
                onClick={() => navigate("/dashboard/paiements")}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
              >
                Voir tout
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Aucune activité récente</p>
                <p className="text-xs mt-1">Les derniers paiements apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-1">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Monthly Performance Table */}
      <Card className="card-modern">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">
            Performance Mensuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartDataFinal.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">Aucune donnée de tendance disponible</div>
          ) : (
            <div className="space-y-2">
              {chartDataFinal.slice().reverse().map((m, idx) => {
                const isFirst = idx === 0;
                return (
                  <div
                    key={m.name}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-xl transition-all duration-200",
                      "border border-transparent hover:border-border hover:bg-muted/50",
                      isFirst && "bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20 border-blue-100 dark:border-blue-900/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex size-9 items-center justify-center rounded-lg text-xs font-bold",
                        isFirst
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {m.name.slice(5)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{m.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {isFirst ? "Mois en cours" : "Performance"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground font-semibold">RECETTES</div>
                        <div className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">
                          +{m.Revenue.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground font-semibold">DÉPENSES</div>
                        <div className="text-sm text-orange-600 dark:text-orange-400 font-bold">
                          -{m.Expenses.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right w-28">
                        <Badge
                          variant={m.Balance >= 0 ? "emerald" : "danger"}
                          className="text-[10px] px-2.5"
                        >
                          {m.Balance >= 0 ? "+" : ""}{m.Balance.toLocaleString()} MAD
                        </Badge>
                      </div>
                      {/* Mini sparkline indicator */}
                      <div className="hidden sm:flex items-center">
                        {m.Balance >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default DashboardCharts;
