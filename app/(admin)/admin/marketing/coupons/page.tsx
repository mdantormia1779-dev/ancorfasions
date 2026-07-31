"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus, Tag, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const coupons = [
  {
    id: "1",
    code: "SUMMER26",
    discount: "20% OFF",
    type: "Percentage",
    usage: "14,230 / Unlimited",
    status: "Active",
    expires: "Aug 31, 2026",
  },
  {
    id: "2",
    code: "VIPWELCOME50",
    discount: "$50 OFF",
    type: "Fixed Amount",
    usage: "450 / 1000",
    status: "Active",
    expires: "No Expiry",
  },
  {
    id: "3",
    code: "FREESHIP-HOLIDAY",
    discount: "Free Shipping",
    type: "Shipping",
    usage: "0 / Unlimited",
    status: "Scheduled",
    expires: "Dec 31, 2026",
  },
  {
    id: "4",
    code: "WINTER25",
    discount: "15% OFF",
    type: "Percentage",
    usage: "84,500 / Unlimited",
    status: "Expired",
    expires: "Jan 31, 2026",
  },
];

export default function CouponsManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Coupon Management
          </h1>
          <p className="mt-1 text-muted-foreground">
            Create and track promotional codes and discounts.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active & Past Promotions</CardTitle>
          <CardDescription>
            A consolidated view of all discount codes across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono font-bold">
                          {coupon.code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {coupon.discount}
                    </TableCell>
                    <TableCell>{coupon.type}</TableCell>
                    <TableCell>{coupon.usage}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          coupon.status === "Active"
                            ? "default"
                            : coupon.status === "Scheduled"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {coupon.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {coupon.expires}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Performance</DropdownMenuItem>
                          <DropdownMenuItem>Edit Rules</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
