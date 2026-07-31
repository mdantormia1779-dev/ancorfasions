import { Metadata } from "next";
import { fetchWishlistAction } from "@/actions/wishlist.actions";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Wishlist | Anchor Fashion",
  description: "View your saved items.",
};

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/wishlist");
  }

  const wishlist = await fetchWishlistAction();

  if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
        <Heart className="mb-6 h-16 w-16 text-muted-foreground opacity-20" />
        <h1 className="mb-2 text-3xl font-bold">Your Wishlist is Empty</h1>
        <p className="mb-8 text-muted-foreground">
          Save items you love to your wishlist to easily find them later.
        </p>
        <Link href="/">
          <Button size="lg">Discover Trends</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">My Wishlist</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {wishlist.items.map((item) => (
          <div key={item.id} className="rounded-lg border bg-card p-4">
            {/* In a real scenario, use ProductCard component */}
            <div className="mb-4 flex aspect-[3/4] items-center justify-center rounded-md bg-secondary">
              {item.product?.main_image_url ? (
                <img
                  src={item.product.main_image_url}
                  alt={item.product.title}
                  className="h-full w-full rounded-md object-cover"
                />
              ) : (
                <span className="text-sm text-muted-foreground">No Image</span>
              )}
            </div>
            <h3 className="line-clamp-1 text-sm font-medium">
              {item.product?.title}
            </h3>
            <p className="mt-1 font-bold">
              BDT {item.product?.sale_price || item.product?.price}
            </p>
            <Button className="mt-4 w-full" variant="outline">
              Move to Cart
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
