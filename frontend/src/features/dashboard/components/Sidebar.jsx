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

export default function Sidebar({ collapsed = false, onLogout }) {
  const location = useLocation();
  const active = location.pathname;

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-sidebar transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-[280px]",
      )}
    >
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Landmark className="h-4 w-4" />
        </div>
        {!collapsed ? (
          <div className="text-sm font-semibold leading-tight">
            Gestion Syndic
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
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-muted-foreground hover:bg-muted/30",
                )
              }
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active.startsWith(item.to) ? "text-blue-700" : "text-muted-foreground",
                )}
              />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-2 pb-4">
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 rounded-xl px-3 py-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors",
            collapsed ? "px-2" : "",
          )}
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {!collapsed ? <span>Déconnexion</span> : null}
        </Button>
      </div>
    </aside>
  );
}
