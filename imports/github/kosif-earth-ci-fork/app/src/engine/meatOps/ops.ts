import type { AgingBuckets, CarcassInput, CutAllocation, CutSpec, Receivable } from './types';

export const toHalalas = (sar: number) => Math.round((Number(sar) || 0) * 100);
export const toSar = (halalas: number) => (Number(halalas) || 0) / 100;

export const dressingPct = (
  carcass: Pick<CarcassInput, 'liveWeightKg' | 'carcassWeightKg'>
): number => {
  if (carcass.liveWeightKg <= 0) return 0;
  if (carcass.carcassWeightKg < 0) throw new Error('وزن الذبيحة لا يمكن أن يكون سالباً');
  return (carcass.carcassWeightKg / carcass.liveWeightKg) * 100;
};

export const allocateCarcassCost = (
  carcass: CarcassInput,
  cuts: CutSpec[]
): CutAllocation[] => {
  if (carcass.carcassWeightKg <= 0) throw new Error('وزن الذبيحة يجب أن يكون أكبر من صفر');
  if (carcass.totalCostHalalas < 0) throw new Error('تكلفة الذبيحة لا يمكن أن تكون سالبة');

  const totalYield = cuts.reduce((sum, c) => sum + Math.max(0, c.yieldPct), 0);
  if (totalYield <= 0) return [];

  return cuts.map(cut => {
    const yieldPct = Math.max(0, cut.yieldPct);
    const weightKg = carcass.carcassWeightKg * (yieldPct / 100);
    const allocatedCostHalalas = Math.round(
      carcass.totalCostHalalas * (yieldPct / totalYield)
    );
    const costPerKgHalalas = weightKg > 0
      ? Math.round(allocatedCostHalalas / weightKg)
      : 0;
    const marginPerKgHalalas = cut.pricePerKgHalalas - costPerKgHalalas;
    const revenueIfSoldHalalas = Math.round(weightKg * cut.pricePerKgHalalas);
    const marginPct = cut.pricePerKgHalalas > 0
      ? (marginPerKgHalalas / cut.pricePerKgHalalas) * 100
      : 0;

    return {
      cutId: cut.id,
      name: cut.name,
      weightKg,
      allocatedCostHalalas,
      costPerKgHalalas,
      pricePerKgHalalas: cut.pricePerKgHalalas,
      marginPerKgHalalas,
      marginPct,
      revenueIfSoldHalalas,
    };
  });
};

export const suggestPriceHalalas = (
  costHalalas: number,
  targetMarginPct: number
): number => {
  const m = Math.min(Math.max(targetMarginPct, 0), 95) / 100;
  if (costHalalas <= 0) return 0;
  return Math.ceil(costHalalas / (1 - m));
};

export const customerBalanceHalalas = (
  openingBalanceHalalas: number,
  billedHalalas: number,
  paidHalalas: number
): number => openingBalanceHalalas + billedHalalas - paidHalalas;

const daysBetween = (a: Date, b: Date) =>
  Math.floor((a.getTime() - b.getTime()) / 86400000);

export const ageReceivables = (
  receivables: Receivable[],
  asOfISO: string
): AgingBuckets => {
  const asOf = new Date(asOfISO + (asOfISO.length === 10 ? 'T12:00:00Z' : ''));
  if (Number.isNaN(asOf.getTime())) throw new Error('تاريخ التقرير غير صالح');

  const out: AgingBuckets = { current:0, d1_30:0, d31_60:0, d61_90:0, d90plus:0, total:0 };

  for (const r of receivables) {
    const outstanding = Math.max(0, r.totalHalalas - r.paidHalalas);
    if (!outstanding) continue;
    const d = new Date(r.invoiceDate + (r.invoiceDate.length === 10 ? 'T12:00:00Z' : ''));
    if (Number.isNaN(d.getTime())) continue;
    const age = Math.max(0, daysBetween(asOf, d));
    out.total += outstanding;
    if (age === 0) out.current += outstanding;
    else if (age <= 30) out.d1_30 += outstanding;
    else if (age <= 60) out.d31_60 += outstanding;
    else if (age <= 90) out.d61_90 += outstanding;
    else out.d90plus += outstanding;
  }
  return out;
};
