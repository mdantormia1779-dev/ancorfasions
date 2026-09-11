"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/features/admin/components/shared/ConfirmDialog";
import { CustomerGroupActions } from "@/features/crm/components/CustomerGroupActions";
import { deleteGroupAction } from "@/app/actions/crm/groups.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface CustomerGroupsClientProps {
  segments: any[];
}

export function CustomerGroupsClient({ segments }: CustomerGroupsClientProps) {
  const [search, setSearch] = useState("");
  const [deletingGroup, setDeletingGroup] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    if (!search) return segments;
    const q = search.toLowerCase();
    return segments.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }, [search, segments]);

  const handleDelete = async () => {
    if (!deletingGroup) return;
    setDeleteLoading(true);
    const res = await deleteGroupAction(deletingGroup.id);
    setDeleteLoading(false);
    if (res.success) {
      toast.success(`Group "${deletingGroup.name}" deleted`);
      setDeletingGroup(null);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete group");
      setDeletingGroup(null);
    }
  };

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p>
                      {search
                        ? "No groups match your search."
                        : "No customer groups found."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((segment) => (
                <TableRow key={segment.id}>
                  <TableCell className="font-medium">{segment.name}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {segment.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant={segment.is_dynamic ? "default" : "secondary"}>
                      {segment.is_dynamic ? "Dynamic" : "Static"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeletingGroup(segment)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deletingGroup}
        title={`Delete "${deletingGroup?.name}"?`}
        description="This will permanently delete this customer group. Customers in this group will not be deleted."
        confirmLabel="Delete Group"
        variant="destructive"
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingGroup(null)}
      />
    </div>
  );
}
