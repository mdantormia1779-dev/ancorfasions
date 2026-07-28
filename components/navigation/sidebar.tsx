import * as React from "react"
import { cn } from "@/lib/utils"

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside className={cn("hidden w-64 flex-col border-r bg-sidebar text-sidebar-foreground md:flex", className)}>
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <span className="font-bold text-lg tracking-tight">Anchor Fashion</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {/* Navigation items go here */}
        <div className="px-3 py-2 text-sm font-medium text-sidebar-foreground bg-sidebar-accent rounded-md">
          Dashboard
        </div>
      </nav>
    </aside>
  )
}
