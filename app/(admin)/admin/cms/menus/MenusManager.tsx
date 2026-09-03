"use client";

import React, { useState } from "react";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Edit,
  Trash,
  MoveVertical,
  Link as LinkIcon,
  Network,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { saveNavigation } from "@/actions/cms.actions";

export default function MenusManager({ initialMenus }: { initialMenus: any[] }) {
  const [menus, setMenus] = useState(initialMenus);
  const [activeMenuId, setActiveMenuId] = useState(initialMenus[0]?.id);
  const [loading, setLoading] = useState(false);

  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [newMenu, setNewMenu] = useState({ name: "", location: "" });

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({ label: "", url: "" });

  const activeMenu = menus.find((m) => m.id === activeMenuId) || menus[0];

  const handleCreateMenu = async () => {
    if (!newMenu.name || !newMenu.location) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      const created = await saveNavigation(newMenu.location, newMenu.name, []);
      setMenus([...menus, created]);
      setActiveMenuId(created.id);
      setIsCreateMenuOpen(false);
      setNewMenu({ name: "", location: "" });
      toast.success("Menu created successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to create menu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.label || !newItem.url) return toast.error("Please fill all fields");
    if (!activeMenu) return toast.error("No active menu selected");
    setLoading(true);
    try {
      const updatedItems = [...(activeMenu.items || []), newItem];
      const updated = await saveNavigation(activeMenu.location, activeMenu.name, updatedItems);
      setMenus(menus.map(m => m.id === activeMenu.id ? updated : m));
      setIsAddItemOpen(false);
      setNewItem({ label: "", url: "" });
      toast.success("Item added successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (index: number) => {
    if (!activeMenu) return;
    setLoading(true);
    try {
      const updatedItems = [...activeMenu.items];
      updatedItems.splice(index, 1);
      const updated = await saveNavigation(activeMenu.location, activeMenu.name, updatedItems);
      setMenus(menus.map(m => m.id === activeMenu.id ? updated : m));
      toast.success("Item deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Navigation Menus</h1>
          <p className="mt-1 text-muted-foreground">
            Manage header, footer, and mobile navigation.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateMenuOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Menu
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Menu Locations</CardTitle>
              <CardDescription>Select a menu to edit its items</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {menus.map((menu) => (
                  <button
                    key={menu.id}
                    onClick={() => setActiveMenuId(menu.id)}
                    className={`border-b px-6 py-4 text-left transition-colors last:border-0 hover:bg-muted/50 ${activeMenuId === menu.id ? "border-l-4 border-l-primary bg-muted/50" : "border-l-4 border-l-transparent"}`}
                  >
                    <div className="font-medium">{menu.name}</div>
                    <div className="mt-1 flex items-center text-xs capitalize text-muted-foreground">
                      <Network className="mr-1 h-3 w-3" />
                      Location: {menu.location}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>{activeMenu?.name || "Menu Editor"}</CardTitle>
                <CardDescription className="mt-1">
                  Drag and drop to reorder items
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsAddItemOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeMenu?.items?.length > 0 ? (
                    activeMenu.items.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <MoveVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                        </TableCell>
                        <TableCell className="font-medium">{item.label}</TableCell>
                        <TableCell className="flex items-center text-muted-foreground">
                          <LinkIcon className="mr-2 h-3 w-3" /> {item.url}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeleteItem(idx)}
                            disabled={loading}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                        No items in this menu.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isCreateMenuOpen} onOpenChange={setIsCreateMenuOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Navigation Menu</DialogTitle>
            <DialogDescription>Create a new menu container for a specific location.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Menu Name</Label>
              <Input
                placeholder="e.g. Header Menu"
                value={newMenu.name}
                onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Location Identifier</Label>
              <Input
                placeholder="e.g. header, footer_1"
                value={newMenu.location}
                onChange={(e) => setNewMenu({ ...newMenu, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateMenuOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateMenu} disabled={loading}>
              {loading ? "Creating..." : "Create Menu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
            <DialogDescription>Add a link to the {activeMenu?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                placeholder="e.g. Shop Now"
                value={newItem.label}
                onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>URL / Link</Label>
              <Input
                placeholder="e.g. /category/dresses"
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem} disabled={loading}>
              {loading ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
