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
  createAttributeAction,
  updateAttributeAction,
  deleteAttributeAction,
  addAttributeValueAction,
  removeAttributeValueAction,
} from "@/lib/actions/admin/catalog.actions";
import { Attribute } from "@/types/catalog.types";
import {
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";

interface AttributesClientPageProps {
  initialAttributes: Attribute[];
}

type AttributeType = "TEXT" | "COLOR" | "SIZE" | "NUMBER" | "BOOLEAN";

const ATTRIBUTE_TYPE_LABELS: Record<AttributeType, string> = {
  TEXT: "Text",
  COLOR: "Color",
  SIZE: "Size",
  NUMBER: "Number",
  BOOLEAN: "Boolean",
};

export function AttributesClientPage({
  initialAttributes,
}: AttributesClientPageProps) {
  const [attributes, setAttributes] = useState(initialAttributes);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Attribute | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Attribute | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [newValueInputs, setNewValueInputs] = useState<Record<string, string>>(
    {}
  );
  const [addingValueFor, setAddingValueFor] = useState<string | null>(null);

  const [form, setForm] = useState<{ name: string; type: AttributeType }>({
    name: "",
    type: "TEXT",
  });

  const filtered = useMemo(
    () =>
      attributes.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase())
      ),
    [attributes, search]
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAdd = () => {
    setEditTarget(null);
    setForm({ name: "", type: "TEXT" });
    setSheetOpen(true);
  };

  const openEdit = (attribute: Attribute) => {
    setEditTarget(attribute);
    setForm({ name: attribute.name, type: attribute.type as AttributeType });
    setSheetOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Attribute name is required.");
      return;
    }
    setIsSaving(true);

    if (editTarget) {
      const res = await updateAttributeAction({
        id: editTarget.id,
        data: { name: form.name, type: form.type },
      });
      if (res.success && res.data) {
        toast.success("Attribute updated");
        setAttributes((prev) =>
          prev.map((a) =>
            a.id === editTarget.id ? (res.data as Attribute) : a
          )
        );
        setSheetOpen(false);
      } else {
        toast.error(res.error || "Failed to update attribute");
      }
    } else {
      const res = await createAttributeAction({
        name: form.name,
        type: form.type,
      });
      if (res.success && res.data) {
        toast.success("Attribute created");
        setAttributes((prev) => [res.data as Attribute, ...prev]);
        setSheetOpen(false);
      } else {
        toast.error(res.error || "Failed to create attribute");
      }
    }
    setIsSaving(false);
  };

  const confirmDelete = (attribute: Attribute) => {
    setDeleteTarget(attribute);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await deleteAttributeAction({ id: deleteTarget.id });
    if (res.success) {
      toast.success("Attribute deleted");
      setAttributes((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    } else {
      toast.error(res.error || "Failed to delete attribute");
    }
    setIsDeleting(false);
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  const handleAddValue = async (attributeId: string) => {
    const value = (newValueInputs[attributeId] || "").trim();
    if (!value) {
      toast.error("Value cannot be empty.");
      return;
    }
    setAddingValueFor(attributeId);
    const res = await addAttributeValueAction({ attributeId, value });
    if (res.success) {
      toast.success("Value added");
      // Refresh the attribute's values list optimistically
      setAttributes((prev) =>
        prev.map((a) => {
          if (a.id !== attributeId) return a;
          const existingValues = (a as any).values ?? [];
          return {
            ...a,
            values: [
              ...existingValues,
              { id: crypto.randomUUID(), attribute_id: attributeId, value },
            ],
          };
        })
      );
      setNewValueInputs((prev) => ({ ...prev, [attributeId]: "" }));
    } else {
      toast.error(res.error || "Failed to add value");
    }
    setAddingValueFor(null);
  };

  const handleRemoveValue = async (attributeId: string, valueId: string) => {
    const res = await removeAttributeValueAction({ valueId });
    if (res.success) {
      toast.success("Value removed");
      setAttributes((prev) =>
        prev.map((a) => {
          if (a.id !== attributeId) return a;
          return {
            ...a,
            values: ((a as any).values ?? []).filter(
              (v: any) => v.id !== valueId
            ),
          };
        })
      );
    } else {
      toast.error(res.error || "Failed to remove value");
    }
  };

  return (
    <>
      <CatalogPageShell
        title="Attributes"
        description="Manage product variations like size, color, and material."
        addLabel="Add Attribute"
        onAdd={openAdd}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search attributes..."
      >
        <div className="rounded-md border bg-card text-card-foreground">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Attribute Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Values</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {search
                      ? `No attributes matching "${search}".`
                      : "No attributes found."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.flatMap((attribute) => {
                  const values: any[] = (attribute as any).values ?? [];
                  const isExpanded = expandedIds.has(attribute.id);

                  return [
                    // Main attribute row
                    <TableRow key={attribute.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleExpand(attribute.id)}
                          disabled={values.length === 0}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {attribute.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {ATTRIBUTE_TYPE_LABELS[
                            attribute.type as AttributeType
                          ] ?? attribute.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {values.length} value{values.length !== 1 ? "s" : ""}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(attribute)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => confirmDelete(attribute)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>,

                    // Expandable values row
                    ...(isExpanded
                      ? [
                          <TableRow
                            key={`${attribute.id}-values`}
                            className="bg-muted/30"
                          >
                            <TableCell />
                            <TableCell colSpan={4} className="py-3">
                              <div className="flex flex-wrap items-center gap-2">
                                {values.map((v: any) => (
                                  <span
                                    key={v.id}
                                    className="flex items-center gap-1 rounded-full border bg-background px-2.5 py-0.5 text-sm"
                                  >
                                    {v.value}
                                    <button
                                      onClick={() =>
                                        handleRemoveValue(attribute.id, v.id)
                                      }
                                      className="ml-0.5 text-muted-foreground hover:text-red-500"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </span>
                                ))}
                                {/* Inline add value */}
                                <div className="flex items-center gap-1">
                                  <Input
                                    className="h-7 w-32 text-sm"
                                    placeholder="Add value…"
                                    value={newValueInputs[attribute.id] ?? ""}
                                    onChange={(e) =>
                                      setNewValueInputs((prev) => ({
                                        ...prev,
                                        [attribute.id]: e.target.value,
                                      }))
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddValue(attribute.id);
                                      }
                                    }}
                                  />
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7"
                                    disabled={addingValueFor === attribute.id}
                                    onClick={() =>
                                      handleAddValue(attribute.id)
                                    }
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>,
                        ]
                      : []),
                  ];
                })
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
              {editTarget ? "Edit Attribute" : "Add Attribute"}
            </SheetTitle>
            <SheetDescription>
              {editTarget
                ? "Update this attribute's name or type."
                : "Create a new product attribute (e.g. Size, Color)."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4 py-6">
            <div className="space-y-1.5">
              <Label htmlFor="attr-name">Name</Label>
              <Input
                id="attr-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Size"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="attr-type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, type: v as AttributeType }))
                }
              >
                <SelectTrigger id="attr-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ATTRIBUTE_TYPE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  : "Create Attribute"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently delete the attribute and all its values. Products using this attribute will be affected."
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
