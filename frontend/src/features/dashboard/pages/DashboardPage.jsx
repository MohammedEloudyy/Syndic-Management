import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats";
import { Building2, DoorOpen, Users, CreditCard } from "lucide-react";
import StatsCard from "@/features/dashboard/components/StatsCard";

export default function DashboardPage() {
  const { stats, loading, error } = useDashboardStats();

  if (loading) return <p className="p-6 text-sm text-gray-500">Chargement…</p>;
  if (error)   return <p className="p-6 text-sm text-red-500">Erreur de chargement.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Immeubles"    value={stats.total_immeubles}    icon={Building2} />
        <StatsCard label="Appartements" value={stats.total_appartements} icon={DoorOpen} />
        <StatsCard label="Résidents"    value={stats.total_residents}    icon={Users} />
        <StatsCard label="Recettes"     value={`${stats.total_paiements} MAD`} icon={CreditCard} />
      </div>

      {/* Monthly chart placeholder — wire recharts here when ready */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-medium text-gray-700 mb-4">Statistiques mensuelles</p>
        <div className="space-y-2">
          {stats.monthly_stats?.map((m) => (
            <div key={m.month} className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{m.month}</span>
              <span className="text-green-600 font-medium">+{m.paiements} MAD</span>
              <span className="text-red-500">-{m.depenses} MAD</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
