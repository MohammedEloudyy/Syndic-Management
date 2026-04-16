import { axiosClient } from "@/lib/axios";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

export async function registerApi(payload) {
  await axiosClient.get("/sanctum/csrf-cookie");
  // Backend may or may not expose /register; the UI is backend-ready either way.
  const xsrf = getCookie("XSRF-TOKEN");
  return axiosClient.post("/register", payload, {
    headers: xsrf ? { "X-XSRF-TOKEN": xsrf } : undefined,
  });
}

