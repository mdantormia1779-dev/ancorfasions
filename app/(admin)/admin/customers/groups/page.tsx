import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CustomerSegmentRepository } from "@/lib/repositories/crm/customer-segment.repository";
import { CustomerGroupActions } from "@/features/crm/components/CustomerGroupActions";

export const metadata = {
  title: "Customer Groups | Customers | Anchor Fashion Enterprise",
};

export default async function AdminCustomerGroupsPage() {
  const segments = await CustomerSegmentRepository.getSegments();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customer Groups</h2>
          <p className="text-muted-foreground mt-1">
            Manage customer segments and groups.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CustomerGroupActions />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search groups..."
            className="w-full bg-card pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {segments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p>No customer groups found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              segments.map((segment: any) => (
                <TableRow key={segment.id}>
                  <TableCell className="font-medium">{segment.name}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{segment.description}</TableCell>
                  <TableCell>
                    <Badge variant={segment.is_dynamic ? "default" : "secondary"}>
                      {segment.is_dynamic ? "Dynamic" : "Static"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
