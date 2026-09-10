"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit2,
  Trash2,
  MoveVertical,
  Link as LinkIcon,
  Network,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Layers,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { saveNavigation, deleteNavigation } from "@/actions/cms.actions";
import { CMSNavigation } from "@/types/cms.types";

interface MenuItem {
  label: string;
  url: string;
  target?: string;
  children?: any[];
}

interface MenusManagerProps {
  initialMenus: CMSNavigation[];
}

export default function MenusManager({ initialMenus }: MenusManagerProps) {
  const router = useRouter();
  const [menus, setMenus] = useState<CMSNavigation[]>(initialMenus);
  const [activeMenuId, setActiveMenuId] = useState<string>(
    initialMenus[0]?.id || ""
  );
  const [loading, setLoading] = useState(false);

  // Dialog States
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [newMenu, setNewMenu] = useState({ name: "", location: "" });

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItem, setNewItem] = useState<MenuItem>({ label: "", url: "", target: "_self" });

  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem>({ label: "", url: "", target: "_self" });

  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState(false);

  // Find active menu or fallback to first
  const activeMenu =
    menus.find((m) => m.id === activeMenuId) || menus[0] || null;

  // Safe helper to get menu items as Array
  const getMenuItems = (menu: CMSNavigation | null): MenuItem[] => {
    if (!menu || !menu.items) return [];
    return Array.isArray(menu.items) ? menu.items : [];
  };

  // 1. Create a New Menu
  const handleCreateMenu = async () => {
    if (!newMenu.name.trim() || !newMenu.location.trim()) {
      return toast.error("Please fill in both Menu Name and Location Identifier");
    }

    const cleanLocation = newMenu.location
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_");

    setLoading(true);
    try {
      const created = await saveNavigation(cleanLocation, newMenu.name.trim(), []);
      setMenus((prev) => {
        // If location already existed, update; otherwise append
        const exists = prev.some((m) => m.location === cleanLocation);
        if (exists) {
          return prev.map((m) => (m.location === cleanLocation ? created : m));
        }
        return [...prev, created];
      });
      setActiveMenuId(created.id);
      setIsCreateMenuOpen(false);
      setNewMenu({ name: "", location: "" });
      toast.success(`Menu "${created.name}" created successfully!`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create menu");
    } finally {
      setLoading(false);
    }
  };

  // 2. Add Item to Active Menu
  const handleAddItem = async () => {
    if (!newItem.label.trim() || !newItem.url.trim()) {
      return toast.error("Please fill in both Label and URL");
    }
    if (!activeMenu) {
      return toast.error("No active menu selected");
    }

    setLoading(true);
    try {
      const currentItems = getMenuItems(activeMenu);
      const updatedItems = [
        ...currentItems,
        {
          label: newItem.label.trim(),
          url: newItem.url.trim(),
          target: newItem.target || "_self",
        },
      ];

      const updated = await saveNavigation(
        activeMenu.location,
        activeMenu.name,
        updatedItems
      );

      // Keep menus and activeMenuId in sync
      setMenus((prev) =>
        prev.map((m) =>
          m.id === activeMenu.id || m.location === updated.location ? updated : m
        )
      );
      setActiveMenuId(updated.id);
      setIsAddItemOpen(false);
      setNewItem({ label: "", url: "", target: "_self" });
      toast.success(`Added "${newItem.label}" to ${activeMenu.name}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to add menu item");
    } finally {
      setLoading(false);
    }
  };

  // 3. Edit Item in Active Menu
  const handleOpenEditItem = (index: number) => {
    const items = getMenuItems(activeMenu);
    if (!items[index]) return;
    setEditingIndex(index);
    setEditingItem({ ...items[index] });
    setIsEditItemOpen(true);
  };

  const handleSaveEditItem = async () => {
    if (editingIndex === null || !activeMenu) return;
    if (!editingItem.label.trim() || !editingItem.url.trim()) {
      return toast.error("Please fill in both Label and URL");
    }

    setLoading(true);
    try {
      const currentItems = [...getMenuItems(activeMenu)];
      currentItems[editingIndex] = {
        ...currentItems[editingIndex],
        label: editingItem.label.trim(),
        url: editingItem.url.trim(),
        target: editingItem.target || "_self",
      };

      const updated = await saveNavigation(
        activeMenu.location,
        activeMenu.name,
        currentItems
      );

      setMenus((prev) =>
        prev.map((m) =>
          m.id === activeMenu.id || m.location === updated.location ? updated : m
        )
      );
      setActiveMenuId(updated.id);
      setIsEditItemOpen(false);
      setEditingIndex(null);
      toast.success("Menu item updated successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  // 4. Delete Item from Active Menu
  const handleDeleteItem = async (index: number) => {
    if (!activeMenu) return;
    const items = getMenuItems(activeMenu);
    if (!items[index]) return;

    setLoading(true);
    try {
      const updatedItems = items.filter((_, i) => i !== index);
      const updated = await saveNavigation(
        activeMenu.location,
        activeMenu.name,
        updatedItems
      );

      setMenus((prev) =>
        prev.map((m) =>
          m.id === activeMenu.id || m.location === updated.location ? updated : m
        )
      );
      setActiveMenuId(updated.id);
      toast.success("Item removed from menu");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  // 5. Reorder Item (Move Up / Down)
  const handleMoveItem = async (index: number, direction: "up" | "down") => {
    if (!activeMenu) return;
    const items = [...getMenuItems(activeMenu)];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    // Swap elements
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    setLoading(true);
    try {
      const updated = await saveNavigation(
        activeMenu.location,
        activeMenu.name,
        items
      );
      setMenus((prev) =>
        prev.map((m) =>
          m.id === activeMenu.id || m.location === updated.location ? updated : m
        )
      );
      setActiveMenuId(updated.id);
      toast.success("Menu order updated");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to reorder items");
    } finally {
      setLoading(false);
    }
  };

  // 6. Delete Entire Menu
  const handleDeleteMenu = async () => {
    if (!activeMenu) return;
    if (activeMenu.location === "header" || activeMenu.location === "footer") {
      return toast.error("Default system menus (header/footer) cannot be deleted.");
    }

    setLoading(true);
    try {
      await deleteNavigation(activeMenu.id);
      const remaining = menus.filter((m) => m.id !== activeMenu.id);
      setMenus(remaining);
      setActiveMenuId(remaining[0]?.id || "");
      setIsDeleteMenuOpen(false);
      toast.success(`Menu "${activeMenu.name}" deleted`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete menu");
    } finally {
      setLoading(false);
    }
  };

  const activeItems = getMenuItems(activeMenu);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Navigation Menus</h1>
            <Badge variant="outline" className="text-xs">
              {menus.length} {menus.length === 1 ? "Menu" : "Menus"} configured
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage header navigation, footer links, mega menus, and mobile trees.
          </p>
        </div>

        {/* Create Menu Dialog Trigger */}
        <div className="flex gap-2">
          <Dialog open={isCreateMenuOpen} onOpenChange={setIsCreateMenuOpen}>
            <DialogTrigger
              render={
                <Button id="create-menu-btn">
                  <Plus className="mr-2 h-4 w-4" /> Create Menu
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Navigation Menu</DialogTitle>
                <DialogDescription>
                  Create a new menu container for a specific location (e.g. mobile, sidebar, footer_col2).
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="menu-name">Menu Name</Label>
                  <Input
                    id="menu-name"
                    placeholder="e.g. Mobile Navigation"
                    value={newMenu.name}
                    onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="menu-location">Location Identifier</Label>
                  <Input
                    id="menu-location"
                    placeholder="e.g. mobile, sidebar_links"
                    value={newMenu.location}
                    onChange={(e) => setNewMenu({ ...newMenu, location: e.target.value })}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Unique slug identifier used by storefront components.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsCreateMenuOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateMenu} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    "Create Menu"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Menu Locations List */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-semibold">Menu Locations</CardTitle>
              <CardDescription className="text-xs">
                Select a menu location to manage its links
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col divide-y">
                {menus.map((menu) => {
                  const isSelected = activeMenu?.id === menu.id;
                  const count = getMenuItems(menu).length;
                  return (
                    <button
                      key={menu.id}
                      onClick={() => setActiveMenuId(menu.id)}
                      className={`px-5 py-3.5 text-left transition-colors hover:bg-muted/50 flex items-center justify-between ${
                        isSelected
                          ? "border-l-4 border-l-primary bg-muted/60 font-medium"
                          : "border-l-4 border-l-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="space-y-0.5 overflow-hidden pr-2">
                        <div className="font-medium text-sm text-foreground truncate">
                          {menu.name}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Network className="mr-1 h-3 w-3 shrink-0" />
                          <span className="truncate font-mono text-[11px]">
                            {menu.location}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0 font-normal">
                        {count} {count === 1 ? "link" : "links"}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Menu Items Table & Editor */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">
                    {activeMenu?.name || "Menu Editor"}
                  </CardTitle>
                  {activeMenu && (
                    <Badge variant="outline" className="font-mono text-xs">
                      location: {activeMenu.location}
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-1 text-xs">
                  Reorder, edit, or remove links for this menu.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {/* Delete Menu Button for custom menus */}
                {activeMenu &&
                  activeMenu.location !== "header" &&
                  activeMenu.location !== "footer" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8"
                      onClick={() => setIsDeleteMenuOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete Menu
                    </Button>
                  )}

                {/* Add Item Dialog Trigger */}
                <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                  <DialogTrigger
                    render={
                      <Button id="add-menu-item-btn" variant="default" size="sm" className="h-8">
                        <Plus className="mr-1.5 h-4 w-4" /> Add Item
                      </Button>
                    }
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Menu Link</DialogTitle>
                      <DialogDescription>
                        Add a navigation link to{" "}
                        <span className="font-semibold text-foreground">
                          {activeMenu?.name}
                        </span>
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="item-label">Link Label</Label>
                        <Input
                          id="item-label"
                          placeholder="e.g. Summer Collection"
                          value={newItem.label}
                          onChange={(e) =>
                            setNewItem({ ...newItem, label: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="item-url">Target URL</Label>
                        <Input
                          id="item-url"
                          placeholder="e.g. /products?category=summer"
                          value={newItem.url}
                          onChange={(e) =>
                            setNewItem({ ...newItem, url: e.target.value })
                          }
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Relative path (e.g. /shop) or external URL (https://...).
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="item-target">Link Target</Label>
                        <select
                          id="item-target"
                          value={newItem.target || "_self"}
                          onChange={(e) =>
                            setNewItem({ ...newItem, target: e.target.value })
                          }
                          className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="_self">Same tab (_self)</option>
                          <option value="_blank">New tab (_blank)</option>
                        </select>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setIsAddItemOpen(false)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddItem} disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                          </>
                        ) : (
                          "Add Item"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">Order</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Target URL</TableHead>
                    <TableHead className="w-20 text-center">Target</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeItems.length > 0 ? (
                    activeItems.map((item, idx) => (
                      <TableRow key={idx} className="group hover:bg-muted/40">
                        {/* Reorder Buttons */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              disabled={idx === 0 || loading}
                              onClick={() => handleMoveItem(idx, "up")}
                              title="Move Up"
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              disabled={idx === activeItems.length - 1 || loading}
                              onClick={() => handleMoveItem(idx, "down")}
                              title="Move Down"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>

                        {/* Label */}
                        <TableCell className="font-semibold text-sm">
                          {item.label}
                        </TableCell>

                        {/* URL */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                            <LinkIcon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                            <span className="truncate max-w-xs">{item.url}</span>
                          </div>
                        </TableCell>

                        {/* Target */}
                        <TableCell className="text-center">
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {item.target === "_blank" ? (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 gap-0.5">
                                new tab <ExternalLink className="h-2.5 w-2.5" />
                              </Badge>
                            ) : (
                              "same tab"
                            )}
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleOpenEditItem(idx)}
                              title="Edit item"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                              onClick={() => handleDeleteItem(idx)}
                              disabled={loading}
                              title="Delete item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Layers className="h-8 w-8 text-muted-foreground/50 mb-1" />
                          <p className="font-medium text-sm text-foreground">No links in this menu</p>
                          <p className="text-xs text-muted-foreground max-w-sm">
                            Click "Add Item" above to add the first link to this menu.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Item Dialog */}
      {isEditItemOpen && (
        <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Menu Link</DialogTitle>
              <DialogDescription>Modify the link label or destination.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-item-label">Link Label</Label>
                <Input
                  id="edit-item-label"
                  value={editingItem.label}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, label: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-item-url">Target URL</Label>
                <Input
                  id="edit-item-url"
                  value={editingItem.url}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, url: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-item-target">Link Target</Label>
                <select
                  id="edit-item-target"
                  value={editingItem.target || "_self"}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, target: e.target.value })
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="_self">Same tab (_self)</option>
                  <option value="_blank">New tab (_blank)</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditItemOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEditItem} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Menu Confirmation Dialog */}
      {isDeleteMenuOpen && (
        <Dialog open={isDeleteMenuOpen} onOpenChange={setIsDeleteMenuOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Delete Menu
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  "{activeMenu?.name}"
                </span>
                ? This will remove all links associated with this location.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteMenuOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteMenu}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Permanently"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
