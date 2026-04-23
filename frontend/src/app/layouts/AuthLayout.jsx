import { Outlet, Link, useLocation } from "react-router-dom";
import { Building2, CreditCard, Lock, Users, Loader2 } from "lucide-react";
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
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 md:grid-cols-2">
        <div className="relative hidden overflow-hidden rounded-br-3xl bg-gradient-to-b from-blue-700 via-blue-600 to-indigo-700 p-10 md:block">
          <div className="space-y-5 text-white">
            <div className="text-4xl font-semibold leading-tight">
              Gestion moderne des copropriétés
            </div>
            <p className="text-sm text-blue-100">
              Pilotez immeubles, appartements, résidents et paiements dans une
              interface intuitive. Automatisez vos tâches, suivez vos revenus
              et offrez une meilleure expérience à vos résidents.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/10 p-4 text-white backdrop-blur">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-100" />
                <div className="text-2xl font-semibold">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.total_immeubles}
                </div>
              </div>
              <div className="mt-1 text-xs text-blue-100">Immeubles</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 text-white backdrop-blur">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-100" />
                <div className="text-2xl font-semibold">
                   {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.total_residents}
                </div>
              </div>
              <div className="mt-1 text-xs text-blue-100">Résidents</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 text-white backdrop-blur">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-100" />
                <div className="text-2xl font-semibold">
                   {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                     <>
                       {stats.payment_rate}<span className="text-base font-normal">%</span>
                     </>
                   )}
                </div>
              </div>
              <div className="mt-1 text-xs text-blue-100">Paiements</div>
            </div>
          </div>

          <div className="absolute bottom-8 left-10 flex items-center gap-2 text-xs text-blue-100">
            <Lock className="h-4 w-4" />
            <span>Interface sécurisée SSL 256-bit</span>
          </div>

          <div className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="flex min-h-screen items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <Card className="border-none bg-white/95 p-6 shadow-xl">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className={cn(
                    "rounded-lg px-4 py-2 text-center text-sm font-medium transition-all duration-300",
                    isLogin
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-muted-foreground hover:bg-gray-100 hover:text-foreground",
                  )}
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className={cn(
                    "rounded-lg px-4 py-2 text-center text-sm font-medium transition-all duration-300",
                    !isLogin
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-muted-foreground hover:bg-gray-100 hover:text-foreground",
                  )}
                >
                  Créer un compte
                </Link>
              </div>

              <div className="mt-6">
                <Outlet />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}