import { ReactNode } from "react";
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
  icon: ReactNode;
  className?: string;
}

export function DataCard({
  title,
  value,
  description,
  trend,
  icon,
  className,
}: DataCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border border-slate-200/60 bg-white shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
        <CardTitle className="text-sm font-medium text-slate-500">
          {title}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 bg-slate-50">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </div>
        {(trend || description) && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 font-medium",
                  trend.isPositive
                    ? "border border-emerald-200/50 bg-emerald-50 text-emerald-700"
                    : "border border-red-200/50 bg-red-50 text-red-700"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%
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
