/**
 * @jest-environment node
 * Courier Registry Unit Tests
 */

import { CourierRegistry } from '@/services/courier/courier-registry';
import { SandboxProvider } from '@/services/courier/providers/sandbox.provider';
import { CourierProviderCode } from '@/types/shipping.types';

// Patch the admin client to avoid DB calls in unit tests
jest.mock('@/lib/supabase/admin-client', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
  }),
}));

describe('CourierRegistry', () => {
  let registry: CourierRegistry;

  beforeEach(() => {
    registry = CourierRegistry.getInstance();
    registry.reset();
  });

  afterEach(() => {
    registry.reset();
  });

  it('should return a singleton instance', () => {
    const a = CourierRegistry.getInstance();
    const b = CourierRegistry.getInstance();
    expect(a).toBe(b);
  });

  it('should register a provider manually', async () => {
    const sandbox = new SandboxProvider({}, true);
    registry.register('sandbox', sandbox);
    const has = await registry.has('sandbox');
    expect(has).toBe(true);
  });

  it('should return the registered provider', async () => {
    const sandbox = new SandboxProvider({}, true);
    registry.register('sandbox', sandbox);
    const provider = await registry.get('sandbox');
    expect(provider.id).toBe('sandbox');
  });

  it('should throw for unregistered provider', async () => {
    await expect(registry.get('steadfast')).rejects.toThrow(/not registered/i);
  });

  it('should return all active providers', async () => {
    const sandbox = new SandboxProvider({}, true);
    registry.register('sandbox', sandbox);
    const active = await registry.getActive();
    expect(active.length).toBeGreaterThanOrEqual(1);
    expect(active[0].id).toBe('sandbox');
  });

  it('should return fallback provider', async () => {
    const sandbox = new SandboxProvider({}, true);
    registry.register('sandbox', sandbox);
    registry.setFallback('sandbox');
    const fallback = await registry.getFallback();
    expect(fallback).not.toBeNull();
    expect(fallback!.id).toBe('sandbox');
  });

  it('should return null fallback if none set', async () => {
    const fallback = await registry.getFallback();
    expect(fallback).toBeNull();
  });
});
