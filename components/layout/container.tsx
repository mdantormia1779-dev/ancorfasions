import * as React from "react"
import { cn } from "@/lib/utils"
export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container mx-auto px-4 md:px-8 max-w-7xl", className)} {...props} />
}
