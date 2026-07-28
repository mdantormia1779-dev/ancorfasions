import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, Search, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Customers | Manager Dashboard",
};

const customers = [
  { id: "CUS-8021", name: "Liam Johnson", email: "liam.johnson@example.com", orders: 12, spent: "$3,250.00", status: "VIP" },
  { id: "CUS-8020", name: "Olivia Smith", email: "olivia.smith@example.com", orders: 3, spent: "$450.00", status: "Active" },
  { id: "CUS-8019", name: "Noah Williams", email: "noah.williams@example.com", orders: 1, spent: "$120.00", status: "New" },
  { id: "CUS-8018", name: "Emma Brown", email: "emma.brown@example.com", orders: 5, spent: "$1,100.00", status: "Active" },
  { id: "CUS-8017", name: "Ava Davis", email: "ava.davis@example.com", orders: 0, spent: "$0.00", status: "Inactive" },
];

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer base and view their order history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or email..."
            className="w-full bg-background pl-8"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-center">Orders</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                <TableCell className="text-center">{customer.orders}</TableCell>
                <TableCell className="text-right font-medium">{customer.spent}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      customer.status === "VIP" ? "default" :
                      customer.status === "Active" ? "secondary" :
                      customer.status === "New" ? "outline" : "destructive"
                    }
                    className={customer.status === "VIP" ? 'bg-indigo-500 hover:bg-indigo-600' : ''}
                  >
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View Profile
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
