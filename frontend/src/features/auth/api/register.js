import axios from "axios";
import { getBackendOrigin, webClient } from "@/api/axios";

export async function registerUser(payload) {
  await axios.get(getBackendOrigin() + "/sanctum/csrf-cookie", {
    withCredentials: true,
  });
  const { data } = await webClient.post("/register", payload);
  return data;
}
