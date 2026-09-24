import type {
  BoxDefinition,
  CostBreakdown,
  EngineSettings,
  LinkedExpense,
  MarginGrade,
  NRVAllocation,
  NRVCut,
  PriceEvaluation,
  PricingOutput,
  RawItem,
  RoundingPolicy,
  WasteMethod,
  YieldTrialInput,
  YieldTrialOutput,
} from './types';

export class PricingReferenceError extends Error {}
export class PricingCycleError extends Error {}

export const roundToPrecision = (num: number, decimals = 4): number => {
  if (!Number.isFinite(num)) throw new Error('القيمة الحسابية غير صالحة');
  const factor = 10 ** decimals;
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

export const toHalalas = (sar: number): number => Math.round(roundToPrecision(sar, 4) * 100);
export const fromHalalas = (halalas: number): number => halalas / 100;

export const extractNetPrice = (
  amount: number,
  isVatInclusive: boolean,
  vatRate: number
): number => {
  if (!Number.isFinite(amount) || amount < 0) throw new Error('السعر يجب أن يكون رقماً موجباً');
  if (!isVatInclusive || vatRate <= 0) return amount;
  return amount / (1 + vatRate);
};

export const calculateUsableUnitCost = (
  netCost: number,
  wastePercent: number,
  method: WasteMethod
): number => {
  if (!Number.isFinite(netCost) || netCost < 0) throw new Error('التكلفة غير صالحة');
  if (!Number.isFinite(wastePercent) || wastePercent < 0) throw new Error('نسبة الهدر غير صالحة');
  if (wastePercent <= 0) return netCost;
  if (wastePercent >= 1) throw new Error('لا يمكن أن تكون نسبة الهدر 100% أو أكثر');
  return method === 'yield'
    ? netCost / (1 - wastePercent)
    : netCost * (1 + wastePercent);
};

const roundCandidate = (price: number, policy: RoundingPolicy): number => {
  switch (policy) {
    case 'none':
      return roundToPrecision(price, 4);
    case 'two_decimals':
      return Math.round((price + Number.EPSILON) * 100) / 100;
    case 'whole_riyal_up':
      return Math.ceil(price);
    case 'half_riyal_up':
      return Math.ceil(price * 2) / 2;
    case 'ending_dot_90': {
      const base = Math.floor(price);
      const candidate = base + 0.90;
      return candidate + Number.EPSILON >= price ? candidate : candidate + 1;
    }
    case 'ending_9': {
      const ceil = Math.ceil(price - Number.EPSILON);
      let candidate = Math.floor(ceil / 10) * 10 + 9;
      if (candidate + Number.EPSILON < price) candidate += 10;
      return candidate;
    }
  }
};

export const applyRoundingPolicy = (
  price: number,
  policy: RoundingPolicy,
  floorCost = 0
): number => {
  if (!Number.isFinite(price) || !Number.isFinite(floorCost)) throw new Error('قيمة التقريب غير صالحة');
  const target = Math.max(0, price, floorCost);
  let rounded = roundCandidate(target, policy);
  while (rounded + 1e-9 < floorCost) {
    rounded = roundCandidate(Math.max(target, rounded + 0.01), policy);
  }
  return roundToPrecision(rounded, 4);
};

export const marginGrade = (
  margin: number,
  thresholds: EngineSettings['marginThresholds']
): MarginGrade => {
  if (margin >= thresholds.excellent) return 'excellent';
  if (margin >= thresholds.good) return 'good';
  return 'weak';
};

const solveTargetNet = (
  costNet: number,
  targetMargin: number,
  settings: EngineSettings
): number => {
  if (targetMargin < 0 || targetMargin >= 1) throw new Error('الهامش المستهدف يجب أن يكون بين 0 و100%');
  if (settings.marginMode === 'net') return costNet / (1 - targetMargin);
  const denominator = 1 - targetMargin * (1 + settings.defaultVatRate);
  if (denominator <= 0) throw new Error('الهامش المستهدف غير ممكن على أساس gross_excel');
  return costNet / denominator;
};

export const evaluatePrice = (
  costNet: number,
  sellingPriceGross: number,
  targetMargin: number,
  settings: EngineSettings
): PriceEvaluation => {
  if (costNet < 0 || sellingPriceGross < 0) throw new Error('التكلفة والسعر لا يمكن أن يكونا سالبين');
  const vat = Math.max(0, settings.defaultVatRate);
  const sellingPriceNet = sellingPriceGross / (1 + vat);
  const profitNet = sellingPriceNet - costNet;
  const marginPercent = settings.marginMode === 'net'
    ? (sellingPriceNet > 0 ? profitNet / sellingPriceNet : 0)
    : (sellingPriceGross > 0 ? profitNet / sellingPriceGross : 0);
  const rawTargetNet = solveTargetNet(costNet, targetMargin, settings);
  const rawTargetGross = rawTargetNet * (1 + vat);
  const targetPriceGross = applyRoundingPolicy(
    rawTargetGross,
    settings.roundingPolicy,
    costNet * (1 + vat)
  );
  const targetPriceNet = targetPriceGross / (1 + vat);
  return {
    costNet: roundToPrecision(costNet),
    sellingPriceNet: roundToPrecision(sellingPriceNet),
    sellingPriceGross: roundToPrecision(sellingPriceGross),
    profitNet: roundToPrecision(profitNet),
    marginPercent: roundToPrecision(marginPercent, 6),
    breakEvenPriceNet: roundToPrecision(costNet),
    breakEvenPriceGross: roundToPrecision(costNet * (1 + vat)),
    targetPriceNet: roundToPrecision(targetPriceNet),
    targetPriceGross: roundToPrecision(targetPriceGross),
    marginGrade: marginGrade(marginPercent, settings.marginThresholds),
  };
};

export const calculateRawPricing = (
  item: RawItem,
  settings: EngineSettings,
  targetMargin = settings.marginThresholds.excellent
): PricingOutput => {
  const purchaseNet = extractNetPrice(item.purchasePrice, item.isVatInclusive, settings.defaultVatRate);
  const usableCost = calculateUsableUnitCost(purchaseNet, item.wastePercent, settings.wasteMethod);
  const sellingPriceGross = item.sellingPriceNet * (1 + settings.defaultVatRate);
  const evaluation = evaluatePrice(usableCost, sellingPriceGross, targetMargin, settings);
  return {
    id: item.id,
    name: item.name,
    totalCostNet: roundToPrecision(usableCost),
    sellingPriceNet: roundToPrecision(item.sellingPriceNet),
    sellingPriceGross: roundToPrecision(sellingPriceGross),
    profitNet: roundToPrecision(item.sellingPriceNet - usableCost),
    marginPercent: evaluation.marginPercent,
    breakEvenPriceNet: roundToPrecision(usableCost),
    targetPriceNet: evaluation.targetPriceNet,
    marginGrade: evaluation.marginGrade,
    breakdown: {
      rawComponentsCostNet: roundToPrecision(usableCost),
      totalWeightKg: item.unit === 'kg' ? 1 : 0,
      dishesCount: 0,
      packagingCostNet: 0,
      expensesCostNet: 0,
      totalCostNet: roundToPrecision(usableCost),
    },
  };
};

const linkedExpenseCost = (
  expense: LinkedExpense,
  boxId: string,
  baseComponentCostNet: number,
  totalWeightKg: number,
  dishesCount: number,
  vatRate: number
): number => {
  const applies = !expense.appliesToBoxIds?.length || expense.appliesToBoxIds.includes(boxId);
  if (!applies) return 0;
  if (expense.method === 'percent_of_component_cost') return baseComponentCostNet * expense.value;
  const valueNet = extractNetPrice(expense.value, expense.isVatInclusive, vatRate);
  if (expense.method === 'fixed') return valueNet;
  if (expense.method === 'per_kg') return valueNet * totalWeightKg;
  return valueNet * dishesCount;
};

export const calculateBoxBreakdown = (
  box: BoxDefinition,
  rawItems: RawItem[],
  boxes: BoxDefinition[],
  settings: EngineSettings,
  stack: readonly string[] = []
): CostBreakdown => {
  if (stack.includes(box.id)) throw new PricingCycleError('تم اكتشاف حلقة دائرية في البوكسات: ' + [...stack, box.id].join(' -> '));
  const nextStack = [...stack, box.id];
  const rawMap = new Map(rawItems.map(x => [x.id, x]));
  const boxMap = new Map(boxes.map(x => [x.id, x]));
  let rawComponentsCostNet = 0;
  let totalWeightKg = 0;
  let dishesCount = 0;

  for (const component of box.components) {
    if (component.quantity < 0) throw new Error('كمية المكون لا يمكن أن تكون سالبة');
    if (component.type === 'raw') {
      const raw = rawMap.get(component.itemId);
      if (!raw) throw new PricingReferenceError('صنف خام غير موجود: ' + component.itemId);
      const purchaseNet = extractNetPrice(raw.purchasePrice, raw.isVatInclusive, settings.defaultVatRate);
      const unitCost = component.applyWaste
        ? calculateUsableUnitCost(purchaseNet, raw.wastePercent, settings.wasteMethod)
        : purchaseNet;
      rawComponentsCostNet += unitCost * component.quantity;
      if (raw.unit === 'kg') totalWeightKg += component.quantity;
    } else {
      const nested = boxMap.get(component.boxId);
      if (!nested) throw new PricingReferenceError('بوكس متداخل غير موجود: ' + component.boxId);
      const nestedCost = calculateBoxBreakdown(nested, rawItems, boxes, settings, nextStack);
      rawComponentsCostNet += nestedCost.totalCostNet * component.quantity;
      totalWeightKg += nestedCost.totalWeightKg * component.quantity;
      dishesCount += nestedCost.dishesCount * component.quantity;
    }
  }

  let packagingCostNet = 0;
  for (const p of box.packaging) {
    if (p.count < 0 || p.unitCostNet < 0) throw new Error('بيانات التغليف غير صالحة');
    packagingCostNet += p.count * p.unitCostNet;
    dishesCount += p.count;
  }

  let expensesCostNet = 0;
  for (const exp of box.linkedExpenses) {
    expensesCostNet += linkedExpenseCost(
      exp,
      box.id,
      rawComponentsCostNet,
      totalWeightKg,
      dishesCount,
      settings.defaultVatRate
    );
  }

  const totalCostNet = rawComponentsCostNet + packagingCostNet + expensesCostNet;
  return {
    rawComponentsCostNet: roundToPrecision(rawComponentsCostNet),
    totalWeightKg: roundToPrecision(totalWeightKg),
    dishesCount: roundToPrecision(dishesCount),
    packagingCostNet: roundToPrecision(packagingCostNet),
    expensesCostNet: roundToPrecision(expensesCostNet),
    totalCostNet: roundToPrecision(totalCostNet),
  };
};

export const calculateBoxPricing = (
  box: BoxDefinition,
  rawItems: RawItem[],
  boxes: BoxDefinition[],
  settings: EngineSettings
): PricingOutput => {
  const breakdown = calculateBoxBreakdown(box, rawItems, boxes, settings);
  const target = box.targetMargin ?? settings.marginThresholds.excellent;
  const sellingNet = Math.max(0, box.sellingPriceNet ?? 0);
  const evaluation = evaluatePrice(
    breakdown.totalCostNet,
    sellingNet * (1 + settings.defaultVatRate),
    target,
    settings
  );
  return {
    id: box.id,
    name: box.name,
    totalCostNet: breakdown.totalCostNet,
    sellingPriceNet: roundToPrecision(sellingNet),
    sellingPriceGross: roundToPrecision(sellingNet * (1 + settings.defaultVatRate)),
    profitNet: roundToPrecision(sellingNet - breakdown.totalCostNet),
    marginPercent: evaluation.marginPercent,
    breakEvenPriceNet: breakdown.totalCostNet,
    targetPriceNet: evaluation.targetPriceNet,
    marginGrade: evaluation.marginGrade,
    breakdown,
  };
};

export const hasCircularDependency = (
  targetBoxId: string,
  candidateBoxId: string,
  boxes: BoxDefinition[]
): boolean => {
  const map = new Map(boxes.map(x => [x.id, x]));
  const seen = new Set<string>();
  const visit = (id: string): boolean => {
    if (id === targetBoxId) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    const box = map.get(id);
    if (!box) return false;
    return box.components.some(c => c.type === 'box' && visit(c.boxId));
  };
  return visit(candidateBoxId);
};

export const nrvAllocate = (
  jointCostNet: number,
  cuts: NRVCut[]
): NRVAllocation[] => {
  if (jointCostNet < 0) throw new Error('التكلفة المشتركة لا يمكن أن تكون سالبة');
  const rows = cuts.map(c => {
    const salesValue = Math.max(0, c.kg) * Math.max(0, c.pricePerKgNet);
    const nrv = Math.max(0, salesValue - Math.max(0, c.furtherCostNet ?? 0));
    return { ...c, nrv };
  });
  const totalNrv = rows.reduce((s, r) => s + r.nrv, 0);
  return rows.map(r => {
    const share = totalNrv > 0 ? r.nrv / totalNrv : (rows.length ? 1 / rows.length : 0);
    const allocatedJointCostNet = jointCostNet * share;
    const totalCostNet = allocatedJointCostNet + Math.max(0, r.furtherCostNet ?? 0);
    return {
      id: r.id,
      nrv: roundToPrecision(r.nrv),
      share: roundToPrecision(share, 8),
      allocatedJointCostNet: roundToPrecision(allocatedJointCostNet),
      totalCostNet: roundToPrecision(totalCostNet),
      costPerKgNet: r.kg > 0 ? roundToPrecision(totalCostNet / r.kg) : 0,
    };
  });
};

export const yieldTrial = (trial: YieldTrialInput): YieldTrialOutput => {
  if (trial.inputKg <= 0) throw new Error('وزن الإدخال يجب أن يكون أكبر من صفر');
  if (trial.usableKg < 0 || trial.usableKg > trial.inputKg) throw new Error('الوزن الصالح غير منطقي');
  const wastePercent = 1 - trial.usableKg / trial.inputKg;
  return {
    usableKg: roundToPrecision(trial.usableKg),
    wastePercent: roundToPrecision(wastePercent, 8),
    effectiveKgCostNet: trial.usableKg > 0 ? roundToPrecision(trial.purchaseCostNet / trial.usableKg) : 0,
  };
};
