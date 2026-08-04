"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

interface DataCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  sparklineData?: number[];
  sparklineColor?: string;
  className?: string;
}

export function DataCard({
  title,
  value,
  description,
  icon,
  iconBgColor = "bg-teal-50",
  iconTextColor = "text-teal-600",
  sparklineData = [10, 20, 15, 30, 25, 40, 35, 50, 40, 60],
  sparklineColor = "#0d9488",
  className,
}: DataCardProps) {
  // Convert array of numbers to object array for recharts
  const chartData = sparklineData.map((val, i) => ({ value: val, index: i }));

  return (
    <Card
      className={cn(
        "overflow-hidden border-none bg-card text-card-foreground shadow-sm rounded-2xl transition-all hover:shadow-md",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
          <button className="text-muted-foreground/80 hover:text-muted-foreground transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-full", iconBgColor, iconTextColor)}>
            {icon}
          </div>
          <div className="flex flex-col">
            <div className="text-[28px] font-bold tracking-tight text-foreground leading-none mb-1">
              {value}
            </div>
            {description && (
              <div className="text-xs font-medium text-muted-foreground/80">
                {description}
              </div>
            )}
          </div>
        </div>

        <div className="h-[60px] w-full -mx-2 -mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={sparklineColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

