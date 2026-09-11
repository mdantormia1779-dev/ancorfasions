"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  LayoutTemplate,
  Trash,
  Eye,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/features/admin/components/shared/ConfirmDialog";
import { deletePage } from "@/actions/cms.actions";
import { toast } from "sonner";
import { CMSPage } from "@/types/cms.types";

interface CmsPagesClientProps {
  pages: CMSPage[];
}

export function CmsPagesClient({ pages }: CmsPagesClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deletingPage, setDeletingPage] = useState<CMSPage | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return pages;
    const q = search.toLowerCase();
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [search, pages]);

  const handlePreview = (page: CMSPage) => {
    window.open(`/${page.slug}`, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async () => {
    if (!deletingPage) return;
    setDeleteLoading(true);
    try {
      await deletePage(deletingPage.id);
      toast.success(`Page "${deletingPage.title}" deleted`);
      setDeletingPage(null);
      router.refresh();
    } catch (err: any) {
      toast.error("Failed to delete page", { description: err.message });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
          <p className="mt-1 text-muted-foreground">
            Manage landing pages, homepage, and static content.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/cms/pages/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Page
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Pages</CardTitle>
            <div className="flex w-full max-w-sm items-center gap-2">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search pages..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Path / Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    /{page.slug}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        page.status === "PUBLISHED" ? "default" : "outline"
                      }
                    >
                      {page.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(page.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuItem render={<Link href={`/admin/cms/pages/${page.id}`} className="flex w-full cursor-pointer items-center" />}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem render={<Link href={`/admin/cms/pages/${page.id}/builder`} className="flex w-full cursor-pointer items-center" />}>
                            <LayoutTemplate className="mr-2 h-4 w-4" /> Visual Builder
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePreview(page)}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" /> Preview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingPage(page)}
                          className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete Page
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {search ? "No pages match your search." : "No pages found. Create your first page."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deletingPage}
        title={`Delete "${deletingPage?.title}"?`}
        description="This will permanently delete the page and all its content blocks. This action cannot be undone."
        confirmLabel="Delete Page"
        variant="destructive"
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingPage(null)}
      />
    </div>
  );
}
