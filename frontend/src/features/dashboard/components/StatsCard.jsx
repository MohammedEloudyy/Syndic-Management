import { memo } from "react";
import { cn } from "@/lib/utils";

const StatsCard = memo(function StatsCard({
  value,
  label,
  icon: Icon,
  description,
  className,
  iconClassName,
  trend,
}) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl border bg-card px-5 py-5 shadow-sm",
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        "overflow-hidden",
        className,
      )}
    >
      {/* Subtle gradient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-indigo-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-bold leading-none tracking-tight">{value}</div>
          <div className="mt-1.5 text-sm font-semibold text-current opacity-80">{label}</div>
          {description && (
            <div className="mt-1 text-xs text-muted-foreground font-medium">{description}</div>
          )}
          {trend !== undefined && trend !== null && (
            <div className={cn(
              "mt-2 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md",
              trend >= 0
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs mois dernier
            </div>
          )}
        </div>
        {Icon ? (
          <div className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            "bg-blue-600/10 text-blue-700 dark:text-blue-400",
            "group-hover:scale-110 transition-transform duration-300",
            iconClassName,
          )}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
});

export default StatsCard;
