import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { router } from "@/app/router";
import { Toaster } from "sonner";

export function AppProviders() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors closeButton />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}