import axios from "axios";
import { useAuthStore } from "@/features/auth/store/authStore";

const baseURL = import.meta.env.VITE_BACKEND_URL ?? "";

export const axiosClient = axios.create({
  baseURL,
  withCredentials: true,
});

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const rawValue = parts.pop().split(";").shift();
    // Important: send the exact value that JS reads from the cookie back in
    // `X-XSRF-TOKEN`. Laravel expects the header value to match the cookie
    // (same encryption/serialization + avoid double-decoding).
    return rawValue;
  }
  return null;
}

axiosClient.interceptors.request.use((config) => {
  const xsrfToken = getCookie("XSRF-TOKEN");
  if (xsrfToken) {
    config.headers = config.headers ?? {};
    config.headers["X-XSRF-TOKEN"] = xsrfToken;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      useAuthStore.getState().logout?.();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  },
);

