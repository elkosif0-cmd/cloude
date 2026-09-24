import {
  loadSettings,
  saveSettings,
  loadRawItems,
  saveRawItems,
  loadBoxItems,
  saveBoxItems,
  loadExpenses,
  saveExpenses,
  loadApprovalMemos,
  saveApprovalMemos,
  loadAuditLogs,
  saveAuditLogs,
  loadPriceRules,
  savePriceRules,
  loadSavedReports,
  saveSavedReports,
  loadButcheryExperiments,
  saveButcheryExperiments,
  loadNRVModels,
  saveNRVModels,
  loadProductMappings,
  saveProductMappings,
  CURRENT_SCHEMA_VERSION,
} from './localStorage';
import { RawItem, BoxItem, ExpenseItem, PriceRule } from '../types/pricing';
import { AppSettings } from '../types/settings';
import { ApprovalMemo } from '../types/approvals';
import { AuditLogEntry } from '../types/audit';
import { SavedReport } from '../types/reports';
import { ButcheryExperiment, NRVModel } from '../types/advanced';
import { ProductMapping } from '../types/commerce';
import { computeBoxItem, computeRawItem, hasCircularDependency } from '../engine/pricingEngine';

export interface BackupPayload {
  schemaVersion: number;
  appName: string;
  exportDate: string;
  settings: AppSettings;
  rawItems: RawItem[];
  boxItems: BoxItem[];
  expenses: ExpenseItem[];
  approvalMemos: ApprovalMemo[];
  auditLogs: AuditLogEntry[];
  priceRules: PriceRule[];
  savedReports: SavedReport[];
  butcheryExperiments: ButcheryExperiment[];
  nrvModels: NRVModel[];
  productMappings: ProductMapping[];
}

export interface VerificationResult {
  valid: boolean;
  schemaVersion: number;
  warnings: string[];
  errors: string[];
  counts: {
    rawItems: number;
    boxItems: number;
    expenses: number;
    memos: number;
    auditLogs: number;
    rules: number;
  };
}

/**
 * تصدير نسخة احتياطية كاملة للملفات والإعدادات
 */
export function createBackupPayload(): BackupPayload {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appName: 'أغنام الوادي v19.10',
    exportDate: new Date().toISOString(),
    settings: loadSettings(),
    rawItems: loadRawItems(),
    boxItems: loadBoxItems(),
    expenses: loadExpenses(),
    approvalMemos: loadApprovalMemos(),
    auditLogs: loadAuditLogs(),
    priceRules: loadPriceRules(),
    savedReports: loadSavedReports(),
    butcheryExperiments: loadButcheryExperiments(),
    nrvModels: loadNRVModels(),
    productMappings: loadProductMappings(),
  };
}

/**
 * فحص والتحقق من صحة النسخة الاحتياطية قبل الاستيراد (Verification before import)
 */
export function verifyBackup(jsonText: string): { payload: BackupPayload | null; result: VerificationResult } {
  const result: VerificationResult = {
    valid: false,
    schemaVersion: 0,
    warnings: [],
    errors: [],
    counts: {
      rawItems: 0,
      boxItems: 0,
      expenses: 0,
      memos: 0,
      auditLogs: 0,
      rules: 0,
    },
  };

  let parsed: any;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err: any) {
    result.errors.push(`فشل قراءة الملف بصيغة JSON: ${err?.message || 'خطأ غير معروف'}`);
    return { payload: null, result };
  }

  if (!parsed || typeof parsed !== 'object') {
    result.errors.push('محتوى الملف غير صالح أو لا يمثل كائناً برمجياً.');
    return { payload: null, result };
  }

  result.schemaVersion = parsed.schemaVersion || 1000;

  // فحص الحقول الأساسية
  if (!Array.isArray(parsed.rawItems)) {
    result.errors.push('حقل المواد الخام rawItems مفقود أو غير صالح.');
  }
  if (!Array.isArray(parsed.boxItems)) {
    result.errors.push('حقل البوكسات boxItems مفقود أو غير صالح.');
  }

  if (result.errors.length > 0) {
    return { payload: null, result };
  }

  const payload = parsed as BackupPayload;
  result.counts.rawItems = payload.rawItems?.length || 0;
  result.counts.boxItems = payload.boxItems?.length || 0;
  result.counts.expenses = payload.expenses?.length || 0;
  result.counts.memos = payload.approvalMemos?.length || 0;
  result.counts.auditLogs = payload.auditLogs?.length || 0;
  result.counts.rules = payload.priceRules?.length || 0;

  // تشغيل محرك الحسابات كفحص صحة أولي
  try {
    const rawMap = new Set((payload.rawItems || []).map((r) => r.id));
    for (const raw of payload.rawItems || []) {
      computeRawItem(raw, payload.settings || loadSettings());
    }

    // فحص سلامة مراجع المكونات والحلقات الدائرية في البوكسات
    for (const box of payload.boxItems || []) {
      for (const ing of box.ingredients || []) {
        if (!rawMap.has(ing.rawItemId)) {
          result.warnings.push(`البوكس "${box.name}" يحتوي مادة خام برقم معرف مفقود (${ing.rawItemId}).`);
        }
      }
      for (const sub of box.subBoxes || []) {
        if (hasCircularDependency(box.id, sub.subBoxId, payload.boxItems || [])) {
          result.errors.push(`تم اكتشاف حلقة اعتماد دائرية في البوكس "${box.name}".`);
        }
      }
      computeBoxItem(
        box,
        payload.rawItems || [],
        payload.boxItems || [],
        payload.expenses || [],
        payload.settings || loadSettings()
      );
    }
  } catch (calcErr: any) {
    result.errors.push(`فشل في فحص حسابات محرك التسعير على النسخة: ${calcErr?.message || 'خطأ غير معروف'}`);
  }

  result.valid = result.errors.length === 0;
  return { payload: result.valid ? payload : null, result };
}

/**
 * تطبيق النسخة الاحتياطية واستبدال البيانات بعد التأكيد
 */
export function restoreBackup(payload: BackupPayload): void {
  if (payload.settings) saveSettings(payload.settings);
  if (payload.rawItems) saveRawItems(payload.rawItems);
  if (payload.boxItems) saveBoxItems(payload.boxItems);
  if (payload.expenses) saveExpenses(payload.expenses);
  if (payload.approvalMemos) saveApprovalMemos(payload.approvalMemos);
  if (payload.auditLogs) saveAuditLogs(payload.auditLogs);
  if (payload.priceRules) savePriceRules(payload.priceRules);
  if (payload.savedReports) saveSavedReports(payload.savedReports);
  if (payload.butcheryExperiments) saveButcheryExperiments(payload.butcheryExperiments);
  if (payload.nrvModels) saveNRVModels(payload.nrvModels);
  if (payload.productMappings) saveProductMappings(payload.productMappings);
}
