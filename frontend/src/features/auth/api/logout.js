import { webClient } from "@/api/axios";

export async function logoutUser() {
  await webClient.post("/logout");
}
