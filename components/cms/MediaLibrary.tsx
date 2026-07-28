'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Upload, Folder } from 'lucide-react';

export function MediaLibrary() {
  const mockMedia = [
    { id: 1, name: 'hero-banner-1.jpg', size: '1.2 MB' },
    { id: 2, name: 'summer-collection.png', size: '2.5 MB' },
    { id: 3, name: 'product-placeholder.jpg', size: '500 KB' },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Media Library</CardTitle>
        <Button size="sm"><Upload className="w-4 h-4 mr-2" /> Upload New</Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockMedia.map((file) => (
            <div key={file.id} className="border rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
              <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
              <span className="text-sm font-medium truncate w-full">{file.name}</span>
              <span className="text-xs text-muted-foreground">{file.size}</span>
            </div>
          ))}
          <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center text-muted-foreground hover:bg-muted/20 transition-colors cursor-pointer min-h-[140px]">
            <Upload className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm">Drag & drop files here</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
