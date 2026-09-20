import { describe, it, expect } from "vitest";
import { AlphaSmsService } from "@/lib/services/sms/alpha-sms.service";

describe("Alpha SMS Service", () => {
  describe("Phone Number Normalization", () => {
    it("should normalize standard 11-digit Bangladeshi mobile number (017...)", () => {
      const result = AlphaSmsService.normalizePhoneNumber("01712345678");
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe("8801712345678");
    });

    it("should normalize numbers starting with +880", () => {
      const result = AlphaSmsService.normalizePhoneNumber("+8801812345678");
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe("8801812345678");
    });

    it("should normalize numbers already having 8801...", () => {
      const result = AlphaSmsService.normalizePhoneNumber("8801912345678");
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe("8801912345678");
    });

    it("should strip spaces, dashes, and parentheses", () => {
      const result = AlphaSmsService.normalizePhoneNumber("(017) 12-345 678");
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe("8801712345678");
    });

    it("should reject invalid operator prefixes (e.g. 012)", () => {
      const result = AlphaSmsService.normalizePhoneNumber("01234567890");
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("Invalid Bangladeshi mobile number");
    });

    it("should reject short numbers", () => {
      const result = AlphaSmsService.normalizePhoneNumber("017123");
      expect(result.valid).toBe(false);
    });

    it("should reject non-Bangladeshi international numbers", () => {
      const result = AlphaSmsService.normalizePhoneNumber("+15551234567");
      expect(result.valid).toBe(false);
    });

    it("should reject empty or null inputs", () => {
      const result = AlphaSmsService.normalizePhoneNumber("");
      expect(result.valid).toBe(false);
    });
  });

  describe("SMS Dispatch in Test Mode", () => {
    const originalTestMode = process.env.SMS_TEST_MODE;

    beforeEach(() => {
      process.env.SMS_TEST_MODE = "true";
    });

    afterEach(() => {
      process.env.SMS_TEST_MODE = originalTestMode;
    });

    it("should simulate SMS dispatch and return request ID without consuming balance", async () => {
      const result = await AlphaSmsService.sendSMS({
        to: "01712345678",
        message: "Your order #ORD-1234 has been confirmed.",
        type: "ORDER_CONFIRMATION",
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe("SENT");
      expect(result.phone).toBe("8801712345678");
      expect(result.requestId).toBeTruthy();
    });

    it("should fail gracefully when sending to an invalid phone number", async () => {
      const result = await AlphaSmsService.sendSMS({
        to: "01199999999", // 011 is not valid BD prefix
        message: "Testing invalid phone",
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe("FAILED");
      expect(result.error).toBeTruthy();
    });
  });

  describe("Rich SMS Message Formatting", () => {
    it("should format a detailed, professional message with items, price, address and payment method", () => {
      const msg = AlphaSmsService.formatOrderConfirmationMessage({
        customerName: "Rahim Ahmed",
        orderNumber: "ORD-998877",
        totalAmount: 2500,
        paymentMethod: "COD",
        deliveryAddress: "House 12, Road 4, Sector 7",
        city: "Dhaka",
        items: [
          { name: "Premium Panjabi", quantity: 1 },
          { name: "Silk Pajama", quantity: 1 },
        ],
      });

      expect(msg).toContain("Dear Rahim Ahmed,");
      expect(msg).toContain("Your order #ORD-998877 has been confirmed!");
      expect(msg).toContain("Items: Premium Panjabi (x1), Silk Pajama (x1)");
      expect(msg).toContain("Total: BDT 2,500 (Cash on Delivery)");
      expect(msg).toContain("Delivery: House 12, Road 4, Sector 7, Dhaka");
      expect(msg).toContain("Thank you for shopping with Anchor Fashion.");
    });

    it("should handle single item and online payment", () => {
      const msg = AlphaSmsService.formatOrderConfirmationMessage({
        customerName: "Sadia Islam",
        orderNumber: "AF-123456",
        totalAmount: 1850.5,
        paymentMethod: "SSLCOMMERZ",
        deliveryAddress: "gaibandha",
        city: "gaibandha",
        items: [{ product_name: "Floral Summer Dress", quantity: 2 }],
      });

      expect(msg).toContain("Dear Sadia Islam,");
      expect(msg).toContain("Your order #AF-123456 has been confirmed!");
      expect(msg).toContain("Items: Floral Summer Dress (x2)");
      expect(msg).toContain("Total: BDT 1,851 (Paid Online)");
      expect(msg).toContain("Delivery: gaibandha, gaibandha");
    });

    it("should include invoice link when invoiceUrl is provided", () => {
      const msg = AlphaSmsService.formatOrderConfirmationMessage({
        customerName: "Antor Mia",
        orderNumber: "AF-20260920-LTKF",
        totalAmount: 549.89,
        paymentMethod: "SSLCOMMERZ",
        invoiceUrl: "https://anchorfashion.com/account/orders/2561fe8b-de70-4ecd-a43d-6f9529089b94/invoice",
      });

      expect(msg).toContain("Dear Antor Mia,");
      expect(msg).toContain("Your order #AF-20260920-LTKF has been confirmed!");
      expect(msg).toContain("Invoice: https://anchorfashion.com/account/orders/2561fe8b-de70-4ecd-a43d-6f9529089b94/invoice");
      expect(msg).toContain("Thank you for shopping with Anchor Fashion.");
    });
  });
});
