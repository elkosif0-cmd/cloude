import { RawItem, BoxItem, ExpenseItem, PriceRule } from '../types/pricing';
import { AppSettings } from '../types/settings';
import { ApprovalMemo } from '../types/approvals';
import { AuditLogEntry } from '../types/audit';
import { SavedReport } from '../types/reports';
import { ButcheryExperiment, NRVModel } from '../types/advanced';
import { ProductMapping } from '../types/commerce';
import {
  SEED_SETTINGS,
  SEED_RAWS,
  SEED_BOXES,
  SEED_EXPS,
  SEED_BUTCHERY_EXPERIMENT,
  SEED_NRV_MODEL,
} from '../data/seedData';

export const STORAGE_KEYS = {
  SETTINGS: 'aghn_settings_v19',
  RAW_ITEMS: 'aghn_raws_v19',
  BOX_ITEMS: 'aghn_boxes_v19',
  EXPENSES: 'aghn_expenses_v19',
  APPROVAL_MEMOS: 'aghn_memos_v19',
  AUDIT_LOGS: 'aghn_audit_v19',
  PRICE_RULES: 'aghn_rules_v19',
  SAVED_REPORTS: 'aghn_reports_v19',
  BUTCHERY_EXPERIMENTS: 'aghn_experiments_v19',
  NRV_MODELS: 'aghn_nrv_v19',
  PRODUCT_MAPPINGS: 'aghn_mappings_v19',
  THEME: 'aghn_theme_v19',
  NAV_MODE: 'aghn_nav_mode_v19',
  SCHEMA_VERSION: 'aghn_schema_version',
} as const;

export const CURRENT_SCHEMA_VERSION = 1910;

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving localStorage key "${key}":`, err);
  }
}

export function loadSettings(): AppSettings {
  return safeGet<AppSettings>(STORAGE_KEYS.SETTINGS, SEED_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  safeSet(STORAGE_KEYS.SETTINGS, settings);
}

export function loadRawItems(): RawItem[] {
  return safeGet<RawItem[]>(STORAGE_KEYS.RAW_ITEMS, SEED_RAWS);
}

export function saveRawItems(items: RawItem[]): void {
  safeSet(STORAGE_KEYS.RAW_ITEMS, items);
}

export function loadBoxItems(): BoxItem[] {
  return safeGet<BoxItem[]>(STORAGE_KEYS.BOX_ITEMS, SEED_BOXES);
}

export function saveBoxItems(items: BoxItem[]): void {
  safeSet(STORAGE_KEYS.BOX_ITEMS, items);
}

export function loadExpenses(): ExpenseItem[] {
  return safeGet<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, SEED_EXPS);
}

export function saveExpenses(items: ExpenseItem[]): void {
  safeSet(STORAGE_KEYS.EXPENSES, items);
}

export function loadApprovalMemos(): ApprovalMemo[] {
  return safeGet<ApprovalMemo[]>(STORAGE_KEYS.APPROVAL_MEMOS, []);
}

export function saveApprovalMemos(memos: ApprovalMemo[]): void {
  safeSet(STORAGE_KEYS.APPROVAL_MEMOS, memos);
}

export function loadAuditLogs(): AuditLogEntry[] {
  return safeGet<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
}

export function saveAuditLogs(logs: AuditLogEntry[]): void {
  safeSet(STORAGE_KEYS.AUDIT_LOGS, logs);
}

export function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  const logs = loadAuditLogs();
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newEntry);
  // الاحتفاظ بآخر 1000 حركة لمنع تضخم التخزين
  saveAuditLogs(logs.slice(0, 1000));
}

export function loadPriceRules(): PriceRule[] {
  return safeGet<PriceRule[]>(STORAGE_KEYS.PRICE_RULES, []);
}

export function savePriceRules(rules: PriceRule[]): void {
  safeSet(STORAGE_KEYS.PRICE_RULES, rules);
}

export function loadSavedReports(): SavedReport[] {
  return safeGet<SavedReport[]>(STORAGE_KEYS.SAVED_REPORTS, []);
}

export function saveSavedReports(reports: SavedReport[]): void {
  safeSet(STORAGE_KEYS.SAVED_REPORTS, reports);
}

export function loadButcheryExperiments(): ButcheryExperiment[] {
  return safeGet<ButcheryExperiment[]>(STORAGE_KEYS.BUTCHERY_EXPERIMENTS, [SEED_BUTCHERY_EXPERIMENT]);
}

export function saveButcheryExperiments(exps: ButcheryExperiment[]): void {
  safeSet(STORAGE_KEYS.BUTCHERY_EXPERIMENTS, exps);
}

export function loadNRVModels(): NRVModel[] {
  return safeGet<NRVModel[]>(STORAGE_KEYS.NRV_MODELS, [SEED_NRV_MODEL]);
}

export function saveNRVModels(models: NRVModel[]): void {
  safeSet(STORAGE_KEYS.NRV_MODELS, models);
}

export function loadProductMappings(): ProductMapping[] {
  return safeGet<ProductMapping[]>(STORAGE_KEYS.PRODUCT_MAPPINGS, [
    {
      rawDescription: 'بوكس ذبيحة نعيمي كاملة مقطع ثلاجة فاخر',
      catalogItemId: 'box-naimi-whole-fridge',
      catalogItemName: 'بوكس ذبيحة نعيمي مقطعة ثلاجة متكاملة',
      confidenceScore: 0.96,
      matchType: 'exact',
      updatedAt: '2026-03-20',
    },
    {
      rawDescription: 'نصف حري بلدي ملكي صحون فاكيوم',
      catalogItemId: 'box-royal-harri-half',
      catalogItemName: 'بوكس نصف ذبيحة حري ملكي مقطع ثلاجة',
      confidenceScore: 0.94,
      matchType: 'fuzzy',
      updatedAt: '2026-03-20',
    },
    {
      rawDescription: 'بوكس شواء مشكل ريش ومفروم وكباب',
      catalogItemId: 'box-bbq-mix',
      catalogItemName: 'بوكس المشاوي المشكل الفاخر',
      confidenceScore: 0.92,
      matchType: 'alias',
      updatedAt: '2026-03-20',
    },
    {
      rawDescription: 'بوكس عائلي نعيمي مقطع وجبات',
      catalogItemId: 'box-naimi-family',
      catalogItemName: 'بوكس النعيمي العائلي الفاخر',
      confidenceScore: 0.95,
      matchType: 'fuzzy',
      updatedAt: '2026-03-20',
    },
  ]);
}

export function saveProductMappings(mappings: ProductMapping[]): void {
  safeSet(STORAGE_KEYS.PRODUCT_MAPPINGS, mappings);
}

export function loadTheme(): 'light' | 'dark' {
  const theme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (theme === 'dark' || theme === 'light') return theme;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function saveTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function loadNavMode(): 'standard' | 'advanced' {
  const mode = localStorage.getItem(STORAGE_KEYS.NAV_MODE);
  return mode === 'advanced' ? 'advanced' : 'standard';
}

export function saveNavMode(mode: 'standard' | 'advanced'): void {
  localStorage.setItem(STORAGE_KEYS.NAV_MODE, mode);
}
