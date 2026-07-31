import { describe, it, expect } from "vitest";
import {
  createSupportTicketSchema,
  createTicketAttachmentSchema,
} from "../../schemas/support.schema";

describe("Support Schema Validation", () => {
  describe("Ticket Schema", () => {
    it("should validate a basic ticket", () => {
      const data = {
        subject: "Order missing",
        category: "Shipping",
      };
      const result = createSupportTicketSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe("medium"); // Default priority
      }
    });

    it("should fail without subject or category", () => {
      const data = {
        priority: "high",
      };
      const result = createSupportTicketSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("Attachment Schema", () => {
    it("should validate attachment with ticket_id", () => {
      const data = {
        ticket_id: "123e4567-e89b-12d3-a456-426614174000",
        file_name: "screenshot.png",
        file_url: "https://example.com/screenshot.png",
      };
      const result = createTicketAttachmentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should fail if no association is provided", () => {
      const data = {
        file_name: "screenshot.png",
        file_url: "https://example.com/screenshot.png",
      };
      const result = createTicketAttachmentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
