import { ensureCsrfToken, webClient } from "@/api/axios";

export async function logoutUser() {
  await ensureCsrfToken();
  await webClient.post("/logout");
}
