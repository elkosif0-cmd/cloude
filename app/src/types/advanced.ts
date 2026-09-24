export interface ButcheryExperiment {
  id: string;
  name: string;
  date: string;
  animalType: string;
  inputWeightKg: number;
  purchaseCostGross: number;
  cuts: {
    cutName: string;
    weightKg: number;
    cutType: 'prime_meat' | 'secondary_meat' | 'bone' | 'fat' | 'byproduct';
    suggestedSellingPrice: number;
  }[];
  totalOutputWeightKg: number;
  usableMeatYieldPercent: number; // مثلاً 58%
  costFactorCF: number; // معامل التكلفة
  notes?: string;
}

export interface NRVProductItem {
  id: string;
  name: string;
  quantityKg: number;
  sellingPriceGross: number;
  processingCostPerKg: number;
  nrvTotal: number;
  allocationPercent: number;
  allocatedJointCost: number;
  unitCostAllocated: number;
  profitMarginPercent: number;
}

export interface NRVModel {
  id: string;
  title: string;
  carcassName: string;
  totalJointCostNet: number;
  items: NRVProductItem[];
  updatedAt: string;
}

export interface Capability {
  id: string;
  version: string;
  type: 'Skill' | 'Tool' | 'Agent';
  risk: 'Low' | 'Medium' | 'High';
  name: string;
  description: string;
  requiredContext: string;
  permissions: string;
  targetView: string;
  status: 'active' | 'sandboxed' | 'disabled';
}

export interface HealthCheckItem {
  id: string;
  title: string;
  category: 'storage' | 'pricing' | 'commerce' | 'approvals' | 'jev';
  level: 'ok' | 'info' | 'warning' | 'critical';
  message: string;
  actionViewId?: string;
  actionLabel?: string;
}
