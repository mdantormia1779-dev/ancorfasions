import { describe, it, expect, vi, beforeEach } from "vitest";
import { CustomerRepository } from "@/lib/repositories/crm/customer.repository";

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => {
  return {
    createClient: vi.fn(),
    createAdminClient: vi.fn().mockImplementation(() => {
      return {
        from: vi.fn((tableName: string) => {
          if (tableName === "crm_customers") {
            return {
              select: vi.fn().mockImplementation((cols: string) => {
                return {
                  in: vi.fn().mockResolvedValue({ data: [], error: null }),
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                  }),
                  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                };
              }),
            };
          }
          if (tableName === "customer_profiles") {
            return {
              select: vi.fn().mockImplementation((cols: string, opts?: any) => {
                if (opts?.count === "exact") {
                  return {
                    gte: vi.fn().mockResolvedValue({ count: 2, error: null }),
                    then: (resolve: any) => resolve({ count: 5, error: null }),
                  };
                }
                return {
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({
                      data: [
                        { id: "cust-1", first_name: "Alice", last_name: "Smith", email: "alice@example.com", created_at: "2026-01-01" },
                        { id: "cust-2", first_name: "Bob", last_name: "Jones", email: "bob@example.com", created_at: "2026-02-01" }
                      ],
                      error: null,
                    }),
                  }),
                  then: (resolve: any) => resolve({
                    data: [
                      { id: "cust-1", first_name: "Alice", last_name: "Smith", email: "alice@example.com", created_at: "2026-01-01" },
                      { id: "cust-2", first_name: "Bob", last_name: "Jones", email: "bob@example.com", created_at: "2026-02-01" }
                    ],
                    error: null,
                  }),
                };
              }),
            };
          }
          if (tableName === "orders") {
            return {
              select: vi.fn().mockResolvedValue({
                data: [
                  { customer_id: "cust-1", grand_total: 250 },
                  { customer_id: "cust-1", grand_total: 100 },
                ],
                error: null,
              }),
            };
          }
          if (tableName === "loyalty_accounts") {
            return {
              select: vi.fn().mockImplementation((cols: string, opts?: any) => {
                if (opts?.count === "exact") {
                  return Promise.resolve({ count: 3, error: null });
                }
                return Promise.resolve({
                  data: [{ tier: "GOLD" }, { tier: "SILVER" }, { tier: "VIP" }],
                  error: null,
                });
              }),
            };
          }
          if (tableName === "profiles") {
            return {
              select: vi.fn().mockResolvedValue({ count: 5, error: null }),
            };
          }
          return {
            select: vi.fn().mockResolvedValue({ data: [], error: null }),
          };
        }),
      };
    }),
  };
});

describe("CustomerRepository CRM Methods", () => {
  let repo: CustomerRepository;

  beforeEach(() => {
    repo = new CustomerRepository();
  });

  it("should fetch customer profiles without requesting customer_lifecycle_stage on customer_profiles", async () => {
    const customers = await repo.getCustomerProfiles(5);
    expect(customers).toBeDefined();
    expect(customers.length).toBe(2);
    expect(customers[0].first_name).toBe("Alice");
    expect(customers[0].customer_lifecycle_stage).toBeDefined();
    expect(customers[0].health_score).toBeGreaterThanOrEqual(0);
  });

  it("should compute customer segments gracefully", async () => {
    const segments = await repo.getCustomerSegments();
    expect(segments).toBeDefined();
    expect(Array.isArray(segments)).toBe(true);
    expect(segments.length).toBe(6);
    const stages = segments.map((s) => s.stage);
    expect(stages).toContain("PROSPECT");
    expect(stages).toContain("REPEAT_CUSTOMER");
  });

  it("should aggregate loyalty stats correctly", async () => {
    const loyalty = await repo.getLoyaltyStats();
    expect(loyalty).toBeDefined();
    expect(loyalty.length).toBe(4);
    const goldTier = loyalty.find((l) => l.tier === "GOLD");
    expect(goldTier?.customerCount).toBe(1);
  });

  it("should calculate CRM summary stats without crashing", async () => {
    const summary = await repo.getCRMSummary();
    expect(summary).toBeDefined();
    expect(summary.totalCustomers).toBeGreaterThanOrEqual(0);
  });
});
