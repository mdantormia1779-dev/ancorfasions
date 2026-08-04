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
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "SEO Settings | Admin",
};

export default function SeoSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search Engine Optimization</h1>
        <p className="mt-1 text-muted-foreground">
          Manage how your store appears on Google and social media.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Default Meta Data</CardTitle>
          <CardDescription>
            These settings will be used if a page doesn't have specific SEO data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta-title">Default Meta Title</Label>
            <Input id="meta-title" defaultValue="Anchor Fashion | Premium Clothing Brand" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta-description">Default Meta Description</Label>
            <Textarea
              id="meta-description"
              defaultValue="Discover the latest trends in fashion at Anchor Fashion. Shop premium clothing and accessories."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="social-image">Default Social Share Image URL</Label>
            <Input id="social-image" defaultValue="https://anchorfashion.com/og-image.jpg" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save SEO Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
