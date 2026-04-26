import { Outlet, Link, useLocation } from "react-router-dom";
import { Building2, Users, Loader2, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getPublicStats } from "@/features/dashboard/api/dashboardApi";

export default function AuthLayout() {
  const { pathname } = useLocation();
  const isLogin = pathname === "/login";

  const [stats, setStats] = useState({ total_immeubles: 0, total_residents: 0, payment_rate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicStats()
      .then(setStats)
      .catch(() => {}) 
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-outfit">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] items-center justify-center p-4 md:p-8">
        <div className="relative grid w-full overflow-hidden rounded-[2.5rem] bg-white shadow-2xl md:grid-cols-12 lg:min-h-[800px]">
          
          {/* Left Side: Brand & Stats */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0A0D14] p-12 text-white md:col-span-5 md:flex lg:col-span-6">
            {/* Background Decorative Elements */}
            <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
            <div className="absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-indigo-600/20 blur-[100px]" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-12">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/40">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">SyndicMaster</span>
              </div>

              <div className="space-y-6 max-w-lg">
                <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">
                  Le futur de la <span className="text-blue-500">gestion syndic</span> est ici.
                </h1>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Une plateforme intelligente pour automatiser vos copropriétés, 
                  optimiser vos revenus et simplifier la vie de vos résidents.
                </p>
                
                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    <span>Automatisation des paiements</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    <span>Rapports financiers en temps réel</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Public Stats Widgets */}
            <div className="relative z-10 grid grid-cols-3 gap-6">
              {[
                { label: "Immeubles", value: stats.total_immeubles, icon: Building2, color: "text-blue-400" },
                { label: "Résidents", value: stats.total_residents, icon: Users, color: "text-emerald-400" },
                { label: "Collecte", value: `${stats.payment_rate}%`, icon: Sparkles, color: "text-amber-400" },
              ].map((s, idx) => (
                <div key={idx} className="group relative rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10">
                  <div className="mb-3 flex items-center justify-between">
                    <s.icon className={cn("h-5 w-5", s.color)} />
                  </div>
                  <div className="text-2xl font-bold tabular-nums">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin opacity-50" /> : s.value}
                  </div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative z-10 flex items-center gap-2 text-xs font-medium text-slate-500">
              <ShieldCheck className="h-4 w-4" />
              <span>Conforme aux standards de sécurité bancaire</span>
            </div>
          </div>

          {/* Right Side: Auth Form */}
          <div className="flex flex-col justify-center bg-white p-8 md:col-span-7 md:p-16 lg:col-span-6">
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  {isLogin ? "Bon retour !" : "Bienvenue parmi nous"}
                </h2>
                <p className="mt-2 text-slate-500">
                  {isLogin ? "Connectez-vous pour gérer vos immeubles." : "Commencez à digitaliser votre copropriété dès aujourd'hui."}
                </p>
              </div>

              <div className="mb-8 flex rounded-2xl bg-slate-100 p-1.5">
                <Link
                  to="/login"
                  className={cn(
                    "flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-all duration-300",
                    isLogin
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className={cn(
                    "flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-all duration-300",
                    !isLogin
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Inscription
                </Link>
              </div>

              <div className="relative">
                <Outlet />
              </div>

              <div className="mt-10 border-t border-slate-100 pt-8 text-center text-xs text-slate-400">
                &copy; {new Date().getFullYear()} SyndicMaster Pro. Tous droits réservés.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}