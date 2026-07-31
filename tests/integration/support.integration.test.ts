import { describe, it, expect, vi } from "vitest";
import { SupportService } from "../../services/support.service";

// Mock dependencies
vi.mock("../../repositories/support.repository", () => ({
  supportRepository: {
    createTicket: vi
      .fn()
      .mockImplementation((data) => Promise.resolve({ id: "1", ...data })),
    updateTicket: vi
      .fn()
      .mockImplementation((id, data) => Promise.resolve({ id, ...data })),
  },
}));

describe("Support Service Integration", () => {
  it("should calculate SLA breach on ticket creation", async () => {
    const supportService = new SupportService();
    const result = await supportService.createTicket({
      subject: "Critical Issue",
      category: "Billing",
      priority: "critical",
    });

    expect(result).toHaveProperty("sla_breach_at");
    // SLA breach should be approximately 1 hour from now
    const breachTime = new Date(result.sla_breach_at!);
    const now = new Date();
    const diffHours = (breachTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBeCloseTo(1, 0);
  });
});
