"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Share2, Users, Gift, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = "ALEX2026";
  const referralLink = `https://anchorfashion.com/invite/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-light tracking-tight text-[#1A1A1A]">Invite Friends</h1>
        <p className="mt-2 text-sm text-gray-500">
          Share your love for Anchor Fashion. Give friends 15% off their first order and earn 5,000 points for each successful referral.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] text-white shadow-xl flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-[#C9A86A] flex items-center gap-2">
              <Gift className="h-5 w-5" /> Earn 5,000 Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-300 text-sm leading-relaxed">
              Your friends get an exclusive 15% discount on their first purchase. Once their order is delivered, you automatically receive 5,000 loyalty points.
            </p>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-semibold text-gray-400">Your Unique Link</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white/10 p-3 rounded border border-white/20 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                  {referralLink}
                </code>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 h-[46px] w-[46px] flex-shrink-0"
                  onClick={handleCopy}
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-[#C9A86A]" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button className="w-full bg-[#C9A86A] text-[#1A1A1A] hover:bg-[#B08D55] font-bold uppercase tracking-widest text-xs h-12">
              <Share2 className="mr-2 h-4 w-4" /> Share Link
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm h-full">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-medium text-[#1A1A1A]">Referral History</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                  <div className="flex justify-center mb-2 text-[#C9A86A]">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="text-2xl font-light text-[#1A1A1A]">3</div>
                  <div className="text-[10px] uppercase tracking-widest font-semibold text-gray-500 mt-1">Friends Joined</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                  <div className="flex justify-center mb-2 text-[#C9A86A]">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div className="text-2xl font-light text-[#1A1A1A]">15,000</div>
                  <div className="text-[10px] uppercase tracking-widest font-semibold text-gray-500 mt-1">Points Earned</div>
                </div>
              </div>

              <div className="space-y-4">
                <ReferralActivity name="Sarah J." date="Oct 12, 2026" status="Completed" />
                <ReferralActivity name="Michael T." date="Oct 05, 2026" status="Completed" />
                <ReferralActivity name="Emily R." date="Sep 28, 2026" status="Completed" />
                <ReferralActivity name="David L." date="Oct 15, 2026" status="Pending" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ReferralActivity({ name, date, status }: any) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-[#1A1A1A]">{name}</p>
          <p className="text-xs text-gray-500">{date}</p>
        </div>
      </div>
      <div>
        <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded ${
          status === "Completed" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
}
