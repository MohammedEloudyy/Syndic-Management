import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:border-blue-600/50 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:opacity-50 aria-invalid:border-rose-500 aria-invalid:ring-rose-500/10 font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
