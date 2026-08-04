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
  title: "Analytics Settings | Admin",
};

export default function AnalyticsSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Tracking</h1>
        <p className="mt-1 text-muted-foreground">
          Integrate third-party tracking and analytics tools.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tracking IDs</CardTitle>
          <CardDescription>
            Enter your container and pixel IDs to track user behavior.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ga-id">Google Analytics 4 Measurement ID</Label>
            <Input id="ga-id" placeholder="G-XXXXXXXXXX" defaultValue="G-1234567890" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gtm-id">Google Tag Manager Container ID</Label>
            <Input id="gtm-id" placeholder="GTM-XXXXXXX" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fb-pixel">Facebook Pixel ID</Label>
            <Input id="fb-pixel" placeholder="123456789012345" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Integrations</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
