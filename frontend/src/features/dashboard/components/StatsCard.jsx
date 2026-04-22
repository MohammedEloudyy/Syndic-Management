import { cn } from "@/lib/utils";

export default function StatsCard({ value, label, icon: Icon, className }) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card px-5 py-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {Icon ? (
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-700">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div>
          <div className="text-2xl font-semibold leading-none">{value}</div>
          <div className="mt-1 text-sm text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}
