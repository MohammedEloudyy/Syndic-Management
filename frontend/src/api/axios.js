import axios from "axios";
import { useAuthStore } from "@/features/auth/store/authStore";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const getBackendOrigin = () => BACKEND;

/**
 * API client — for /api/* routes (authenticated)
 * 
 * - withCredentials: sends session + XSRF cookies cross-origin
 * - withXSRFToken: Axios 1.6+ auto-reads XSRF-TOKEN cookie and sends X-XSRF-TOKEN header
 */
export const axiosClient = axios.create({
  baseURL: BACKEND + "/api",
  withCredentials: true,
  withXSRFToken: true,
  timeout: 30000,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * Web client — for auth routes (/login, /logout, /register)
 * 
 * Same cookie/CSRF config as axiosClient, different baseURL.
 */
export const webClient = axios.create({
  baseURL: BACKEND,
  withCredentials: true,
  withXSRFToken: true,
  timeout: 30000,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * Shared 401 handler — clears auth state on session expiration.
 * 
 * Does NOT do window.location.href — Zustand store update triggers
 * route guard re-evaluation automatically (no full page reload needed).
 */
function handle401(error) {
  if (error.response?.status === 401) {
    const store = useAuthStore.getState();

    // Only clear if user was previously authenticated (avoid clearing during bootstrap)
    if (store.user) {
      store.clearUser();
    }
  }

  return Promise.reject(error);
}

// Attach 401 interceptor to both clients
axiosClient.interceptors.response.use((response) => response, handle401);
webClient.interceptors.response.use((response) => response, handle401);
