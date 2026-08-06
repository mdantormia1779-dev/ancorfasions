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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Truck,
  Activity,
  Settings,
  Link as LinkIcon,
  RefreshCcw,
} from "lucide-react";
import { CourierProviderRecord } from "@/types/shipping.types";
import { updateCourierProviderAction } from "@/actions/logistics.actions";
import { toast } from "sonner";
import { CourierConfigModal } from "./CourierConfigModal";

interface Props {
  initialCouriers: CourierProviderRecord[];
}

export function CourierListClient({ initialCouriers }: Props) {
  const [couriers, setCouriers] = useState(initialCouriers);
  const [selectedCourier, setSelectedCourier] = useState<CourierProviderRecord | null>(null);

  const handleToggle = async (id: string, checked: boolean) => {
    try {
      setCouriers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: checked } : c))
      );
      const res = await updateCourierProviderAction(id, { is_active: checked });
      if (!res.success) throw new Error(res.error);
      toast.success(checked ? "Courier activated" : "Courier deactivated");
    } catch (err: any) {
      toast.error(err.message);
      // Revert
      setCouriers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !checked } : c))
      );
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Courier Integrations
            </h1>
            <p className="text-muted-foreground">
              Manage logistics partners, API health, and COD settlements.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCcw className="mr-2 h-4 w-4" /> Sync Status
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {couriers.length === 0 && (
            <div className="col-span-2 text-center text-muted-foreground py-12">
              No couriers configured in database.
            </div>
          )}
          {couriers.map((courier) => (
            <Card
              key={courier.id}
              className={!courier.is_active ? "opacity-70" : ""}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center space-x-4">
                  {courier.logo_url ? (
                    <img
                      src={courier.logo_url}
                      alt={courier.name}
                      className="h-12 w-12 object-contain rounded-md"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                      {courier.display_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-xl">
                      {courier.display_name}
                      {courier.is_sandbox && (
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                          SANDBOX
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center">
                      {courier.is_active ? (
                        <span className="flex items-center text-emerald-600">
                          <Activity className="mr-1 h-3 w-3" /> API Health: 100%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Integration Offline
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`status-${courier.id}`} className="sr-only">
                    Toggle {courier.name}
                  </Label>
                  <Switch
                    id={`status-${courier.id}`}
                    checked={courier.is_active}
                    onCheckedChange={(checked) =>
                      handleToggle(courier.id, checked)
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="my-4 grid grid-cols-2 gap-4">
                  <div className="flex flex-col rounded-md bg-muted/50 p-3">
                    <span className="mb-1 text-xs text-muted-foreground">
                      Active Shipments
                    </span>
                    <span className="flex items-center text-xl font-semibold">
                      <Truck className="mr-2 h-4 w-4 text-blue-500" />
                      --
                    </span>
                  </div>
                  <div className="flex flex-col rounded-md bg-muted/50 p-3">
                    <span className="mb-1 text-xs text-muted-foreground">
                      Pending COD
                    </span>
                    <span className="flex items-center text-xl font-semibold">
                      <span className="mr-1 font-bold text-amber-500">৳</span>
                      --
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium">Supported Features:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {courier.is_cod_supported && (
                      <Badge variant="secondary" className="font-normal">
                        COD
                      </Badge>
                    )}
                    <Badge variant="secondary" className="font-normal">
                      API Sync
                    </Badge>
                    <Badge variant="secondary" className="font-normal">
                      Live Tracking
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="ghost" size="sm">
                  View API Logs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCourier(courier)}
                >
                  <Settings className="mr-2 h-4 w-4" /> Configure Settings
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <CourierConfigModal
        courier={selectedCourier}
        onClose={() => setSelectedCourier(null)}
        onSaved={(updated) => {
          setCouriers((prev) =>
            prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
          );
          setSelectedCourier(null);
        }}
      />
    </>
  );
}
