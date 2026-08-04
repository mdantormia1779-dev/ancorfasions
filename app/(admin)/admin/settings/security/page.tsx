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
  title: "Security Settings | Admin",
};

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security & Privacy</h1>
        <p className="mt-1 text-muted-foreground">
          Manage system security policies and access controls.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Policies</CardTitle>
          <CardDescription>
            Control how users authenticate and manage their sessions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication (2FA)</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA for all administrator accounts.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Strict Password Policy</Label>
              <p className="text-sm text-muted-foreground">
                Require minimum 12 characters, numbers, and symbols.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Session Timeout</Label>
              <p className="text-sm text-muted-foreground">
                Log users out after 30 minutes of inactivity.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Update Security Policies</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
