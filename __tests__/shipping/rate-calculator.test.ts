/**
 * @jest-environment node
 * RateCalculatorService Unit Tests
 */

import { RateCalculatorService } from '@/services/shipping/rate-calculator.service';
import { DeliveryZone, ShippingRate } from '@/types/shipping.types';

const MOCK_ZONE: DeliveryZone = {
  id: 'zone-dhaka-001',
  name: 'Dhaka City',
  code: 'DHAKA',
  description: 'Dhaka metropolitan area',
  districts: ['Dhaka'],
  is_cod_available: true,
  is_active: true,
  estimated_days_min: 1,
  estimated_days_max: 2,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_RATE: ShippingRate = {
  id: 'rate-001',
  zone_id: 'zone-dhaka-001',
  courier_provider_id: null,
  name: 'Dhaka Standard',
  base_rate: 60,
  per_kg_rate: 10,
  free_shipping_above: 1000,
  min_weight_kg: 0,
  max_weight_kg: null,
  is_cod_rate: false,
  cod_charge: 30,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_COD_RATE: ShippingRate = {
  ...MOCK_RATE,
  id: 'rate-002',
  is_cod_rate: true,
  cod_charge: 30,
};

// Mock the repository
jest.mock('@/repositories/delivery-zone.repository', () => ({
  DeliveryZoneRepository: jest.fn().mockImplementation(() => ({
    getZoneByAddress: jest.fn().mockResolvedValue(MOCK_ZONE),
    getZoneById: jest.fn().mockResolvedValue(MOCK_ZONE),
    getShippingRates: jest.fn().mockResolvedValue([MOCK_RATE, MOCK_COD_RATE]),
    getAllActiveZones: jest.fn().mockResolvedValue([MOCK_ZONE]),
    calculateCharge: jest.fn().mockResolvedValue(70),
  })),
}));

describe('RateCalculatorService', () => {
  let service: RateCalculatorService;

  beforeEach(() => {
    service = new RateCalculatorService();
  });

  it('should resolve zone by district', async () => {
    const zone = await service.getZoneByAddress('Dhaka');
    expect(zone).toBeDefined();
    expect(zone!.code).toBe('DHAKA');
  });

  it('should calculate charge for non-COD shipment', async () => {
    const calc = await service.calculateShippingCharge('zone-dhaka-001', 0.5, 0, false);
    expect(calc.baseRate).toBe(60);
    expect(calc.weightCharge).toBe(5); // 0.5kg × 10
    expect(calc.codCharge).toBe(0);
    expect(calc.total).toBe(65);
    expect(calc.isFreeShipping).toBe(false);
  });

  it('should apply free shipping when order value exceeds threshold', async () => {
    const calc = await service.calculateShippingCharge('zone-dhaka-001', 0.5, 1500, false);
    expect(calc.isFreeShipping).toBe(true);
    expect(calc.total).toBe(0);
  });

  it('should add COD charge for COD shipments', async () => {
    const calc = await service.calculateShippingCharge('zone-dhaka-001', 0.5, 0, true);
    expect(calc.codCharge).toBe(30);
    expect(calc.total).toBeGreaterThan(0);
  });

  it('should detect COD availability from zone', async () => {
    const available = await service.isCODAvailable('zone-dhaka-001');
    expect(available).toBe(true);
  });

  it('should detect free shipping eligibility', async () => {
    const isFree = await service.isFreeShipping('zone-dhaka-001', 1200, false);
    expect(isFree).toBe(true);
  });

  it('should return active zones', async () => {
    const zones = await service.getActiveZones();
    expect(zones.length).toBeGreaterThan(0);
    expect(zones[0].is_active).toBe(true);
  });
});
