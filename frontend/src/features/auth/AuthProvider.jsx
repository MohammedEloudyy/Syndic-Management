import { useEffect } from "react";
import { getMe } from "./api/me";
import { useAuthStore } from "./store/authStore";

/**
 * AuthProvider - ONLY responsibility: Bootstrap auth state
 * 
 * On mount:
 * 1. Store starts in "loading" state (user === undefined)
 * 2. Call /api/user
 * 3. Update state to "authenticated" (user object) or "guest" (user === null)
 * 
 * That's it. No caching, no hacks, no timing tricks.
 * 
 * All UI gating happens in RequireAuth and RedirectIfAuthed guards.
 */
export function AuthProvider({ children }) {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    let mounted = true;

    // Bootstrap auth from backend (store already starts as "loading")
    (async () => {
      try {
        const user = await getMe();
        
        if (!mounted) return;
        
        // Successfully fetched user
        setUser(user ?? null);
      } catch (err) {
        if (!mounted) return;
        
        // 401 = not authenticated (expected)
        // Any other error = also treat as unauthenticated
        clearUser();
      }
    })();

    return () => {
      mounted = false;
    };
  }, []); // setUser/clearUser are stable Zustand refs

  // Provider just wraps children, no UI here
  // All UI gating happens in route guards
  return children;
}
