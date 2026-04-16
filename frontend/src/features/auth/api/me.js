import { axiosClient } from "@/lib/axios";

export async function meApi() {
  return axiosClient.get("/user");
}

