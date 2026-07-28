import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-[250px] mb-2" />
        <Skeleton className="h-5 w-[400px]" />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
        <Skeleton className="h-10 w-[260px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-xl p-6 bg-card text-card-foreground shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-[120px] mb-2" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        ))}
      </div>

      <div className="mt-8 border rounded-xl p-6 bg-card">
        <Skeleton className="h-6 w-[200px] mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    </div>
  );
}
