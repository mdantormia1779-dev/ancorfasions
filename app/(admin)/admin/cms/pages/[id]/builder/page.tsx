'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Settings, Save, MoreVertical, Eye, Layout, Type, Image as ImageIcon, Video, BoxSelect, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function VisualBuilderPage() {
  const [activeTab, setActiveTab] = useState('editor');

  const availableBlocks = [
    { id: 'hero', name: 'Hero Banner', icon: Layout },
    { id: 'text', name: 'Rich Text', icon: Type },
    { id: 'image', name: 'Image Block', icon: ImageIcon },
    { id: 'video', name: 'Video Embed', icon: Video },
    { id: 'products', name: 'Product Carousel', icon: BoxSelect },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-4 md:-m-8">
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms/pages">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold">Homepage <span className="text-sm font-normal text-muted-foreground ml-2">(Draft)</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Eye className="mr-2 h-4 w-4" /> Preview</Button>
          <Button><Save className="mr-2 h-4 w-4" /> Save Draft</Button>
          <Button variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
            <Sparkles className="mr-2 h-4 w-4" /> Publish
          </Button>
        </div>
      </div>

      {/* Main Builder Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Block Palette */}
        <div className="w-64 border-r bg-muted/20 flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-sm">Block Library</h2>
            <p className="text-xs text-muted-foreground mt-1">Drag and drop blocks to build your page.</p>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {availableBlocks.map((block) => (
              <Card key={block.id} className="p-3 cursor-grab hover:border-primary transition-colors flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <block.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{block.name}</span>
              </Card>
            ))}
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 bg-muted/10 overflow-y-auto p-8 flex flex-col items-center">
          <div className="max-w-4xl w-full min-h-[600px] bg-background border rounded-lg shadow-sm flex flex-col">
            {/* Canvas Header/Browser Frame Mock */}
            <div className="h-8 border-b bg-muted/30 flex items-center px-4 gap-2">
              <div className="h-2 w-2 rounded-full bg-red-400"></div>
              <div className="h-2 w-2 rounded-full bg-amber-400"></div>
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
            </div>
            
            {/* Canvas Body (Dropzone) */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-muted m-4 rounded-lg bg-muted/5">
              <Layout className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-muted-foreground">Empty Page</h3>
              <p className="text-sm text-muted-foreground mt-1">Drag a block from the library to get started.</p>
              
              <Button variant="outline" className="mt-6">
                <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                Generate with AI
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l bg-background flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <div className="px-4 py-2 border-b">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="editor">Block Settings</TabsTrigger>
                <TabsTrigger value="page">Page SEO</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="editor" className="flex-1 p-4 m-0 overflow-y-auto">
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Settings className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Select a block on the canvas<br/>to edit its properties.</p>
              </div>
            </TabsContent>
            <TabsContent value="page" className="flex-1 p-4 m-0 overflow-y-auto space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Meta Title</label>
                <input type="text" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" defaultValue="Anchor Fashion | Home" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Meta Description</label>
                <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" defaultValue="Discover the latest premium fashion trends." />
              </div>
              <Button variant="outline" className="w-full"><Sparkles className="mr-2 h-4 w-4 text-purple-500" /> AI Optimize SEO</Button>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}
