import { describe, it, expect } from "vitest";
import { CourierFactory } from "@/lib/couriers/courier.factory";
import { PathaoCourierProvider } from "@/lib/couriers/pathao";
import { SteadfastCourierProvider } from "@/lib/couriers/steadfast";
import { SandboxCourierProvider } from "@/lib/couriers/sandbox";
import { mapPathaoStatus } from "@/lib/couriers/pathao/mapper";
import { mapSteadfastStatus } from "@/lib/couriers/steadfast/mapper";
import { handlePathaoWebhook } from "@/lib/couriers/pathao/webhook";
import { handleSteadfastWebhook } from "@/lib/couriers/steadfast/webhook";
import { sanitizeLogData } from "@/lib/couriers/logger";
import {
  encrypt,
  decrypt,
  encryptCredentialsObject,
  decryptCredentialsObject,
  maskCredentialsObject,
  isEncryptedValue,
} from "@/utils/encryption.util";
import { CourierNotConfiguredError } from "@/lib/couriers/errors";

describe("Courier Integrations Suite", () => {
  describe("1. Credential Encryption & Masking (AES-256-GCM)", () => {
    it("should encrypt and decrypt strings correctly", () => {
      const plaintext = "super_secret_api_key_12345";
      const encrypted = encrypt(plaintext);

      expect(encrypted).not.toEqual(plaintext);
      expect(isEncryptedValue(encrypted)).toBe(true);

      const decrypted = decrypt(encrypted);
      expect(decrypted).toEqual(plaintext);
    });

    it("should encrypt credentials object and decrypt back to plaintext", () => {
      const rawCreds = {
        apiKey: "steadfast_api_key_abc",
        secretKey: "steadfast_secret_xyz",
      };

      const encryptedCreds = encryptCredentialsObject(rawCreds);
      expect(isEncryptedValue(encryptedCreds.apiKey)).toBe(true);
      expect(isEncryptedValue(encryptedCreds.secretKey)).toBe(true);

      const decryptedCreds = decryptCredentialsObject(encryptedCreds);
      expect(decryptedCreds.apiKey).toBe(rawCreds.apiKey);
      expect(decryptedCreds.secretKey).toBe(rawCreds.secretKey);
    });

    it("should safely mask credentials for UI display", () => {
      const rawCreds = {
        apiKey: "sf_key_9X21",
        shortKey: "123",
      };

      const masked = maskCredentialsObject(rawCreds);
      expect(masked.apiKey).toBe("••••••••9X21");
      expect(masked.shortKey).toBe("••••••••");
    });
  });

  describe("2. Courier Factory Resolution", () => {
    it("should instantiate PathaoCourierProvider with decrypted credentials", () => {
      const provider = CourierFactory.getProvider("pathao", {
        clientId: "cid_123",
        clientSecret: "csec_456",
        username: "merchant@example.com",
        password: "password123",
      });

      expect(provider).toBeInstanceOf(PathaoCourierProvider);
      expect(provider.code).toBe("pathao");
      expect(provider.isConfigured()).toBe(true);
    });

    it("should instantiate SteadfastCourierProvider with decrypted credentials", () => {
      const provider = CourierFactory.getProvider("steadfast", {
        apiKey: "api_key_123",
        secretKey: "secret_456",
      });

      expect(provider).toBeInstanceOf(SteadfastCourierProvider);
      expect(provider.code).toBe("steadfast");
      expect(provider.isConfigured()).toBe(true);
    });

    it("should instantiate SandboxCourierProvider with decrypted credentials", () => {
      const provider = CourierFactory.getProvider("sandbox", {});

      expect(provider).toBeInstanceOf(SandboxCourierProvider);
      expect(provider.code).toBe("sandbox");
      expect(provider.isConfigured()).toBe(true);
    });

    it("should report unconfigured if credentials are empty for pathao", () => {
      const provider = CourierFactory.getProvider("pathao", {});
      expect(provider.isConfigured()).toBe(false);
    });
  });

  describe("3. Pathao Provider & Status Mapper", () => {
    it("should map Pathao raw statuses to canonical shipment statuses", () => {
      expect(mapPathaoStatus("Pending")).toBe("created");
      expect(mapPathaoStatus("Picked_up")).toBe("picked_up");
      expect(mapPathaoStatus("In_Transit")).toBe("in_transit");
      expect(mapPathaoStatus("Delivered")).toBe("delivered");
      expect(mapPathaoStatus("Return")).toBe("returned_to_origin");
      expect(mapPathaoStatus("Cancelled")).toBe("cancelled");
      expect(mapPathaoStatus("NonExistentStatus")).toBe("unknown");
    });

    it("should return not_configured health check if credentials missing", async () => {
      const provider = new PathaoCourierProvider({
        credentials: { clientId: "", clientSecret: "", username: "", password: "" },
      });

      const health = await provider.healthCheck();
      expect(health.status).toBe("not_configured");
      expect(health.responseTime).toBe(0);
    });

    it("should throw CourierNotConfiguredError when creating shipment without credentials", async () => {
      const provider = new PathaoCourierProvider({
        credentials: { clientId: "", clientSecret: "", username: "", password: "" },
      });

      await expect(
        provider.createShipment({
          orderId: "ord-1",
          invoiceNumber: "INV-1",
          recipientName: "Test Customer",
          recipientPhone: "01711111111",
          recipientAddress: "Dhaka, Bangladesh",
          weightKg: 1,
          codAmount: 500,
          isCOD: true,
        })
      ).rejects.toThrow(CourierNotConfiguredError);
    });
  });

  describe("4. Steadfast Provider & Status Mapper", () => {
    it("should map Steadfast statuses to canonical shipment statuses", () => {
      expect(mapSteadfastStatus("in_review")).toBe("created");
      expect(mapSteadfastStatus("pending")).toBe("created");
      expect(mapSteadfastStatus("pickedup")).toBe("picked_up");
      expect(mapSteadfastStatus("in_transit")).toBe("in_transit");
      expect(mapSteadfastStatus("delivered")).toBe("delivered");
      expect(mapSteadfastStatus("cancelled")).toBe("cancelled");
      expect(mapSteadfastStatus("return")).toBe("returned_to_origin");
    });

    it("should return not_configured health check if credentials missing", async () => {
      const provider = new SteadfastCourierProvider({
        credentials: { apiKey: "", secretKey: "" },
      });

      const health = await provider.healthCheck();
      expect(health.status).toBe("not_configured");
      expect(health.responseTime).toBe(0);
    });

    it("should throw CourierNotConfiguredError when creating shipment without credentials", async () => {
      const provider = new SteadfastCourierProvider({
        credentials: { apiKey: "", secretKey: "" },
      });

      await expect(
        provider.createShipment({
          orderId: "ord-2",
          invoiceNumber: "INV-2",
          recipientName: "Test Customer",
          recipientPhone: "01711111111",
          recipientAddress: "Chittagong, Bangladesh",
          weightKg: 1,
          codAmount: 0,
          isCOD: false,
        })
      ).rejects.toThrow(CourierNotConfiguredError);
    });
  });

  describe("5. Webhook Handlers", () => {
    it("should parse Pathao webhook payload into standard WebhookResult", async () => {
      const payload = {
        consignment_id: "PATHAO-12345",
        order_status: "Delivered",
        updated_at: "2026-09-22T10:00:00Z",
      };

      const result = await handlePathaoWebhook(payload);
      expect(result.success).toBe(true);
      expect(result.consignmentId).toBe("PATHAO-12345");
      expect(result.status).toBe("delivered");
    });

    it("should parse Steadfast webhook payload into standard WebhookResult", async () => {
      const payload = {
        consignment_id: 98765,
        status: "delivered",
        updated_at: "2026-09-22T11:00:00Z",
      };

      const result = await handleSteadfastWebhook(payload);
      expect(result.success).toBe(true);
      expect(result.consignmentId).toBe("98765");
      expect(result.status).toBe("delivered");
    });
  });

  describe("6. Log Sanitization", () => {
    it("should strip sensitive credentials from log payloads", () => {
      const rawPayload = {
        apiKey: "secret_api_key_123",
        password: "plain_password",
        client_secret: "hidden_secret",
        recipient_name: "Customer Name",
        amount: 1500,
      };

      const sanitized = sanitizeLogData(rawPayload) as any;
      expect(sanitized.apiKey).toBe("••••••••");
      expect(sanitized.password).toBe("••••••••");
      expect(sanitized.client_secret).toBe("••••••••");
      expect(sanitized.recipient_name).toBe("Customer Name");
      expect(sanitized.amount).toBe(1500);
    });
  });

  describe("7. Sandbox Provider Lifecycle & Testing", () => {
    it("should return healthy status for sandbox healthCheck", async () => {
      const provider = new SandboxCourierProvider();
      const health = await provider.healthCheck();

      expect(health.status).toBe("healthy");
      expect(health.responseTime).toBeGreaterThanOrEqual(0);
      expect(health.message).toContain("Sandbox courier is connected");
    });

    it("should create shipment successfully in sandbox mode", async () => {
      const provider = new SandboxCourierProvider();
      const result = await provider.createShipment({
        orderId: "ord-sandbox-123",
        invoiceNumber: "INV-SBOX-101",
        recipientName: "Test Buyer",
        recipientPhone: "01800000000",
        recipientAddress: "Mirpur 10, Dhaka",
        recipientCity: "Dhaka",
        weightKg: 1.5,
        codAmount: 1200,
        isCOD: true,
      });

      expect(result.success).toBe(true);
      expect(result.courierCode).toBe("sandbox");
      expect(result.trackingCode).toContain("SBOX-");
      expect(result.consignmentId).toContain("CSID-");
      expect(result.deliveryFee).toBeGreaterThan(0);
    });

    it("should retrieve mock tracking events for sandbox shipment", async () => {
      const provider = new SandboxCourierProvider();
      const tracking = await provider.getTracking("SBOX-12345");

      expect(tracking.success).toBe(true);
      expect(tracking.trackingCode).toBe("SBOX-12345");
      expect(tracking.currentStatusNormalized).toBe("in_transit");
      expect(tracking.events.length).toBeGreaterThanOrEqual(1);
    });

    it("should cancel shipment and handle simulated webhook in sandbox", async () => {
      const provider = new SandboxCourierProvider();
      const cancelRes = await provider.cancelShipment("CSID-SBOX-12345");
      expect(cancelRes.success).toBe(true);

      const webhookRes = await provider.handleWebhook({
        tracking_code: "SBOX-12345",
        status: "delivered",
      });
      expect(webhookRes.success).toBe(true);
      expect(webhookRes.status).toBe("delivered");
    });
  });
});

