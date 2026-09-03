import { Search, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReviewRepository } from "@/lib/repositories/catalog/review.repository";

export const metadata = {
  title: "Reviews | Catalog | Anchor Fashion Enterprise",
};

export default async function AdminReviewsPage() {
  const reviews = await ReviewRepository.getReviews();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Reviews</h2>
          <p className="text-muted-foreground mt-1">
            Monitor and manage customer reviews across all products.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reviews..."
            className="w-full bg-card pl-8"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border bg-card text-card-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer ID</TableHead>
              <TableHead>Product ID</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p>No reviews found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review: any) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium text-xs max-w-[150px] truncate">
                    {review.customer ? `${review.customer.first_name || ""} ${review.customer.last_name || ""}`.trim() : review.customer_id || "Anonymous"}
                  </TableCell>
                  <TableCell className="text-xs max-w-[150px] truncate">
                    {review.product?.name || review.product_id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {review.rating} / 5
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {review.review_text}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        review.is_approved
                          ? "default"
                          : "secondary"
                      }
                    >
                      {review.is_approved ? "APPROVED" : "PENDING"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
