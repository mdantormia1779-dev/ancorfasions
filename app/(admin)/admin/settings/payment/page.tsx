import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Payment Settings | Admin",
};

export default function PaymentSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Gateways</h1>
        <p className="mt-1 text-muted-foreground">
          Manage how your customers pay for their orders.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>SSLCommerz</CardTitle>
            <CardDescription>
              Accept cards, mobile banking, and net banking in Bangladesh.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="sslcommerz" defaultChecked />
              <Label htmlFor="sslcommerz">Enable SSLCommerz</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Configure</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Cash on Delivery</CardTitle>
            <CardDescription>
              Allow customers to pay when they receive the product.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="cod" defaultChecked />
              <Label htmlFor="cod">Enable COD</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Configure</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
