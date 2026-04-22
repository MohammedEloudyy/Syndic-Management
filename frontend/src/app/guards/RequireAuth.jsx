import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";

/**
 * RequireAuth Guard
 * 
 * Gates protected routes with 3-state gating:
 * - loading (user === undefined) → Show splash screen (prevents flicker)
 * - authenticated (user !== null) → Render protected content
 * - guest (user === null) → Redirect to login
 * 
 * This prevents the bug where dashboard briefly shows then redirects.
 */
export default function RequireAuth() {
  const { user } = useAuthStore();
  
  // Determine auth state from user value
  const isLoading = user === undefined;
  const isAuthenticated = user !== null && user !== undefined;
  
  // State 1: Loading - Show splash screen (prevents flicker)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }
  
  // State 2: Authenticated - Render protected routes
  if (isAuthenticated) {
    return <Outlet />;
  }
  
  // State 3: Guest - Redirect to login
  return <Navigate to="/login" replace />;
}
