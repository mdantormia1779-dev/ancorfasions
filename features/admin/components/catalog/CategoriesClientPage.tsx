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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/features/admin/components/shared/ConfirmDialog";
import { CatalogPageShell } from "@/features/admin/components/shared/CatalogPageShell";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/lib/actions/admin/catalog.actions";
import { Category } from "@/types/catalog.types";
import { Pencil, Trash2 } from "lucide-react";

interface CategoriesClientPageProps {
  initialCategories: Category[];
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function CategoriesClientPage({
  initialCategories,
}: CategoriesClientPageProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [form, setForm] = useState<{
    name: string;
    slug: string;
    parent_id: string | null;
    is_active: boolean;
    display_order: number;
  }>({
    name: "",
    slug: "",
    parent_id: "",
    is_active: true,
    display_order: 0,
  });

  const filtered = useMemo(
    () =>
      categories.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.slug.toLowerCase().includes(search.toLowerCase())
      ),
    [categories, search]
  );

  const openAdd = () => {
    setEditTarget(null);
    setForm({ name: "", slug: "", parent_id: "", is_active: true, display_order: 0 });
    setSheetOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditTarget(category);
    setForm({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id ?? "",
      is_active: category.is_active,
      display_order: category.display_order,
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
    setIsSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug,
      parent_id: form.parent_id || null,
      is_active: form.is_active,
      display_order: form.display_order,
    };

    if (editTarget) {
      const res = await updateCategoryAction({ id: editTarget.id, data: payload });
      if (res.success && res.data) {
        toast.success("Category updated");
        setCategories((prev) =>
          prev.map((c) => (c.id === editTarget.id ? (res.data as Category) : c))
        );
        setSheetOpen(false);
      } else {
        toast.error(res.error || "Failed to update category");
      }
    } else {
      const res = await createCategoryAction(payload as any);
      if (res.success && res.data) {
        toast.success("Category created");
        setCategories((prev) => [res.data as Category, ...prev]);
        setSheetOpen(false);
      } else {
        toast.error(res.error || "Failed to create category");
      }
    }
    setIsSaving(false);
  };

  const confirmDelete = (category: Category) => {
    setDeleteTarget(category);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await deleteCategoryAction({ id: deleteTarget.id });
    if (res.success) {
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    } else {
      toast.error(res.error || "Failed to delete category");
    }
    setIsDeleting(false);
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  // Root-level categories for parent selector
  const rootCategories = categories.filter((c) => !c.parent_id);

  return (
    <>
      <CatalogPageShell
        title="Categories"
        description="Manage your product category hierarchy."
        addLabel="Add Category"
        onAdd={openAdd}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search categories..."
      >
        <div className="rounded-md border bg-card text-card-foreground">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {search ? `No categories matching "${search}".` : "No categories found."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {category.slug}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {category.parent?.name ?? (
                        <span className="italic text-muted-foreground/60">Root</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{category.display_order}</TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(category)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => confirmDelete(category)}
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
            <SheetTitle>{editTarget ? "Edit Category" : "Add Category"}</SheetTitle>
            <SheetDescription>
              {editTarget
                ? "Update the details of this category."
                : "Create a new category for your catalog."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4 py-6">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Men's Clothing"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="e.g. mens-clothing"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-parent">Parent Category</Label>
              <Select
                value={form.parent_id || "none"}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, parent_id: v === "none" ? "" : v }))
                }
              >
                <SelectTrigger id="cat-parent">
                  <SelectValue placeholder="None (Root)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Root)</SelectItem>
                  {rootCategories
                    .filter((c) => c.id !== editTarget?.id)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-order">Display Order</Label>
              <Input
                id="cat-order"
                type="number"
                value={form.display_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, display_order: Number(e.target.value) }))
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive categories are hidden from the store.
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
            </div>
          </div>
          <SheetFooter className="px-4">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : editTarget ? "Save Changes" : "Create Category"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently delete the category. Products in this category will become uncategorized."
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
