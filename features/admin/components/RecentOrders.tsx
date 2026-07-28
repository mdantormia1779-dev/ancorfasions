"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const recentOrders = [
  { id: "#ORD-7352", customer: "Liam Neeson", email: "liam@example.com", amount: "$120.00", status: "Completed", date: "Just now", avatar: "https://i.pravatar.cc/150?u=liam" },
  { id: "#ORD-7351", customer: "Emma Watson", email: "emma@example.com", amount: "$340.50", status: "Processing", date: "2 hours ago", avatar: "https://i.pravatar.cc/150?u=emma" },
  { id: "#ORD-7350", customer: "Will Smith", email: "will@example.com", amount: "$85.00", status: "Pending", date: "5 hours ago", avatar: "https://i.pravatar.cc/150?u=will" },
  { id: "#ORD-7349", customer: "Margot Robbie", email: "margot@example.com", amount: "$1,250.00", status: "Completed", date: "Yesterday", avatar: "https://i.pravatar.cc/150?u=margot" },
  { id: "#ORD-7348", customer: "Tom Hardy", email: "tom@example.com", amount: "$45.00", status: "Cancelled", date: "Yesterday", avatar: "https://i.pravatar.cc/150?u=tom" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Completed":
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
    case "Processing":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
    case "Pending":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
    case "Cancelled":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function RecentOrders() {
  return (
    <Card className="border-slate-200/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-900">Recent Orders</CardTitle>
        <CardDescription>The latest transactions across your store.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9 border border-slate-100">
                  <AvatarImage src={order.avatar} alt={order.customer} />
                  <AvatarFallback>{order.customer.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-slate-900">{order.customer}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{order.id}</span>
                    <span>•</span>
                    <span>{order.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{order.amount}</p>
                  <p className="text-xs text-slate-500">{order.date}</p>
                </div>
                <div className="w-[90px] text-right">
                  {getStatusBadge(order.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
