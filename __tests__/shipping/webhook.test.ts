/**
 * @jest-environment node
 * Courier Webhook Route Tests
 */

import { POST as providerWebhookPost } from "@/app/api/webhooks/courier/[provider]/route";
import { POST as genericWebhookPost } from "@/app/api/webhooks/courier/route";

// Mock the gateway and shipping service
jest.mock("@/services/courier/courier-gateway.service", () => ({
  CourierGatewayService: {
    processWebhook: jest.fn().mockResolvedValue({
      success: true,
      data: {
        trackingNumber: "SBOX-TEST",
        consignmentId: "CSID-TEST",
        status: "delivered",
        statusDescription: "Delivered",
        location: "Dhaka",
        eventTime: new Date().toISOString(),
      },
    }),
  },
}));

jest.mock("@/services/shipping/shipping.service", () => ({
  ShippingService: jest.fn().mockImplementation(() => ({
    processWebhookEvent: jest.fn().mockResolvedValue(undefined),
  })),
}));

function makeRequest(
  body: object,
  url = "http://localhost/api/webhooks/courier"
) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Provider-specific Webhook Route (/api/webhooks/courier/[provider])", () => {
  it("should return 200 for valid steadfast webhook", async () => {
    const req = makeRequest({
      tracking_code: "SBOX-TEST",
      status: "Delivered",
    });
    const res = await providerWebhookPost(req, {
      params: Promise.resolve({ provider: "sandbox" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
  });

  it("should return 400 for invalid JSON", async () => {
    const req = new Request("http://localhost/api/webhooks/courier/sandbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await providerWebhookPost(req, {
      params: Promise.resolve({ provider: "sandbox" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("Generic Webhook Route (/api/webhooks/courier?provider=)", () => {
  it("should return 400 if provider is missing", async () => {
    const req = makeRequest(
      { tracking_code: "TEST" },
      "http://localhost/api/webhooks/courier"
    );
    const res = await genericWebhookPost(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/provider not specified/i);
  });

  it("should process webhook with provider param", async () => {
    const req = makeRequest(
      { tracking_code: "SBOX-TEST", status: "Delivered" },
      "http://localhost/api/webhooks/courier?provider=sandbox"
    );
    const res = await genericWebhookPost(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
  });
});
