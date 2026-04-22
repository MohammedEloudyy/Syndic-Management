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
  user: null,
  
  // Set user (marks as ready/authenticated)
  setUser: (user) => set({ user }),
  
  // Clear user (logout)
  clearUser: () => set({ user: null }),
  
  // Initialize to loading state on mount
  initializeLoading: () => set({ user: undefined }),
}));
