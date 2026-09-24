import {
  RawItem,
  BoxItem,
  ExpenseItem,
  RawComputation,
  BoxComputation,
  BoxCostBreakdown,
  ProfitTier,
  WasteMethod,
  MarginBasis,
  RoundingMethod,
} from '../types/pricing';
import { AppSettings } from '../types/settings';

/**
 * جولة تقريب الأسعار وفق الأساليب المحددة في النظام
 */
export function roundPrice(price: number, method: RoundingMethod): number {
  if (isNaN(price) || price <= 0) return 0;
  switch (method) {
    case 'point90': {
      // 149.20 -> 149.90, 150.00 -> 149.90 or 150.90 based on standard retail rounding
      const floor = Math.floor(price);
      return floor + 0.90;
    }
    case 'ceil':
      return Math.ceil(price);
    case 'half':
      return Math.ceil(price * 2) / 2;
    case 'twoDecimals':
      return Math.round(price * 100) / 100;
    case 'none':
    default:
      return Math.round(price * 100) / 100;
  }
}

/**
 * حساب معامل الهدر
 * Yield method: factor = 1 / (1 - waste)
 * Markup method: factor = 1 + waste
 */
export function computeWasteFactor(wastePercent: number, method: WasteMethod): number {
  const w = Math.max(0, Math.min(0.99, wastePercent));
  if (method === 'yield') {
    return 1 / (1 - w);
  }
  return 1 + w;
}

/**
 * حساب سعر البيع الصافي
 */
export function computeNetSales(grossPrice: number, vatRate: number): number {
  if (grossPrice <= 0) return 0;
  return grossPrice / (1 + vatRate);
}

/**
 * تصنيف الربحية
 */
export function determineProfitTier(
  profitMargin: number,
  netProfit: number,
  settings: Pick<AppSettings, 'excellentThreshold' | 'goodThreshold'>,
  isByProduct = false
): ProfitTier {
  if (isByProduct) return 'byproduct';
  if (netProfit <= 0) return 'loss';
  if (profitMargin >= settings.excellentThreshold) return 'excellent';
  if (profitMargin >= settings.goodThreshold) return 'good';
  return 'low';
}

/**
 * حساب تكلفة وسعر صنف مادة خام (Raw Item)
 */
export function computeRawItem(
  item: RawItem,
  settings: AppSettings
): RawComputation {
  const vatRate = item.purchaseVatRate ?? settings.defaultVatRate;
  
  // صافي سعر الشراء
  const purchasePriceNet = item.isPurchaseVatReclaimable
    ? item.purchasePriceGross / (1 + vatRate)
    : item.purchasePriceGross;
    
  const vatAmountPurchase = item.purchasePriceGross - purchasePriceNet;
  
  // معامل الهدر
  const wasteFactor = computeWasteFactor(item.wastePercent, settings.wasteMethod);
  const usableKgCost = purchasePriceNet * wasteFactor;
  
  const vatImpact = vatAmountPurchase;
  const wasteImpact = usableKgCost - purchasePriceNet;
  
  const sellingPriceGross = item.sellingPriceGross;
  const sellingPriceNet = computeNetSales(sellingPriceGross, settings.defaultVatRate);
  const vatAmountSelling = sellingPriceGross - sellingPriceNet;
  
  const netProfit = sellingPriceNet - usableKgCost;
  
  // حساب الهامش
  const marginGrossBasis = sellingPriceGross > 0 ? (netProfit / sellingPriceGross) : 0;
  const marginNetBasis = sellingPriceNet > 0 ? (netProfit / sellingPriceNet) : 0;
  
  const profitMargin = settings.marginBasis === 'gross' ? marginGrossBasis : marginNetBasis;
  
  // نقطة التعادل شامل الضريبة
  const breakEvenGross = usableKgCost * (1 + settings.defaultVatRate);
  
  // السعر المطلوب لتحقيق الهامش المستهدف
  let targetPriceGross = 0;
  const targetMargin = settings.targetProfitMargin;
  if (settings.marginBasis === 'net') {
    if (targetMargin < 1) {
      const targetNet = usableKgCost / (1 - targetMargin);
      targetPriceGross = targetNet * (1 + settings.defaultVatRate);
    }
  } else {
    // gross basis
    const factor = (1 / (1 + settings.defaultVatRate)) - targetMargin;
    if (factor > 0) {
      targetPriceGross = usableKgCost / factor;
    }
  }
  
  targetPriceGross = roundPrice(targetPriceGross, settings.roundingMethod);
  
  const tier = determineProfitTier(profitMargin, netProfit, settings, item.isByProduct);
  const targetAchieved = profitMargin >= settings.targetProfitMargin;
  
  return {
    purchasePriceGross: item.purchasePriceGross,
    purchasePriceNet,
    vatAmountPurchase,
    wastePercent: item.wastePercent,
    wasteFactor,
    usableKgCost,
    vatImpact,
    wasteImpact,
    sellingPriceGross,
    sellingPriceNet,
    vatAmountSelling,
    netProfit,
    profitMargin,
    profitMarginGrossBasis: marginGrossBasis,
    profitMarginNetBasis: marginNetBasis,
    breakEvenGross,
    targetPriceGross,
    tier,
    targetAchieved,
  };
}

/**
 * فحص منع الحلقات الدائرية (Circular Dependency Check)
 */
export function hasCircularDependency(
  targetBoxId: string,
  candidateSubBoxId: string,
  allBoxes: BoxItem[],
  visited = new Set<string>()
): boolean {
  if (candidateSubBoxId === targetBoxId) return true;
  if (visited.has(candidateSubBoxId)) return false;
  visited.add(candidateSubBoxId);

  const subBox = allBoxes.find((b) => b.id === candidateSubBoxId);
  if (!subBox || !subBox.subBoxes) return false;

  for (const inner of subBox.subBoxes) {
    if (inner.subBoxId === targetBoxId) return true;
    if (hasCircularDependency(targetBoxId, inner.subBoxId, allBoxes, visited)) {
      return true;
    }
  }
  return false;
}

/**
 * حساب تفصيلي لتكلفة البوكس ومكوناته
 */
export function computeBoxCostBreakdown(
  box: BoxItem,
  rawItems: RawItem[],
  allBoxes: BoxItem[],
  expenses: ExpenseItem[],
  settings: AppSettings,
  depth = 0,
  visitedBoxIds = new Set<string>()
): BoxCostBreakdown {
  if (depth > 10 || visitedBoxIds.has(box.id)) {
    // منع الحلقات المتكررة كحماية إضافية
    return {
      rawsCost: 0,
      subBoxesCost: 0,
      dishesCostGross: 0,
      dishesCostNet: 0,
      expensesCost: 0,
      totalCost: 0,
      totalWeightKg: 0,
      ingredientsBreakdown: [],
    };
  }

  visitedBoxIds.add(box.id);

  let rawsCost = 0;
  let totalWeightKg = 0;
  const ingredientsBreakdown: BoxCostBreakdown['ingredientsBreakdown'] = [];

  // حساب المواد الخام
  for (const ing of box.ingredients || []) {
    const raw = rawItems.find((r) => r.id === ing.rawItemId);
    if (!raw) continue;

    let unitCost: number;
    if (ing.overrideUnitCost !== undefined && ing.overrideUnitCost > 0) {
      unitCost = ing.overrideUnitCost;
    } else {
      const rawComp = computeRawItem(raw, settings);
      unitCost = ing.applyWaste ? rawComp.usableKgCost : rawComp.purchasePriceNet;
    }

    const itemTotalCost = unitCost * ing.quantity;
    rawsCost += itemTotalCost;
    totalWeightKg += ing.quantity;

    ingredientsBreakdown.push({
      rawItemId: raw.id,
      rawName: raw.name,
      quantity: ing.quantity,
      unitCost,
      totalCost: itemTotalCost,
      costSharePercent: 0, // سنحسبها لاحقاً بالنسبة للتكلفة الإجمالية
    });
  }

  // حساب البوكسات المتداخلة (Nested Sub-boxes)
  let subBoxesCost = 0;
  for (const sub of box.subBoxes || []) {
    const subBox = allBoxes.find((b) => b.id === sub.subBoxId);
    if (!subBox) continue;

    const subCostBreakdown = computeBoxCostBreakdown(
      subBox,
      rawItems,
      allBoxes,
      expenses,
      settings,
      depth + 1,
      new Set(visitedBoxIds)
    );
    subBoxesCost += subCostBreakdown.totalCost * sub.quantity;
    totalWeightKg += subCostBreakdown.totalWeightKg * sub.quantity;
  }

  // تكلفة الصحون (حسب فلسفة المصدر الصارمة)
  // تكلفة الصحن الواحد شامل الضريبة -> صافي الصحن = السعر / (1 + ضريبة)
  // إجمالي تكلفة الصحون = صافي الصحن الواحد * عدد الصحون
  const vatRate = settings.defaultVatRate;
  const dishCostGrossEach = box.dishCostEachGross || 0;
  const dishCostNetEach = dishCostGrossEach / (1 + vatRate);
  const numberOfDishes = box.numberOfDishes || 0;
  const dishesCostNet = dishCostNetEach * numberOfDishes;
  const dishesCostGross = dishCostGrossEach * numberOfDishes;

  // المصروفات
  let expensesCost = 0;
  const directAndMaterials = rawsCost + subBoxesCost + dishesCostNet;

  for (const exp of expenses) {
    const isApplicable = exp.applyToAll || (box.linkedExpenseIds && box.linkedExpenseIds.includes(exp.id));
    if (!isApplicable) continue;

    const expVat = exp.vatRate ?? vatRate;
    const expNet = exp.amount / (1 + expVat);

    if (exp.type === 'fixed_amount') {
      expensesCost += expNet;
    } else if (exp.type === 'percentage_of_cost') {
      expensesCost += directAndMaterials * exp.amount;
    } else if (exp.type === 'per_unit') {
      expensesCost += expNet * (totalWeightKg || 1);
    }
  }

  const totalCost = directAndMaterials + expensesCost;

  // ضبط نسب المشاركة للمكونات
  for (const ing of ingredientsBreakdown) {
    ing.costSharePercent = totalCost > 0 ? (ing.totalCost / totalCost) * 100 : 0;
  }

  return {
    rawsCost,
    subBoxesCost,
    dishesCostGross,
    dishesCostNet,
    expensesCost,
    totalCost,
    totalWeightKg,
    ingredientsBreakdown,
  };
}

/**
 * حساب بوكس كامل (سعر، ربح، هامش، نقطة تعادل، هدف)
 */
export function computeBoxItem(
  box: BoxItem,
  rawItems: RawItem[],
  allBoxes: BoxItem[],
  expenses: ExpenseItem[],
  settings: AppSettings
): BoxComputation {
  const costBreakdown = computeBoxCostBreakdown(box, rawItems, allBoxes, expenses, settings);
  const totalCostNet = costBreakdown.totalCost;

  const sellingPriceGross = box.sellingPriceGross;
  const sellingPriceNet = computeNetSales(sellingPriceGross, settings.defaultVatRate);
  const vatAmountSelling = sellingPriceGross - sellingPriceNet;

  const netProfit = sellingPriceNet - totalCostNet;

  const marginGrossBasis = sellingPriceGross > 0 ? (netProfit / sellingPriceGross) : 0;
  const marginNetBasis = sellingPriceNet > 0 ? (netProfit / sellingPriceNet) : 0;

  const profitMargin = settings.marginBasis === 'gross' ? marginGrossBasis : marginNetBasis;

  const breakEvenGross = totalCostNet * (1 + settings.defaultVatRate);

  // السعر المطلوب لتحقيق الهامش المستهدف
  let targetPriceGross = 0;
  const targetMargin = settings.targetProfitMargin;
  if (settings.marginBasis === 'net') {
    if (targetMargin < 1) {
      const targetNet = totalCostNet / (1 - targetMargin);
      targetPriceGross = targetNet * (1 + settings.defaultVatRate);
    }
  } else {
    const factor = (1 / (1 + settings.defaultVatRate)) - targetMargin;
    if (factor > 0) {
      targetPriceGross = totalCostNet / factor;
    }
  }

  targetPriceGross = roundPrice(targetPriceGross, settings.roundingMethod);

  const tier = determineProfitTier(profitMargin, netProfit, settings, false);
  const targetAchieved = profitMargin >= settings.targetProfitMargin;

  return {
    costBreakdown,
    totalCostNet,
    sellingPriceGross,
    sellingPriceNet,
    vatAmountSelling,
    netProfit,
    profitMargin,
    profitMarginGrossBasis: marginGrossBasis,
    profitMarginNetBasis: marginNetBasis,
    breakEvenGross,
    targetPriceGross,
    tier,
    targetAchieved,
  };
}

/**
 * محاكي التسعير الفوري لبوكس أو مادة خام
 */
export function simulatePricing(
  totalCostNet: number,
  inputPriceGross: number,
  targetMarginInput: number, // e.g. 0.25
  settings: AppSettings
) {
  const vatRate = settings.defaultVatRate;
  
  // 1. حساب مؤشرات السعر المدخل يدوياً
  const netSalesManual = computeNetSales(inputPriceGross, vatRate);
  const netProfitManual = netSalesManual - totalCostNet;
  const marginGrossManual = inputPriceGross > 0 ? netProfitManual / inputPriceGross : 0;
  const marginNetManual = netSalesManual > 0 ? netProfitManual / netSalesManual : 0;
  const currentMargin = settings.marginBasis === 'gross' ? marginGrossManual : marginNetManual;
  const currentTier = determineProfitTier(currentMargin, netProfitManual, settings);

  // 2. حساب السعر المطلوب للنسبة المستهدفة
  let rawRequiredGross = 0;
  if (settings.marginBasis === 'net') {
    if (targetMarginInput < 1) {
      const targetNet = totalCostNet / (1 - targetMarginInput);
      rawRequiredGross = targetNet * (1 + vatRate);
    }
  } else {
    const factor = (1 / (1 + vatRate)) - targetMarginInput;
    if (factor > 0) {
      rawRequiredGross = totalCostNet / factor;
    }
  }

  const roundedRequiredGross = roundPrice(rawRequiredGross, settings.roundingMethod);
  const simNetSales = computeNetSales(roundedRequiredGross, vatRate);
  const simNetProfit = simNetSales - totalCostNet;
  const diffFromCurrent = roundedRequiredGross - inputPriceGross;
  const percentChange = inputPriceGross > 0 ? (diffFromCurrent / inputPriceGross) * 100 : 0;

  return {
    manual: {
      sellingPriceGross: inputPriceGross,
      netSales: netSalesManual,
      netProfit: netProfitManual,
      margin: currentMargin,
      tier: currentTier,
    },
    targetSimulator: {
      targetMarginInput,
      rawRequiredGross,
      roundedRequiredGross,
      expectedNetSales: simNetSales,
      expectedNetProfit: simNetProfit,
      priceDiff: diffFromCurrent,
      percentChange,
    },
  };
}

export function computeQuickSimulation(
  costNet: number,
  sellingPriceGross: number,
  vatRate: number = 0.15,
  marginBasis: 'gross' | 'net' = 'net',
  targetMargin: number = 0.20
) {
  const sellingPriceNet = sellingPriceGross > 0 ? sellingPriceGross / (1 + vatRate) : 0;
  const vatAmountSelling = sellingPriceGross - sellingPriceNet;
  const netProfit = sellingPriceNet - costNet;
  const profitMarginGross = sellingPriceGross > 0 ? netProfit / sellingPriceGross : 0;
  const profitMarginNet = sellingPriceNet > 0 ? netProfit / sellingPriceNet : 0;
  const profitMargin = marginBasis === 'gross' ? profitMarginGross : profitMarginNet;
  const breakEvenGross = costNet * (1 + vatRate);

  return {
    sellingPriceGross,
    sellingPriceNet,
    vatAmountSelling,
    netProfit,
    profitMargin,
    profitMarginGross,
    profitMarginNet,
    breakEvenGross,
  };
}

export function computeTargetSellingPrice(
  costNet: number,
  targetMargin: number = 0.20,
  vatRate: number = 0.15,
  marginBasis: 'gross' | 'net' = 'net'
): number {
  if (costNet <= 0) return 0;
  let targetGross = 0;
  if (marginBasis === 'net') {
    if (targetMargin < 1) {
      const targetNet = costNet / (1 - targetMargin);
      targetGross = targetNet * (1 + vatRate);
    }
  } else {
    const factor = (1 / (1 + vatRate)) - targetMargin;
    if (factor > 0) {
      targetGross = costNet / factor;
    }
  }
  return Math.round(targetGross * 100) / 100;
}
