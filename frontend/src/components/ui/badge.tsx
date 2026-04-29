import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-3 focus:ring-ring/20",
  {
    variants: {
      variant: {
        default:
          "border-border bg-background text-foreground shadow-sm",
        success:
          "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        warning:
          "border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-300",
        danger:
          "border-transparent bg-red-500/10 text-red-700 dark:text-red-300",
        info: "border-transparent bg-sky-500/10 text-sky-700 dark:text-sky-300",
        muted: "border-border bg-muted/30 text-muted-foreground shadow-none",
        emerald: "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold",
        amber: "border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

