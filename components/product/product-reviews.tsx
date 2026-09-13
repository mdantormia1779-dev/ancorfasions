import { Star } from "lucide-react";
import { Jost } from "next/font/google";
import { WriteReviewButton } from "@/features/customer/WriteReviewButton";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

import { Review } from "@/types/catalog.types";

interface ProductReviewsProps {
  productId: string;
  averageRating: number;
  totalReviews: number;
  reviews?: Review[];
}

export function ProductReviews({
  productId,
  averageRating = 0,
  totalReviews = 0,
  reviews = [],
}: ProductReviewsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="border-t border-gray-100 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className={`${jost.className} mb-2 text-2xl font-light tracking-tight text-[#1A1A1A] md:text-3xl`}>
              Customer Reviews
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(averageRating) ? "fill-black text-black" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-[#1A1A1A]">
                {averageRating} / 5
              </span>
              <span className="text-sm text-gray-500">
                Based on {totalReviews} reviews
              </span>
            </div>
          </div>
          <WriteReviewButton productId={productId} />
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {reviews.map((review) => {
              const authorName = review.customer
                ? `${review.customer.first_name || ""} ${review.customer.last_name || ""}`.trim() || "Anonymous"
                : "Anonymous User";
              
              return (
                <div key={review.id} className="flex flex-col border-t border-gray-100 pt-8">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="mb-2 flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < review.rating ? "fill-black text-black" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <h3 className="text-sm font-semibold text-[#1A1A1A]">
                        {review.title || "No Title"}
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.created_at)}
                    </span>
                  </div>

                  <p className="mb-6 text-sm leading-relaxed text-gray-600">
                    {review.review_text || "No review content provided."}
                  </p>
                  
                  {/* Photo UGC Gallery */}
                  {review.images && review.images.length > 0 && (
                    <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
                      {review.images.map((img: string, idx: number) => (
                        <div key={idx} className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img src={img} alt={`Review photo ${idx + 1}`} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium text-[#1A1A1A]">{authorName}</span>
                      {review.order_id && (
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <button className="text-xs text-gray-500 underline transition-colors hover:text-black">
                      Helpful ({review.helpful_votes || 0})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
            <Star className="mb-4 h-8 w-8 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-[#1A1A1A]">No Reviews Yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Be the first to review this product and share your experience with other customers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
