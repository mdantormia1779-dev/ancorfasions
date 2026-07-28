import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import Image from 'next/image';

export const metadata = {
  title: 'My Reviews | Anchor Fashion',
};

export default function ReviewsPage() {
  const reviews = [
    {
      id: '1',
      productName: 'Classic White T-Shirt',
      productImage: '/placeholder.svg',
      rating: 5,
      title: 'Great quality!',
      text: 'The fabric is very soft and fits perfectly.',
      date: '2026-10-15',
    },
    {
      id: '2',
      productName: 'Denim Jacket',
      productImage: '/placeholder.svg',
      rating: 4,
      title: 'Nice jacket, a bit tight',
      text: 'Love the color and style, but I would recommend sizing up.',
      date: '2026-09-22',
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews & Ratings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your product reviews and see what you've rated.
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map(review => (
          <Card key={review.id}>
            <CardContent className="p-6 flex flex-col md:flex-row gap-6">
              <div className="w-24 h-24 bg-muted rounded-md relative shrink-0">
                {/* Fallback image */}
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  IMG
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{review.productName}</h3>
                    <div className="flex text-yellow-500 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="space-x-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                  </div>
                </div>
                <p className="font-medium mt-2">{review.title}</p>
                <p className="text-muted-foreground text-sm">{review.text}</p>
                <p className="text-xs text-muted-foreground mt-2">Reviewed on {new Date(review.date).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
