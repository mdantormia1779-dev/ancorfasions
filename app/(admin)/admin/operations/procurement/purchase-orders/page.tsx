import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Filter,
  FileText,
  CheckCircle2,
  Clock,
  Truck,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const metadata: Metadata = {
  title: "Purchase Orders | Anchor Fashion Enterprise",
  description: "Manage Procurement and Purchase Orders",
};

// Mock data for development
const mockPurchaseOrders = [
  {
    id: "1",
    poNumber: "PO-2026-07-001",
    supplier: "Zhejiang Textiles Co.",
    destination: "Central Hub - Dhaka",
    items: 1200,
    totalValue: 45000,
    status: "DRAFT",
    expectedDate: null,
  },
  {
    id: "2",
    poNumber: "PO-2026-07-002",
    supplier: "Dhaka Leather Mills",
    destination: "Central Hub - Dhaka",
    items: 500,
    totalValue: 12500,
    status: "SENT",
    expectedDate: "2026-08-01",
  },
  {
    id: "3",
    poNumber: "PO-2026-06-045",
    supplier: "Guangzhou Garments Ltd",
    destination: "Regional Hub - Chattogram",
    items: 3000,
    totalValue: 120000,
    status: "PARTIAL_RECEIPT",
    expectedDate: "2026-07-20",
  },
  {
    id: "4",
    poNumber: "PO-2026-06-042",
    supplier: "Narayanganj Knitwear",
    destination: "Central Hub - Dhaka",
    items: 800,
    totalValue: 16000,
    status: "FULFILLED",
    expectedDate: "2026-07-15",
  },
  {
    id: "5",
    poNumber: "PO-2026-07-005",
    supplier: "Surat Fabrics Group",
    destination: "Fulfillment Center - Sylhet",
    items: 450,
    totalValue: 9800,
    status: "PENDING_APPROVAL",
    expectedDate: null,
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "DRAFT":
      return (
        <Badge variant="outline">
          <FileText className="mr-1 h-3 w-3" /> Draft
        </Badge>
      );
    case "PENDING_APPROVAL":
      return (
        <Badge variant="secondary">
          <Clock className="mr-1 h-3 w-3" /> Pending Approval
        </Badge>
      );
    case "SENT":
      return (
        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
          <Truck className="mr-1 h-3 w-3" /> Sent to Supplier
        </Badge>
      );
    case "PARTIAL_RECEIPT":
      return (
        <Badge variant="default" className="bg-amber-600 hover:bg-amber-700">
          <Truck className="mr-1 h-3 w-3" /> Partial Receipt
        </Badge>
      );
    case "FULFILLED":
      return (
        <Badge
          variant="default"
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckCircle2 className="mr-1 h-3 w-3" /> Fulfilled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function PurchaseOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage supplier orders and procurement workflows.
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create PO
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <CardTitle>All Purchase Orders</CardTitle>
              <CardDescription>
                Track the status of all active and historical procurement
                requests.
              </CardDescription>
            </div>
            <div className="flex w-full gap-2 md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search PO number or supplier..."
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total Value ($)</TableHead>
                <TableHead>Expected Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPurchaseOrders.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.poNumber}</TableCell>
                  <TableCell>{po.supplier}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {po.destination}
                  </TableCell>
                  <TableCell className="text-right">
                    {po.items.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${po.totalValue.toLocaleString()}
                  </TableCell>
                  <TableCell>{po.expectedDate || "TBD"}</TableCell>
                  <TableCell>{getStatusBadge(po.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Download PDF</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {po.status === "SENT" ||
                        po.status === "PARTIAL_RECEIPT" ? (
                          <DropdownMenuItem className="font-medium text-blue-600">
                            Receive Goods (GRN)
                          </DropdownMenuItem>
                        ) : null}
                        {po.status === "PENDING_APPROVAL" ? (
                          <DropdownMenuItem className="font-medium text-emerald-600">
                            Approve PO
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
