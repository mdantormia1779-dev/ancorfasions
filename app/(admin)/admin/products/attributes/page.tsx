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
import { AttributeRepository } from "@/lib/repositories/catalog/attribute.repository";

export const metadata = {
  title: "Attributes | Catalog | Anchor Fashion Enterprise",
};

export default async function AdminAttributesPage() {
  const attributes = await AttributeRepository.getAttributes();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attributes</h2>
          <p className="text-muted-foreground mt-1">
            Manage product variations like size, color, and material.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Attribute
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search attributes..."
            className="w-full bg-card pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card text-card-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attribute Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p>No attributes found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              attributes.map((attribute: any) => (
                <TableRow key={attribute.id}>
                  <TableCell className="font-medium">{attribute.name}</TableCell>
                  <TableCell>{attribute.type}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
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
