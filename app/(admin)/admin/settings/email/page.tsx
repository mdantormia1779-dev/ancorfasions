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
  title: "Email Settings | Admin",
};

export default function EmailSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email & SMTP</h1>
        <p className="mt-1 text-muted-foreground">
          Configure how the system sends transactional emails.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
          <CardDescription>
            Settings for your outgoing mail server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sender-name">Sender Name</Label>
            <Input id="sender-name" defaultValue="Anchor Fashion Support" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sender-email">Sender Email</Label>
            <Input id="sender-email" defaultValue="noreply@anchorfashion.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-host">SMTP Host</Label>
            <Input id="smtp-host" defaultValue="smtp.mailgun.org" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-port">SMTP Port</Label>
            <Input id="smtp-port" defaultValue="587" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Test Connection</Button>
          <Button>Save Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
