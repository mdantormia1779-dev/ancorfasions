"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { PaymentGatewayConfig, updatePaymentConfig } from "@/lib/actions/payment.actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function PaymentClient({ 
  initialSslcommerz, 
  initialCod 
}: { 
  initialSslcommerz: PaymentGatewayConfig;
  initialCod: PaymentGatewayConfig;
}) {
  const [sslcommerz, setSslcommerz] = useState<PaymentGatewayConfig>(initialSslcommerz);
  const [cod, setCod] = useState<PaymentGatewayConfig>(initialCod);
  
  const [isSavingSsl, setIsSavingSsl] = useState(false);
  const [isSavingCod, setIsSavingCod] = useState(false);

  const handleSaveSslcommerz = async () => {
    setIsSavingSsl(true);
    try {
      const res = await updatePaymentConfig("sslcommerz", sslcommerz);
      if (res.success) {
        toast.success("SSLCommerz settings saved successfully");
      } else {
        toast.error(res.error || "Failed to save settings");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    } finally {
      setIsSavingSsl(false);
    }
  };

  const handleSaveCod = async () => {
    setIsSavingCod(true);
    try {
      const res = await updatePaymentConfig("cod", cod);
      if (res.success) {
        toast.success("COD settings saved successfully");
      } else {
        toast.error(res.error || "Failed to save settings");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    } finally {
      setIsSavingCod(false);
    }
  };

  return (
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
            <Switch 
              id="sslcommerz-enabled" 
              checked={sslcommerz.enabled}
              onCheckedChange={(c) => setSslcommerz({ ...sslcommerz, enabled: c })}
            />
            <Label htmlFor="sslcommerz-enabled">Enable SSLCommerz</Label>
          </div>
          
          {sslcommerz.enabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="store_id">Store ID</Label>
                <Input 
                  id="store_id"
                  value={sslcommerz.store_id || ""}
                  onChange={(e) => setSslcommerz({ ...sslcommerz, store_id: e.target.value })}
                  placeholder="Enter Store ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_password">Store Password</Label>
                <Input 
                  id="store_password"
                  type="password"
                  value={sslcommerz.store_password || ""}
                  onChange={(e) => setSslcommerz({ ...sslcommerz, store_password: e.target.value })}
                  placeholder="Enter Store Password"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  id="sslcommerz-sandbox" 
                  checked={sslcommerz.sandbox}
                  onCheckedChange={(c) => setSslcommerz({ ...sslcommerz, sandbox: c })}
                />
                <Label htmlFor="sslcommerz-sandbox">Sandbox Mode (Testing)</Label>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSslcommerz} disabled={isSavingSsl}>
            {isSavingSsl ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Save Configuration
          </Button>
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
            <Switch 
              id="cod-enabled" 
              checked={cod.enabled}
              onCheckedChange={(c) => setCod({ ...cod, enabled: c })}
            />
            <Label htmlFor="cod-enabled">Enable COD</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveCod} disabled={isSavingCod}>
            {isSavingCod ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Save Configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
