import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { loginUser } from "./api/login";
import { registerUser } from "./api/register";
import { logoutUser } from "./api/logout";

/**
 * useAuth Hook
 * 
 * Provides login, register, logout functions.
 * State is managed by Zustand store.
 * 
 * No hacks, no timeouts, no caching.
 */
export function useAuth() {
  const navigate = useNavigate();
  const { user, setUser, clearUser } = useAuthStore();

  /**
   * Login flow:
   * 1. POST /login (establishes session + returns user)
   * 2. Update store with returned user
   * 3. Navigate (UI gate prevents flicker)
   */
  async function login(credentials) {
    try {
      // Step 1: Login returns user data directly
      const response = await loginUser(credentials);
      const userData = response.user ?? response;
      
      // Step 2: Update store
      setUser(userData);
      
      // Step 3: Navigate (UI gate prevents flicker)
      navigate("/dashboard", { replace: true });
    } catch (error) {
      // Error handling is in LoginForm
      throw error;
    }
  }

  /**
   * Register flow: Same as login, but creates account first
   */
  async function register(payload) {
    try {
      // Step 1: Register returns user data directly
      const response = await registerUser(payload);
      const userData = response.user ?? response;
      
      // Step 2: Update store
      setUser(userData);
      
      // Step 3: Navigate
      navigate("/dashboard", { replace: true });
    } catch (error) {
      // Error handling is in RegisterForm
      throw error;
    }
  }

  /**
   * Logout flow
   */
  async function logout() {
    try {
      // Call backend logout
      await logoutUser();
    } finally {
      // Always clear store and redirect (even if logout fails)
      clearUser();
      navigate("/login", { replace: true });
    }
  }

  return { user, login, register, logout };
}
