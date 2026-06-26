import { ensureCsrfToken, webClient } from "@/api/axios";

/**
 * Reset password directly (no token/email verification required).
 * POST /direct-reset-password
 */
export async function directResetPassword({ email, password, password_confirmation }) {
  // Step 1: Get CSRF token from Sanctum
  try {
    await ensureCsrfToken();
  } catch (error) {
    console.error("CSRF cookie request failed:", error);
    throw new Error("Impossible d'initialiser la connexion");
  }

  // Step 2: Send direct reset request
  const { data } = await webClient.post("/direct-reset-password", {
    email,
    password,
    password_confirmation,
  });
  return data;
}
