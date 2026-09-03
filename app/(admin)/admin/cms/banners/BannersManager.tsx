"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  upsertHeroSlideWithUpload,
  deleteHeroSlide,
  HeroSlide,
} from "@/actions/cms.actions";
import {
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  ExternalLink,
  GripVertical,
} from "lucide-react";
import Image from "next/image";

const SLIDE_FALLBACKS = [
  "/images/home/hero-banner.png",
  "/images/home/hero-slide-2.png",
  "/images/home/hero-slide-3.png",
];

type EditSlide = Partial<HeroSlide> & {
  image_url: string;
  link_url: string;
  alt_text?: string;
  file?: File | null;
  isNew?: boolean;
};

export function BannersManager({
  initialSlides,
}: {
  initialSlides: HeroSlide[];
}) {
  const [slides, setSlides] = useState<EditSlide[]>(
    initialSlides.length > 0
      ? initialSlides as EditSlide[]
      : SLIDE_FALLBACKS.map((url, i) => ({
          id: `default-${i}`,
          image_url: url,
          link_url: "/products",
          display_order: i,
        }))
  );
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  const addNewSlide = () => {
    const newSlide: EditSlide = {
      id: `new-${Date.now()}`,
      image_url: "",
      link_url: "/products",
      display_order: slides.length,
      isNew: true,
    };
    setSlides([...slides, newSlide]);
    setEditingId(newSlide.id as string);
  };

  const updateSlide = (id: string, field: string, value: any) => {
    setSlides(slides.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const saveSlide = (slide: EditSlide) => {
    if (!slide.image_url && !slide.file) {
      toast.error("An image is required.");
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      if (!slide.isNew) {
        formData.append("id", slide.id as string);
      }
      formData.append("link_url", slide.link_url);
      if (slide.image_url) {
        formData.append("image_url", slide.image_url);
      }
      formData.append("display_order", String(slide.display_order));
      if (slide.alt_text) {
        formData.append("alt_text", slide.alt_text);
      }
      if (slide.file) {
        formData.append("file", slide.file);
      }

      const result = await upsertHeroSlideWithUpload(formData);
      if (result.success) {
        toast.success("Banner saved successfully!");
        setEditingId(null);
        // Mark as saved and update image_url from the response if it was uploaded
        setSlides(
          slides.map((s) => 
            s.id === slide.id 
              ? { ...s, isNew: false, image_url: result.image_url || s.image_url, file: null } 
              : s
          )
        );
      } else {
        toast.error(result.error ?? "Failed to save banner.");
      }
    });
  };

  const removeSlide = (id: string) => {
    if (id.startsWith("new-") || id.startsWith("default-")) {
      setSlides(slides.filter((s) => s.id !== id));
      return;
    }
    startTransition(async () => {
      const result = await deleteHeroSlide(id);
      if (result.success) {
        setSlides(slides.filter((s) => s.id !== id));
        toast.success("Banner removed.");
      } else {
        toast.error(result.error ?? "Failed to delete banner.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hero Banners</h1>
          <p className="mt-1 text-muted-foreground">
            Manage the full-width image slides that appear at the top of the
            homepage.
          </p>
        </div>
        <Button onClick={addNewSlide}>
          <Plus className="mr-2 h-4 w-4" /> Add Slide
        </Button>
      </div>

      {slides.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ImageIcon className="mb-4 h-12 w-12 opacity-30" />
            <p className="text-sm">No hero slides configured yet.</p>
            <Button variant="outline" className="mt-4" onClick={addNewSlide}>
              Add Your First Slide
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <Card
            key={slide.id}
            className={editingId === slide.id ? "ring-2 ring-primary" : ""}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                  <CardTitle className="text-base">
                    Slide {index + 1}
                    {slide.isNew && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        New
                      </Badge>
                    )}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  {editingId !== slide.id ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(slide.id as string)}
                    >
                      Edit
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => saveSlide(slide)}
                      disabled={isPending}
                    >
                      <Save className="mr-1 h-3 w-3" />
                      {isPending ? "Saving..." : "Save"}
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
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`img-${slide.id}`}>
                        Banner Image <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`img-${slide.id}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            updateSlide(slide.id as string, "file", file);
                            // Also clear image_url so that we know we are using the new file? No, keep it as fallback.
                          }
                        }}
                      />
                      {slide.image_url && !slide.file && (
                        <p className="text-xs text-muted-foreground truncate">Current: {slide.image_url.split('/').pop()}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Recommended size: 1600×600px. Upload a new image to replace the current one.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`cta-${slide.id}`}>
                        Link URL (when clicked){" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`cta-${slide.id}`}
                        value={slide.link_url}
                        onChange={(e) =>
                          updateSlide(
                            slide.id as string,
                            "link_url",
                            e.target.value
                          )
                        }
                        placeholder="/products or /categories/sale"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`alt-${slide.id}`}>
                        Alt Text
                      </Label>
                      <Input
                        id={`alt-${slide.id}`}
                        value={slide.alt_text || ""}
                        onChange={(e) =>
                          updateSlide(
                            slide.id as string,
                            "alt_text",
                            e.target.value
                          )
                        }
                        placeholder="Description of the banner image for accessibility (optional)"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  {slide.image_url && (
                    <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={slide.image_url}
                        alt={`Slide ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/placeholder.jpg"; // Use a safe local fallback
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-1 text-sm">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ExternalLink className="h-3 w-3" />
                      <span>{slide.link_url}</span>
                    </div>
                    {!slide.image_url && (
                      <p className="text-xs text-amber-500">
                        ⚠ No image configured
                      </p>
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
