import { Navigate, useLocation } from "react-router-dom";
import { useAuthReady } from "@/features/auth/useAuthReady";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Loader2 } from "lucide-react";

export function RedirectIfAuthed({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authReady = useAuthReady();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  return children;
}

