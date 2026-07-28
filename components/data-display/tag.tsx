import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge, BadgeProps } from "@/components/ui/badge"

export function Tag({ className, variant, ...props }: BadgeProps) {
  return <Badge variant={variant || "secondary"} className={cn("rounded-sm font-normal px-1.5 py-0.5", className)} {...props} />
}
