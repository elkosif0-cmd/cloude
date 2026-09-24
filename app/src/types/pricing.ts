export type WasteMethod = 'yield' | 'markup';
export type MarginBasis = 'gross' | 'net';
export type RoundingMethod = 'point90' | 'ceil' | 'half' | 'twoDecimals' | 'none';
export type ItemType = 'raw' | 'box';
export type ProfitTier = 'excellent' | 'good' | 'low' | 'loss' | 'byproduct';

export interface RawItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  purchasePriceGross: number; // شامل الضريبة
  purchaseVatRate: number; // 0.15
  isPurchaseVatReclaimable: boolean;
  wastePercent: number; // e.g. 0.05 = 5%
  sellingPriceGross: number; // السعر المحدد للبيع شامل الضريبة
  supplier?: string;
  isByProduct?: boolean;
  notes?: string;
  archived?: boolean;
  minPriceAlert?: number;
  maxPriceAlert?: number;
}

export interface BoxIngredient {
  rawItemId: string;
  quantity: number; // كمية بالكيلو أو الوحدة
  applyWaste: boolean; // هل يطبق الهدر الخاص بالمادة الخام أم لا
  overrideUnitCost?: number; // تكلفة مخصصة اختيارية
}

export interface SubBoxIngredient {
  subBoxId: string;
  quantity: number;
}

export interface BoxItem {
  id: string;
  code: string;
  name: string;
  category: string;
  sellingPriceGross: number;
  ingredients: BoxIngredient[];
  subBoxes?: SubBoxIngredient[]; // بوكسات متداخلة
  numberOfDishes: number; // عدد الصحون المستخدمة
  dishCostEachGross: number; // سعر الصحن الواحد شامل الضريبة
  linkedExpenseIds: string[]; // مصروفات مرتبطة بهذا البوكس تحديداً
  notes?: string;
  archived?: boolean;
  minPriceAlert?: number;
  maxPriceAlert?: number;
}

export type ExpenseType = 'fixed_amount' | 'percentage_of_cost' | 'per_unit';

export interface ExpenseItem {
  id: string;
  name: string;
  type: ExpenseType;
  amount: number; // ريال ثابت أو نسبة مئوية مثلاً 0.03 = 3%
  applyToAll: boolean;
  vatRate: number;
  notes?: string;
}

export interface RawComputation {
  purchasePriceGross: number;
  purchasePriceNet: number;
  vatAmountPurchase: number;
  wastePercent: number;
  wasteFactor: number;
  usableKgCost: number; // تكلفة الكيلو بعد الهدر
  vatImpact: number;
  wasteImpact: number;
  sellingPriceGross: number;
  sellingPriceNet: number;
  vatAmountSelling: number;
  netProfit: number;
  profitMargin: number; // نسبة مئوية
  profitMarginGrossBasis: number;
  profitMarginNetBasis: number;
  breakEvenGross: number;
  targetPriceGross: number;
  tier: ProfitTier;
  targetAchieved: boolean;
}

export interface BoxCostBreakdown {
  rawsCost: number;
  subBoxesCost: number;
  dishesCostGross: number;
  dishesCostNet: number;
  expensesCost: number;
  totalCost: number;
  totalWeightKg: number;
  ingredientsBreakdown: {
    rawItemId: string;
    rawName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    costSharePercent: number;
  }[];
}

export interface BoxComputation {
  costBreakdown: BoxCostBreakdown;
  totalCostNet: number;
  sellingPriceGross: number;
  sellingPriceNet: number;
  vatAmountSelling: number;
  netProfit: number;
  profitMargin: number;
  profitMarginGrossBasis: number;
  profitMarginNetBasis: number;
  breakEvenGross: number;
  targetPriceGross: number;
  tier: ProfitTier;
  targetAchieved: boolean;
}

export interface PriceRule {
  id: string;
  itemId: string;
  itemType: ItemType;
  condition: 'less_or_equal' | 'greater_or_equal';
  targetValue: number;
  note: string;
  createdAt: string;
}
