import { fetchReviewsAction } from '@/app/actions/customer.actions';
import { ReviewsList } from '@/components/customer/ReviewsList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'My Reviews | Anchor Fashion',
};

export default async function ReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/account/reviews');
  }

  const res = await fetchReviewsAction();
  const reviews = (res.success && res.data) ? res.data : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews & Ratings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your product reviews and see what you've rated.
          </p>
        </div>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Write a Review
        </Button>
      </div>

      <ReviewsList initialReviews={reviews} />
    </div>
  );
}
