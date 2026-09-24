export type ReportType =
  | 'executive_summary'
  | 'profitability_breakdown'
  | 'loss_and_underperforming'
  | 'cost_sensitivity'
  | 'box_cost_sheet'
  | 'raw_materials_kg_cost'
  | 'excel_reconciliation'
  | 'approval_memo_sheet'
  | 'customer_price_list'
  | 'audit_decisions_log';

export interface ReportConfig {
  type: ReportType;
  title: string;
  subtitle?: string;
  categoryFilter?: string;
  tierFilter?: string;
  selectedBoxId?: string;
  selectedRawId?: string;
  orientation: 'portrait' | 'landscape';
  includeInternalCosts: boolean;
  notes?: string;
  preparedBy?: string;
  date: string;
}

export interface SavedReport {
  id: string;
  type: ReportType;
  title: string;
  date: string;
  orientation: 'portrait' | 'landscape';
  snapshotHtml?: string;
  summaryText?: string;
}
