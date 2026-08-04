"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Package } from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

const formatCurrency = (val: number) =>
  formatCurrency(val);

export function TopSellersTable({ data = [] }: { data?: any[] }) {
  return (
    <Card className="border-none bg-card text-card-foreground shadow-sm rounded-2xl overflow-hidden h-full">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Top Seller Of The Month</h3>
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
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Sold</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center">No top sellers found</td></tr>
              ) : data.map((seller) => (
                <tr key={seller.product_id} className="hover:bg-muted/50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-slate-300 text-[#00A1FF] focus:ring-[#00A1FF]" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 overflow-hidden rounded-md border border-border relative bg-muted/50 flex items-center justify-center">
                        {seller.image_url ? (
                          <Image src={seller.image_url} alt={seller.product_name} fill className="object-cover" />
                        ) : (
                          <Package className="h-4 w-4 text-muted-foreground/80" />
                        )}
                      </div>
                      <span className="font-medium text-foreground/90">{seller.product_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{seller.category_name}</td>
                  <td className="px-6 py-4 font-medium text-foreground/90">{seller.sold}</td>
                  <td className="px-6 py-4">{formatCurrency(seller.price)}</td>
                  <td className="px-6 py-4 font-medium text-foreground/90">{formatCurrency(seller.earnings)}</td>
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
