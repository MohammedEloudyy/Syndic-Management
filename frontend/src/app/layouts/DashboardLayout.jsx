import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/features/dashboard/components/Navbar";
import Sidebar from "@/features/dashboard/components/Sidebar";
import { useAuth } from "@/features/auth/useAuth";
import { useTheme } from "@/components/common/ThemeProvider";

export default function DashboardLayout() {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Cleanup on unmount (e.g. logout)
    return () => document.documentElement.classList.remove("dark");
  }, [theme]);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
  };

  const sidebar = <Sidebar collapsed={false} onLogout={handleLogout} />;

  return (
    <div className="min-h-screen bg-background font-outfit">
      <div className="flex bg-background text-foreground transition-colors duration-300">
        <div className="sticky top-0 hidden h-screen md:block">{sidebar}</div>

        {mobileOpen ? (
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        ) : null}

        <div
          className={[
            "fixed left-0 top-0 z-50 h-screen md:hidden transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="h-full bg-sidebar shadow-lg">{sidebar}</div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar onToggleSidebar={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-auto px-4 pb-10 md:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
