import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "@/app/guards/RequireAuth";
import { RedirectIfAuthed } from "@/app/guards/RedirectIfAuthed";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";
import { AuthLayout } from "@/app/layouts/AuthLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { DashboardPage } from "@/dashboard/pages/DashboardPage";
import { ImmeublesPage } from "@/dashboard/pages/ImmeublesPage";
import { AppartementsPage } from "@/dashboard/pages/AppartementsPage";
import { ResidentsPage } from "@/dashboard/pages/ResidentsPage";
import { PaiementsPage } from "@/dashboard/pages/PaiementsPage";
import { DepensesPage } from "@/dashboard/pages/DepensesPage";
import { GlobalErrorPage } from "@/app/GlobalErrorPage";
import { RootRedirect } from "@/app/routes/RootRedirect";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
    errorElement: <GlobalErrorPage />,
  },
  {
    path: "/login",
    element: (
      <RedirectIfAuthed>
        <AuthLayout mode="login">
          <LoginPage />
        </AuthLayout>
      </RedirectIfAuthed>
    ),
    errorElement: <GlobalErrorPage />,
  },
  {
    path: "/register",
    element: (
      <RedirectIfAuthed>
        <AuthLayout mode="register">
          <RegisterPage />
        </AuthLayout>
      </RedirectIfAuthed>
    ),
    errorElement: <GlobalErrorPage />,
  },
  {
    path: "/dashboard",
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    errorElement: <GlobalErrorPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "immeubles", element: <ImmeublesPage /> },
      { path: "appartements", element: <AppartementsPage /> },
      { path: "residents", element: <ResidentsPage /> },
      { path: "paiements", element: <PaiementsPage /> },
      { path: "depenses", element: <DepensesPage /> },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);

