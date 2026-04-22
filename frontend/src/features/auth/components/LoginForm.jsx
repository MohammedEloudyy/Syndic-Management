import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";

const schema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  remember: z.boolean().optional(),
});

export default function LoginForm() {
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
    mode: "onTouched",
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await login({ email: values.email, password: values.password });
    } catch (error) {
      const status = error?.response?.status;
      const resp = error?.response?.data;
      const errors = resp?.errors;

      if (status === 419) {
        setServerError(
          resp?.message ||
            resp?.error ||
            (typeof resp === "string" ? resp : null) ||
            `Erreur de sécurité (CSRF) - HTTP ${status}. Rechargez la page puis réessayez.`,
        );
        return;
      }

      if (errors?.email?.[0]) {
        form.setError("email", { message: errors.email[0] });
      }

      if (errors?.password?.[0]) {
        form.setError("password", { message: errors.password[0] });
      }

      if (!errors) {
        setServerError(
          resp?.message ||
            error?.response?.data?.error ||
            "Impossible de se connecter. Vérifiez vos identifiants.",
        );
      }
    }
  };

  const emailError = useMemo(() => form.formState.errors.email?.message, [form.formState.errors.email]);
  const passwordError = useMemo(
    () => form.formState.errors.password?.message,
    [form.formState.errors.password],
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Adresse email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="admin@syndic.com"
            className="pl-9"
            {...form.register("email")}
            autoComplete="email"
            aria-invalid={!!emailError}
          />
        </div>
        {emailError ? <p className="text-xs text-destructive">{emailError}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Mot de passe</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-9 pr-10"
            {...form.register("password")}
            autoComplete="current-password"
            aria-invalid={!!passwordError}
          />
          <button
            type="button"
            className="absolute right-2 top-2.5 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {passwordError ? <p className="text-xs text-destructive">{passwordError}</p> : null}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border border-input bg-background"
            {...form.register("remember")}
          />
          Se souvenir de moi
        </label>

        <Link to="/forgot" className="text-sm text-primary hover:underline">
          Mot de passe oublié ?
        </Link>
      </div>

      {serverError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Se connecter
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        En vous connectant, vous acceptez nos conditions d&apos;utilisation et notre politique de
        confidentialité.
      </p>
    </form>
  );
}
