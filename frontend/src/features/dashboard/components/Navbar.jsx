import { memo } from "react";
import { Menu, Sun, Moon } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { useTheme } from "@/components/common/ThemeProvider";

const Navbar = memo(function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const displayName = user?.name ?? "Utilisateur";
  const subtitle = user?.email ?? "Syndic Autorisé";

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border bg-background p-2 text-muted-foreground transition-colors hover:bg-muted md:hidden"
          onClick={onToggleSidebar}
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        

      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 rounded-full border bg-background px-3 py-1.5 shadow-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-md shadow-blue-600/20">
            {initials}
          </div>
          <div className="hidden md:block leading-tight pr-1">
            <div className="text-[13px] font-bold text-foreground">{displayName}</div>
            <div className="text-[10px] text-muted-foreground font-medium">{subtitle}</div>
          </div>
        </div>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-90 shadow-sm hover:shadow-md dark:border-slate-800"
          aria-label="Changer le thème"
        >
          {theme === "dark" ? (
            <Sun className="h-[1.1rem] w-[1.1rem] text-amber-500 animate-in zoom-in-50 duration-300" />
          ) : (
            <Moon className="h-[1.1rem] w-[1.1rem] text-blue-600 animate-in zoom-in-50 duration-300" />
          )}
        </button>
      </div>
    </header>
  );
});

export default Navbar;
