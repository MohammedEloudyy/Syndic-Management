import { create } from "zustand";

/**
 * Auth Store - Single source of truth for authentication state
 * 
 * States:
 * - "loading" → Checking authentication status (user === undefined)
 * - "authenticated" → User is logged in (user object exists)
 * - "guest" → User is not logged in (user === null)
 * 
 * NO localStorage, NO caching, NO hacks.
 */
export const useAuthStore = create((set) => ({
  user: undefined,  // Start in LOADING state — prevents flash redirect
  
  // Set user (marks as authenticated, or null for guest)
  setUser: (user) => set({ user }),
  
  // Clear user (logout → guest state)
  clearUser: () => set({ user: null }),
}));
