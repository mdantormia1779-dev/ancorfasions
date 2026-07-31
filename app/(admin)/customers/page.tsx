import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export const metadata = {
  title: "Customer Management | Admin",
};

export default function AdminCustomersPage() {
  const customers = [
    {
      id: "usr-1",
      name: "John Doe",
      email: "john@example.com",
      tier: "VIP",
      status: "Active",
      totalSpent: 45000,
    },
    {
      id: "usr-2",
      name: "Jane Smith",
      email: "jane@example.com",
      tier: "GOLD",
      status: "Active",
      totalSpent: 12000,
    },
    {
      id: "usr-3",
      name: "Bob Wilson",
      email: "bob@example.com",
      tier: "SILVER",
      status: "Suspended",
      totalSpent: 1500,
    },
  ];

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your enterprise customers, view their loyalty tiers and
            wallets.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Customers</CardTitle>
          <div className="flex space-x-2">
            <Input placeholder="Search customers..." className="w-64" />
            <Button variant="secondary">Filter</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Loyalty Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Spent (BDT)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/customers/${c.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.tier}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        c.status === "Active" ? "default" : "destructive"
                      }
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.totalSpent.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Link href={`/customers/${c.id}`}>View Details</Link>
                    </Button>
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
