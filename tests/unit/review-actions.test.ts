import { describe, it, expect, vi } from "vitest";

// Mock supabase server and admin
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: "admin-1",
            app_metadata: { role: "admin" },
          },
        },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { product_id: "prod-1", customer_id: "cust-1" }, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: { product_id: "prod-1", slug: "test-product" }, error: null }),
    }),
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

describe("Review Management & Repository Unit Tests", () => {
  it("should import ReviewRepository without errors", async () => {
    const { ReviewRepository } = await import("@/lib/repositories/catalog/review.repository");
    expect(ReviewRepository).toBeDefined();
    expect(typeof ReviewRepository.approveReview).toBe("function");
    expect(typeof ReviewRepository.revokeReview).toBe("function");
    expect(typeof ReviewRepository.recalculateProductRating).toBe("function");
  });

  it("should call approveReview without throwing", async () => {
    const { ReviewRepository } = await import("@/lib/repositories/catalog/review.repository");
    await expect(ReviewRepository.approveReview("123e4567-e89b-12d3-a456-426614174000")).resolves.not.toThrow();
  });

  it("should call revokeReview without throwing", async () => {
    const { ReviewRepository } = await import("@/lib/repositories/catalog/review.repository");
    await expect(ReviewRepository.revokeReview("123e4567-e89b-12d3-a456-426614174000")).resolves.not.toThrow();
  });

  it("should import catalog review actions", async () => {
    const { approveReviewAction, revokeReviewAction } = await import("@/lib/actions/admin/catalog.actions");
    expect(approveReviewAction).toBeDefined();
    expect(revokeReviewAction).toBeDefined();
  });
});
