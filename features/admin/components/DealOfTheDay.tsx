"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";

export function DealOfTheDay({ data }: { data?: any }) {
  if (!data) return null;

  const fallbackImage = "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=300&h=400";

  return (
    <Card className="border-none bg-card text-card-foreground shadow-sm rounded-2xl overflow-hidden h-full">
      <CardContent className="p-0 flex flex-col sm:flex-row h-full">
        <div className="relative w-full sm:w-[220px] h-[200px] sm:h-auto bg-slate-100 flex-shrink-0">
          <Image 
            src={data.image_url || fallbackImage}
            alt={data.name || "Deal of the day"} 
            fill 
            className="object-cover" 
          />
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-foreground line-clamp-1">{data.name || "Featured Product"}</h3>
            <button className="text-muted-foreground/80 hover:text-muted-foreground">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          
          <div className="text-[#00A1FF] text-xl font-bold mb-4">${Number(data.base_price).toFixed(2) || "0.00"}</div>
          
          <div className="mb-4">
            <div className="text-xs text-muted-foreground mb-2">Select size:</div>
            <div className="flex items-center gap-2">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <button 
                  key={size}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-xs text-muted-foreground hover:border-[#00A1FF] hover:text-[#00A1FF] transition-colors"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-xs text-muted-foreground mb-2">Colour:</div>
            <div className="flex items-center gap-2">
              <button className="w-5 h-5 rounded-full bg-slate-800 ring-2 ring-offset-2 ring-[#00A1FF]"></button>
              <button className="w-5 h-5 rounded-full bg-slate-300"></button>
              <button className="w-5 h-5 rounded-full bg-pink-300"></button>
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="text-xs font-semibold text-[#9333EA] mb-1">Special Discount</div>
            <h4 className="text-base font-bold text-foreground mb-3">Deal of the Day Free...</h4>
            
            <div className="flex items-center gap-3">
              {[
                { value: '14', label: 'Days' },
                { value: '23', label: 'Hours' },
                { value: '59', label: 'Min' },
                { value: '32', label: 'Sec' },
              ].map((time) => (
                <div key={time.label} className="text-center">
                  <div className="text-lg font-bold text-[#00A1FF] bg-[#F0F9FF] rounded-lg w-10 h-10 flex items-center justify-center mb-1">
                    {time.value}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium">{time.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
