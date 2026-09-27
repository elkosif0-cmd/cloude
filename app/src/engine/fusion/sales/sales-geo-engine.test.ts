import { describe, expect, it } from 'vitest';
import { aggregate, CITIES, cityOf, districtSpots, heat, project, REGIONS } from './sales-geo-engine';

describe('where the customers are', () => {
  it('knows the thirteen regions and names a city\'s region whatever its spelling', () => {
    expect(REGIONS).toHaveLength(13);
    expect(CITIES.every((c) => REGIONS.some((r) => r.key === c.region))).toBe(true);
    expect(cityOf('جده')!.region).toBe('makkah');
    expect(cityOf('Jeddah')!.ar).toBe('جدة');
    expect(cityOf('الاحساء')!.region).toBe('eastern');
    expect(cityOf('نيويورك')).toBeNull();
  });
  it('places Jeddah west of Riyadh and Dammam east, on the plane', () => {
    const j = project(21.49, 39.19), r = project(24.71, 46.68), d = project(26.43, 50.1);
    expect(j.x).toBeLessThan(r.x);
    expect(d.x).toBeGreaterThan(r.x);
    expect(j.y).toBeGreaterThan(r.y);
  });
  it('adds the orders up by region, city and district, keeping unknown cities apart', () => {
    const a = aggregate([
      { city: 'جدة', district: 'الروضة', customer: 'a', amount: 100 }, { city: 'جده', district: 'الروضة', customer: 'b', amount: 50 },
      { city: 'مكة المكرمة', district: 'الشوقية', customer: 'a', amount: 30 }, { city: 'الرياض', district: 'العليا', customer: 'c', amount: 200 }, { city: 'دبي', amount: 20 },
    ]);
    expect(a.regions.map((r) => [r.key, r.amount, r.orders])).toEqual([['riyadh', 200, 1], ['makkah', 180, 3]]);
    expect(a.cities[1]).toMatchObject({ ar: 'جدة', amount: 150, customers: 2 });
    expect(a.districts.find((d) => d.city === 'جدة')).toMatchObject({ ar: 'الروضة', orders: 2 });
    expect(a.unknown[0]).toMatchObject({ ar: 'دبي', amount: 20 });
    expect(a.total).toBe(400);
  });
  it('spreads districts around their city and grades the heat', () => {
    const s = districtSpots(5);
    expect(new Set(s.map((p) => p.dx + ',' + p.dy)).size).toBe(5);
    expect([heat(0, 10), heat(1, 10), heat(10, 10)]).toEqual([0, 1, 5]);
  });
});
