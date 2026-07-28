import * as React from "react"
import { Loader2 } from "lucide-react"

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-muted-foreground w-full h-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p>{message}</p>
    </div>
  )
}
