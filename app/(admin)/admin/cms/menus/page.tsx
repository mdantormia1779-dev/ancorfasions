import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash,
  MoveVertical,
  Link as LinkIcon,
  Network,
} from "lucide-react";
import { getNavigation } from "@/actions/cms.actions";

export const metadata = {
  title: "Menu Manager | CMS",
};

// Assuming cms_navigation table has rows like {id, name, location, items, ...}
// but the action getNavigation takes location. We will fetch a few known locations,
// or ideally an action getAllNavigations() would exist. Since we didn't add it,
// we'll fetch 'header' and 'footer' explicitly for the view.
export default async function MenuManager() {
  const headerMenu = await getNavigation("header");
  const footerMenu = await getNavigation("footer");

  const menus = [
    ...(headerMenu
      ? [headerMenu]
      : [
          {
            id: "mock-1",
            name: "Main Header Navigation",
            location: "header",
            items: [],
            updated_at: new Date().toISOString(),
          },
        ]),
    ...(footerMenu
      ? [footerMenu]
      : [
          {
            id: "mock-2",
            name: "Footer Links",
            location: "footer",
            items: [],
            updated_at: new Date().toISOString(),
          },
        ]),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Navigation Menus
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage header, footer, and mobile navigation.
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
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
                {menus.map((menu, i) => (
                  <button
                    key={menu.id}
                    className={`border-b px-6 py-4 text-left transition-colors last:border-0 hover:bg-muted/50 ${i === 0 ? "border-l-4 border-l-primary bg-muted/50" : "border-l-4 border-l-transparent"}`}
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
                <CardTitle>{menus[0]?.name || "Menu Editor"}</CardTitle>
                <CardDescription className="mt-1">
                  Drag and drop to reorder items
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
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
                  {menus[0]?.items?.length > 0 ? (
                    menus[0].items.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <MoveVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.label}
                        </TableCell>
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
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-8 text-center text-muted-foreground"
                      >
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
    </div>
  );
}
