import { Metadata } from 'next';
import { fetchWishlistAction } from '@/actions/wishlist.actions';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'My Wishlist | Anchor Fashion',
  description: 'View your saved items.',
};

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/wishlist');
  }

  const wishlist = await fetchWishlistAction();

  if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <Heart className="w-16 h-16 text-muted-foreground opacity-20 mb-6" />
        <h1 className="text-3xl font-bold mb-2">Your Wishlist is Empty</h1>
        <p className="text-muted-foreground mb-8">Save items you love to your wishlist to easily find them later.</p>
        <Link href="/">
          <Button size="lg">Discover Trends</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.items.map(item => (
          <div key={item.id} className="border rounded-lg p-4 bg-card">
            {/* In a real scenario, use ProductCard component */}
            <div className="aspect-[3/4] bg-secondary rounded-md mb-4 flex items-center justify-center">
              {item.product?.main_image_url ? (
                 <img src={item.product.main_image_url} alt={item.product.title} className="object-cover w-full h-full rounded-md" />
              ) : (
                <span className="text-muted-foreground text-sm">No Image</span>
              )}
            </div>
            <h3 className="font-medium text-sm line-clamp-1">{item.product?.title}</h3>
            <p className="font-bold mt-1">BDT {item.product?.sale_price || item.product?.price}</p>
            <Button className="w-full mt-4" variant="outline">Move to Cart</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
