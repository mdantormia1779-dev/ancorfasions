import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  loading?: boolean;
  description?: string;
}

export function StatCard({ title, value, icon, trend, loading, description }: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[120px] mb-2" />
          <Skeleton className="h-3 w-[150px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        {trend !== undefined && (
          <div className="flex items-center text-xs mt-1">
            {trend > 0 ? (
              <span className="text-emerald-500 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded-sm">
                <ArrowUpIcon className="mr-1 h-3 w-3" />
                {trend}%
              </span>
            ) : trend < 0 ? (
              <span className="text-rose-500 flex items-center bg-rose-500/10 px-1.5 py-0.5 rounded-sm">
                <ArrowDownIcon className="mr-1 h-3 w-3" />
                {Math.abs(trend)}%
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center bg-muted px-1.5 py-0.5 rounded-sm">
                <MinusIcon className="mr-1 h-3 w-3" />
                0%
              </span>
            )}
            <span className="text-muted-foreground ml-2">vs previous period</span>
          </div>
        )}
        
        {description && !trend && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
