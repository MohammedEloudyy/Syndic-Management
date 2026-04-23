import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/useAuth";

const schema = z
  .object({
    fullName: z.string().min(2, "Nom complet requis"),
    email: z.string().email("Adresse email invalide"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    passwordConfirmation: z.string().min(6, "Confirmation requise"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirmation"],
  });

export default function RegisterForm() {
  const { register: registerUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
    mode: "onTouched",
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await registerUser({
        name: values.fullName,
        email: values.email,
        password: values.password,
        password_confirmation: values.passwordConfirmation,
      });
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

      if (errors?.name?.[0]) {
        form.setError("fullName", { message: errors.name[0] });
      }

      if (errors?.password?.[0]) {
        form.setError("password", { message: errors.password[0] });
      }

      if (!errors) {
        setServerError(
          resp?.message ||
            error?.response?.data?.error ||
            "Impossible de créer le compte. Veuillez réessayer.",
        );
      }
    }
  };

  const fullNameError = useMemo(
    () => form.formState.errors.fullName?.message,
    [form.formState.errors.fullName],
  );
  const emailError = useMemo(
    () => form.formState.errors.email?.message,
    [form.formState.errors.email],
  );
  const passwordError = useMemo(
    () => form.formState.errors.password?.message,
    [form.formState.errors.password],
  );
  const passwordConfirmationError = useMemo(
    () => form.formState.errors.passwordConfirmation?.message,
    [form.formState.errors.passwordConfirmation],
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Nom complet</label>
        <Input
          placeholder="Jean Dupont"
          {...form.register("fullName")}
          aria-invalid={!!fullNameError}
        />
        {fullNameError ? <p className="text-xs text-destructive">{fullNameError}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Adresse email</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="jean@syndic.com"
            className="pl-9"
            {...form.register("email")}
            aria-invalid={!!emailError}
            autoComplete="email"
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
            aria-invalid={!!passwordError}
            autoComplete="new-password"
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

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Confirmer le mot de passe</label>
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          className="pr-3"
          {...form.register("passwordConfirmation")}
          aria-invalid={!!passwordConfirmationError}
          autoComplete="new-password"
        />
        {passwordConfirmationError ? (
          <p className="text-xs text-destructive">{passwordConfirmationError}</p>
        ) : null}
      </div>

      {serverError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      ) : null}

      <Button 
        type="submit" 
        className="w-full h-11" 
        variant="modern"
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Créer un compte
      </Button>
    </form>
  );
}
