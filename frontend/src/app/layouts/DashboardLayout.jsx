import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Navbar } from "@/dashboard/components/Navbar";
import { Sidebar } from "@/dashboard/components/Sidebar";
import { useAuthStore } from "@/features/auth/store/authStore";
import { logoutApi } from "@/features/auth/api/logout";

export function DashboardLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const onLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore network/backend issues for frontend logout.
    }
    logout();
    navigate("/login");
  };

  const sidebar = (
    <Sidebar
      collapsed={false}
      onLogout={() => {
        setMobileOpen(false);
        onLogout();
      }}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <div className="hidden md:block">{sidebar}</div>

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

