import axios from "axios";
import { useAuthStore } from "@/features/auth/store/authStore";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const getBackendOrigin = () => BACKEND;

// Helper: Extract CSRF token from cookie
function getCSRFToken() {
  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];
    
    return token ? decodeURIComponent(token) : null;
  } catch (error) {
    console.warn("CSRF token extraction error:", error);
    return null;
  }
}

// API client - with credentials for session-based auth
export const axiosClient = axios.create({
  baseURL: BACKEND + "/api",
  withCredentials: true,  // ✅ Critical: send cookies
  timeout: 30000,  // 30 second timeout
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

// Web client - for auth routes (non-API)
export const webClient = axios.create({
  baseURL: BACKEND,
  withCredentials: true,  // ✅ Critical: send cookies
  timeout: 30000,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor: add CSRF token for POST/PUT/PATCH/DELETE
axiosClient.interceptors.request.use((config) => {
  const token = getCSRFToken();
  // Only add CSRF token for state-changing requests
  if (["post", "put", "patch", "delete"].includes(config.method?.toLowerCase()) && token) {
    config.headers["X-XSRF-TOKEN"] = token;
  }
  return config;
});

webClient.interceptors.request.use((config) => {
  const token = getCSRFToken();
  if (["post", "put", "patch", "delete"].includes(config.method?.toLowerCase()) && token) {
    config.headers["X-XSRF-TOKEN"] = token;
  }
  return config;
});

/**
 * Response Interceptor
 * 
 * Handles 401 responses (session expired).
 * Only clears auth if user was actually authenticated.
 */
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration (401)
    if (error.response?.status === 401) {
      const store = useAuthStore.getState();
      
      // Only clear if user was authenticated
      if (store.user) {
        store.clearUser();
        
        // Redirect to login (unless already there)
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login?reason=session_expired";
        }
      }
    }
    
    return Promise.reject(error);
  }
);
