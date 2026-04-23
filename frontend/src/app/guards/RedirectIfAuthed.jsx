import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";

/**
 * RedirectIfAuthed Guard
 * 
 * Prevents authenticated users from accessing auth pages (login, register).
 * Gating:
 * - loading (user === undefined) → Show splash (prevents redirect flicker)
 * - authenticated (user !== null) → Redirect to dashboard
 * - guest (user === null) → Show auth pages
 */
export default function RedirectIfAuthed() {
  const { user } = useAuthStore();
  
  // Determine auth state from user value
  const isLoading = user === undefined;
  const isAuthenticated = !!(user && typeof user === 'object' && Object.keys(user).length > 0);
  
  // State 1: Loading - Show splash while checking
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
  
  // State 2: Authenticated - Redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // State 3: Guest - Show auth pages
  return <Outlet />;
}
