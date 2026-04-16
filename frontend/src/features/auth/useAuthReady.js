import { useContext } from "react";
import { AuthReadyContext } from "@/features/auth/authReadyContext";

export function useAuthReady() {
  return useContext(AuthReadyContext);
}

