import { Menu } from "lucide-react";

export function Navbar({ onToggleSidebar }) {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-lg border bg-background p-2 text-muted-foreground transition-colors hover:bg-muted md:hidden"
        onClick={onToggleSidebar}
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 rounded-full border bg-background px-3 py-2 shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            AD
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium">Admin User</div>
            <div className="text-xs text-muted-foreground">Administrateur</div>
          </div>
        </div>
      </div>
    </header>
  );
}

