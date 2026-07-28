'use client';

import { useState } from 'react';
import { useWishlistStore } from '@/stores/use-wishlist-store';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function WishlistButton({ productId, className, variant = 'outline', size = 'icon' }: WishlistButtonProps) {
  const { wishlist, addItem, removeItem, isLoading } = useWishlistStore();
  const { toast } = useToast();
  const [localLoading, setLocalLoading] = useState(false);

  // Check if item is in wishlist
  const wishlistItem = wishlist?.items?.find(item => item.product_id === productId);
  const isWishlisted = !!wishlistItem;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if wrapped in a link
    e.stopPropagation();
    
    if (!wishlist) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to add items to your wishlist.',
        variant: 'destructive'
      });
      return;
    }

    setLocalLoading(true);
    try {
      if (isWishlisted && wishlistItem) {
        await removeItem(wishlistItem.id);
        toast({ title: 'Removed from wishlist' });
      } else {
        await addItem(productId);
        toast({ title: 'Added to wishlist' });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update wishlist.',
        variant: 'destructive'
      });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={cn("transition-colors", className)}
      onClick={handleToggle}
      disabled={isLoading || localLoading}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={cn("w-5 h-5", isWishlisted && "fill-destructive text-destructive")} />
    </Button>
  );
}
