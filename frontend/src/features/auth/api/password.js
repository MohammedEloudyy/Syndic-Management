import axios from "axios";
import { getBackendOrigin, webClient } from "@/api/axios";

/**
 * Reset password directly (no token/email verification required).
 * POST /direct-reset-password
 */
export async function directResetPassword({ email, password, password_confirmation }) {
  // Step 1: Get CSRF token from Sanctum
  await axios.get(getBackendOrigin() + "/sanctum/csrf-cookie", {
    withCredentials: true,
    timeout: 5000,
  });

  // Step 2: Send direct reset request
  const { data } = await webClient.post("/direct-reset-password", {
    email,
    password,
    password_confirmation,
  });
  return data;
}
