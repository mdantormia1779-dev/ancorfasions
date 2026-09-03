"use client";

import React, { useState, useCallback } from "react";
import { CMSPage, CMSPageBlock } from "@/types/cms.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { savePageBlocks } from "@/actions/cms.actions";
import { toast } from "sonner";
import {
  ArrowLeft,
  Settings,
  Save,
  Eye,
  Layout,
  Type,
  Image as ImageIcon,
  Video,
  Sparkles,
  Link as LinkIcon,
  Minus,
  Trash,
  GripVertical
} from "lucide-react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Define block templates
const BLOCK_TEMPLATES = [
  { id: "hero", name: "Hero Banner", icon: Layout, defaultContent: { title: "Welcome", subtitle: "Hero subtitle", imageUrl: "" } },
  { id: "text", name: "Rich Text", icon: Type, defaultContent: { text: "Enter your text here...", align: "left" } },
  { id: "image", name: "Image Block", icon: ImageIcon, defaultContent: { url: "", alt: "", caption: "" } },
  { id: "video", name: "Video Embed", icon: Video, defaultContent: { url: "", provider: "youtube" } },
  { id: "button", name: "Button / CTA", icon: LinkIcon, defaultContent: { label: "Click Here", url: "#", variant: "default" } },
  { id: "divider", name: "Divider", icon: Minus, defaultContent: { style: "solid" } },
];

// Sortable Item Component
function SortableBlock({ 
  block, 
  isActive, 
  onSelect, 
  onDelete 
}: { 
  block: any, 
  isActive: boolean, 
  onSelect: () => void, 
  onDelete: () => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative mb-4 cursor-pointer rounded-lg border-2 p-4 transition-colors ${
        isActive ? "border-primary bg-primary/5" : "border-transparent bg-white shadow-sm hover:border-muted"
      }`}
      onClick={onSelect}
    >
      <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 opacity-0 transition-opacity hover:opacity-100" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {block.section_type} BLOCK
        </span>
        {isActive && (
          <Button variant="ghost" size="sm" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="mt-2 text-sm">
        {block.section_type === "text" && <p className="truncate">{block.content_json.text}</p>}
        {block.section_type === "hero" && <p className="font-bold">{block.content_json.title}</p>}
        {block.section_type === "image" && <div className="h-24 w-full rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">{block.content_json.url ? "Image Provided" : "No Image"}</div>}
        {block.section_type === "button" && <Button variant="secondary" size="sm">{block.content_json.label}</Button>}
        {block.section_type === "divider" && <hr className="my-2 border-t-2 border-muted" />}
        {block.section_type === "video" && <p className="text-muted-foreground">Video Placeholder</p>}
      </div>
    </div>
  );
}

export function VisualBuilder({
  page,
  initialBlocks,
}: {
  page: CMSPage;
  initialBlocks: CMSPageBlock[];
}) {
  const [blocks, setBlocks] = useState<any[]>(
    initialBlocks.map((b) => ({ ...b, id: b.id || uuidv4() }))
  );
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addBlock = (templateId: string) => {
    const template = BLOCK_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    const newBlock = {
      id: uuidv4(),
      page_id: page.id,
      section_type: template.id,
      content_json: { ...template.defaultContent },
      display_order: blocks.length,
      is_active: true,
    };

    setBlocks([...blocks, newBlock]);
    setActiveBlockId(newBlock.id);
    setActiveTab("editor");
  };

  const updateActiveBlock = (updates: any) => {
    if (!activeBlockId) return;
    setBlocks(blocks.map((b) => (b.id === activeBlockId ? { ...b, content_json: { ...b.content_json, ...updates } } : b)));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (activeBlockId === id) setActiveBlockId(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePageBlocks(page.id, blocks);
      toast.success("Page saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save page");
    } finally {
      setIsSaving(false);
    }
  };

  const activeBlock = blocks.find((b) => b.id === activeBlockId);

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
              {page.title}{" "}
              <span className="ml-2 text-sm font-normal text-muted-foreground uppercase">
                ({page.status})
              </span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${page.slug}`} target="_blank">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" /> Preview
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Save Page"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Block Palette */}
        <div className="flex w-64 flex-col border-r bg-muted/20">
          <div className="border-b p-4">
            <h2 className="text-sm font-semibold">Block Library</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Click a block to add it to your page.
            </p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {BLOCK_TEMPLATES.map((block) => (
              <Card
                key={block.id}
                onClick={() => addBlock(block.id)}
                className="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:border-primary"
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
          <div className="flex min-h-[600px] w-full max-w-3xl flex-col rounded-lg border bg-background shadow-sm">
            {/* Canvas Header */}
            <div className="flex h-8 items-center gap-2 border-b bg-muted/30 px-4">
              <div className="h-2 w-2 rounded-full bg-red-400"></div>
              <div className="h-2 w-2 rounded-full bg-amber-400"></div>
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
            </div>

            {/* Canvas Body */}
            <div className="flex-1 p-6">
              {blocks.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/5 p-8 text-center">
                  <Layout className="mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium text-muted-foreground">Empty Page</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Click a block from the library to get started.</p>
                  <Button variant="outline" className="mt-6" onClick={() => toast.info("AI Generation coming soon")}>
                    <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                    Generate with AI
                  </Button>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                    {blocks.map((block) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        isActive={activeBlockId === block.id}
                        onSelect={() => setActiveBlockId(block.id)}
                        onDelete={() => deleteBlock(block.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="flex w-80 flex-col border-l bg-background">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full w-full flex-col">
            <div className="border-b px-4 py-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor">Settings</TabsTrigger>
                <TabsTrigger value="page">Page Info</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="editor" className="m-0 flex-1 overflow-y-auto p-4">
              {!activeBlock ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                  <Settings className="mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">Select a block on the canvas<br />to edit its properties.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold uppercase tracking-wider text-muted-foreground text-xs">{activeBlock.section_type} BLOCK</h3>
                  
                  {activeBlock.section_type === "hero" && (
                    <>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={activeBlock.content_json.title || ""} onChange={(e) => updateActiveBlock({ title: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Input value={activeBlock.content_json.subtitle || ""} onChange={(e) => updateActiveBlock({ subtitle: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input value={activeBlock.content_json.imageUrl || ""} onChange={(e) => updateActiveBlock({ imageUrl: e.target.value })} placeholder="https://..." />
                      </div>
                    </>
                  )}
                  
                  {activeBlock.section_type === "text" && (
                    <>
                      <div className="space-y-2">
                        <Label>Text Content</Label>
                        <Textarea rows={6} value={activeBlock.content_json.text || ""} onChange={(e) => updateActiveBlock({ text: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Alignment</Label>
                        <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={activeBlock.content_json.align || "left"} onChange={(e) => updateActiveBlock({ align: e.target.value })}>
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </>
                  )}

                  {activeBlock.section_type === "image" && (
                    <>
                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input value={activeBlock.content_json.url || ""} onChange={(e) => updateActiveBlock({ url: e.target.value })} placeholder="https://..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Alt Text</Label>
                        <Input value={activeBlock.content_json.alt || ""} onChange={(e) => updateActiveBlock({ alt: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Caption (Optional)</Label>
                        <Input value={activeBlock.content_json.caption || ""} onChange={(e) => updateActiveBlock({ caption: e.target.value })} />
                      </div>
                    </>
                  )}

                  {activeBlock.section_type === "button" && (
                    <>
                      <div className="space-y-2">
                        <Label>Button Label</Label>
                        <Input value={activeBlock.content_json.label || ""} onChange={(e) => updateActiveBlock({ label: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input value={activeBlock.content_json.url || ""} onChange={(e) => updateActiveBlock({ url: e.target.value })} />
                      </div>
                    </>
                  )}

                  {activeBlock.section_type === "video" && (
                    <>
                      <div className="space-y-2">
                        <Label>Video URL</Label>
                        <Input value={activeBlock.content_json.url || ""} onChange={(e) => updateActiveBlock({ url: e.target.value })} placeholder="https://youtube.com/..." />
                      </div>
                    </>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="page" className="m-0 flex-1 space-y-4 overflow-y-auto p-4">
              <div>
                <Label className="mb-1 block text-xs">Page Slug</Label>
                <Input disabled value={page.slug} />
              </div>
              <div className="space-y-2">
                <Label className="mb-1 block text-xs">Meta Title</Label>
                <Input value={page.seo_metadata?.title || page.title} readOnly />
                <p className="text-xs text-muted-foreground">Edit in Page Settings</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
