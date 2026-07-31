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

export const metadata: Metadata = {
  title: "Courier Integration | Anchor Fashion Enterprise",
  description: "Manage 3PL Logistics Providers and Delivery APIs",
};

// Mock data for development
const mockCouriers = [
  {
    id: "1",
    name: "Steadfast Courier",
    logo: "S",
    status: "ACTIVE",
    apiHealth: 99.8,
    activeShipments: 1245,
    codPending: 450000,
    features: ["API Sync", "Live Tracking", "Next Day Delivery"],
  },
  {
    id: "2",
    name: "Pathao",
    logo: "P",
    status: "ACTIVE",
    apiHealth: 99.9,
    activeShipments: 842,
    codPending: 280000,
    features: [
      "API Sync",
      "Live Tracking",
      "Same Day Delivery",
      "Reverse Logistics",
    ],
  },
  {
    id: "3",
    name: "RedX",
    logo: "R",
    status: "ACTIVE",
    apiHealth: 98.5,
    activeShipments: 410,
    codPending: 120000,
    features: ["API Sync", "Bulk Booking"],
  },
  {
    id: "4",
    name: "Paperfly",
    logo: "PF",
    status: "INACTIVE",
    apiHealth: 0,
    activeShipments: 0,
    codPending: 0,
    features: ["Doorstep Delivery", "Smart Return"],
  },
];

export default function CouriersPage() {
  return (
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
          <Button>
            <LinkIcon className="mr-2 h-4 w-4" /> Add Provider
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {mockCouriers.map((courier) => (
          <Card
            key={courier.id}
            className={courier.status === "INACTIVE" ? "opacity-70" : ""}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {courier.logo}
                </div>
                <div>
                  <CardTitle className="text-xl">{courier.name}</CardTitle>
                  <CardDescription className="mt-1 flex items-center">
                    {courier.status === "ACTIVE" ? (
                      <span className="flex items-center text-emerald-600">
                        <Activity className="mr-1 h-3 w-3" /> API Health:{" "}
                        {courier.apiHealth}%
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
                  checked={courier.status === "ACTIVE"}
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
                    {courier.activeShipments.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col rounded-md bg-muted/50 p-3">
                  <span className="mb-1 text-xs text-muted-foreground">
                    Pending COD
                  </span>
                  <span className="flex items-center text-xl font-semibold">
                    <span className="mr-1 font-bold text-amber-500">৳</span>
                    {courier.codPending.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium">Supported Features:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {courier.features.map((feature) => (
                    <Badge
                      key={feature}
                      variant="secondary"
                      className="font-normal"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="ghost" size="sm">
                View API Logs
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" /> Configure Settings
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
