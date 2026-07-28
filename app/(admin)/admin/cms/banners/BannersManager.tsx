'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { upsertHeroSlide, deleteHeroSlide, HeroSlide } from '@/lib/actions/cms.actions';
import { Plus, Trash2, Save, Image as ImageIcon, ExternalLink, GripVertical } from 'lucide-react';
import Image from 'next/image';

const SLIDE_FALLBACKS = [
  '/images/home/hero-banner.png',
  '/images/home/hero-slide-2.png',
  '/images/home/hero-slide-3.png',
];

type EditSlide = Partial<HeroSlide> & { media_url: string; cta_url: string; isNew?: boolean };

export function BannersManager({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const [slides, setSlides] = useState<EditSlide[]>(
    initialSlides.length > 0
      ? initialSlides
      : SLIDE_FALLBACKS.map((url, i) => ({
          id: `default-${i}`,
          media_url: url,
          cta_url: '/products',
          headline: null,
          subheadline: null,
          cta_text: null,
          display_order: i,
        }))
  );
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  const addNewSlide = () => {
    const newSlide: EditSlide = {
      id: `new-${Date.now()}`,
      media_url: '',
      cta_url: '/products',
      headline: null,
      subheadline: null,
      cta_text: null,
      display_order: slides.length,
      isNew: true,
    };
    setSlides([...slides, newSlide]);
    setEditingId(newSlide.id as string);
  };

  const updateSlide = (id: string, field: string, value: string | null) => {
    setSlides(slides.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const saveSlide = (slide: EditSlide) => {
    if (!slide.media_url) {
      toast.error('Image URL is required.');
      return;
    }
    startTransition(async () => {
      const result = await upsertHeroSlide({
        id: slide.isNew ? undefined : slide.id as string,
        media_url: slide.media_url,
        cta_url: slide.cta_url,
        headline: slide.headline,
        subheadline: slide.subheadline,
        cta_text: slide.cta_text,
      });
      if (result.success) {
        toast.success('Banner saved successfully!');
        setEditingId(null);
        // Mark as saved
        setSlides(slides.map((s) => (s.id === slide.id ? { ...s, isNew: false } : s)));
      } else {
        toast.error(result.error ?? 'Failed to save banner.');
      }
    });
  };

  const removeSlide = (id: string) => {
    if (id.startsWith('new-') || id.startsWith('default-')) {
      setSlides(slides.filter((s) => s.id !== id));
      return;
    }
    startTransition(async () => {
      const result = await deleteHeroSlide(id);
      if (result.success) {
        setSlides(slides.filter((s) => s.id !== id));
        toast.success('Banner removed.');
      } else {
        toast.error(result.error ?? 'Failed to delete banner.');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hero Banners</h1>
          <p className="text-muted-foreground mt-1">
            Manage the full-width image slides that appear at the top of the homepage.
          </p>
        </div>
        <Button onClick={addNewSlide}>
          <Plus className="mr-2 h-4 w-4" /> Add Slide
        </Button>
      </div>

      {slides.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-sm">No hero slides configured yet.</p>
            <Button variant="outline" className="mt-4" onClick={addNewSlide}>
              Add Your First Slide
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <Card key={slide.id} className={editingId === slide.id ? 'ring-2 ring-primary' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <CardTitle className="text-base">
                    Slide {index + 1}
                    {slide.isNew && <Badge variant="secondary" className="ml-2 text-xs">New</Badge>}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  {editingId !== slide.id ? (
                    <Button variant="outline" size="sm" onClick={() => setEditingId(slide.id as string)}>
                      Edit
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => saveSlide(slide)} disabled={isPending}>
                      <Save className="mr-1 h-3 w-3" />
                      {isPending ? 'Saving...' : 'Save'}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeSlide(slide.id as string)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingId === slide.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`img-${slide.id}`}>
                        Image URL <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`img-${slide.id}`}
                        value={slide.media_url}
                        onChange={(e) => updateSlide(slide.id as string, 'media_url', e.target.value)}
                        placeholder="/images/home/hero-banner.png or https://..."
                      />
                      <p className="text-xs text-muted-foreground">Use a local path (e.g., /images/...) or an external URL. Recommended size: 1600×600px.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`cta-${slide.id}`}>
                        Link URL (when clicked) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`cta-${slide.id}`}
                        value={slide.cta_url}
                        onChange={(e) => updateSlide(slide.id as string, 'cta_url', e.target.value)}
                        placeholder="/products or /categories/sale"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`headline-${slide.id}`}>Headline (optional)</Label>
                      <Input
                        id={`headline-${slide.id}`}
                        value={slide.headline ?? ''}
                        onChange={(e) => updateSlide(slide.id as string, 'headline', e.target.value || null)}
                        placeholder="Summer Collection 2026"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`sub-${slide.id}`}>Sub-headline (optional)</Label>
                      <Input
                        id={`sub-${slide.id}`}
                        value={slide.subheadline ?? ''}
                        onChange={(e) => updateSlide(slide.id as string, 'subheadline', e.target.value || null)}
                        placeholder="Explore the latest trends"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`ctabtn-${slide.id}`}>Button Text (optional)</Label>
                      <Input
                        id={`ctabtn-${slide.id}`}
                        value={slide.cta_text ?? ''}
                        onChange={(e) => updateSlide(slide.id as string, 'cta_text', e.target.value || null)}
                        placeholder="Shop Now"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 items-start">
                  {slide.media_url && (
                    <div className="relative w-32 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0 border">
                      <Image
                        src={slide.media_url}
                        alt={slide.headline ?? `Slide ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={() => {}}
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-1 text-sm">
                    {slide.headline && <p className="font-semibold">{slide.headline}</p>}
                    {slide.subheadline && <p className="text-muted-foreground">{slide.subheadline}</p>}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ExternalLink className="h-3 w-3" />
                      <span>{slide.cta_url}</span>
                    </div>
                    {!slide.media_url && (
                      <p className="text-amber-500 text-xs">⚠ No image configured</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
