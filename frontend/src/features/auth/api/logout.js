import { axiosClient } from "@/lib/axios";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

export async function logoutApi() {
  // Sanctum logout is usually POST /logout and clears the session cookie.
  const xsrf = getCookie("XSRF-TOKEN");
  return axiosClient.post("/logout", null, {
    headers: xsrf ? { "X-XSRF-TOKEN": xsrf } : undefined,
  });
}

