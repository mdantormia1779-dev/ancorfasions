"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupplierAction } from "@/app/actions/manager/procurement.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewSupplierPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const supplier = {
      name: formData.get("name") as string,
      contact_email: formData.get("contact_email") as string,
      contact_phone: formData.get("contact_phone") as string,
      lead_time_days: Number(formData.get("lead_time_days") || 7),
      rating: 0,
    };

    const res = await createSupplierAction(supplier);
    setLoading(false);

    if (res.success) {
      toast.success("Supplier created successfully");
      router.push("/manager/inventory/suppliers");
    } else {
      toast.error(res.error || "Failed to create supplier");
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/manager/inventory/suppliers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Supplier</h1>
          <p className="text-muted-foreground">Add a new vendor to your procurement list.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name <span className="text-destructive">*</span></Label>
              <Input id="name" name="name" required placeholder="Acme Corp" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input id="contact_email" name="contact_email" type="email" placeholder="contact@acme.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input id="contact_phone" name="contact_phone" type="tel" placeholder="+1 (555) 000-0000" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead_time_days">Default Lead Time (Days)</Label>
              <Input id="lead_time_days" name="lead_time_days" type="number" defaultValue="7" min="0" />
              <p className="text-xs text-muted-foreground">Average number of days it takes for them to deliver an order.</p>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/manager/inventory/suppliers">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Supplier"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
