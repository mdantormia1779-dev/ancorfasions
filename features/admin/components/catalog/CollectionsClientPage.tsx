"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { ConfirmDialog } from "@/features/admin/components/shared/ConfirmDialog";
import { CatalogPageShell } from "@/features/admin/components/shared/CatalogPageShell";
import {
  createCollectionAction,
  updateCollectionAction,
  deleteCollectionAction,
} from "@/lib/actions/admin/catalog.actions";
import { Collection } from "@/types/catalog.types";
import { Pencil, Trash2 } from "lucide-react";

interface CollectionsClientPageProps {
  initialCollections: Collection[];
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function CollectionsClientPage({
  initialCollections,
}: CollectionsClientPageProps) {
  const [collections, setCollections] = useState(initialCollections);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Collection | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    banner_url: "",
    is_active: true,
  });

  const filtered = useMemo(
    () =>
      collections.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.slug.toLowerCase().includes(search.toLowerCase())
      ),
    [collections, search]
  );

  const openAdd = () => {
    setEditTarget(null);
    setForm({ name: "", slug: "", banner_url: "", is_active: true });
    setSheetOpen(true);
  };

  const openEdit = (collection: Collection) => {
    setEditTarget(collection);
    setForm({
      name: collection.name,
      slug: collection.slug,
      banner_url: (collection as any).banner_url ?? "",
      is_active: collection.is_active,
    });
    setSheetOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: editTarget ? f.slug : slugify(name),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and slug are required.");
      return;
    }
    setIsSaving(true);

    const payload = {
      name: form.name,
      slug: form.slug,
      banner_url: form.banner_url || null,
      is_active: form.is_active,
    };

    if (editTarget) {
      const res = await updateCollectionAction({
        id: editTarget.id,
        data: payload,
      });
      if (res.success && res.data) {
        toast.success("Collection updated");
        setCollections((prev) =>
          prev.map((c) =>
            c.id === editTarget.id ? (res.data as Collection) : c
          )
        );
        setSheetOpen(false);
      } else {
        toast.error(res.error || "Failed to update collection");
      }
    } else {
      const res = await createCollectionAction(payload as any);
      if (res.success && res.data) {
        toast.success("Collection created");
        setCollections((prev) => [res.data as Collection, ...prev]);
        setSheetOpen(false);
      } else {
        toast.error(res.error || "Failed to create collection");
      }
    }
    setIsSaving(false);
  };

  const confirmDelete = (collection: Collection) => {
    setDeleteTarget(collection);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await deleteCollectionAction({ id: deleteTarget.id });
    if (res.success) {
      toast.success("Collection deactivated");
      setCollections((prev) =>
        prev.filter((c) => c.id !== deleteTarget.id)
      );
    } else {
      toast.error(res.error || "Failed to delete collection");
    }
    setIsDeleting(false);
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  return (
    <>
      <CatalogPageShell
        title="Collections"
        description="Manage product collections and curated groupings."
        addLabel="Add Collection"
        onAdd={openAdd}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search collections..."
      >
        <div className="rounded-md border bg-card text-card-foreground">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collection Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {search
                      ? `No collections matching "${search}".`
                      : "No collections found."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell className="font-medium">
                      {collection.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {collection.slug}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          collection.is_active ? "default" : "secondary"
                        }
                      >
                        {collection.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(collection)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => confirmDelete(collection)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CatalogPageShell>

      {/* Create / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editTarget ? "Edit Collection" : "Add Collection"}
            </SheetTitle>
            <SheetDescription>
              {editTarget
                ? "Update the details of this collection."
                : "Create a new product collection."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4 py-6">
            <div className="space-y-1.5">
              <Label htmlFor="col-name">Name</Label>
              <Input
                id="col-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Summer 2026"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="col-slug">Slug</Label>
              <Input
                id="col-slug"
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                placeholder="e.g. summer-2026"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="col-banner">Banner URL (optional)</Label>
              <Input
                id="col-banner"
                value={form.banner_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, banner_url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive collections are hidden from the storefront.
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, is_active: v }))
                }
              />
            </div>
          </div>
          <SheetFooter className="px-4">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? "Saving…"
                : editTarget
                  ? "Save Changes"
                  : "Create Collection"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will deactivate the collection. It will be hidden from the storefront."
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
    </>
  );
}
