'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function HomepageEditor() {
  const [sections, setSections] = useState([
    { id: 'hero', name: 'Hero Banner', isVisible: true },
    { id: 'featured', name: 'Featured Categories', isVisible: true },
    { id: 'products', name: 'Trending Products', isVisible: true },
    { id: 'promo', name: 'Promo Banner', isVisible: false },
  ]);

  const toggleSection = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Homepage Layout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">Toggle sections to enable or disable them on the storefront homepage.</p>
        <div className="space-y-2">
          {sections.map(section => (
            <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
              <span className="font-medium">{section.name}</span>
              <Button 
                variant={section.isVisible ? "default" : "outline"} 
                size="sm"
                onClick={() => toggleSection(section.id)}
              >
                {section.isVisible ? 'Visible' : 'Hidden'}
              </Button>
            </div>
          ))}
        </div>
        <div className="pt-4">
          <Button className="w-full">Save Layout Configuration</Button>
        </div>
      </CardContent>
    </Card>
  );
}
