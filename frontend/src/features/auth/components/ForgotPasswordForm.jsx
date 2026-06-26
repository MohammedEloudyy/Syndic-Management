import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { directResetPassword } from "@/features/auth/api/password";

const schema = z
  .object({
    email: z.string().email("Adresse email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    password_confirmation: z.string().min(1, "Veuillez confirmer votre mot de passe"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirmation"],
  });

export default function ForgotPasswordForm() {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", password_confirmation: "" },
    mode: "onTouched",
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values) => {
    setServerError("");
    setSuccess(false);
    try {
      await directResetPassword({
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });
      setSuccess(true);
    } catch (error) {
      const resp = error?.response?.data;
      const errors = resp?.errors;

      if (errors?.email?.[0]) {
        form.setError("email", { message: errors.email[0] });
      } else if (errors?.password?.[0]) {
        form.setError("password", { message: errors.password[0] });
      } else {
        setServerError(
          resp?.message ||
          resp?.error ||
          "Impossible de réinitialiser le mot de passe. Réessayez plus tard."
        );
      }
    }
  };

  const emailError = useMemo(
    () => form.formState.errors.email?.message,
    [form.formState.errors.email]
  );
  const passwordError = useMemo(
    () => form.formState.errors.password?.message,
    [form.formState.errors.password]
  );
  const confirmError = useMemo(
    () => form.formState.errors.password_confirmation?.message,
    [form.formState.errors.password_confirmation]
  );

  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-emerald-900">Mot de passe modifié !</h3>
            <p className="text-sm text-emerald-700 leading-relaxed">
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
            </p>
          </div>
        </div>
        <Link to="/login">
          <Button variant="modern" className="w-full h-11">
            Se connecter
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Email */}
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
            autoFocus
            aria-invalid={!!emailError}
          />
        </div>
        {emailError && (
          <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {emailError}
          </p>
        )}
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Nouveau mot de passe</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-9 pr-10"
            {...form.register("password")}
            autoComplete="new-password"
            aria-invalid={!!passwordError}
          />
          <button
            type="button"
            className="absolute right-2 top-2.5 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Masquer" : "Afficher"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {passwordError && (
          <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {passwordError}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Confirmer le mot de passe</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            className="pl-9 pr-10"
            {...form.register("password_confirmation")}
            autoComplete="new-password"
            aria-invalid={!!confirmError}
          />
          <button
            type="button"
            className="absolute right-2 top-2.5 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Masquer" : "Afficher"}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {confirmError && (
          <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {confirmError}
          </p>
        )}
      </div>

      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive animate-in zoom-in-95 duration-200">
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-11"
        variant="modern"
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Réinitialiser le mot de passe
      </Button>

      <Link
        to="/login"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la connexion
      </Link>
    </form>
  );
}
