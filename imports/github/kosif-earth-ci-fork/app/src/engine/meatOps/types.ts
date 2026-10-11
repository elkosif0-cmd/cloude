export interface CarcassInput {
  id: string;
  name: string;
  liveWeightKg: number;
  carcassWeightKg: number;
  totalCostHalalas: number;
}

export interface CutSpec {
  id: string;
  name: string;
  yieldPct: number;
  pricePerKgHalalas: number;
}

export interface CutAllocation {
  cutId: string;
  name: string;
  weightKg: number;
  allocatedCostHalalas: number;
  costPerKgHalalas: number;
  pricePerKgHalalas: number;
  marginPerKgHalalas: number;
  marginPct: number;
  revenueIfSoldHalalas: number;
}

export interface Receivable {
  id: string;
  customerId: string;
  invoiceDate: string;
  totalHalalas: number;
  paidHalalas: number;
}

export interface AgingBuckets {
  current: number;
  d1_30: number;
  d31_60: number;
  d61_90: number;
  d90plus: number;
  total: number;
}
