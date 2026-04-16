import { axiosClient } from "@/lib/axios";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

export async function loginApi(credentials) {
  // Sanctum: CSRF cookie must be loaded before login POST.
  await axiosClient.get("/sanctum/csrf-cookie");
  const xsrf = getCookie("XSRF-TOKEN");
  return axiosClient.post("/login", credentials, {
    headers: xsrf ? { "X-XSRF-TOKEN": xsrf } : undefined,
  });
}

