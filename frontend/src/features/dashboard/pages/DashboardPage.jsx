import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats";
import { Building2, DoorOpen, Users, CreditCard, Wallet, Loader2, TrendingUp } from "lucide-react";
import StatsCard from "@/features/dashboard/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function DashboardPage() {
  const { stats, loading, error } = useDashboardStats();

  if (loading && !stats) return (
    <div className="flex min-h-[400px] items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span>Chargement du tableau de bord...</span>
    </div>
  );

  if (error && !stats) return (
    <div className="p-6">
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Erreur de chargement des statistiques. Veuillez rafraîchir la page.
      </div>
    </div>
  );

  const balance = (stats.total_paiements || 0) - (stats.total_depenses || 0);

  // Format data for chart
  const chartData = (stats.monthly_stats || []).map(item => ({
    name: item.month,
    Revenue: item.paiements,
    Expenses: item.depenses,
    Balance: item.paiements - item.depenses
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-muted-foreground">Bienvenue dans votre gestionnaire de syndic</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
          <TrendingUp className="h-4 w-4" />
          Statistiques à jour
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          label="Immeubles"
          value={stats.total_immeubles}
          icon={Building2}
          description="Total des bâtiments gérés"
        />
        <StatsCard
          label="Appartements"
          value={stats.total_appartements}
          icon={DoorOpen}
          description={`${stats.total_residents} occupés`}
        />
        <StatsCard
          label="Résidents"
          value={stats.total_residents}
          icon={Users}
          description="Total des copropriétaires"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatsCard
          label="Total Recettes"
          value={`${stats.total_paiements.toLocaleString()} MAD`}
          icon={CreditCard}
          className="bg-emerald-50 border-emerald-100"
        />
        <StatsCard
          label="Total Dépenses"
          value={`${stats.total_depenses.toLocaleString()} MAD`}
          icon={Wallet}
          className="bg-orange-50 border-orange-100"
        />
        <StatsCard
          label="Balance Net"
          value={`${balance.toLocaleString()} MAD`}
          icon={TrendingUp}
          className={balance >= 0 ? "bg-blue-50 border-blue-100" : "bg-red-50 border-red-100"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Flux Financier Mensuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888888', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888888', fontSize: 12 }}
                    tickFormatter={(value) => `${value} MAD`}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8f8f8' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="Revenue" name="Recettes" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="Expenses" name="Dépenses" fill="#f97316" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Statut des paiements</CardTitle>
            <p className="text-sm text-muted-foreground">Répartition actuelle</p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220} minWidth={0} debounce={100}>
                <PieChart>
                  <Pie
                    data={stats.payment_status_stats || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {(stats.payment_status_stats || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={['#10b981', '#3b82f6', '#f59e0b'][index % 3]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="w-full mt-4 space-y-2">
                {(stats.payment_status_stats || []).map((entry, index) => {
                  const total = (stats.payment_status_stats || []).reduce((acc, curr) => acc + curr.value, 0);
                  const percentage = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                  const colors = ['#10b981', '#3b82f6', '#f59e0b'];

                  return (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % 3] }} />
                        <span className="text-gray-600">{entry.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Détails des mois récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(chartData || []).slice().reverse().map((m) => (
                <div key={m.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-700">{m.name}</span>
                    <span className="text-xs text-muted-foreground">Solde mensuel</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Recettes</div>
                      <div className="text-sm text-emerald-600 font-medium">+{m.Revenue.toLocaleString()} MAD</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Dépenses</div>
                      <div className="text-sm text-orange-600 font-medium">-{m.Expenses.toLocaleString()} MAD</div>
                    </div>
                    <div className="text-right w-24">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Solde</div>
                      <div className={`text-sm font-bold ${m.Balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {m.Balance.toLocaleString()} MAD
                      </div>
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
}
