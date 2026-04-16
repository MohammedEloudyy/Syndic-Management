import { useAuthStore } from "@/features/auth/store/authStore";

export function useAuth() {
  return useAuthStore((s) => ({ isAuthenticated: s.isAuthenticated }));
}

