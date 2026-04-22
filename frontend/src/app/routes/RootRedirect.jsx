import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";

/**
 * RootRedirect
 * 
 * Handles root "/" route redirection based on auth state.
 * Uses 3-state gating to prevent redirect flicker.
 */
export function RootRedirect() {
  const { user } = useAuthStore();
  
  // Determine auth state
  const isLoading = user === undefined;
  const isAuthenticated = user !== null && user !== undefined;

  // Show nothing while loading (router handles gating)
  if (isLoading) {
    return null;
  }

  // Redirect based on auth state
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}
