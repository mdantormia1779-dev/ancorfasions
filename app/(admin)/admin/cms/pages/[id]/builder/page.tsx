"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Settings,
  Save,
  MoreVertical,
  Eye,
  Layout,
  Type,
  Image as ImageIcon,
  Video,
  BoxSelect,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function VisualBuilderPage() {
  const [activeTab, setActiveTab] = useState("editor");

  const availableBlocks = [
    { id: "hero", name: "Hero Banner", icon: Layout },
    { id: "text", name: "Rich Text", icon: Type },
    { id: "image", name: "Image Block", icon: ImageIcon },
    { id: "video", name: "Video Embed", icon: Video },
    { id: "products", name: "Product Carousel", icon: BoxSelect },
  ];

  return (
    <div className="-m-4 flex h-[calc(100vh-6rem)] flex-col md:-m-8">
      {/* Topbar */}
      <div className="flex items-center justify-between border-b bg-background px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms/pages">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold">
              Homepage{" "}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                (Draft)
              </span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
          <Button
            variant="secondary"
            className="bg-primary/10 text-primary hover:bg-primary/20"
          >
            <Sparkles className="mr-2 h-4 w-4" /> Publish
          </Button>
        </div>
      </div>

      {/* Main Builder Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Block Palette */}
        <div className="flex w-64 flex-col border-r bg-muted/20">
          <div className="border-b p-4">
            <h2 className="text-sm font-semibold">Block Library</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Drag and drop blocks to build your page.
            </p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {availableBlocks.map((block) => (
              <Card
                key={block.id}
                className="flex cursor-grab items-center gap-3 p-3 transition-colors hover:border-primary"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                  <block.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{block.name}</span>
              </Card>
            ))}
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex flex-1 flex-col items-center overflow-y-auto bg-muted/10 p-8">
          <div className="flex min-h-[600px] w-full max-w-4xl flex-col rounded-lg border bg-background shadow-sm">
            {/* Canvas Header/Browser Frame Mock */}
            <div className="flex h-8 items-center gap-2 border-b bg-muted/30 px-4">
              <div className="h-2 w-2 rounded-full bg-red-400"></div>
              <div className="h-2 w-2 rounded-full bg-amber-400"></div>
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
            </div>

            {/* Canvas Body (Dropzone) */}
            <div className="m-4 flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/5 p-8 text-center">
              <Layout className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-muted-foreground">
                Empty Page
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Drag a block from the library to get started.
              </p>

              <Button variant="outline" className="mt-6">
                <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                Generate with AI
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="flex w-80 flex-col border-l bg-background">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex h-full w-full flex-col"
          >
            <div className="border-b px-4 py-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor">Block Settings</TabsTrigger>
                <TabsTrigger value="page">Page SEO</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="editor"
              className="m-0 flex-1 overflow-y-auto p-4"
            >
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <Settings className="mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">
                  Select a block on the canvas
                  <br />
                  to edit its properties.
                </p>
              </div>
            </TabsContent>
            <TabsContent
              value="page"
              className="m-0 flex-1 space-y-4 overflow-y-auto p-4"
            >
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Meta Title
                </label>
                <input
                  type="text"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  defaultValue="Anchor Fashion | Home"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Meta Description
                </label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  defaultValue="Discover the latest premium fashion trends."
                />
              </div>
              <Button variant="outline" className="w-full">
                <Sparkles className="mr-2 h-4 w-4 text-purple-500" /> AI
                Optimize SEO
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
