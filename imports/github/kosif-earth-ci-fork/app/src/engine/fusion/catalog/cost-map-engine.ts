/* Product cost map — one product's cost as the tree of what goes into it, read from the pricing record itself
   (aghnam-pricing-v3: raws, boxes, linked expenses, settings). The formulas are the pricing engine's own — VAT-inclusive
   purchases netted, waste by yield 1/(1−w) or by markup 1+w, nested boxes at their component cost, overheads, linked
   expenses (fixed, per kg, per dish, % of components) and the dish cost — so the map's total reconciles to the
   catalogue's cost to the halala. What the catalogue only totals, the map opens up:
   • every input with its formula and its share of the cost;
   • the drivers that move the margin most (a +10% shock on each), the cost ceiling for the target margin;
   • a what-if (price, a general cost move, per-input changes, and draft inputs not yet in the record);
   • the IAS 2 view the annual reports disclose: inventory cost (materials and conversion, IAS 2.10–15) apart from the
     costs to sell (IAS 2.16), net realisable value (IAS 2.6) and the write-down when it falls below cost (IAS 2.28–33). */

export type PricingSettings = { vat?: number | string; waste?: string; base?: string; target?: number | string; good?: number | string; excellent?: number | string; round?: string };
export type RawRec = { id: string; name?: string; cat?: string; buy?: number | string; vat?: string; waste?: number | string; price?: number | string | null; kind?: string; status?: string };
export type BoxComp = { t?: string; id: string; q?: number | string; wasteMode?: string };
export type BoxRec = { id: string; name?: string; cat?: string; price?: number | string; dishes?: number | string; dishCost?: number | string; comps?: BoxComp[];
  ohs?: { id?: string; label?: string; amt?: number | string; vat?: string }[]; status?: string };
export type ExpRec = { id: string; name?: string; amt?: number | string; method?: string; vat?: string; links?: string[] };
export type PricingState = { settings?: PricingSettings; raws?: RawRec[]; boxes?: BoxRec[]; exps?: ExpRec[] };

/** materials (raws, nested boxes, packaging) and conversion are inventory cost; selling and admin are not (IAS 2.16). */
export type CostClass = 'materials' | 'conversion' | 'selling' | 'admin';
export type LineKind = 'purchase' | 'waste' | 'raw' | 'box' | 'overhead' | 'expense' | 'dish';
export type CostLine = { key: string; kind: LineKind; refId: string; name: string; qty: number; unit: string; unitCost: number; amount: number; share: number;
  formula: string[]; cls: CostClass; baseUnit?: number; wasteRate?: number; method?: string; unitWeight?: number };
export type Band = 'na' | 'loss' | 'low' | 'good' | 'ex' | 'by';
export type CostMap = { id: string; kind: 'raw' | 'box'; name: string; lines: CostLine[]; components: number; total: number; weight: number; dishes: number;
  hasPrice: boolean; price: number; priceNet: number; vatAmount: number; profit: number; margin: number | null; marginBase: 'net' | 'gross';
  breakeven: number; targetRate: number; target: number | null; band: Band; missing: number; cycle: boolean;
  vatRate: number; yieldMethod: boolean; rounding: string; good: number; excellent: number };

const num = (v: unknown) => { const n = parseFloat(String(v ?? '')); return Number.isFinite(n) ? n : 0; };
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const f2 = (n: number) => (Math.round(n * 100) / 100).toFixed(2);
const pctTxt = (n: number) => String(Math.round(n * 1000) / 10) + '%';

/** The pricing engine's rounding policies (nine: …9 from 100 up, …x.90 below; int; half; default: the halala). */
export function roundPrice(p: number, mode?: string): number {
  if (!Number.isFinite(p) || p <= 0) return p;
  const e = 1e-9;
  switch (mode) {
    case 'nine': {
      if (p >= 100) { const n = Math.ceil(p - e); return n + ((9 - (n % 10)) + 10) % 10; }
      const k = Math.ceil(p - 0.9 - e); return +(k + 0.9).toFixed(2);
    }
    case 'int': return Math.ceil(p - e);
    case 'half': return Math.ceil(p * 2 - e) / 2;
    default: return Math.ceil(p * 100 - e) / 100;
  }
}

/** Where a linked expense belongs, read from its name; the user can override it per expense. */
export function classifyExpense(name: string): CostClass {
  const s = String(name || '');
  if (/توصيل|للعميل|للنقل|شحن|عمول|تسويق|إعلان|اعلان|دعاي|منص[ةه]|تطبيق|بوابة|رسوم (?:الدفع|دفع)|مدى/.test(s)) return 'selling';
  if (/إدار|ادار|مكتب|محاسب|رسوم حكومية|اشتراك/.test(s)) return 'admin';
  if (/تغليف|صحن|صحون|علب|علبة|كرتون|صندوق|أكياس|اكياس|ملصق/.test(s)) return 'materials';
  return 'conversion';
}

type Ctx = { v: number; yieldM: boolean; netBase: boolean; T: number; good: number; excellent: number; round: string;
  raws: Map<string, RawRec>; boxes: Map<string, BoxRec>; exps: ExpRec[] };
function ctxOf(S: PricingState): Ctx {
  const st = S.settings || {};
  return { v: num(st.vat ?? 15) / 100, yieldM: st.waste !== 'markup', netBase: st.base !== 'gross', T: num(st.target) / 100,
    good: num(st.good) / 100, excellent: num(st.excellent) / 100, round: String(st.round || ''),
    raws: new Map((S.raws || []).map((r) => [String(r.id), r])), boxes: new Map((S.boxes || []).map((b) => [String(b.id), b])), exps: S.exps || [] };
}
const netOf = (c: Ctx, amt: number, mode?: string) => (mode === 'incl' ? amt / (1 + c.v) : amt);
const factor = (c: Ctx, w: number) => (c.yieldM ? 1 / (1 - w) : 1 + w);
function rawCost(c: Ctx, r: RawRec) {
  const w = clamp(num(r.waste) / 100, 0, 0.95), buy = num(r.buy), net = netOf(c, buy, r.vat);
  return { w, buy, net, cost: net * factor(c, w) };
}
function marginOf(c: Ctx, profit: number, price: number) { const base = c.netBase ? price / (1 + c.v) : price; return base > 0 ? profit / base : null; }
function targetPrice(c: Ctx, cost: number, t: number) {
  if (!(cost > 0)) return null;
  if (c.netBase) return t >= 0.98 ? null : (cost / (1 - t)) * (1 + c.v);
  const d = 1 / (1 + c.v) - t; return d <= 0.005 ? null : cost / d;
}
function bandOf(c: Ctx, m: number | null): Band { return m == null || !Number.isFinite(m) ? 'na' : m < 0 ? 'loss' : m < c.good ? 'low' : m < c.excellent ? 'good' : 'ex'; }

/** A box's component cost and weight, nested boxes included (at their component cost, as the pricing engine counts them). */
function boxComponents(c: Ctx, b: BoxRec, stack: string[]): { comp: number; weight: number; missing: number; cycle: boolean } {
  if (stack.includes(b.id)) return { comp: 0, weight: 0, missing: 0, cycle: true };
  let comp = 0, weight = 0, missing = 0, cycle = false;
  for (const k of b.comps || []) {
    const q = num(k.q);
    if (k.t === 'box') {
      const sb = c.boxes.get(String(k.id)); if (!sb) { missing++; continue; }
      const s = boxComponents(c, sb, [...stack, b.id]); if (s.cycle) { cycle = true; continue; }
      comp += s.comp * q; weight += s.weight * q; missing += s.missing;
    } else {
      const r = c.raws.get(String(k.id)); if (!r) { missing++; continue; }
      const rc = rawCost(c, r); comp += (k.wasteMode === 'none' ? rc.net : rc.cost) * q; weight += q;
    }
  }
  return { comp, weight, missing, cycle };
}

/** The cost map of one raw or box of the pricing record; null when the record has no such product. */
export function productCostMap(S: PricingState, id: string, opts: { classes?: Record<string, CostClass> } = {}): CostMap | null {
  const c = ctxOf(S), vt = 1 + c.v, wm = c.yieldM ? 'بطريقة العائد ÷ (1 − الهدر)' : 'بطريقة الإضافة × (1 + الهدر)';
  const lines: CostLine[] = [];
  let name = '', kind: 'raw' | 'box', weight = 0, dishes = 0, missing = 0, cycle = false, hasPrice = false, price = 0, isBy = false;
  const raw = c.raws.get(String(id)), box = raw ? undefined : c.boxes.get(String(id));
  if (raw) {
    kind = 'raw'; name = String(raw.name || ''); isBy = raw.kind === 'by'; weight = 1;
    const rc = rawCost(c, raw);
    lines.push({ key: 'purchase', kind: 'purchase', refId: raw.id, name: 'سعر الشراء', qty: 1, unit: 'كجم', unitCost: rc.net, amount: rc.net, share: 0, cls: 'materials', baseUnit: rc.net,
      formula: raw.vat === 'incl' ? ['الشراء ' + f2(rc.buy) + ' شامل الضريبة', '÷ ' + vt.toFixed(2) + ' = ' + f2(rc.net) + ' صافي للكجم'] : ['الشراء ' + f2(rc.buy) + ' صافي للكجم (قبل الضريبة)'] });
    if (rc.w > 0) lines.push({ key: 'waste', kind: 'waste', refId: raw.id, name: 'الهدر', qty: 1, unit: 'كجم', unitCost: rc.cost - rc.net, amount: rc.cost - rc.net, share: 0, cls: 'materials',
      baseUnit: rc.net, wasteRate: rc.w, formula: ['هدر ' + pctTxt(rc.w) + ' ' + wm, f2(rc.net) + ' → ' + f2(rc.cost) + ' تكلفة الكجم الصالح'] });
    const p = raw.price;
    hasPrice = p !== null && p !== undefined && p !== '' && num(p) > 0; price = hasPrice ? num(p) : 0;
  } else if (box) {
    kind = 'box'; name = String(box.name || ''); dishes = num(box.dishes);
    (box.comps || []).forEach((k, i) => {
      const q = num(k.q);
      if (k.t === 'box') {
        const sb = c.boxes.get(String(k.id)); if (!sb) { missing++; return; }
        const s = boxComponents(c, sb, [box.id]);
        if (s.cycle) { cycle = true; return; }
        missing += s.missing; weight += s.weight * q;
        lines.push({ key: 'c' + i, kind: 'box', refId: sb.id, name: String(sb.name || ''), qty: q, unit: 'بوكس', unitCost: s.comp, amount: s.comp * q, share: 0, cls: 'materials', unitWeight: s.weight,
          formula: ['بوكس داخلي بتكلفة مكوناته ' + f2(s.comp) + ' × ' + q + ' = ' + f2(s.comp * q)] });
      } else {
        const r = c.raws.get(String(k.id)); if (!r) { missing++; return; }
        const rc = rawCost(c, r), withW = k.wasteMode !== 'none', unit = withW ? rc.cost : rc.net;
        weight += q;
        lines.push({ key: 'c' + i, kind: 'raw', refId: r.id, name: String(r.name || ''), qty: q, unit: 'كجم', unitCost: unit, amount: unit * q, share: 0, cls: 'materials',
          baseUnit: rc.net, wasteRate: withW ? rc.w : 0,
          formula: [(r.vat === 'incl' ? 'الشراء ' + f2(rc.buy) + ' شامل ÷ ' + vt.toFixed(2) + ' = ' : 'الشراء صافٍ ') + f2(rc.net) + ' للكجم',
            ...(withW && rc.w > 0 ? ['هدر ' + pctTxt(rc.w) + ' ' + wm + ' → ' + f2(rc.cost)] : withW ? [] : ['بلا هدر: يُباع كما اشتُري']),
            f2(unit) + ' × ' + q + ' كجم = ' + f2(unit * q)] });
      }
    });
    const comp = lines.reduce((s, l) => s + l.amount, 0);
    (box.ohs || []).forEach((o, i) => {
      const n = netOf(c, num(o.amt), o.vat);
      lines.push({ key: 'o' + i, kind: 'overhead', refId: String(o.id || ''), name: String(o.label || 'تكلفة إضافية'), qty: 1, unit: 'بوكس', unitCost: n, amount: n, share: 0,
        cls: opts.classes?.[String(o.id || '')] ?? 'materials', formula: [o.vat === 'incl' ? f2(num(o.amt)) + ' شامل ÷ ' + vt.toFixed(2) + ' = ' + f2(n) : f2(n) + ' صافٍ'] });
    });
    for (const e of c.exps) {
      if (!(e.links || []).includes(box.id)) continue;
      const a = num(e.amt), m = e.method || 'fixed';
      const base = m === 'kg' ? a * weight : m === 'dish' ? a * dishes : m === 'pct' ? (a / 100) * comp : a;
      const n = m === 'pct' ? base : netOf(c, base, e.vat);
      const how = m === 'kg' ? f2(a) + ' لكل كجم × ' + r2(weight) + ' كجم' : m === 'dish' ? f2(a) + ' لكل صحن × ' + dishes + ' صحن' : m === 'pct' ? a + '% من تكلفة المكونات ' + f2(comp) : f2(a) + ' ثابت للبوكس';
      lines.push({ key: 'e:' + e.id, kind: 'expense', refId: e.id, name: String(e.name || 'مصروف'), qty: m === 'kg' ? weight : m === 'dish' ? dishes : 1, unit: m === 'kg' ? 'كجم' : m === 'dish' ? 'صحن' : 'بوكس',
        unitCost: m === 'kg' || m === 'dish' ? netOf(c, a, e.vat) : n, amount: n, share: 0, cls: opts.classes?.[e.id] ?? classifyExpense(String(e.name || '')), method: m,
        formula: [how + (m !== 'pct' && e.vat === 'incl' ? ' شامل ÷ ' + vt.toFixed(2) : ''), '= ' + f2(n) + ' صافٍ'] });
    }
    const dc = Math.max(0, num(box.dishCost));
    if (dc > 0 && dishes > 0) {
      const each = dc / vt;
      lines.push({ key: 'dish', kind: 'dish', refId: box.id, name: 'تكلفة الصحون', qty: dishes, unit: 'صحن', unitCost: each, amount: each * dishes, share: 0, cls: 'materials',
        formula: [f2(dc) + ' للصحن شامل ÷ ' + vt.toFixed(2) + ' = ' + f2(each), '× ' + dishes + ' صحن = ' + f2(each * dishes)] });
    }
    price = num(box.price); hasPrice = price > 0;
  } else return null;

  const components = lines.filter((l) => l.kind === 'raw' || l.kind === 'box' || l.kind === 'purchase' || l.kind === 'waste').reduce((s, l) => s + l.amount, 0);
  const total = lines.reduce((s, l) => s + l.amount, 0);
  for (const l of lines) { l.share = total > 0 ? l.amount / total : 0; l.amount = r2(l.amount); l.unitCost = Math.round(l.unitCost * 10000) / 10000; }
  const priceNet = hasPrice ? price / vt : 0, profit = hasPrice ? priceNet - total : 0;
  const margin = hasPrice ? marginOf(c, profit, price) : null, t = targetPrice(c, total, c.T);
  return { id: String(id), kind, name, lines, components: r2(components), total: r2(total), weight: r2(weight), dishes, hasPrice, price: r2(price), priceNet: r2(priceNet),
    vatAmount: r2(price - priceNet), profit: r2(profit), margin: margin == null ? null : Math.round(margin * 1e6) / 1e6, marginBase: c.netBase ? 'net' : 'gross',
    breakeven: r2(total * vt), targetRate: c.T, target: t == null ? null : roundPrice(t, c.round), band: isBy ? 'by' : bandOf(c, margin), missing, cycle,
    vatRate: c.v, yieldMethod: c.yieldM, rounding: c.round, good: c.good, excellent: c.excellent };
}

const marginAt = (map: CostMap, total: number, price: number) => {
  if (!(price > 0)) return null;
  const pn = price / (1 + map.vatRate), base = map.marginBase === 'net' ? pn : price;
  return base > 0 ? (pn - total) / base : null;
};
/** The gross price that gives margin `rate` on `total`, rounded by the record's policy and never below break-even. */
export function priceForMargin(map: CostMap, rate: number, total = map.total): number | null {
  const vt = 1 + map.vatRate;
  let p: number | null;
  if (map.marginBase === 'net') p = rate >= 0.98 ? null : (total / (1 - rate)) * vt;
  else { const d = 1 / vt - rate; p = d <= 0.005 ? null : total / d; }
  if (p == null || !(total > 0)) return null;
  let out = roundPrice(Math.max(p, total * vt), map.rounding), guard = 0;
  while (out + 1e-9 < total * vt && guard++ < 50) out = roundPrice(out + 0.01, map.rounding);
  return out;
}
/** The highest cost the current price carries at the target margin, and the room left under it. */
export function costCeiling(map: CostMap, rate = map.targetRate) {
  if (!map.hasPrice) return null;
  const ceiling = map.marginBase === 'net' ? map.priceNet * (1 - rate) : map.priceNet - rate * map.price;
  return { ceiling: r2(ceiling), headroom: r2(ceiling - map.total), headroomPct: map.total > 0 ? Math.round(((ceiling - map.total) / map.total) * 1000) / 10 : 0 };
}

export type Draft = { id: string; type: string; label: string; qty?: number; unitCost?: number; vat?: string; method?: string };
export type LineChange = { unitPct?: number; qty?: number; waste?: number };
export type WhatIf = { priceGross?: number | null; costPct?: number; lines?: Record<string, LineChange>; drafts?: Draft[]; targetRate?: number };
/** The draft's cost per unit of product: quantity × net unit cost, or a percentage of the components for an expense. */
export function draftAmount(map: CostMap, d: Draft, components = map.components): number {
  const q = Number(d.qty), u = Number(d.unitCost);
  if (!Number.isFinite(u) || u <= 0) return 0;
  if (d.method === 'pct') return r2((u / 100) * components);
  return r2((Number.isFinite(q) && q > 0 ? q : 1) * (d.vat === 'incl' ? u / (1 + map.vatRate) : u));
}
/** Re-prices the map under a what-if. Nothing is written back; the source record stays the truth. */
export function scenario(map: CostMap, w: WhatIf = {}) {
  const general = 1 + (Number(w.costPct) || 0) / 100, changes = w.lines || {};
  const rows = map.lines.map((l) => {
    const ch = changes[l.key] || {};
    let unit = l.unitCost, qty = l.qty;
    if ((l.kind === 'raw' || l.kind === 'waste') && ch.waste != null && l.baseUnit != null) {
      const wr = clamp(Number(ch.waste) / 100, 0, 0.95), f = map.yieldMethod ? 1 / (1 - wr) : 1 + wr;
      unit = l.kind === 'raw' ? l.baseUnit * f : l.baseUnit * (f - 1);
    }
    if (ch.unitPct != null) unit *= 1 + Number(ch.unitPct) / 100;
    if (ch.qty != null && (l.kind === 'raw' || l.kind === 'box') && Number(ch.qty) >= 0) qty = Number(ch.qty);
    return { key: l.key, kind: l.kind, method: l.method, unitPct: ch.unitPct, before: l.amount, amount: unit * qty * general, qty, weight: l.kind === 'raw' ? qty : l.kind === 'box' ? (l.unitWeight ?? 0) * qty : 0 };
  });
  // the per-kg and %-of-components expenses follow the new weight and the new component cost, as the pricing engine charges them
  const isComp = (k: string) => k === 'raw' || k === 'box' || k === 'purchase' || k === 'waste';
  const components = rows.filter((r) => isComp(r.kind)).reduce((s, r) => s + r.amount, 0);
  const newWeight = map.kind === 'raw' ? map.weight : rows.reduce((s, r) => s + r.weight, 0);
  for (const r of rows) {
    if (r.kind !== 'expense' || (r.method !== 'kg' && r.method !== 'pct')) continue;
    r.amount = r.method === 'kg' ? (map.weight > 0 ? r.before * (newWeight / map.weight) : r.before) * general : map.components > 0 ? r.before * (components / map.components) : r.before;
    if (r.unitPct != null) r.amount *= 1 + Number(r.unitPct) / 100;
  }
  const drafts = (w.drafts || []).map((d) => ({ id: d.id, label: d.label, amount: draftAmount(map, d, components) }));
  const total = r2(rows.reduce((s, r) => s + r.amount, 0) + drafts.reduce((s, d) => s + d.amount, 0));
  const price = w.priceGross != null && Number(w.priceGross) > 0 ? Number(w.priceGross) : map.price;
  const margin = marginAt(map, total, price), rate = w.targetRate ?? map.targetRate;
  const profit = price > 0 ? r2(price / (1 + map.vatRate) - total) : 0;
  return { total, price: r2(price), priceNet: r2(price / (1 + map.vatRate)), profit, margin, breakeven: r2(total * (1 + map.vatRate)),
    target: priceForMargin(map, rate, total), targetRate: rate, weight: r2(newWeight),
    deltaTotal: r2(total - map.total), deltaProfit: r2(profit - map.profit), deltaMarginPts: margin != null && map.margin != null ? Math.round((margin - map.margin) * 1000) / 10 : null,
    rows: rows.map((r) => ({ key: r.key, before: r.before, amount: r2(r.amount), qty: r.qty })), drafts,
    changed: Object.keys(changes).length + (w.costPct ? 1 : 0) + drafts.length + (price !== map.price ? 1 : 0) };
}

/** What moves the margin: each input and the price shocked by `step`, ranked by the swing in margin points. */
export function sensitivity(map: CostMap, step = 0.1) {
  if (!map.hasPrice || map.margin == null) return [];
  const base = map.marginBase === 'net' ? map.priceNet : map.price;
  const out = map.lines.filter((l) => l.amount > 0).map((l) => ({ key: l.key, name: l.name, kind: l.kind as LineKind | 'price', share: l.share,
    dProfit: r2(-step * l.amount), dMarginPts: base > 0 ? Math.round((-step * l.amount / base) * 1000) / 10 : 0 }));
  const up = marginAt(map, map.total, map.price * (1 + step));
  out.push({ key: 'price', name: 'سعر البيع', kind: 'price', share: 0, dProfit: r2(map.priceNet * step), dMarginPts: up == null ? 0 : Math.round((up - map.margin) * 1000) / 10 });
  return out.sort((a, b) => Math.abs(b.dMarginPts) - Math.abs(a.dMarginPts)).slice(0, 7);
}

export const CLASS_AR: Record<CostClass, string> = { materials: 'مواد مباشرة وتعبئة', conversion: 'تكاليف تحويل وتجهيز', selling: 'تكاليف بيع وتوصيل', admin: 'مصروفات إدارية' };
/** IAS 2: inventory cost apart from the costs to sell; net realisable value and the write-down below it. */
export function inventoryView(map: CostMap, extraSelling = 0) {
  const sum = (k: CostClass) => r2(map.lines.filter((l) => l.cls === k).reduce((s, l) => s + l.amount, 0));
  const materials = sum('materials'), conversion = sum('conversion'), selling = r2(sum('selling') + extraSelling), admin = sum('admin');
  const inventoriable = r2(materials + conversion);
  const nrv = map.hasPrice ? r2(map.priceNet - selling) : null;
  const carrying = nrv == null ? inventoriable : r2(Math.min(inventoriable, nrv));
  return { materials, conversion, selling, admin, inventoriable, nrv, carrying, writeDown: nrv == null ? 0 : r2(Math.max(0, inventoriable - nrv)),
    excluded: r2(selling + admin), refs: ['IAS 2.10', 'IAS 2.16', 'IAS 2.6', 'IAS 2.28'] };
}

/** Units a period must sell at the current margin to cover fixed costs not in the unit cost. */
export function breakevenUnits(map: CostMap, fixed: number, profit = map.profit) {
  if (!(fixed > 0)) return null;
  if (!(profit > 0)) return { units: null as number | null, profit: r2(profit) };
  return { units: Math.ceil(fixed / profit - 1e-9), profit: r2(profit) };
}

export type CostCheck = { level: 'bad' | 'warn' | 'info' | 'ok'; code: string; text: string };
/** The controls around the product's cost and price, each with what to do. */
export function costChecks(map: CostMap, opts: { catalogCost?: number | null; drafts?: number } = {}): CostCheck[] {
  const out: CostCheck[] = [], money = (n: number) => f2(n) + ' ر.س';
  if (opts.catalogCost != null && Number.isFinite(opts.catalogCost)) {
    const d = r2(map.total - Number(opts.catalogCost));
    out.push(Math.abs(d) <= 0.01 ? { level: 'ok', code: 'reconciled', text: 'تكلفة الخريطة ' + money(map.total) + ' مطابقة لتكلفة سجل الأصناف' }
      : { level: 'bad', code: 'unreconciled', text: 'فرق ' + money(d) + ' بين تكلفة الخريطة وسجل الأصناف — راجع مكونات الصنف' });
  }
  if (map.cycle) out.push({ level: 'bad', code: 'cycle', text: 'بوكس يدخل في نفسه عبر بوكس داخلي — التكلفة ناقصة حتى تُفك الحلقة' });
  if (map.missing) out.push({ level: 'bad', code: 'missing', text: map.missing + ' مكوّن محذوف من سجل الأصناف ما زال في الوصفة — التكلفة أقل من الحقيقة' });
  if (!map.hasPrice) out.push({ level: 'warn', code: 'no-price', text: 'لا يوجد سعر بيع؛ السعر المقترح للهامش المستهدف ' + (map.target != null ? money(map.target) : '—') });
  else if (map.price + 1e-9 < map.breakeven) out.push({ level: 'bad', code: 'loss', text: 'السعر ' + money(map.price) + ' أقل من التعادل ' + money(map.breakeven) + ' — كل بيع يخسر ' + money(-map.profit) });
  else if (map.margin != null && map.margin < map.good) out.push({ level: 'warn', code: 'low-margin', text: 'الهامش ' + pctTxt(map.margin) + ' دون حد «جيد» ' + pctTxt(map.good) });
  else if (map.margin != null && map.margin < map.targetRate) out.push({ level: 'info', code: 'below-target', text: 'الهامش ' + pctTxt(map.margin) + ' دون المستهدف ' + pctTxt(map.targetRate) + '؛ السعر المقترح ' + (map.target != null ? money(map.target) : '—') });
  if (map.hasPrice && map.rounding && roundPrice(map.price, map.rounding) !== map.price) out.push({ level: 'info', code: 'rounding', text: 'السعر ' + money(map.price) + ' لا يتبع سياسة التقريب؛ أقرب سعر متوافق ' + money(roundPrice(map.price, map.rounding)) });
  const zero = map.lines.filter((l) => (l.kind === 'raw' || l.kind === 'box' || l.kind === 'purchase') && l.amount <= 0);
  if (zero.length) out.push({ level: 'warn', code: 'zero-cost', text: 'بلا تكلفة: ' + zero.map((l) => l.name).join('، ') + ' — أدخل سعر الشراء' });
  const highW = map.lines.filter((l) => (l.wasteRate ?? 0) > 0.3);
  if (highW.length) out.push({ level: 'warn', code: 'waste', text: 'هدر مرتفع (> 30%): ' + highW.map((l) => l.name + ' ' + pctTxt(l.wasteRate ?? 0)).join('، ') + ' — الهدر غير المعتاد مصروف وليس تكلفة مخزون (IAS 2.16)' });
  const top = [...map.lines].sort((a, b) => b.share - a.share)[0];
  if (top && top.share >= 0.8 && map.lines.length > 1) out.push({ level: 'info', code: 'concentration', text: pctTxt(top.share) + ' من التكلفة في «' + top.name + '» — أي تغير في سعره ينتقل للهامش مباشرة' });
  const iv = inventoryView(map);
  if (iv.writeDown > 0) out.push({ level: 'bad', code: 'nrv', text: 'صافي القيمة القابلة للتحقق ' + money(iv.nrv ?? 0) + ' أقل من تكلفة المخزون ' + money(iv.inventoriable) + ' — تخفيض ' + money(iv.writeDown) + ' للوحدة (IAS 2.28)' });
  if (opts.drafts) out.push({ level: 'info', code: 'drafts', text: opts.drafts + ' عنصر مقترح في الخريطة غير مسجل في الأصناف — يظهر أثره في «ماذا لو» فقط' });
  return out;
}
