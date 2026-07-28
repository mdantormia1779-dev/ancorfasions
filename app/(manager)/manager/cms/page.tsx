import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutTemplate, FileText, Image as ImageIcon, MessageSquare } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CMS | Manager Dashboard",
};

export default function CMSPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your storefront content, blogs, and media.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <LayoutTemplate className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Storefront Pages</CardTitle>
                <CardDescription>Manage homepage banners, sections, and static pages.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" className="w-full">Homepage Builder</Button>
              <Button variant="outline" className="w-full">Static Pages</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Blog & Articles</CardTitle>
                <CardDescription>Publish SEO-optimized articles and fashion guides.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" className="w-full">Manage Posts</Button>
              <Button variant="outline" className="w-full">Categories</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Media Library</CardTitle>
                <CardDescription>Manage product images, banners, and digital assets.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Open Media Manager</Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>FAQs & Policies</CardTitle>
                <CardDescription>Update shipping policies, return rules, and FAQs.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" className="w-full">Edit FAQs</Button>
              <Button variant="outline" className="w-full">Store Policies</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
