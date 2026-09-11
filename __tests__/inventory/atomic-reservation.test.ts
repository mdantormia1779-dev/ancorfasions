/**
 * Atomic Inventory Reservation — Concurrency Tests
 *
 * REQUIREMENTS:
 *   These tests require a LIVE Supabase test database, NOT the production DB.
 *   Set the following environment variables before running:
 *
 *     SUPABASE_TEST_URL=https://<test-project>.supabase.co
 *     SUPABASE_TEST_SERVICE_ROLE_KEY=<test-service-role-key>
 *
 *   If either variable is missing, all tests are SKIPPED with a clear message.
 *   No results are faked. No mocks are used for the RPC calls.
 *
 * Run:
 *   npx vitest run __tests__/inventory/atomic-reservation.test.ts
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
// Use createClient without the Database generic so we avoid 'never' type
// inference on tables that don't exist in the generated types yet.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require("@supabase/supabase-js");

// ── Test environment guard ─────────────────────────────────────────────────
const TEST_URL = process.env.SUPABASE_TEST_URL;
const TEST_KEY = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;

const SKIP = !TEST_URL || !TEST_KEY;
const skipMessage =
  "SKIPPED: Set SUPABASE_TEST_URL and SUPABASE_TEST_SERVICE_ROLE_KEY to run concurrency tests against a live test database.";

// ── Test fixtures ──────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabase: any;
let testVariantId: string;
let testWarehouseId: string;
let testInventoryLevelId: string;

/** Helper: create a fresh test inventory level with a given available qty. */
async function seedInventory(quantityAvailable: number): Promise<string> {
  const { data, error } = await supabase
    .from("inventory_levels")
    .insert({
      variant_id: testVariantId,
      warehouse_id: testWarehouseId,
      quantity_available: quantityAvailable,
      quantity_reserved: 0,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Seed failed: ${error.message}`);
  return data.id as string;
}

/** Helper: read current inventory level row. */
async function getInventoryLevel(
  id: string
): Promise<{ quantity_available: number; quantity_reserved: number }> {
  const { data, error } = await supabase
    .from("inventory_levels")
    .select("quantity_available, quantity_reserved")
    .eq("id", id)
    .single();
  if (error) throw new Error(`Read failed: ${error.message}`);
  return data;
}

/** Helper: create a minimal order with items (status pending_payment). */
async function createTestOrder(
  variantId: string,
  quantity: number
): Promise<string> {
  const orderNum = `TEST-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      order_number: orderNum,
      status: "pending_payment",
      grand_total: 0,
      currency: "BDT",
    })
    .select("id")
    .single();

  if (orderErr) throw new Error(`Order create failed: ${orderErr.message}`);

  const { error: itemErr } = await supabase.from("order_items").insert({
    order_id: order.id,
    variant_id: variantId,
    sku: "TEST-SKU",
    product_name: "Test Product",
    unit_price: 100,
    quantity,
    discount: 0,
    tax: 0,
    line_total: quantity * 100,
    inventory_reserved: false,
  });

  if (itemErr) throw new Error(`Order item create failed: ${itemErr.message}`);
  return order.id as string;
}

/** Helper: call reserve_order_inventory RPC. */
async function callReserveRPC(orderId: string, items: object[]) {
  return supabase.rpc("reserve_order_inventory", {
    p_order_id: orderId,
    p_items: JSON.stringify(items),
  });
}

/** Helper: call release_order_inventory RPC. */
async function callReleaseRPC(orderId: string) {
  return supabase.rpc("release_order_inventory", { p_order_id: orderId });
}

// ── Setup ──────────────────────────────────────────────────────────────────
beforeAll(async () => {
  if (SKIP) return;

  supabase = createClient(TEST_URL, TEST_KEY);

  // Create a throwaway test warehouse.
  const { data: wh, error: whErr } = await supabase
    .from("warehouses")
    .insert({ name: `Test Warehouse ${Date.now()}`, is_active: true })
    .select("id")
    .single();
  if (whErr) throw new Error(`Warehouse seed: ${whErr.message}`);
  testWarehouseId = wh.id;

  // We need a real variant. Find the first active one.
  const { data: variant, error: varErr } = await supabase
    .from("variants")
    .select("id")
    .eq("is_active", true)
    .limit(1)
    .single();
  if (varErr)
    throw new Error(
      `Variant lookup: ${varErr.message} — ensure at least one active variant exists`
    );
  testVariantId = variant.id;
});

afterAll(async () => {
  if (SKIP || !supabase) return;
  if (testWarehouseId) {
    await supabase.from("warehouses").delete().eq("id", testWarehouseId);
  }
});

// ── Tests ──────────────────────────────────────────────────────────────────
describe("reserve_order_inventory — concurrency and atomicity", () => {
  it(skipMessage, () => {
    if (SKIP) {
      console.warn(skipMessage);
    }
  });

  it(
    "exactly 1 of 10 concurrent requests succeeds when stock = 1",
    async () => {
      if (SKIP) return;

      testInventoryLevelId = await seedInventory(1);

      const orderIds = await Promise.all(
        Array.from({ length: 10 }, () => createTestOrder(testVariantId, 1))
      );

      const results = await Promise.allSettled(
        orderIds.map((orderId) =>
          callReserveRPC(orderId, [
            {
              variant_id: testVariantId,
              warehouse_id: testWarehouseId,
              quantity: 1,
            },
          ])
        )
      );

      const successes = results.filter(
        (r) =>
          r.status === "fulfilled" &&
          (r as PromiseFulfilledResult<{ error: unknown }>).value.error == null
      );

      console.log(
        `Concurrency test (stock=1, 10 requests): ${successes.length} succeeded`
      );

      expect(successes.length).toBe(1);

      const level = await getInventoryLevel(testInventoryLevelId);
      expect(level.quantity_available).toBeGreaterThanOrEqual(0);
      expect(level.quantity_available + level.quantity_reserved).toBe(1);

      await supabase.from("inventory_levels").delete().eq("id", testInventoryLevelId);
      await supabase.from("orders").delete().in("id", orderIds);
    },
    30_000
  );

  it(
    "total reservation never exceeds stock = 5 under concurrent load (3+3+2)",
    async () => {
      if (SKIP) return;

      testInventoryLevelId = await seedInventory(5);

      const quantities = [3, 3, 2];
      const orderIds = await Promise.all(
        quantities.map((qty) => createTestOrder(testVariantId, qty))
      );

      await Promise.allSettled(
        orderIds.map((orderId, idx) =>
          callReserveRPC(orderId, [
            {
              variant_id: testVariantId,
              warehouse_id: testWarehouseId,
              quantity: quantities[idx],
            },
          ])
        )
      );

      const level = await getInventoryLevel(testInventoryLevelId);

      console.log(
        `Concurrency test (stock=5, 3+3+2): reserved=${level.quantity_reserved}, available=${level.quantity_available}`
      );

      expect(level.quantity_available).toBeGreaterThanOrEqual(0);
      expect(level.quantity_reserved).toBeLessThanOrEqual(5);
      expect(level.quantity_available + level.quantity_reserved).toBe(5);

      await supabase.from("inventory_levels").delete().eq("id", testInventoryLevelId);
      await supabase.from("orders").delete().in("id", orderIds);
    },
    30_000
  );

  it(
    "calling reserve_order_inventory twice for the same order is a no-op (idempotent)",
    async () => {
      if (SKIP) return;

      testInventoryLevelId = await seedInventory(10);
      const orderId = await createTestOrder(testVariantId, 2);

      const items = [
        { variant_id: testVariantId, warehouse_id: testWarehouseId, quantity: 2 },
      ];

      const first = await callReserveRPC(orderId, items);
      expect(first.error).toBeNull();

      const afterFirst = await getInventoryLevel(testInventoryLevelId);
      expect(afterFirst.quantity_reserved).toBe(2);
      expect(afterFirst.quantity_available).toBe(8);

      // Second call is idempotent — should not double-reserve.
      const second = await callReserveRPC(orderId, items);
      expect(second.error).toBeNull();

      const afterSecond = await getInventoryLevel(testInventoryLevelId);
      expect(afterSecond.quantity_reserved).toBe(2);
      expect(afterSecond.quantity_available).toBe(8);

      await supabase.from("inventory_levels").delete().eq("id", testInventoryLevelId);
      await supabase.from("orders").delete().eq("id", orderId);
    },
    15_000
  );

  it(
    "multi-item order rolls back entirely if one item has insufficient stock",
    async () => {
      if (SKIP) return;

      testInventoryLevelId = await seedInventory(5);

      const { data: secondVariant } = await supabase
        .from("variants")
        .select("id")
        .eq("is_active", true)
        .neq("id", testVariantId)
        .limit(1)
        .maybeSingle();

      if (!secondVariant) {
        console.warn(
          "Skipping multi-item rollback test: need at least 2 active variants"
        );
        return;
      }

      const { data: secondLevel } = await supabase
        .from("inventory_levels")
        .insert({
          variant_id: secondVariant.id,
          warehouse_id: testWarehouseId,
          quantity_available: 1,
          quantity_reserved: 0,
        })
        .select("id")
        .single();

      const orderId = await createTestOrder(testVariantId, 3);
      await supabase.from("order_items").insert({
        order_id: orderId,
        variant_id: secondVariant.id,
        sku: "TEST-SKU-2",
        product_name: "Test Product 2",
        unit_price: 200,
        quantity: 5, // Exceeds available stock of 1
        discount: 0,
        tax: 0,
        line_total: 1000,
        inventory_reserved: false,
      });

      const result = await callReserveRPC(orderId, [
        { variant_id: testVariantId, warehouse_id: testWarehouseId, quantity: 3 },
        { variant_id: secondVariant.id, warehouse_id: testWarehouseId, quantity: 5 },
      ]);

      // RPC must fail.
      expect(result.error).not.toBeNull();

      // First item must NOT have been reserved (PostgreSQL rolled back entirely).
      const firstLevel = await getInventoryLevel(testInventoryLevelId);
      expect(firstLevel.quantity_reserved).toBe(0);
      expect(firstLevel.quantity_available).toBe(5);

      const { data: sl } = await supabase
        .from("inventory_levels")
        .select("quantity_available, quantity_reserved")
        .eq("id", secondLevel.id)
        .single();
      expect(sl.quantity_reserved).toBe(0);
      expect(sl.quantity_available).toBe(1);

      await supabase.from("inventory_levels").delete().eq("id", testInventoryLevelId);
      await supabase.from("inventory_levels").delete().eq("id", secondLevel.id);
      await supabase.from("orders").delete().eq("id", orderId);
    },
    20_000
  );

  it(
    "release_order_inventory restores stock correctly and is idempotent",
    async () => {
      if (SKIP) return;

      testInventoryLevelId = await seedInventory(10);
      const orderId = await createTestOrder(testVariantId, 4);

      const reserveResult = await callReserveRPC(orderId, [
        { variant_id: testVariantId, warehouse_id: testWarehouseId, quantity: 4 },
      ]);
      expect(reserveResult.error).toBeNull();

      const afterReserve = await getInventoryLevel(testInventoryLevelId);
      expect(afterReserve.quantity_reserved).toBe(4);
      expect(afterReserve.quantity_available).toBe(6);

      const releaseResult = await callReleaseRPC(orderId);
      expect(releaseResult.error).toBeNull();

      const afterRelease = await getInventoryLevel(testInventoryLevelId);
      expect(afterRelease.quantity_reserved).toBe(0);
      expect(afterRelease.quantity_available).toBe(10);

      // Idempotent second release — must not error or modify stock.
      const releaseAgain = await callReleaseRPC(orderId);
      expect(releaseAgain.error).toBeNull();

      const afterReleaseAgain = await getInventoryLevel(testInventoryLevelId);
      expect(afterReleaseAgain.quantity_available).toBe(10);
      expect(afterReleaseAgain.quantity_reserved).toBe(0);

      await supabase.from("inventory_levels").delete().eq("id", testInventoryLevelId);
      await supabase.from("orders").delete().eq("id", orderId);
    },
    20_000
  );
});
