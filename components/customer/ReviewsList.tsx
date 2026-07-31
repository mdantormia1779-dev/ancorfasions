'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Trash2, Edit } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export function ReviewsList({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    // In a real implementation, you would call a server action here.
    toast.success('Review deleted (mock)');
    setReviews(reviews.filter(r => r.id !== id));
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl border-dashed">
        <p className="text-muted-foreground">You haven't written any reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map(review => {
        const product = review.product;
        const title = product?.name || 'Unknown Product';
        const image = product?.main_image_url || '/images/placeholder.webp';

        return (
          <Card key={review.id}>
            <CardContent className="p-6 flex flex-col md:flex-row gap-6">
              <div className="w-24 h-24 bg-muted rounded-md relative shrink-0 overflow-hidden">
                <Image src={image} alt={title} fill className="object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <div className="flex text-yellow-500 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(review.id)} disabled={isPending}>
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
                {review.title && <p className="font-medium mt-2">{review.title}</p>}
                <p className="text-muted-foreground text-sm">{review.comment || review.review_text}</p>
                <p className="text-xs text-muted-foreground mt-2">Reviewed on {new Date(review.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
