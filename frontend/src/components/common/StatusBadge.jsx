import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }) {
  if (status === "occupé") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-700",
          className,
        )}
      >
        occupé
      </span>
    );
  }
  if (status === "vacant") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground",
          className,
        )}
      >
        vacant
      </span>
    );
  }

  if (status === "payé") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-700",
          className,
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        payé
      </span>
    );
  }

  if (status === "en attente") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs text-sky-700",
          className,
        )}
      >
        <Clock3 className="h-3.5 w-3.5" />
        en attente
      </span>
    );
  }

  if (status === "en retard") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs text-red-700",
          className,
        )}
      >
        <XCircle className="h-3.5 w-3.5" />
        en retard
      </span>
    );
  }

  return (
    <span className={cn("inline-flex rounded-full bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground", className)}>
      {status}
    </span>
  );
}

