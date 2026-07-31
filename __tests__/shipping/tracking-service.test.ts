/**
 * @jest-environment node
 * TrackingService Unit Tests
 */

import { TrackingService } from "@/services/shipping/tracking.service";
import { Shipment, ShipmentTrackingEvent } from "@/types/shipping.types";

const NOW = new Date().toISOString();

const MOCK_SHIPMENT: Shipment = {
  id: "shipment-001",
  shipment_number: "SHIP-001",
  order_id: "order-001",
  courier_provider_code: "sandbox",
  status: "in_transit",
  tracking_number: "SBOX-12345",
  consignment_id: "CSID-12345",
  label_url: null,
  recipient_name: "Test User",
  recipient_phone: "01700000000",
  recipient_address: "Test Address, Dhaka",
  recipient_city: "Dhaka",
  recipient_district: "Dhaka",
  delivery_zone_id: null,
  is_cod: false,
  cod_amount: 0,
  shipping_charge: 60,
  weight_kg: 0.5,
  special_instructions: null,
  failure_reason: null,
  provider_status: "in_transit",
  estimated_delivery_date: null,
  label_generated_at: null,
  created_at: NOW,
  updated_at: NOW,
  created_by: null,
  updated_by: null,
  pickup_requested_at: NOW,
  pickup_confirmed_at: NOW,
  picked_up_at: NOW,
  in_transit_at: NOW,
  out_for_delivery_at: null,
  delivered_at: null,
  delivery_failed_at: null,
  returned_at: null,
  cancelled_at: null,
} as unknown as Shipment;

const MOCK_EVENTS: ShipmentTrackingEvent[] = [
  {
    id: "evt-001",
    shipment_id: "shipment-001",
    tracking_number: "SBOX-12345",
    status: "created",
    status_description: "Shipment Created",
    location: "Warehouse",
    event_time: NOW,
    provider_raw: {},
    created_at: NOW,
  },
  {
    id: "evt-002",
    shipment_id: "shipment-001",
    tracking_number: "SBOX-12345",
    status: "in_transit",
    status_description: "In Transit",
    location: "Dhaka Hub",
    event_time: NOW,
    provider_raw: {},
    created_at: NOW,
  },
];

jest.mock("@/repositories/shipment.repository", () => ({
  ShipmentRepository: jest.fn().mockImplementation(() => ({
    getShipmentByTrackingNumber: jest.fn().mockResolvedValue(MOCK_SHIPMENT),
    getShipmentById: jest.fn().mockResolvedValue(MOCK_SHIPMENT),
    getTrackingEvents: jest.fn().mockResolvedValue(MOCK_EVENTS),
    upsertTrackingEvent: jest.fn().mockResolvedValue(undefined),
    updateShipment: jest.fn().mockResolvedValue(MOCK_SHIPMENT),
  })),
}));

jest.mock("@/services/courier/courier-gateway.service", () => ({
  CourierGatewayService: {
    trackShipment: jest.fn().mockResolvedValue({
      success: true,
      data: {
        status: "delivered",
        statusDescription: "Delivered",
        estimatedDelivery: null,
        updates: [
          {
            status: "delivered",
            statusDescription: "Delivered",
            location: "Recipient",
            timestamp: new Date().toISOString(),
          },
        ],
      },
    }),
  },
}));

describe("TrackingService", () => {
  let service: TrackingService;

  beforeEach(() => {
    service = new TrackingService();
  });

  it("should get tracking timeline by tracking number", async () => {
    const timeline = await service.getTrackingTimeline(
      "SBOX-12345",
      "tracking_number"
    );
    expect(timeline).not.toBeNull();
    expect(timeline!.trackingNumber).toBe("SBOX-12345");
    expect(timeline!.currentStatus).toBe("in_transit");
  });

  it("should build correct lifecycle events", async () => {
    const timeline = await service.getTrackingTimeline(
      "SBOX-12345",
      "tracking_number"
    );
    const completedEvents = timeline!.events.filter((e) => e.isCompleted);
    expect(completedEvents.length).toBeGreaterThan(0);
  });

  it("should have a current event", async () => {
    const timeline = await service.getTrackingTimeline(
      "SBOX-12345",
      "tracking_number"
    );
    const currentEvent = timeline!.events.find((e) => e.isCurrent);
    expect(currentEvent).toBeDefined();
    expect(currentEvent!.status).toBe("in_transit");
  });

  it("should refresh tracking from provider", async () => {
    const timeline = await service.refreshTracking("shipment-001");
    expect(timeline).not.toBeNull();
  });

  it("should return null for unknown tracking number", async () => {
    const {
      ShipmentRepository,
    } = require("@/repositories/shipment.repository");
    ShipmentRepository.mockImplementation(() => ({
      getShipmentByTrackingNumber: jest.fn().mockResolvedValue(null),
      getShipmentById: jest.fn().mockResolvedValue(null),
      getTrackingEvents: jest.fn().mockResolvedValue([]),
      upsertTrackingEvent: jest.fn(),
      updateShipment: jest.fn(),
    }));

    const s = new TrackingService();
    const timeline = await s.getTrackingTimeline(
      "UNKNOWN-999",
      "tracking_number"
    );
    expect(timeline).toBeNull();
  });
});
