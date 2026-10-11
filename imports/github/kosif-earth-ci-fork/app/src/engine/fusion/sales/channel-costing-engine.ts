/* Channel costing — the cost of each sale from the rule in force on its date, for its product and its channel
   (merged from the owner's «لوحة المبيعات والتكاليف والأرباح» v16, 2026-10-08).

   A rule is valid from `from` to `to` (either may be open) for one product, and for one channel or for all of them. A sale
   takes the most specific rule in force on its own date: a rule for its channel beats an all-channels rule, then the latest
   start wins — so units sold on days 1–5 take the old cost and units sold on days 6–10 the new one, and the totals add up.
   A rule carries its cost components (v16): per unit — purchase before VAT (with the purchase VAT added only when it is not
   recoverable), packaging, processing, other; per sale — the platform's commission, a card fee (card payments only, or
   all), a VIP discount (VIP customers only, or all), other deductions; per order — a fixed platform fee and the cost of
   free shipping (free-shipping orders only, or all), shared over the order's lines by their share of its amount, so an
   order is never charged twice. A legacy rule `{ cost }` is a purchase cost per unit.

   The order of evidence for a sale's cost: an imported cost, else an imported gross profit, else the rule, else the
   catalog's cost for the product, else unknown (counted apart, never guessed). Money is in halalas; sale amounts include
   VAT and revenue is net of it (opts.vat); percentage fees apply to the amount paid. */

export type CostRule = {
  id?: string; product: string; channel?: string; from?: string; to?: string; note?: string;
  cost?: number; purchase?: number; vatPct?: number; includeVat?: boolean; packaging?: number; processing?: number; otherUnit?: number;
  platformPct?: number; platformFixed?: number; cardPct?: number; cardMode?: 'conditional' | 'all'; vipPct?: number; vipMode?: 'conditional' | 'all';
  otherPct?: number; shipping?: number; shippingMode?: 'conditional' | 'all';
};
export type CostLine = {
  id?: string; date: string; amount: number; qty: number; product: string; channel?: string; invoice?: string; category?: string;
  paymentMethod?: string; customerType?: string; freeShipping?: boolean; manualCost?: number | null; profit?: number | null;
};
export type Breakdown = { purchase: number; vat: number; packaging: number; processing: number; otherUnit: number; platformPct: number; platformFixed: number; card: number; vip: number; otherPct: number; shipping: number };
export type Financial = { known: boolean; cost: number; source: 'manual' | 'profit' | 'rule' | 'catalog' | 'none'; ruleId?: string; breakdown?: Breakdown };
export type Opts = { vat?: number; catalogCost?: (product: string) => number | null | undefined; from?: string; to?: string; channels?: string[]; product?: string; category?: string };

const H = 100; // rule values are in riyals; the result in halalas
const COMPONENTS: (keyof Breakdown)[] = ['purchase', 'vat', 'packaging', 'processing', 'otherUnit', 'platformPct', 'platformFixed', 'card', 'vip', 'otherPct', 'shipping'];
export const COMPONENT_LABELS: Record<keyof Breakdown, string> = {
  purchase: 'الشراء', vat: 'ضريبة الشراء', packaging: 'التغليف', processing: 'التجهيز', otherUnit: 'أخرى للوحدة', platformPct: 'عمولة المنصة',
  platformFixed: 'رسوم المنصة الثابتة', card: 'عمولة البطاقة', vip: 'خصم المميز', otherPct: 'أخرى من المبيعات', shipping: 'الشحن المجاني',
};
const zero = (): Breakdown => ({ purchase: 0, vat: 0, packaging: 0, processing: 0, otherUnit: 0, platformPct: 0, platformFixed: 0, card: 0, vip: 0, otherPct: 0, shipping: 0 });
const n = (v: unknown) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const r4 = (v: number) => Math.round(v * 10000) / 10000;
const day = (d: string) => String(d || '').slice(0, 10);
const validDay = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(day(d));

/** Arabic-aware key: hamzas, taa marbuta and alif maqsura folded, spaces and punctuation dropped */
export function normalizeText(s: unknown): string {
  return String(s ?? '').trim().toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[\s_\-/\\().،,:]+/g, '');
}
const has = (s: unknown, words: string[]) => { const x = normalizeText(s); return !!x && words.some((w) => x.includes(normalizeText(w))); };
export const isCardPayment = (v: unknown) => has(v, ['فيزا', 'visa', 'مدى', 'mada', 'ماستركارد', 'mastercard', 'بطاقة', 'card', 'applepay', 'ابل باي']);
export const isVipCustomer = (v: unknown) => has(v, ['مميز', 'vip', 'خاص', 'ذهبي', 'premium']);

/** the four channels of the v16 dashboard under one spelling; any other name is kept as it is */
export function normalizeChannel(s: unknown): string {
  const x = normalizeText(s);
  const map: [string, string[]][] = [['المعرض', ['المعرض', 'معرض', 'exhibition', 'showroom', 'storefront']], ['الجملة', ['الجمله', 'جمله', 'wholesale']],
    ['المتجر', ['المتجر', 'متجر', 'onlinestore', 'website', 'webstore']], ['هنغرستيشن', ['هنغرستيشن', 'هنقرستيشن', 'hungerstation', 'hunger']]];
  for (const [name, alts] of map) if (alts.some((a) => normalizeText(a) === x)) return name;
  return String(s ?? '').trim();
}

/** the rule in force for a sale: same product, its channel or all channels, its date inside the validity */
export function findRule(rules: CostRule[], line: Pick<CostLine, 'product' | 'channel' | 'date'>): CostRule | null {
  const p = normalizeText(line.product), ch = normalizeChannel(line.channel ?? ''), d = day(line.date);
  const ok = rules.filter((r) => normalizeText(r.product) === p && (!r.channel || normalizeChannel(r.channel) === ch) && (!r.from || !d || r.from <= d) && (!r.to || !d || r.to >= d) && (validDay(d) || (!r.from && !r.to)));
  ok.sort((a, b) => Number(!!b.channel) - Number(!!a.channel) || String(b.from ?? '').localeCompare(String(a.from ?? '')));
  return ok[0] ?? null;
}

/** each line's share of its order (same day, channel and invoice) by amount; a line without an invoice is its own order */
export function orderShares(lines: CostLine[]): number[] {
  const key = (l: CostLine) => (l.invoice ? `${day(l.date)}|${normalizeChannel(l.channel ?? '')}|${l.invoice}` : '');
  const sums = new Map<string, number>();
  lines.forEach((l) => { const k = key(l); if (k) sums.set(k, (sums.get(k) ?? 0) + Math.max(0, n(l.amount))); });
  return lines.map((l) => { const k = key(l); if (!k) return 1; const t = sums.get(k) ?? 0; return t ? Math.max(0, n(l.amount)) / t : 1; });
}

/** the cost of one sale under one rule, in halalas, with its components; `force` overrides the card/VIP/shipping conditions (the preview) */
export function costByRule(line: Pick<CostLine, 'qty' | 'amount' | 'paymentMethod' | 'customerType' | 'freeShipping'>, rule: CostRule, share = 1, force: boolean | null = null): { cost: number; breakdown: Breakdown } {
  const q = n(line.qty), paid = n(line.amount), unit = (v: unknown) => Math.round(q * n(v) * H), pct = (v: unknown) => Math.round(paid * n(v) / 100);
  const b = zero();
  b.purchase = unit(rule.purchase ?? rule.cost);
  b.vat = rule.includeVat ? Math.round(b.purchase * n(rule.vatPct ?? 15) / 100) : 0;
  b.packaging = unit(rule.packaging); b.processing = unit(rule.processing); b.otherUnit = unit(rule.otherUnit);
  b.platformPct = pct(rule.platformPct); b.otherPct = pct(rule.otherPct);
  b.platformFixed = Math.round(n(rule.platformFixed) * H * share);
  const card = force ?? (rule.cardMode === 'all' || isCardPayment(line.paymentMethod));
  const vip = force ?? (rule.vipMode === 'all' || isVipCustomer(line.customerType));
  const ship = force ?? (rule.shippingMode === 'all' || !!line.freeShipping);
  b.card = card ? pct(rule.cardPct) : 0; b.vip = vip ? pct(rule.vipPct) : 0; b.shipping = ship ? Math.round(n(rule.shipping) * H * share) : 0;
  return { cost: COMPONENTS.reduce((a, k) => a + b[k], 0), breakdown: b };
}

/** what one sale cost, by the order of evidence (imported cost → imported profit → rule → catalog → unknown) */
export function resolveFinancial(line: CostLine, rules: CostRule[], share = 1, opts: Opts = {}): Financial {
  const vat = opts.vat ?? 0.15, net = Math.round(n(line.amount) / (1 + vat));
  if (line.manualCost != null && Number.isFinite(Number(line.manualCost))) return { known: true, cost: Math.round(n(line.manualCost)), source: 'manual' };
  if (line.profit != null && Number.isFinite(Number(line.profit))) return { known: true, cost: net - Math.round(n(line.profit)), source: 'profit' };
  const rule = findRule(rules, line);
  if (rule) { const c = costByRule(line, rule, share); return { known: true, cost: c.cost, source: 'rule', ruleId: rule.id, breakdown: c.breakdown }; }
  const cat = opts.catalogCost ? opts.catalogCost(line.product) : null;
  if (cat != null && Number.isFinite(cat)) { const b = zero(); b.purchase = Math.round(n(cat) * n(line.qty)); return { known: true, cost: b.purchase, source: 'catalog', breakdown: b }; }
  return { known: false, cost: 0, source: 'none' };
}

/** a rule's preview: the cost and profit of `qty` units sold for `salesSar` riyals (VAT included), conditions on or off */
export function previewRule(rule: CostRule, qty: number, salesSar: number, conditions: boolean, opts: Opts = {}) {
  const amount = Math.round(n(salesSar) * H), c = costByRule({ qty, amount }, rule, 1, conditions), net = Math.round(amount / (1 + (opts.vat ?? 0.15)));
  return { amount, net, cost: c.cost, profit: net - c.cost, margin: net ? r4((net - c.cost) / net) : null, perUnit: qty ? Math.round(c.cost / qty) : null, breakdown: c.breakdown };
}

type Row = { key: string; revenue: number; amount: number; cost: number; profit: number; margin: number | null; qty: number; lines: number; costed: number; costedRevenue: number };
const row = (key: string): Row => ({ key, revenue: 0, amount: 0, cost: 0, profit: 0, margin: null, qty: 0, lines: 0, costed: 0, costedRevenue: 0 });
export type ProductRow = Row & { category: string; channels: Record<string, { qty: number; revenue: number }>; breakdown: Breakdown };
export type Analysis = { totals: Row & { coverage: number; missingLines: number; undatedOut: number }; channels: (Row & { share: number })[]; products: ProductRow[]; days: Row[];
  components: Breakdown; sources: Record<Financial['source'], number>; missing: string[] };
const close = <T extends Row>(r: T): T => ({ ...r, profit: r.costedRevenue - r.cost, margin: r.costedRevenue ? r4((r.costedRevenue - r.cost) / r.costedRevenue) : null });

/** the dashboard: totals, channels, products (with their per-channel quantities and revenue), days, cost components,
    coverage and rule-based recommendations, for the lines inside the filter. Order shares are taken over all the lines of
    the period so a filter on one product does not move a shared order fee. Profit is counted only on costed revenue. */
export function analyze(lines: CostLine[], rules: CostRule[], opts: Opts = {}): Analysis & { recommendations: Rec[] } {
  const vat = opts.vat ?? 0.15;
  /* an undated line (a summary report without dates) counts while no period is chosen; a period leaves it out, and says how many */
  const period = !!(opts.from || opts.to);
  const undatedOut = period ? lines.filter((l) => !validDay(l.date)).length : 0;
  const inPeriod = lines.filter((l) => Number.isFinite(n(l.amount)) && (validDay(l.date) ? (!opts.from || day(l.date) >= opts.from) && (!opts.to || day(l.date) <= opts.to) : !period));
  const shares = orderShares(inPeriod);
  const chSet = opts.channels && opts.channels.length ? new Set(opts.channels.map(normalizeChannel)) : null;
  const total = row('الكل'), byCh = new Map<string, Row>(), byDay = new Map<string, Row>(), comp = zero(), sources: Record<Financial['source'], number> = { manual: 0, profit: 0, rule: 0, catalog: 0, none: 0 };
  const byProd = new Map<string, ProductRow>();
  const missing: string[] = [];
  inPeriod.forEach((l, i) => {
    const ch = normalizeChannel(l.channel ?? '') || 'غير محدد';
    if (chSet && !chSet.has(ch)) return;
    if (opts.product && normalizeText(l.product) !== normalizeText(opts.product)) return;
    if (opts.category && (l.category || '') !== opts.category) return;
    const f = resolveFinancial(l, rules, shares[i], { ...opts, vat }), net = Math.round(n(l.amount) / (1 + vat));
    sources[f.source]++;
    const add = (r: Row) => { r.revenue += net; r.amount += n(l.amount); r.qty += n(l.qty); r.lines++; if (f.known) { r.cost += f.cost; r.costed++; r.costedRevenue += net; } };
    add(total);
    add(byCh.get(ch) ?? (byCh.set(ch, row(ch)), byCh.get(ch)!));
    if (validDay(l.date)) add(byDay.get(day(l.date)) ?? (byDay.set(day(l.date), row(day(l.date))), byDay.get(day(l.date))!));
    const pk = l.product || 'غير محدد';
    let p = byProd.get(pk); if (!p) { p = { ...row(pk), category: l.category || '', channels: {}, breakdown: zero() }; byProd.set(pk, p); }
    add(p);
    const pc = p.channels[ch] ?? (p.channels[ch] = { qty: 0, revenue: 0 }); pc.qty += n(l.qty); pc.revenue += net;
    if (f.breakdown) COMPONENTS.forEach((k) => { comp[k] += f.breakdown![k]; p!.breakdown[k] += f.breakdown![k]; });
    if (!f.known && missing.length < 200) missing.push(pk);
  });
  const T = close(total);
  const channels = [...byCh.values()].map(close).map((c) => ({ ...c, share: T.revenue ? r4(c.revenue / T.revenue) : 0 })).sort((a, b) => b.revenue - a.revenue);
  const products = [...byProd.values()].map(close).sort((a, b) => b.revenue - a.revenue);
  const days = [...byDay.values()].map(close).sort((a, b) => a.key.localeCompare(b.key));
  const coverage = T.revenue ? r4(T.costedRevenue / T.revenue) : 1;
  const result: Analysis = { totals: { ...T, coverage, missingLines: T.lines - T.costed, undatedOut }, channels, products, days, components: comp, sources, missing: [...new Set(missing)] };
  return { ...result, recommendations: recommend(result) };
}

export type Rec = { tone: 'ok' | 'warn' | 'bad' | 'info'; tag: string; title: string; body: string };
/** Arabic counted noun: صنف واحد · صنفان · 3 أصناف · 11 صنفاً */
export const items = (k: number) => (k === 1 ? 'صنف واحد' : k === 2 ? 'صنفان' : k >= 3 && k <= 10 ? `${k} أصناف` : `${k} صنفاً`);
const pctTxt = (m: number | null) => (m == null ? '—' : (Math.round(m * 1000) / 10) + '٪');
const sarTxt = (h: number) => (Math.round(h / 100)).toLocaleString('en-US') + ' ر.س';
/** rule-based advice from the numbers themselves (no AI): coverage, losses, weak margins, channel gaps, fees, concentration */
export function recommend(a: Analysis): Rec[] {
  const out: Rec[] = [], T = a.totals;
  if (!T.lines) return [{ tone: 'info', tag: 'لا توجد بيانات', title: 'لا حركات في هذه الفترة', body: 'وسّع الفترة أو القنوات، أو استورد سطور المبيعات.' }];
  if (T.coverage < 0.99) out.push({ tone: 'warn', tag: 'استكمال التكلفة', title: `تغطية التكلفة ${pctTxt(T.coverage)}`, body: `${T.missingLines} حركة بلا تكلفة مطابقة (${a.missing.slice(0, 3).join('، ')}). أضف قاعدة بفترة سريانها قبل الاعتماد على الربح.` });
  const costed = a.products.filter((p) => p.costed);
  const losing = costed.filter((p) => p.profit < 0).sort((x, y) => x.profit - y.profit);
  if (losing.length) {
    const p = losing[0], unitCost = p.qty ? p.cost / p.qty : 0, need = unitCost / 0.85;
    out.push({ tone: 'bad', tag: 'خسارة', title: `${items(losing.length)} ${losing.length === 1 ? 'يبيع' : 'تبيع'} بخسارة — ${losing.length === 1 ? '' : 'أكبرها '}${p.key}`, body: `خسارة ${sarTxt(-p.profit)}. لهامش 15٪ يلزم سعر صافٍ ≥ ${(need / 100).toFixed(2)} ر.س للوحدة، أو خفض التكلفة.` });
  }
  const weak = costed.filter((p) => p.margin != null && p.margin >= 0 && p.margin < 0.1);
  if (weak.length) out.push({ tone: 'warn', tag: 'هامش ضعيف', title: `${items(weak.length)} — هامش أقل من 10٪`, body: weak.slice(0, 3).map((p) => `${p.key} ${pctTxt(p.margin)}`).join('، ') + ' — راجع السعر أو حجم التغليف والتجهيز.' });
  const chs = a.channels.filter((c) => c.costed && c.margin != null);
  if (chs.length >= 2) {
    const best = chs.reduce((x, y) => (y.margin! > x.margin! ? y : x)), worst = chs.reduce((x, y) => (y.margin! < x.margin! ? y : x));
    if (best.key !== worst.key && best.margin! - worst.margin! >= 0.05) out.push({ tone: 'info', tag: 'فجوة القنوات', title: `${worst.key} أقل القنوات هامشاً (${pctTxt(worst.margin)})`, body: `مقابل ${best.key} ${pctTxt(best.margin)}. راجع رسوم ${worst.key} وتسعيرها أو وجّه العروض إلى ${best.key}.` });
  }
  const fees = a.components.platformPct + a.components.platformFixed + a.components.card + a.components.vip + a.components.shipping + a.components.otherPct;
  if (T.costedRevenue && fees / T.costedRevenue >= 0.08) out.push({ tone: 'warn', tag: 'الرسوم', title: `رسوم البيع ${pctTxt(r4(fees / T.costedRevenue))} من الإيراد`, body: `عمولات المنصات والبطاقات والشحن ${sarTxt(fees)}. فاوض على العمولة أو اربط الشحن المجاني بحد أدنى للطلب.` });
  const top = a.products[0];
  if (top && T.revenue && top.revenue / T.revenue >= 0.4) out.push({ tone: 'info', tag: 'التركّز', title: `${top.key} = ${pctTxt(r4(top.revenue / T.revenue))} من الإيراد`, body: 'اعتماد كبير على صنف واحد؛ أي تغير في تكلفته أو توفره يحرك الربح كله.' });
  if (!out.length) out.push({ tone: 'ok', tag: 'سليم', title: `الهامش الكلي ${pctTxt(T.margin)}`, body: 'كل الحركات مغطاة بالتكلفة ولا أصناف خاسرة أو ضعيفة في هذه الفترة.' });
  return out;
}

/** the same analysis over the previous period of equal length (for «مقارنة فترتين») */
export function previousPeriod(from: string, to: string): { from: string; to: string } {
  const a = Date.parse(from + 'T00:00:00Z'), b = Date.parse(to + 'T00:00:00Z'), len = Math.round((b - a) / 86400000) + 1;
  const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
  return { from: iso(a - len * 86400000), to: iso(a - 86400000) };
}
