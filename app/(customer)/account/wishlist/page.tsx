import { Metadata } from "next";
import { WishlistGrid } from "@/components/wishlist/wishlist-grid";
import { fetchWishlistAction } from "@/lib/actions/wishlist.actions";
import { createClient } from "@/lib/supabase/server";
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
    redirect("/auth/login?redirect=/account/wishlist");
  }

  // Pre-fetch wishlist on server
  await fetchWishlistAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Wishlist</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage the items you've saved for later.
        </p>
      </div>

      <WishlistGrid />
    </div>
  );
}
