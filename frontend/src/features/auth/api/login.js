import axios from "axios";
import { getBackendOrigin, webClient } from "@/api/axios";

export async function loginUser(credentials) {
  // Step 1: Get CSRF token from Sanctum
  try {
    await axios.get(getBackendOrigin() + "/sanctum/csrf-cookie", {
      withCredentials: true,
      timeout: 5000,
    });
  } catch (error) {
    console.error("CSRF cookie request failed:", error);
    throw new Error("Impossible d'initialiser la connexion");
  }

  // Step 2: Perform login (this establishes session)
  const { data } = await webClient.post("/login", credentials);
  
  // Returns: { user: {...}, message: "Login successful" }
  return data;
}
