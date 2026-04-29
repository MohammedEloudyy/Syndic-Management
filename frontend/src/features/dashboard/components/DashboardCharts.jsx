import { memo } from "react";
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
  Pie
} from "recharts";
import { useTheme } from "@/components/common/ThemeProvider";

/**
 * DashboardCharts — Restored to the previous loved layout
 * with the Monthly Trends Table and Pie Chart distribution.
 */
const DashboardCharts = memo(function DashboardCharts({ stats, chartData }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const distribution = stats?.payment_distribution || [];
  const chartDataFinal = chartData || [];
  
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const cursorColor = isDark ? "rgba(255,255,255,0.05)" : "#f8fafc";

  return (
    <div className="space-y-6">
      {/* 1. Full-width Bar Chart */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            Flux Financier Mensuel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: textColor, fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: textColor, fontSize: 12 }}
                  tickFormatter={(value) => `${value} MAD`}
                />
                <Tooltip
                  cursor={{ fill: cursorColor }}
                  contentStyle={{ 
                    backgroundColor: tooltipBg,
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                  }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="Revenue" name="Recettes" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="Expenses" name="Dépenses" fill="#f97316" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. Grid: Pie Chart (1/3) + Months Table (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-modern lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Statut des paiements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180} minWidth={0} debounce={100}>
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={['#10b981', '#3b82f6', '#f59e0b'][index % 3]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="w-full mt-4 space-y-2">
                {distribution.map((entry, index) => {
                  const total = distribution.reduce((acc, curr) => acc + curr.value, 0);
                  const percentage = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                  const colors = ['#10b981', '#3b82f6', '#f59e0b'];

                  return (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % 3] }} />
                        <span className="text-muted-foreground">{entry.name}</span>
                      </div>
                      <span className="font-bold text-foreground">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Détails des mois récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartDataFinal.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">Aucune donnée de tendance disponible</div>
              ) : chartDataFinal.slice().reverse().map((m) => (
                <div key={m.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">{m.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Performance</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[10px] text-muted-foreground font-semibold">RECETTES</div>
                      <div className="text-sm text-emerald-600 font-bold">+{m.Revenue.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-muted-foreground font-semibold">DÉPENSES</div>
                      <div className="text-sm text-orange-600 font-bold">-{m.Expenses.toLocaleString()}</div>
                    </div>
                    <div className="text-right w-24">
                      <Badge variant={m.Balance >= 0 ? "emerald" : "danger"} className="text-[10px]">
                        {m.Balance >= 0 ? "+" : ""}{m.Balance.toLocaleString()} MAD
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default DashboardCharts;
