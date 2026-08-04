import { Star } from "lucide-react";
import { Jost } from "next/font/google";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

interface ProductReviewsProps {
  productId: string;
  averageRating: number;
  totalReviews: number;
}

export function ProductReviews({
  productId,
  averageRating = 4.8,
  totalReviews = 124,
}: ProductReviewsProps) {
  // Mock data for presentation as per instructions "Do not modify review backend"
  const mockReviews = [
    {
      id: "1",
      author: "Sarah M.",
      verified: true,
      rating: 5,
      date: "Oct 12, 2026",
      title: "Absolute Perfection",
      content:
        "The fit is incredibly flattering and the material feels very premium. It drapes beautifully and holds its shape after washing. Exactly what I was looking for.",
      fit: "True to Size",
      sizeBought: "S",
      helpfulCount: 24,
    },
    {
      id: "2",
      author: "Emily R.",
      verified: true,
      rating: 5,
      date: "Sep 28, 2026",
      title: "Worth the investment",
      content:
        "You can instantly feel the quality. The stitching is flawless and the silhouette is very modern. I've received so many compliments wearing this.",
      fit: "True to Size",
      sizeBought: "M",
      helpfulCount: 18,
    },
  ];

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
          <button className="border border-black px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#1A1A1A] transition-colors hover:bg-black hover:text-white">
            Write a Review
          </button>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {mockReviews.map((review) => (
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
                  <h3 className="text-sm font-semibold text-[#1A1A1A]">{review.title}</h3>
                </div>
                <span className="text-xs text-gray-500">{review.date}</span>
              </div>
              
              <p className="mb-6 text-sm leading-relaxed text-gray-600">
                "{review.content}"
              </p>

              <div className="mb-6 grid grid-cols-2 gap-4 border-l-2 border-gray-100 pl-4 text-xs">
                <div>
                  <span className="block text-gray-500">Fit</span>
                  <span className="font-medium text-[#1A1A1A]">{review.fit}</span>
                </div>
                <div>
                  <span className="block text-gray-500">Size Purchased</span>
                  <span className="font-medium text-[#1A1A1A]">{review.sizeBought}</span>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-[#1A1A1A]">{review.author}</span>
                  {review.verified && (
                    <span className="flex items-center gap-1 text-gray-500">
                      <span className="h-1 w-1 rounded-full bg-black"></span>
                      Verified Buyer
                    </span>
                  )}
                </div>
                <button className="text-xs text-gray-500 underline transition-colors hover:text-black">
                  Helpful ({review.helpfulCount})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
