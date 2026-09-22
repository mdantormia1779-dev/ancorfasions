"use client";

import { useEffect, useState } from "react";
import { CourierProviderRecord } from "@/types/shipping.types";
import { updateCourierProviderAction } from "@/actions/logistics.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Props {
  courier: CourierProviderRecord | null;
  onClose: () => void;
  onSaved: (updated: CourierProviderRecord) => void;
}

export function CourierConfigModal({ courier, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isSandbox, setIsSandbox] = useState(false);

  useEffect(() => {
    if (courier) {
      setCredentials(courier.credentials || {});
      setIsSandbox(courier.is_sandbox);
    }
  }, [courier]);

  if (!courier) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await updateCourierProviderAction(courier.id, {
        credentials,
        is_sandbox: isSandbox,
      });

      if (!res.success) throw new Error(res.error);

      toast.success(`${courier.display_name} configuration saved.`);
      onSaved({ ...courier, credentials, is_sandbox: isSandbox });
    } catch (err: any) {
      toast.error(err.message || "Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }));
  };

  const renderFields = () => {
    // Render dynamic fields based on courier code
    switch (courier.code) {
      case "steadfast":
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                value={credentials.apiKey || ""}
                onChange={(e) => handleChange("apiKey", e.target.value)}
                placeholder="Enter Steadfast API Key"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                value={credentials.secretKey || ""}
                onChange={(e) => handleChange("secretKey", e.target.value)}
                placeholder="Enter Steadfast Secret Key"
              />
            </div>
          </>
        );
      case "pathao":
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                value={credentials.clientId || ""}
                onChange={(e) => handleChange("clientId", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                value={credentials.clientSecret || ""}
                onChange={(e) => handleChange("clientSecret", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Pathao Email</Label>
              <Input
                id="username"
                value={credentials.username || ""}
                onChange={(e) => handleChange("username", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Pathao Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password || ""}
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="storeId">Store ID</Label>
              <Input
                id="storeId"
                value={credentials.storeId || ""}
                onChange={(e) => handleChange("storeId", e.target.value)}
              />
            </div>
          </>
        );
      case "redx":
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                value={credentials.accessToken || ""}
                onChange={(e) => handleChange("accessToken", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="storeId">Store ID (Optional)</Label>
              <Input
                id="storeId"
                value={credentials.storeId || ""}
                onChange={(e) => handleChange("storeId", e.target.value)}
              />
            </div>
          </>
        );
      default:
        return (
          <div className="text-sm text-muted-foreground">
            No specific credential fields configured for this provider in the UI yet.
            Please use JSON configuration in the database directly.
          </div>
        );
    }
  };

  return (
    <Dialog open={!!courier} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure {courier.display_name}</DialogTitle>
          <DialogDescription>
            Update API credentials and settings for this provider.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="sandbox-mode"
              checked={isSandbox}
              onCheckedChange={setIsSandbox}
            />
            <Label htmlFor="sandbox-mode">Enable Sandbox (Test Mode)</Label>
          </div>
          {renderFields()}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
