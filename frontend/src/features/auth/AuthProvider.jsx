import { useEffect, useState } from "react";
import { meApi } from "@/features/auth/api/me";
import { useAuthStore } from "@/features/auth/store/authStore";
import { AuthReadyContext } from "@/features/auth/authReadyContext";

export function AuthProvider({ children }) {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await meApi();
        if (mounted) setAuthenticated(true);
      } catch {
        if (mounted) setAuthenticated(false);
      } finally {
        if (mounted) setAuthReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [setAuthenticated]);

  return (
    <AuthReadyContext.Provider value={authReady}>
      {children}
    </AuthReadyContext.Provider>
  );
}

