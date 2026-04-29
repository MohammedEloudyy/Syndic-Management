import { memo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Building2,
  Building,
  CreditCard,
  Home,
  Landmark,
  LogOut,
  Receipt,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Tableau de bord", to: "/dashboard", icon: Home },
  { label: "Immeubles", to: "/dashboard/immeubles", icon: Building2 },
  { label: "Appartements", to: "/dashboard/appartements", icon: Building },
  { label: "Résidents", to: "/dashboard/residents", icon: Users },
  { label: "Paiements", to: "/dashboard/paiements", icon: CreditCard },
  { label: "Dépenses", to: "/dashboard/depenses", icon: Receipt },
];

const Sidebar = memo(function Sidebar({ collapsed = false, onLogout }) {
  const location = useLocation();
  const active = location.pathname;

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-sidebar transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-[280px]",
      )}
    >
      <div className="flex h-20 items-center gap-3.5 px-6">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-950/40 transition-shadow">
          <Landmark className="h-5 w-5" />
        </div>
        {!collapsed ? (
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground transition-colors">
              Gestion Syndic
            </span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest transition-colors">
              Plateforme
            </span>
          </div>
        ) : null}
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-300",
                  isActive
                    ? "bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )
              }
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active.startsWith(item.to) 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto px-2 pb-4 space-y-1">


        <Button
          type="button"
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 rounded-xl px-3 py-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors",
            collapsed ? "px-2" : "",
          )}
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed ? <span>Déconnexion</span> : null}
        </Button>
      </div>
    </aside>
  );
});

export default Sidebar;

