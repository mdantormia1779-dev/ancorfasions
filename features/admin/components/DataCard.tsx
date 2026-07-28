"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataCardProps {
  title: string;
  value: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  className?: string;
}

export function DataCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  className,
}: DataCardProps) {
  return (
    <Card className={cn("overflow-hidden border border-slate-200/60 shadow-sm transition-all hover:shadow-md bg-white", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
        <CardTitle className="text-sm font-medium text-slate-500">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
          <Icon className="h-4 w-4 text-slate-700" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-slate-900 tracking-tight">{value}</div>
        {(trend || description) && (
          <div className="mt-2 text-xs flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  "font-medium rounded-md px-1.5 py-0.5",
                  trend.isPositive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                    : "bg-red-50 text-red-700 border border-red-200/50"
                )}
              >
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <span className="text-slate-500">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}