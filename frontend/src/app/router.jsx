import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import RequireAuth from "@/app/guards/RequireAuth";
import RedirectIfAuthed from "@/app/guards/RedirectIfAuthed";
import DashboardLayout from "@/app/layouts/DashboardLayout";
import AuthLayout from "@/app/layouts/AuthLayout";
import GlobalErrorPage from "@/app/GlobalErrorPage";
import { RootRedirect } from "@/app/routes/RootRedirect";
import { Loader2 } from "lucide-react";

// ── Lazy-loaded pages (each becomes its own JS chunk) ──────
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const ImmeublesPage = lazy(() => import("@/features/dashboard/pages/ImmeublesPage"));
const AppartementsPage = lazy(() => import("@/features/dashboard/pages/AppartementsPage"));
const ResidentsPage = lazy(() => import("@/features/dashboard/pages/ResidentsPage"));
const PaiementsPage = lazy(() => import("@/features/dashboard/pages/PaiementsPage"));
const DepensesPage = lazy(() => import("@/features/dashboard/pages/DepensesPage"));

/** Minimal loading spinner shown while a lazy chunk downloads */
function PageLoader() {
  return (
    <div className="flex min-h-[300px] items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Chargement…</span>
    </div>
  );
}

/** Wrap a lazy component in Suspense */
function lazify(Component) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    element: <RedirectIfAuthed />,
    errorElement: <GlobalErrorPage />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: lazify(LoginPage) },
          { path: "/register", element: lazify(RegisterPage) },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    errorElement: <GlobalErrorPage />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/dashboard", element: lazify(DashboardPage) },
          { path: "/dashboard/immeubles", element: lazify(ImmeublesPage) },
          { path: "/dashboard/appartements", element: lazify(AppartementsPage) },
          { path: "/dashboard/residents", element: lazify(ResidentsPage) },
          { path: "/dashboard/paiements", element: lazify(PaiementsPage) },
          { path: "/dashboard/depenses", element: lazify(DepensesPage) },
        ],
      },
      // Catch-all: under RequireAuth so guests get redirected to login cleanly
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
