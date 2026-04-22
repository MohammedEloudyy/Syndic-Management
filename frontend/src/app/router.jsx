import { createBrowserRouter, Navigate } from "react-router-dom";
import RequireAuth from "@/app/guards/RequireAuth";
import RedirectIfAuthed from "@/app/guards/RedirectIfAuthed";
import DashboardLayout from "@/app/layouts/DashboardLayout";
import AuthLayout from "@/app/layouts/AuthLayout";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import ImmeublesPage from "@/features/dashboard/pages/ImmeublesPage";
import AppartementsPage from "@/features/dashboard/pages/AppartementsPage";
import ResidentsPage from "@/features/dashboard/pages/ResidentsPage";
import PaiementsPage from "@/features/dashboard/pages/PaiementsPage";
import DepensesPage from "@/features/dashboard/pages/DepensesPage";
import GlobalErrorPage from "@/app/GlobalErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <RedirectIfAuthed />,
    errorElement: <GlobalErrorPage />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login",    element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
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
          { path: "/dashboard",              element: <DashboardPage /> },
          { path: "/dashboard/immeubles",    element: <ImmeublesPage /> },
          { path: "/dashboard/appartements", element: <AppartementsPage /> },
          { path: "/dashboard/residents",    element: <ResidentsPage /> },
          { path: "/dashboard/paiements",    element: <PaiementsPage /> },
          { path: "/dashboard/depenses",     element: <DepensesPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
