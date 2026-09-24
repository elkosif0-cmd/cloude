import { ItemType, ProfitTier } from './pricing';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalItem {
  itemId: string;
  itemType: ItemType;
  name: string;
  code: string;
  oldPriceGross: number;
  newPriceGross: number;
  costNet: number;
  oldMarginPercent: number;
  newMarginPercent: number;
  oldProfitNet: number;
  newProfitNet: number;
  oldTier: ProfitTier;
  newTier: ProfitTier;
  targetAchieved: boolean;
}

export interface ApprovalMemo {
  id: string;
  referenceNumber: string; // APPR-2026-001
  date: string;
  title: string;
  reason: string;
  categoryScope: string;
  items: ApprovalItem[];
  status: ApprovalStatus;
  preparerName: string;
  approverName?: string;
  decisionDate?: string;
  decisionNotes?: string;
  snapshotId?: string;
  createdAt: string;
}

export interface PriceSnapshot {
  id: string;
  referenceNumber?: string;
  timestamp: string;
  reason: string;
  rawItems: {
    id: string;
    code: string;
    name: string;
    sellingPriceGross: number;
    purchasePriceGross: number;
    profitMargin: number;
  }[];
  boxItems: {
    id: string;
    code: string;
    name: string;
    sellingPriceGross: number;
    totalCostNet: number;
    profitMargin: number;
  }[];
}
