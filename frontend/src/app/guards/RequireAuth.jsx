import { Navigate } from "react-router-dom";
import { useAuthReady } from "@/features/auth/useAuthReady";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Loader2 } from "lucide-react";

export function RequireAuth({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authReady = useAuthReady();

  if (!authReady) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

