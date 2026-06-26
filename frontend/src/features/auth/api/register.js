import { ensureCsrfToken, webClient } from "@/api/axios";

export async function registerUser(payload) {
  await ensureCsrfToken();
  const { data } = await webClient.post("/register", payload);
  return data;
}
