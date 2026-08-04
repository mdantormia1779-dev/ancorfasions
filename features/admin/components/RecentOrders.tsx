"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, User } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
    case "delivered":
    case "succeed":
      return (
        <span className="inline-flex items-center rounded-md bg-[#E8F8F5] px-3 py-1 text-xs font-medium text-[#0D9488]">
          {status}
        </span>
      );
    case "pending":
    case "preparing":
    case "waiting":
      return (
        <span className="inline-flex items-center rounded-md bg-[#FFF3E0] px-3 py-1 text-xs font-medium text-[#E65100]">
          {status}
        </span>
      );
    case "cancelled":
    case "failed":
      return (
        <span className="inline-flex items-center rounded-md bg-[#FFEBEE] px-3 py-1 text-xs font-medium text-[#C62828]">
          {status}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-foreground">
          {status}
        </span>
      );
  }
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    val
  );

export function RecentOrders({ data = [] }: { data?: any[] }) {
  return (
    <Card className="border-none bg-card text-card-foreground shadow-sm rounded-2xl overflow-hidden h-full">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Search:</span>
            <Input className="h-8 w-[150px] rounded-lg border-border" />
          </div>
          <button className="text-muted-foreground/80 hover:text-muted-foreground transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground">
            <thead className="bg-muted/50/50 text-xs font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">
                  <input type="checkbox" className="rounded border-slate-300 text-[#00A1FF] focus:ring-[#00A1FF]" />
                </th>
                <th className="px-6 py-4">Recent Orders</th>
                <th className="px-6 py-4">Order Date</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">No recent orders found</td></tr>
              ) : data.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-slate-300 text-[#00A1FF] focus:ring-[#00A1FF]" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={order.customer_avatar} />
                        <AvatarFallback className="bg-slate-100"><User className="h-4 w-4 text-muted-foreground/80"/></AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground/90">{order.customer_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{format(new Date(order.created_at), "MMM dd - hh.mm a")}</td>
                  <td className="px-6 py-4 font-medium text-foreground/90">{formatCurrency(order.grand_total)}</td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between px-6 py-4 border-t border-border text-sm text-muted-foreground">
          <div>Showing 1 to {data.length} of {data.length} entries</div>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 rounded-md text-muted-foreground/80 hover:text-muted-foreground">Previous</button>
            <button className="h-7 w-7 rounded-md bg-[#00A1FF] text-white flex items-center justify-center">1</button>
            <button className="px-3 py-1 rounded-md text-muted-foreground hover:text-slate-900">Next</button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

