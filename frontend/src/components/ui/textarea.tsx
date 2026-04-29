import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/10 font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
