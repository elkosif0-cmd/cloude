/* Where the customers are — the Kingdom's regions, their cities and the cities' districts, weighted by orders.
   The map is schematic: an outline of the Kingdom and the real coordinates (latitude, longitude) of the thirteen
   regions' seats and the main cities, projected on a plane. Districts have no geometry in the orders, so on the
   map they are placed around their city (a deterministic spiral), and the lists give their exact figures.
   aggregate() reads the orders (city, district, customer, amount) and names each city's region, whatever the
   spelling («جده»، «جدة»، «Jeddah»). */

export type Region = { key: string; ar: string; seat: string; lat: number; lon: number };
export const REGIONS: Region[] = [
  { key: 'riyadh', ar: 'منطقة الرياض', seat: 'الرياض', lat: 24.71, lon: 46.68 },
  { key: 'makkah', ar: 'منطقة مكة المكرمة', seat: 'مكة المكرمة', lat: 21.39, lon: 39.86 },
  { key: 'madinah', ar: 'منطقة المدينة المنورة', seat: 'المدينة المنورة', lat: 24.47, lon: 39.61 },
  { key: 'qassim', ar: 'منطقة القصيم', seat: 'بريدة', lat: 26.33, lon: 43.97 },
  { key: 'eastern', ar: 'المنطقة الشرقية', seat: 'الدمام', lat: 26.43, lon: 50.1 },
  { key: 'asir', ar: 'منطقة عسير', seat: 'أبها', lat: 18.22, lon: 42.51 },
  { key: 'tabuk', ar: 'منطقة تبوك', seat: 'تبوك', lat: 28.38, lon: 36.57 },
  { key: 'hail', ar: 'منطقة حائل', seat: 'حائل', lat: 27.52, lon: 41.7 },
  { key: 'northern', ar: 'منطقة الحدود الشمالية', seat: 'عرعر', lat: 30.98, lon: 41.04 },
  { key: 'jazan', ar: 'منطقة جازان', seat: 'جازان', lat: 16.89, lon: 42.55 },
  { key: 'najran', ar: 'منطقة نجران', seat: 'نجران', lat: 17.49, lon: 44.13 },
  { key: 'baha', ar: 'منطقة الباحة', seat: 'الباحة', lat: 20.01, lon: 41.47 },
  { key: 'jouf', ar: 'منطقة الجوف', seat: 'سكاكا', lat: 29.97, lon: 40.21 },
];
export type City = { ar: string; region: string; lat: number; lon: number; aliases: string[] };
const C = (ar: string, region: string, lat: number, lon: number, ...aliases: string[]): City => ({ ar, region, lat, lon, aliases });
export const CITIES: City[] = [
  C('الرياض', 'riyadh', 24.71, 46.68, 'riyadh'), C('الخرج', 'riyadh', 24.15, 47.33, 'kharj'), C('الدرعية', 'riyadh', 24.74, 46.57, 'diriyah'), C('المجمعة', 'riyadh', 25.9, 45.34),
  C('جدة', 'makkah', 21.49, 39.19, 'jeddah', 'jiddah'), C('مكة المكرمة', 'makkah', 21.39, 39.86, 'مكه', 'مكة', 'makkah', 'mecca'), C('الطائف', 'makkah', 21.27, 40.42, 'taif'), C('رابغ', 'makkah', 22.8, 39.03, 'rabigh'), C('القنفذة', 'makkah', 19.13, 41.08),
  C('المدينة المنورة', 'madinah', 24.47, 39.61, 'المدينه', 'المدينة', 'madinah', 'medina'), C('ينبع', 'madinah', 24.09, 38.06, 'yanbu'),
  C('بريدة', 'qassim', 26.33, 43.97, 'buraidah', 'buraydah'), C('عنيزة', 'qassim', 26.08, 43.99, 'unaizah'), C('الرس', 'qassim', 25.87, 43.5),
  C('الدمام', 'eastern', 26.43, 50.1, 'dammam'), C('الخبر', 'eastern', 26.28, 50.21, 'khobar', 'al khobar'), C('الظهران', 'eastern', 26.29, 50.11, 'dhahran'), C('الجبيل', 'eastern', 27.01, 49.66, 'jubail'),
  C('الأحساء', 'eastern', 25.38, 49.59, 'الاحساء', 'الهفوف', 'hofuf', 'ahsa'), C('القطيف', 'eastern', 26.56, 50.01, 'qatif'), C('حفر الباطن', 'eastern', 28.43, 45.96, 'hafar'),
  C('أبها', 'asir', 18.22, 42.51, 'ابها', 'abha'), C('خميس مشيط', 'asir', 18.31, 42.73, 'khamis'), C('تبوك', 'tabuk', 28.38, 36.57, 'tabuk'), C('حائل', 'hail', 27.52, 41.7, 'hail'),
  C('عرعر', 'northern', 30.98, 41.04, 'arar'), C('جازان', 'jazan', 16.89, 42.55, 'جيزان', 'jazan', 'jizan'), C('نجران', 'najran', 17.49, 44.13, 'najran'), C('الباحة', 'baha', 20.01, 41.47, 'baha'),
  C('سكاكا', 'jouf', 29.97, 40.21, 'sakaka'),
];
/** The Kingdom's outline (longitude, latitude), schematic — enough to place the cities, not a survey. */
export const OUTLINE: [number, number][] = [
  [34.9, 29.4], [36.0, 29.2], [37.5, 30.0], [38.0, 31.5], [39.2, 32.1], [40.4, 31.9], [42.0, 31.1], [44.7, 29.2], [46.5, 29.1], [47.4, 28.9], [48.4, 28.5],
  [49.3, 27.2], [50.1, 26.6], [50.2, 25.8], [50.8, 24.8], [51.6, 24.3], [52.6, 22.9], [55.1, 22.6], [55.7, 22.0], [55.0, 20.0], [52.0, 19.0], [49.1, 18.6],
  [47.5, 17.1], [46.3, 17.2], [44.0, 17.4], [43.3, 17.5], [43.0, 16.7], [42.7, 16.4], [42.1, 17.5], [41.2, 19.0], [40.2, 20.3], [39.1, 21.5], [38.9, 22.7],
  [38.0, 24.1], [37.2, 25.1], [36.5, 26.0], [35.5, 27.5], [34.8, 28.1],
];
/** Plane coordinates for a point: longitude scaled by the cosine of the Kingdom's mid-latitude. */
export function project(lat: number, lon: number, box = { w: 1000, h: 820 }) {
  const minLon = 34.4, maxLon = 56.2, minLat = 15.9, maxLat = 32.6, k = Math.cos((24 * Math.PI) / 180);
  const sx = box.w / ((maxLon - minLon) * k), sy = box.h / (maxLat - minLat), s = Math.min(sx, sy);
  return { x: Math.round((lon - minLon) * k * s * 10) / 10, y: Math.round((maxLat - lat) * s * 10) / 10 };
}

const norm = (s: string) => String(s || '').trim().toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/^ال/, '').replace(/\s+/g, ' ');
const INDEX = new Map<string, City>();
for (const c of CITIES) for (const n of [c.ar, ...c.aliases]) INDEX.set(norm(n), c);
/** The city (and so its region) of a free-text city name, or null when it is not a known city. */
export function cityOf(name: string): City | null { return INDEX.get(norm(name)) ?? null; }

export type Order = { city?: string; district?: string; customer?: string; amount?: number; date?: string };
export type Cell = { key: string; ar: string; orders: number; amount: number; customers: number; share: number };
const r2 = (x: number) => Math.round(x * 100) / 100;
/** Orders by region, city and district, with the orders whose city is not known kept apart. */
export function aggregate(orders: Order[]) {
  type Acc = { orders: number; amount: number; cust: Set<string> };
  const reg = new Map<string, Acc>(), city = new Map<string, Acc>(), dist = new Map<string, Acc>(), unknown = new Map<string, Acc>();
  const add = (m: Map<string, Acc>, k: string, o: Order) => { const a = m.get(k) ?? { orders: 0, amount: 0, cust: new Set<string>() }; a.orders++; a.amount += o.amount ?? 0; if (o.customer) a.cust.add(o.customer); m.set(k, a); };
  let total = 0;
  for (const o of orders) {
    total += o.amount ?? 0;
    const c = cityOf(o.city ?? '');
    if (!c) { add(unknown, (o.city || 'غير محدد').trim(), o); continue; }
    add(reg, c.region, o); add(city, c.ar, o); add(dist, c.ar + '|' + (String(o.district || '').trim() || 'غير محدد'), o);
  }
  const cells = (m: Map<string, Acc>, ar: (k: string) => string): Cell[] => [...m.entries()].map(([k, a]) => ({ key: k, ar: ar(k), orders: a.orders, amount: r2(a.amount), customers: a.cust.size, share: total ? Math.round((a.amount / total) * 1000) / 10 : 0 }))
    .sort((a, b) => b.amount - a.amount);
  return {
    total: r2(total), orders: orders.length,
    regions: cells(reg, (k) => REGIONS.find((r) => r.key === k)!.ar),
    cities: cells(city, (k) => k),
    districts: cells(dist, (k) => k.split('|')[1]).map((d) => ({ ...d, city: d.key.split('|')[0] })),
    unknown: cells(unknown, (k) => k),
  };
}
/** Positions for a city's districts around its centre (a golden-angle spiral, largest first), in plane units. */
export function districtSpots(n: number, radius = 34) {
  return Array.from({ length: n }, (_, i) => { const r = radius * Math.sqrt((i + 0.6) / Math.max(n, 1)), a = i * 2.39996; return { dx: Math.round(r * Math.cos(a) * 10) / 10, dy: Math.round(r * Math.sin(a) * 10) / 10 }; });
}
/** A colour step 0–5 for a value against the largest, for the map's legend. */
export const heat = (v: number, max: number) => (max <= 0 || v <= 0 ? 0 : Math.min(5, Math.max(1, Math.ceil((v / max) * 5))));
