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
  Trash,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
import { deletePost, updatePost } from "@/actions/blog.actions";
import { toast } from "sonner";
import { BlogPost } from "@/types/blog.types";

interface CmsBlogsClientProps {
  posts: BlogPost[];
}

export function CmsBlogsClient({ posts }: CmsBlogsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q))
    );
  }, [search, posts]);

  const handleDelete = async () => {
    if (!deletingPost) return;
    setDeleteLoading(true);
    try {
      await deletePost(deletingPost.id);
      toast.success(`Post "${deletingPost.title}" deleted`);
      setDeletingPost(null);
      router.refresh();
    } catch (err: any) {
      toast.error("Failed to delete blog post", { description: err.message });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const nextStatus = post.status === "published" ? "draft" : "published";
    try {
      await updatePost(post.id, {
        status: nextStatus,
        published_at: nextStatus === "published" ? new Date().toISOString() : null,
      });
      toast.success(
        `Post "${post.title}" ${nextStatus === "published" ? "published" : "moved to draft"}`
      );
      router.refresh();
    } catch (err: any) {
      toast.error("Failed to update post status", { description: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="mt-1 text-muted-foreground">
            Manage articles, fashion guides, editorial content, and categories.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/cms/blogs/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Post
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Posts ({posts.length})</CardTitle>
            <div className="flex w-full max-w-sm items-center gap-2">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search articles..."
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
                <TableHead className="w-16">Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((post) => {
                const img = post.featured_image || (post as any).cover_image;
                return (
                  <TableRow key={post.id}>
                    <TableCell>
                      {img ? (
                        <div className="relative h-10 w-14 overflow-hidden rounded border">
                          <Image
                            src={img}
                            alt={post.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-14 items-center justify-center rounded border bg-muted text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {post.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      /blog/{post.slug}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          post.status === "published" ? "default" : "outline"
                        }
                        className="cursor-pointer select-none"
                        onClick={() => handleToggleStatus(post)}
                        title="Click to toggle draft/published"
                      >
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : "-"}
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
                          <DropdownMenuItem render={<Link href={`/admin/cms/blogs/${post.id}`} className="flex w-full cursor-pointer items-center" />}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Post
                          </DropdownMenuItem>
                          <DropdownMenuItem render={<Link href={`/blog/${post.slug}`} target="_blank" className="flex w-full cursor-pointer items-center" />}>
                            <Eye className="mr-2 h-4 w-4" /> View Public Page
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeletingPost(post)}
                            className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    {search
                      ? "No blog posts match your search."
                      : "No blog posts found. Create your first post."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deletingPost}
        title={`Delete "${deletingPost?.title}"?`}
        description="This will permanently delete the blog post and cannot be undone."
        confirmLabel="Delete Post"
        variant="destructive"
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingPost(null)}
      />
    </div>
  );
}
