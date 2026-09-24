export type ChangeGroup = 
  | 'selling_prices'
  | 'purchase_costs'
  | 'waste_ratios'
  | 'vat_settings'
  | 'box_formulations'
  | 'expenses'
  | 'settings'
  | 'decisions'
  | 'catalog'
  | 'data_imports';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  group: ChangeGroup;
  itemName?: string;
  itemId?: string;
  field: string;
  previousValue: string | number | boolean | null;
  newValue: string | number | boolean | null;
  source: 'manual' | 'memo_approval' | 'bulk_import' | 'system' | 'simulator';
  user?: string;
  referenceNumber?: string;
  notes?: string;
}
