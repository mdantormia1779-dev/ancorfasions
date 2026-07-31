import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, PackageX } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const alerts = [
  {
    id: 1,
    product: "Classic Oxford Shirt",
    sku: "SHR-OX-01",
    stock: 5,
    threshold: 10,
    status: "low",
  },
  {
    id: 2,
    product: "Slim Fit Chinos",
    sku: "PNT-CH-03",
    stock: 0,
    threshold: 15,
    status: "out",
  },
  {
    id: 3,
    product: "Leather Loafers",
    sku: "SHO-LF-02",
    stock: 2,
    threshold: 8,
    status: "low",
  },
  {
    id: 4,
    product: "Merino Wool Sweater",
    sku: "SWT-MW-05",
    stock: 0,
    threshold: 12,
    status: "out",
  },
];

export function InventoryAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Alerts</CardTitle>
        <CardDescription>
          Products requiring immediate restocking.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {alerts.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between space-x-4"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`rounded-full p-2 ${item.status === "out" ? "bg-destructive/10 text-destructive" : "bg-orange-500/10 text-orange-500"}`}
              >
                {item.status === "out" ? (
                  <PackageX className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium leading-none">
                  {item.product}
                </p>
                <p className="text-sm text-muted-foreground">{item.sku}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge
                variant={item.status === "out" ? "destructive" : "secondary"}
                className={
                  item.status === "low"
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : ""
                }
              >
                {item.stock} in stock
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
