import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Copy } from "lucide-react";

export const metadata = {
  title: "Coupons & Offers | Anchor Fashion",
};

export default function CouponsPage() {
  const coupons = [
    {
      code: "WELCOME10",
      discount: "10% OFF",
      description: "On your first purchase",
      expiry: "2026-12-31",
      type: "Available",
    },
    {
      code: "VIP20",
      discount: "20% OFF",
      description: "Exclusive VIP Discount",
      expiry: "2026-11-30",
      type: "Available",
    },
    {
      code: "BIRTHDAY",
      discount: "BDT 1000 OFF",
      description: "Birthday special",
      expiry: "2026-10-10",
      type: "Used",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coupons & Offers</h1>
        <p className="mt-2 text-muted-foreground">
          View available discounts and personalized offers.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {coupons.map((coupon, i) => (
          <Card
            key={i}
            className={coupon.type === "Used" ? "opacity-60 grayscale" : ""}
          >
            <CardHeader className="border-b border-dashed pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl text-primary">
                    {coupon.discount}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {coupon.description}
                  </CardDescription>
                </div>
                <Ticket className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between bg-muted/20 pt-4">
              <div>
                <p className="font-mono font-bold tracking-widest">
                  {coupon.code}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {coupon.type === "Used"
                    ? `Used on ${coupon.expiry}`
                    : `Valid until ${coupon.expiry}`}
                </p>
              </div>
              {coupon.type === "Available" && (
                <Button variant="outline" size="sm" className="space-x-2">
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
