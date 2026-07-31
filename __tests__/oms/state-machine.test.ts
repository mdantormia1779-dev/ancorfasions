import { OrderStatusService } from "@/lib/services/oms/order-status.service";
import { OrderStatus } from "@/types/oms";

describe("OrderStatusService - State Machine", () => {
  let service: OrderStatusService;

  beforeEach(() => {
    service = new OrderStatusService();
  });

  describe("canTransition()", () => {
    it("should allow valid transitions", () => {
      expect(service.canTransition("draft", "pending_payment")).toBe(true);
      expect(service.canTransition("paid", "confirmed")).toBe(true);
      expect(service.canTransition("shipped", "delivered")).toBe(true);
    });

    it("should reject invalid transitions", () => {
      expect(service.canTransition("draft", "shipped")).toBe(false);
      expect(service.canTransition("paid", "draft")).toBe(false);
      expect(service.canTransition("cancelled", "paid")).toBe(false);
    });

    it("should allow Super Admin to override any transition", () => {
      expect(service.canTransition("draft", "shipped", "super_admin")).toBe(
        true
      );
      expect(service.canTransition("cancelled", "paid", "super_admin")).toBe(
        true
      );
    });
  });

  describe("getAllowedNextStates()", () => {
    it("should return correct next states for draft", () => {
      const states = service.getAllowedNextStates("draft");
      expect(states).toContain("pending_payment");
      expect(states).toContain("cancelled");
      expect(states.length).toBe(2);
    });

    it("should return empty array for terminal states", () => {
      const states = service.getAllowedNextStates("cancelled");
      expect(states.length).toBe(0);

      const statesRefunded = service.getAllowedNextStates("refunded");
      expect(statesRefunded.length).toBe(0);
    });
  });
});
