'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function NavigationBuilder() {
  const [items, setItems] = useState([
    { id: 1, label: 'Home', url: '/' },
    { id: 2, label: 'Shop', url: '/products' },
    { id: 3, label: 'Categories', url: '/categories' },
    { id: 4, label: 'About Us', url: '/about' },
  ]);

  const removeItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), label: 'New Link', url: '#' }]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Main Navigation</CardTitle>
        <Button size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-2" /> Add Link</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-3 bg-card border rounded-md p-3 shadow-sm">
            <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
            <div className="grid grid-cols-2 gap-3 flex-1">
              <Input defaultValue={item.label} placeholder="Link Label" />
              <Input defaultValue={item.url} placeholder="URL (/path)" />
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <div className="pt-4 flex justify-end">
          <Button>Save Navigation</Button>
        </div>
      </CardContent>
    </Card>
  );
}
