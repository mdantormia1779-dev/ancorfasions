"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Search,
  Users,
  Trash2,
  Edit2,
  Loader2,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/features/admin/components/shared/ConfirmDialog";
import { CustomerGroupActions } from "@/features/crm/components/CustomerGroupActions";
import {
  deleteGroupAction,
  getGroupMembersAction,
  updateGroupAction,
} from "@/app/actions/crm/groups.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CustomerGroupsClientProps {
  segments: any[];
}

export function CustomerGroupsClient({ segments }: CustomerGroupsClientProps) {
  const [search, setSearch] = useState("");
  const [deletingGroup, setDeletingGroup] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();

  // View / Edit Modal State
  const [viewingGroup, setViewingGroup] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsDynamic, setEditIsDynamic] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (!search) return segments;
    const q = search.toLowerCase();
    return segments.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }, [search, segments]);

  const handleOpenView = async (group: any) => {
    setViewingGroup(group);
    setIsEditing(false);
    setEditName(group.name || "");
    setEditDescription(group.description || "");
    setEditIsDynamic(!!group.is_dynamic);
    setLoadingMembers(true);

    try {
      const res = await getGroupMembersAction(group.id);
      if (res.success && res.data) {
        setMembers(res.data.members || []);
      } else {
        setMembers([]);
      }
    } catch {
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      toast.error("Group name is required");
      return;
    }

    startTransition(async () => {
      const res = await updateGroupAction(viewingGroup.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        isDynamic: editIsDynamic,
      });

      if (res.success) {
        toast.success("Customer group updated successfully");
        setViewingGroup((prev: any) => ({
          ...prev,
          name: editName.trim(),
          description: editDescription.trim(),
          is_dynamic: editIsDynamic,
        }));
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update group");
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingGroup) return;
    setDeleteLoading(true);
    const res = await deleteGroupAction(deletingGroup.id);
    setDeleteLoading(false);
    if (res.success) {
      toast.success(`Group "${deletingGroup.name}" deleted`);
      setDeletingGroup(null);
      if (viewingGroup?.id === deletingGroup.id) {
        setViewingGroup(null);
      }
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete group");
      setDeletingGroup(null);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customer Groups</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage customer segments, targeted groups, and loyalty audiences.
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
                    <Users className="h-6 w-6 text-muted-foreground/40 mb-1" />
                    <p className="font-medium text-foreground">
                      {search ? "No groups match your search." : "No customer groups found."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((segment) => (
                <TableRow key={segment.id}>
                  <TableCell className="font-medium text-foreground">
                    {segment.name}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {segment.description || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={segment.is_dynamic ? "default" : "secondary"} className="text-xs">
                      {segment.is_dynamic ? "Dynamic Segment" : "Static Group"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenView(segment)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

      {/* View & Edit Group Modal */}
      <Dialog
        open={!!viewingGroup}
        onOpenChange={(open) => {
          if (!open) {
            setViewingGroup(null);
            setIsEditing(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5 text-primary" />
                {isEditing ? "Edit Group Details" : viewingGroup?.name}
              </DialogTitle>
              {!isEditing && (
                <Badge variant={viewingGroup?.is_dynamic ? "default" : "secondary"}>
                  {viewingGroup?.is_dynamic ? "Dynamic" : "Static"}
                </Badge>
              )}
            </div>
            {!isEditing && viewingGroup?.description && (
              <DialogDescription className="text-sm pt-1">
                {viewingGroup.description}
              </DialogDescription>
            )}
          </DialogHeader>

          {isEditing ? (
            /* Edit Form */
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g., VIP Wholesale Buyers"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="group-desc">Description</Label>
                <Textarea
                  id="group-desc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Describe targeting or criteria for this customer group..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="group-dynamic" className="cursor-pointer font-medium">
                    Dynamic Membership
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically includes customers who match lifecycle or order criteria
                  </p>
                </div>
                <Switch
                  id="group-dynamic"
                  checked={editIsDynamic}
                  onCheckedChange={setEditIsDynamic}
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleSaveEdit} disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          ) : (
            /* View Details & Member List */
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Members ({members.length})
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {viewingGroup?.is_dynamic ? "Auto-synced" : "Manual assignment"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="mr-1.5 h-3.5 w-3.5" /> Edit Group
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setDeletingGroup(viewingGroup);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {loadingMembers ? (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs">Loading customer members...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="font-medium text-foreground">No customer members found</p>
                  <p className="text-xs mt-1">
                    Customers matching this segment will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member: any) => {
                        const name =
                          [member.first_name, member.last_name].filter(Boolean).join(" ") ||
                          "Customer";
                        return (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium text-xs sm:text-sm">
                              {name}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {member.email || "—"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {member.phone || "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Link href={`/admin/customers/${member.id}`}>
                                <Button variant="ghost" size="sm" className="h-7 px-2">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingGroup}
        title={`Delete "${deletingGroup?.name}"?`}
        description="This will permanently delete this customer group. Customer accounts in this group will not be deleted."
        confirmLabel="Delete Group"
        variant="destructive"
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingGroup(null)}
      />
    </div>
  );
}
