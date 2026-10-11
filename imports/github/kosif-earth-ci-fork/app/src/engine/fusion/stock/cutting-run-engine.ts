/* a cutting run of the meat pack (FOUNDATION §3.7 «عمق قطاع اللحوم»): one carcass (or a batch of carcasses) is cut into the
   cuts that are sold, the by-products, and waste. The joint cost is assigned as IAS 2 allows for joint products:
     • by-products are measured at their net realisable value and that value is deducted from the joint cost;
     • the rest is allocated across the main cuts by relative sales value (or by weight, when sales prices are not known);
     • normal waste (within the pack's tolerance) stays in the cost of the cuts; waste beyond it is abnormal and is expensed
       at the average cost per kilo of the carcass (IAS 2.16).
   Money is in halalas (integers) and the allocation keeps every halala: cuts + by-products + abnormal waste = carcass cost.
   The posting moves the cost out of the carcass account into the cuts, the by-products and the waste expense. */

export type CuttingCut = { name: string; weightKg: number; pricePerKgHalalas?: number };
export type CuttingByProduct = { name: string; weightKg: number; nrvPerKgHalalas: number };
export type CuttingRunInput = {
  id: string; date: string; carcassWeightKg: number; carcassCostHalalas: number;
  cuts: CuttingCut[]; byProducts?: CuttingByProduct[]; wasteKg?: number;
  /** the share of the carcass weight that is normal waste (pack policy), default 3% */
  normalWastePct?: number;
  basis?: 'sales-value' | 'weight';
};
export type CuttingRunLine = { name: string; weightKg: number; costHalalas: number; costPerKgHalalas: number; salesValueHalalas: number | null; marginHalalas: number | null };
export type CuttingRun = {
  basis: 'sales-value' | 'weight';
  cuts: CuttingRunLine[];
  byProducts: { name: string; weightKg: number; valueHalalas: number }[];
  waste: { kg: number; normalKg: number; abnormalKg: number; abnormalCostHalalas: number };
  yieldPct: number;
  /** carcass weight not explained by cuts, by-products and waste (kg, positive = missing) */
  unaccountedKg: number;
  balanced: boolean;
};

/** largest-remainder allocation: integer shares that sum exactly to total */
export function allocateExact(total: number, weights: number[]): number[] {
  const sum = weights.reduce((s, w) => s + Math.max(0, w), 0);
  if (total <= 0 || sum <= 0) return weights.map(() => 0);
  const raw = weights.map((w) => (Math.max(0, w) / sum) * total), out = raw.map(Math.floor);
  let left = total - out.reduce((s, v) => s + v, 0);
  raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0] || a[1] - b[1]).forEach(([, i]) => { if (left > 0) { out[i] += 1; left -= 1; } });
  return out;
}

const kg = (v: number) => Math.round(v * 1000) / 1000;

export function cuttingRun(x: CuttingRunInput): CuttingRun {
  if (!(x.carcassWeightKg > 0)) throw new Error('وزن الذبيحة يجب أن يكون أكبر من صفر');
  if (!Number.isInteger(x.carcassCostHalalas) || x.carcassCostHalalas < 0) throw new Error('تكلفة الذبيحة بالهللة يجب أن تكون عدداً صحيحاً غير سالب');
  const cuts = x.cuts.filter((c) => c.weightKg > 0);
  if (!cuts.length) throw new Error('أضف قطعة واحدة على الأقل بوزن أكبر من صفر');
  const byp = (x.byProducts ?? []).filter((b) => b.weightKg > 0);
  const wasteKg = Math.max(0, x.wasteKg ?? 0), normalKg = kg(x.carcassWeightKg * Math.max(0, x.normalWastePct ?? 3) / 100);
  const abnormalKg = kg(Math.max(0, wasteKg - normalKg));
  const abnormalCost = Math.min(x.carcassCostHalalas, Math.round(abnormalKg * x.carcassCostHalalas / x.carcassWeightKg));
  const bypValues = byp.map((b) => Math.round(b.weightKg * Math.max(0, b.nrvPerKgHalalas)));
  // by-products cannot absorb more than the joint cost left after abnormal waste
  const bypCap = x.carcassCostHalalas - abnormalCost, bypTotal = Math.min(bypCap, bypValues.reduce((s, v) => s + v, 0));
  const bypShares = bypTotal === bypValues.reduce((s, v) => s + v, 0) ? bypValues : allocateExact(bypTotal, bypValues);
  const joint = x.carcassCostHalalas - abnormalCost - bypTotal;
  const priced = cuts.every((c) => (c.pricePerKgHalalas ?? 0) > 0);
  const basis = x.basis === 'weight' || !priced ? 'weight' : 'sales-value';
  const sales = cuts.map((c) => (c.pricePerKgHalalas ?? 0) > 0 ? Math.round(c.weightKg * (c.pricePerKgHalalas as number)) : null);
  const costs = allocateExact(joint, basis === 'weight' ? cuts.map((c) => c.weightKg) : sales.map((s) => s ?? 0));
  const out = cuts.map((c, i) => ({ name: c.name, weightKg: kg(c.weightKg), costHalalas: costs[i], costPerKgHalalas: Math.round(costs[i] / c.weightKg),
    salesValueHalalas: sales[i], marginHalalas: sales[i] === null ? null : (sales[i] as number) - costs[i] }));
  const cutsKg = cuts.reduce((s, c) => s + c.weightKg, 0), bypKg = byp.reduce((s, b) => s + b.weightKg, 0);
  const total = costs.reduce((s, v) => s + v, 0) + bypShares.reduce((s, v) => s + v, 0) + abnormalCost;
  return {
    basis, cuts: out, byProducts: byp.map((b, i) => ({ name: b.name, weightKg: kg(b.weightKg), valueHalalas: bypShares[i] })),
    waste: { kg: kg(wasteKg), normalKg: Math.min(normalKg, kg(wasteKg)), abnormalKg, abnormalCostHalalas: abnormalCost },
    yieldPct: Math.round((cutsKg / x.carcassWeightKg) * 10000) / 100,
    unaccountedKg: kg(x.carcassWeightKg - cutsKg - bypKg - wasteKg),
    balanced: total === x.carcassCostHalalas,
  };
}

export type CuttingAccounts = { carcassAccountId: string; cutsAccountId: string; byProductsAccountId: string; abnormalWasteAccountId: string };

/** the journal of a run, in currency units (2 dp) as the ledger stores them */
export function cuttingRunJournal(x: CuttingRunInput, a: CuttingAccounts) {
  const r = cuttingRun(x), sar = (h: number) => h / 100;
  const cutsCost = r.cuts.reduce((s, c) => s + c.costHalalas, 0), bypCost = r.byProducts.reduce((s, b) => s + b.valueHalalas, 0);
  const lines = [
    ...(cutsCost ? [{ accountId: a.cutsAccountId, debit: sar(cutsCost), credit: 0, description: 'قطع جاهزة — ' + r.cuts.map((c) => c.name + ' ' + c.weightKg + 'كجم').join('، ') }] : []),
    ...(bypCost ? [{ accountId: a.byProductsAccountId, debit: sar(bypCost), credit: 0, description: 'منتجات ثانوية بصافي القيمة القابلة للتحقق' }] : []),
    ...(r.waste.abnormalCostHalalas ? [{ accountId: a.abnormalWasteAccountId, debit: sar(r.waste.abnormalCostHalalas), credit: 0, description: 'هدر غير طبيعي ' + r.waste.abnormalKg + 'كجم' }] : []),
    { accountId: a.carcassAccountId, debit: 0, credit: sar(x.carcassCostHalalas), description: 'ذبيحة ' + x.carcassWeightKg + 'كجم' },
  ];
  return { run: r, journal: { id: x.id, date: x.date, reference: 'CUT-' + x.id, memo: 'تشغيلة تقطيع — مردود ' + r.yieldPct + '٪', lines } };
}
