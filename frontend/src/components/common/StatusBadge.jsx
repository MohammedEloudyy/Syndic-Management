import { memo } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const StatusBadge = memo(function StatusBadge({ status, className }) {
  if (status === "occupé") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
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
          "inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-500/20",
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
          "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
          className,
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        payé
      </span>
    );
  }

  if (status === "en attente" || status === "en_attente") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-400 border border-sky-500/20",
          className,
        )}
      >
        <Clock3 className="h-3.5 w-3.5" />
        en attente
      </span>
    );
  }

  if (status === "en retard" || status === "en_retard") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-400 border border-red-500/20",
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
});

export default StatusBadge;

