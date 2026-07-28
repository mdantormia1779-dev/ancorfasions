'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, DownloadIcon, FilterIcon, RefreshCwIcon } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AnalyticsFilters({ showExport = true }: { showExport?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>({
    from: searchParams.get('from') ? new Date(searchParams.get('from') as string) : subDays(new Date(), 30),
    to: searchParams.get('to') ? new Date(searchParams.get('to') as string) : new Date(),
  });

  const updateFilters = (range: { from?: Date; to?: Date }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (range?.from) {
      params.set('from', range.from.toISOString());
    } else {
      params.delete('from');
    }
    
    if (range?.to) {
      params.set('to', range.to.toISOString());
    } else {
      params.delete('to');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleQuickFilter = (days: number) => {
    const to = new Date();
    const from = subDays(to, days);
    setDateRange({ from, to });
    updateFilters({ from, to });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[260px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range) => {
                setDateRange(range as { from?: Date; to?: Date });
                if (range?.from && range?.to) {
                  updateFilters(range as { from?: Date; to?: Date });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <div className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleQuickFilter(7)}>7D</Button>
          <Button variant="ghost" size="sm" onClick={() => handleQuickFilter(30)}>30D</Button>
          <Button variant="ghost" size="sm" onClick={() => handleQuickFilter(90)}>90D</Button>
          <Button variant="ghost" size="sm" onClick={() => handleQuickFilter(365)}>1Y</Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => {
            startTransition(() => {
              router.refresh();
            });
          }}
          disabled={isPending}
        >
          <RefreshCwIcon className={cn("h-4 w-4", isPending && "animate-spin")} />
        </Button>
        
        {showExport && (
          <Button variant="outline" className="gap-2">
            <DownloadIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        )}
      </div>
    </div>
  );
}
