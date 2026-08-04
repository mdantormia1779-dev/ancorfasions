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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Store Settings | Admin",
};

export default function StoreSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Configure your store's basic information and localization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
          <CardDescription>
            The official name and currency of your store.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store-name">Store Name</Label>
            <Input id="store-name" defaultValue="Anchor Fashion" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" defaultValue="BDT (৳)" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" defaultValue="Asia/Dhaka (GMT+6)" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight-unit">Default Weight Unit</Label>
            <Input id="weight-unit" defaultValue="kg" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
