export type WasteMethod = 'yield' | 'markup';
export type MarginMode = 'net' | 'gross_excel';
export type RoundingPolicy =
  | 'none'
  | 'two_decimals'
  | 'whole_riyal_up'
  | 'half_riyal_up'
  | 'ending_dot_90'
  | 'ending_9';
export type MarginGrade = 'excellent' | 'good' | 'weak';
export type ExpenseMethod = 'fixed' | 'per_kg' | 'per_dish' | 'percent_of_component_cost';

export interface MarginThresholds {
  excellent: number;
  good: number;
}

export interface RawItem {
  id: string;
  name: string;
  purchasePrice: number;
  isVatInclusive: boolean;
  wastePercent: number;
  sellingPriceNet: number;
  category: string;
  unit: 'kg' | 'piece';
  supplierId: string;
}

export interface BoxItemRef {
  type: 'raw';
  itemId: string;
  quantity: number;
  applyWaste: boolean;
}

export interface BoxNestedRef {
  type: 'box';
  boxId: string;
  quantity: number;
}

export type BoxComponent = BoxItemRef | BoxNestedRef;

export interface PackagingExpense {
  id: string;
  name: string;
  count: number;
  unitCostNet: number;
}

export interface LinkedExpense {
  id: string;
  name: string;
  method: ExpenseMethod;
  value: number;
  isVatInclusive: boolean;
  appliesToBoxIds?: string[];
}

export interface BoxDefinition {
  id: string;
  name: string;
  components: BoxComponent[];
  packaging: PackagingExpense[];
  linkedExpenses: LinkedExpense[];
  targetMargin?: number;
  sellingPriceNet?: number;
}

export interface EngineSettings {
  defaultVatRate: number;
  wasteMethod: WasteMethod;
  marginMode: MarginMode;
  roundingPolicy: RoundingPolicy;
  marginThresholds: MarginThresholds;
}

export interface CostBreakdown {
  rawComponentsCostNet: number;
  totalWeightKg: number;
  dishesCount: number;
  packagingCostNet: number;
  expensesCostNet: number;
  totalCostNet: number;
}

export interface PricingOutput {
  id: string;
  name: string;
  totalCostNet: number;
  sellingPriceNet: number;
  sellingPriceGross: number;
  profitNet: number;
  marginPercent: number;
  breakEvenPriceNet: number;
  targetPriceNet: number;
  marginGrade: MarginGrade;
  breakdown: CostBreakdown;
}

export interface PriceEvaluation {
  costNet: number;
  sellingPriceNet: number;
  sellingPriceGross: number;
  profitNet: number;
  marginPercent: number;
  breakEvenPriceNet: number;
  breakEvenPriceGross: number;
  targetPriceNet: number;
  targetPriceGross: number;
  marginGrade: MarginGrade;
}

export interface NRVCut {
  id: string;
  kg: number;
  pricePerKgNet: number;
  furtherCostNet?: number;
}

export interface NRVAllocation {
  id: string;
  nrv: number;
  share: number;
  allocatedJointCostNet: number;
  totalCostNet: number;
  costPerKgNet: number;
}

export interface YieldTrialInput {
  inputKg: number;
  purchaseCostNet: number;
  usableKg: number;
}

export interface YieldTrialOutput {
  usableKg: number;
  wastePercent: number;
  effectiveKgCostNet: number;
}
