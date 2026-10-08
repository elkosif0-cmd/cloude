import { describe, expect, it } from 'vitest';
import { analyze, costByRule, findRule, normalizeChannel, orderShares, previewRule, previousPeriod, resolveFinancial, type CostLine, type CostRule } from './channel-costing-engine';

const L = (o: Partial<CostLine>): CostLine => ({ date: '2026-07-01', amount: 11500, qty: 1, product: 'نعيمي', channel: 'المعرض', ...o });

describe('the rule in force on the sale date', () => {
  const rules: CostRule[] = [
    { id: 'old', product: 'نعيمي', channel: 'المعرض', from: '2026-07-01', to: '2026-07-05', purchase: 40 },
    { id: 'new', product: 'نعيمي', channel: 'المعرض', from: '2026-07-06', to: '2026-07-10', purchase: 46 },
    { id: 'all', product: 'نعيمي', from: '2026-01-01', purchase: 30 },
  ];
  it('days 1–5 take the old cost, days 6–10 the new one, and the totals add up (the v16 example)', () => {
    const lines = [L({ date: '2026-07-03', qty: 5 }), L({ date: '2026-07-08', qty: 5 })];
    expect(findRule(rules, lines[0])!.id).toBe('old');
    expect(findRule(rules, lines[1])!.id).toBe('new');
    const a = analyze(lines, rules);
    expect(a.totals.cost).toBe(5 * 4000 + 5 * 4600);
  });
  it('a rule for the channel beats an all-channels rule; another channel falls back to the all-channels rule', () => {
    expect(findRule(rules, L({ date: '2026-07-02' }))!.id).toBe('old');
    expect(findRule(rules, L({ date: '2026-07-02', channel: 'المتجر' }))!.id).toBe('all');
  });
  it('matches names through hamza and taa-marbuta spelling, and the channel aliases', () => {
    expect(findRule([{ product: 'كبدة غنم', purchase: 1 }], { product: 'كبده غنم', channel: 'x', date: '2026-01-01' })).not.toBeNull();
    expect(normalizeChannel('HungerStation')).toBe('هنغرستيشن');
    expect(normalizeChannel('wholesale')).toBe('الجملة');
    expect(normalizeChannel('سلة')).toBe('سلة');
  });
  it('an undated sale only takes an open rule', () => {
    expect(findRule(rules, L({ date: '' }))).toBeNull();
    expect(findRule([{ id: 'open', product: 'نعيمي', purchase: 1 }], L({ date: '' }))!.id).toBe('open');
  });
});

describe('cost components', () => {
  const rule: CostRule = { product: 'x', purchase: 50, vatPct: 15, includeVat: true, packaging: 1, processing: 2, otherUnit: 0.5, platformPct: 10, platformFixed: 4, cardPct: 2, cardMode: 'conditional', vipPct: 5, vipMode: 'conditional', otherPct: 1, shipping: 20, shippingMode: 'conditional' };
  it('per unit, per sale and per order, with the conditions read from the sale', () => {
    const c = costByRule({ qty: 2, amount: 23000, paymentMethod: 'مدى', customerType: 'عادي', freeShipping: true }, rule, 0.5);
    expect(c.breakdown).toEqual({ purchase: 10000, vat: 1500, packaging: 200, processing: 400, otherUnit: 100, platformPct: 2300, platformFixed: 200, card: 460, vip: 0, otherPct: 230, shipping: 1000 });
    expect(c.cost).toBe(16390);
  });
  it('recoverable purchase VAT is not a cost; a legacy { cost } rule is a purchase cost per unit', () => {
    expect(costByRule({ qty: 3, amount: 0 }, { product: 'x', purchase: 10, vatPct: 15, includeVat: false }).breakdown.vat).toBe(0);
    expect(costByRule({ qty: 3, amount: 0 }, { product: 'x', cost: 12.5 }).cost).toBe(3750);
  });
  it('the preview applies or drops every condition at once', () => {
    const on = previewRule(rule, 1, 115, true), off = previewRule(rule, 1, 115, false);
    expect(on.cost - off.cost).toBe(230 + 575 + 2000);
    expect(off.net).toBe(10000);
  });
});

describe('orders, evidence and the dashboard', () => {
  it('a fixed order fee is shared over the order by amount and charged once', () => {
    const lines = [L({ invoice: 'A', amount: 3000 }), L({ invoice: 'A', amount: 1000, product: 'مفروم' }), L({ invoice: 'B', amount: 5000 }), L({ amount: 500 })];
    const s = orderShares(lines);
    expect(s).toEqual([0.75, 0.25, 1, 1]);
    const rules: CostRule[] = [{ product: 'نعيمي', platformFixed: 8 }, { product: 'مفروم', platformFixed: 8 }];
    const a = analyze(lines, rules);
    expect(a.components.platformFixed).toBe(600 + 200 + 800 + 800);
  });
  it('imported cost, then imported profit, then the rule, then the catalog, then unknown', () => {
    const rules: CostRule[] = [{ product: 'نعيمي', purchase: 40 }];
    expect(resolveFinancial(L({ manualCost: 1234 }), rules).source).toBe('manual');
    expect(resolveFinancial(L({ profit: 2000 }), rules)).toMatchObject({ source: 'profit', cost: 8000 });
    expect(resolveFinancial(L({}), rules)).toMatchObject({ source: 'rule', cost: 4000 });
    expect(resolveFinancial(L({ product: 'عجل', qty: 2 }), rules, 1, { catalogCost: () => 3000 })).toMatchObject({ source: 'catalog', cost: 6000 });
    expect(resolveFinancial(L({ product: 'عجل' }), rules)).toMatchObject({ known: false, source: 'none' });
  });
  it('profit is counted on costed revenue only; coverage and the missing lines are reported', () => {
    const a = analyze([L({ amount: 11500 }), L({ product: 'عجل', amount: 23000 })], [{ product: 'نعيمي', purchase: 60 }]);
    expect(a.totals.revenue).toBe(30000);
    expect(a.totals.profit).toBe(10000 - 6000);
    expect(a.totals.coverage).toBeCloseTo(1 / 3, 4);
    expect(a.totals.missingLines).toBe(1);
    expect(a.recommendations[0].tag).toBe('استكمال التكلفة');
  });
  it('channels, per-channel product columns and the filters', () => {
    const lines = [L({ channel: 'معرض', qty: 2 }), L({ channel: 'المتجر', qty: 1, amount: 23000 }), L({ product: 'مفروم', channel: 'هنقرستيشن' })];
    const a = analyze(lines, [{ product: 'نعيمي', purchase: 50 }, { product: 'مفروم', purchase: 50 }]);
    expect(a.channels.map((c) => c.key)).toEqual(['المتجر', 'المعرض', 'هنغرستيشن']);
    expect(a.products[0].channels['المعرض']).toEqual({ qty: 2, revenue: 10000 });
    expect(analyze(lines, [], { channels: ['المتجر'] }).totals.lines).toBe(1);
    expect(analyze(lines, [], { product: 'مفروم' }).totals.lines).toBe(1);
    expect(analyze(lines, [], { from: '2026-08-01' }).totals.lines).toBe(0);
  });
  it('recommends from the numbers: a losing product gets the price for a 15% margin', () => {
    const a = analyze([L({ qty: 1, amount: 11500 })], [{ product: 'نعيمي', purchase: 120 }]);
    const loss = a.recommendations.find((r) => r.tag === 'خسارة')!;
    expect(loss.body).toContain('141.18');
  });
  it('undated lines (a summary report) count without a period and are left out, and counted, with one', () => {
    const lines = [L({ date: '', profit: 1000 }), L({ date: '2026-07-02' })];
    expect(analyze(lines, []).totals.lines).toBe(2);
    expect(analyze(lines, []).days.map((d) => d.key)).toEqual(['2026-07-02']);
    const p = analyze(lines, [], { from: '2026-07-01' });
    expect(p.totals.lines).toBe(1);
    expect(p.totals.undatedOut).toBe(1);
  });
  it('counts in Arabic', async () => {
    const { items } = await import('./channel-costing-engine');
    expect([1, 2, 3, 10, 11, 25].map(items)).toEqual(['صنف واحد', 'صنفان', '3 أصناف', '10 أصناف', '11 صنفاً', '25 صنفاً']);
  });
  it('the previous period has the same length', () => {
    expect(previousPeriod('2026-07-11', '2026-07-20')).toEqual({ from: '2026-07-01', to: '2026-07-10' });
  });
});
