"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Copy, CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";

export function CouponsClient({ coupons }: { coupons: any[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Coupon code copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const available = coupons.filter(c => c.type === "Available" && !c.recommended);
  const recommended = coupons.filter(c => c.recommended);
  const used = coupons.filter(c => c.type === "Used");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-[#1A1A1A]">Coupons & Offers</h1>
          <p className="mt-2 text-sm text-gray-500">
            View available discounts and personalized offers.
          </p>
        </div>
      </div>

      {recommended.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#1A1A1A] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#C9A86A]" /> Recommended For You
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {recommended.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} copiedId={copiedId} onCopy={handleCopy} isPremium />
            ))}
          </div>
        </div>
      )}

      {available.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#1A1A1A]">Available Coupons</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {available.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} copiedId={copiedId} onCopy={handleCopy} />
            ))}
          </div>
        </div>
      )}

      {used.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-gray-100">
          <h3 className="text-lg font-medium text-gray-500">Past Offers</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {used.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} copiedId={copiedId} onCopy={handleCopy} isUsed />
            ))}
          </div>
        </div>
      )}
      
      {coupons.length === 0 && (
        <div className="py-12 text-center border-2 border-dashed rounded-lg border-gray-200">
          <Ticket className="h-10 w-10 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No coupons available</h3>
          <p className="mt-1 text-sm text-gray-500">Check back later for new offers.</p>
        </div>
      )}
    </div>
  );
}

function CouponCard({ coupon, copiedId, onCopy, isPremium, isUsed }: any) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isUsed ? "opacity-60 bg-gray-50 border-gray-100 grayscale-[0.5]" : "border-gray-200 shadow-sm",
        isPremium ? "border-[#C9A86A]/30 bg-gradient-to-br from-white to-[#C9A86A]/5" : ""
      )}
    >
      <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-[#1A1A1A] to-[#2D2D2D] opacity-10" />
      {isPremium && <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-[#C9A86A] to-[#B08D55]" />}
      
      <CardHeader className="pb-4 pl-6 border-b border-dashed border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className={cn("text-2xl font-light tracking-tight", isPremium ? "text-[#C9A86A]" : "text-[#1A1A1A]")}>
              {coupon.discount}
            </CardTitle>
            <p className="mt-1 text-sm font-medium text-gray-600">
              {coupon.description}
            </p>
          </div>
          <Ticket className={cn("h-6 w-6", isPremium ? "text-[#C9A86A]" : "text-gray-300")} />
        </div>
      </CardHeader>
      
      <CardContent className="flex items-center justify-between pt-4 pl-6 bg-white/50">
        <div>
          <div className="inline-block bg-gray-100 px-3 py-1 rounded border border-gray-200">
            <span className="font-mono font-bold tracking-widest text-sm text-[#1A1A1A]">
              {coupon.code}
            </span>
          </div>
          <p className="mt-2 text-[11px] uppercase tracking-widest font-semibold text-gray-400">
            {coupon.expiry}
          </p>
        </div>
        
        {!isUsed && (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 px-4 border-gray-200 text-[#1A1A1A] hover:bg-gray-50 font-semibold uppercase tracking-widest text-xs"
            onClick={() => onCopy(coupon.code, coupon.id)}
          >
            {copiedId === coupon.id ? (
              <><CheckCircle2 className="h-4 w-4 mr-2 text-[#C9A86A]" /> Copied</>
            ) : (
              <><Copy className="h-4 w-4 mr-2" /> Copy Code</>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
