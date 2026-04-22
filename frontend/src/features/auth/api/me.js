import { axiosClient } from "@/api/axios";

export async function getMe() {
  const { data } = await axiosClient.get("/user");
  return data;
}
