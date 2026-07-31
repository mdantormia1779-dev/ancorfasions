import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Search, Filter, Image as ImageIcon, FileText, Video, Trash, Link as LinkIcon, MoreVertical } from 'lucide-react';
import { getMedia } from '@/actions/cms.actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from 'next/image';

export const metadata = {
  title: 'Media Library | CMS',
};

export default async function MediaLibrary() {
  const media = await getMedia();

  const getIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="h-8 w-8 text-purple-500" />;
    return <FileText className="h-8 w-8 text-orange-500" />;
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground mt-1">Manage images, videos, and documents.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
          <Button><Upload className="mr-2 h-4 w-4" /> Upload Media</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="rounded-full">All Files</Button>
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">Images</Button>
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">Videos</Button>
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">Documents</Button>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search files..."
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((item) => (
              <div key={item.id} className="group relative border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-muted flex items-center justify-center relative">
                  {item.file_type.startsWith('image/') ? (
                    <Image
                      src={item.file_url}
                      alt={item.alt_text || item.file_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    getIcon(item.file_type)
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <LinkIcon className="mr-2 h-4 w-4" /> Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ImageIcon className="mr-2 h-4 w-4" /> Preview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate" title={item.file_name}>{item.file_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatBytes(item.file_size_bytes)} • {item.file_type.split('/')[1]?.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
            
            {media.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No media files found.</p>
                <p className="text-sm mt-1">Upload files to populate your media library.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
