import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/10 font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
