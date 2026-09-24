import React, { useState } from 'react';
import {
  Settings,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FileCheck,
  Save,
  Code2,
  FileArchive,
  FileCode,
} from 'lucide-react';
import { AppSettings } from '../types/settings';
import { RawItem, BoxItem, ExpenseItem } from '../types/pricing';
import { Order, Customer } from '../types/commerce';
import { ApprovalMemo } from '../types/approvals';
import { AuditLogEntry } from '../types/audit';
import { createBackupPayload, verifyBackup, restoreBackup, VerificationResult, BackupPayload } from '../storage/backup';
import { formatPercent, formatSAR } from '../utils/formatters';
import { exportEntireCodeAsJson, exportEntireCodeAsZip } from '../utils/codeExporter';

interface SettingsDataViewProps {
  settings: AppSettings;
  rawItems: RawItem[];
  boxItems: BoxItem[];
  expenses: ExpenseItem[];
  orders: Order[];
  customers: Customer[];
  memos: ApprovalMemo[];
  auditLogs: AuditLogEntry[];
  onSaveSettings: (newSettings: AppSettings) => void;
  onRestoreBackup: (importedData: BackupPayload) => void;
  onResetToDefaults: () => void;
}

export const SettingsDataView: React.FC<SettingsDataViewProps> = ({
  settings,
  rawItems,
  boxItems,
  expenses,
  orders,
  customers,
  memos,
  auditLogs,
  onSaveSettings,
  onRestoreBackup,
  onResetToDefaults,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Backup & Import verification state
  const [, setImportJsonText] = useState('');
  const [validationResult, setValidationResult] = useState<VerificationResult | null>(null);
  const [pendingImportData, setPendingImportData] = useState<BackupPayload | null>(null);

  // Full Code Export state
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [codeExportNotice, setCodeExportNotice] = useState<string | null>(null);

  const handleSaveSettings = () => {
    onSaveSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Download complete backup
  const handleDownloadBackup = () => {
    const payload = createBackupPayload();
    // override with current local state
    payload.settings = localSettings;
    payload.rawItems = rawItems;
    payload.boxItems = boxItems;
    payload.expenses = expenses;
    payload.approvalMemos = memos;
    payload.auditLogs = auditLogs;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Aghnam_AlWadi_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle file select for JSON import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      const { payload, result } = verifyBackup(content);
      setValidationResult(result);
      if (result.valid && payload) {
        setPendingImportData(payload);
      } else {
        setPendingImportData(null);
      }
    };
    reader.readAsText(file);
  };

  // Confirm import after pre-verification
  const handleConfirmImport = () => {
    if (!pendingImportData) return;
    restoreBackup(pendingImportData);
    onRestoreBackup(pendingImportData);
    setPendingImportData(null);
    setValidationResult(null);
    setImportJsonText('');
    alert('تم استيراد واستعادة البيانات بنجاح.');
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              إعدادات المنظومة وقواعد البيانات والنسخ الاحتياطي
            </h3>
            <p className="text-xs text-slate-500">
              ضبط معدلات الضريبة وتكاليف التغليف، وتصدير واستيراد النسخ الاحتياطية مع التحقق المسبق
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              تم حفظ الإعدادات
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            حفظ التغييرات
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h4 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          المعايير المالية والضريبية الأساسية
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              نسبة ضريبة القيمة المضافة ZATCA
            </label>
            <input
              type="number"
              step="0.01"
              value={localSettings.defaultVatRate}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, defaultVatRate: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 font-mono font-bold text-left"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">افتراضي: 0.15 (15%)</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              طريقة احتساب الهدر
            </label>
            <select
              value={localSettings.wasteMethod}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, wasteMethod: e.target.value as 'yield' | 'markup' })
              }
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 font-bold"
            >
              <option value="yield">معامل العائد 1/(1-هدر) - أدق علمياً</option>
              <option value="markup">إضافة الهدر (1+هدر)</option>
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">معيار المحاسبة التكاليفية</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              هامش الربح المستهدف للكتالوج
            </label>
            <input
              type="number"
              step="0.01"
              value={localSettings.targetProfitMargin}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, targetProfitMargin: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 font-mono font-bold text-left"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              الحالي: {formatPercent(localSettings.targetProfitMargin)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              أساس احتساب الهامش
            </label>
            <select
              value={localSettings.marginBasis}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  marginBasis: e.target.value as 'gross' | 'net',
                })
              }
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 font-bold"
            >
              <option value="net">صافي سعر البيع (Net Basis - موصى به)</option>
              <option value="gross">إجمالي سعر البيع (Gross Basis)</option>
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              يحدد مقام معادلة نسبة الهامش
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              رقم السجل التجاري CR
            </label>
            <input
              type="text"
              value={localSettings.commercialRegister || ''}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, commercialRegister: e.target.value })
              }
              placeholder="1010892019"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              الرقم الضريبي ZATCA VAT Number
            </label>
            <input
              type="text"
              value={localSettings.vatNumber || ''}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, vatNumber: e.target.value })
              }
              placeholder="310928472900003"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Complete Source Code Export Card (JSON & Compressed ZIP) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                تصدير كامل الكود البرمجي للمنظومة (Full Source Code & Architecture)
              </h4>
              <p className="text-xs text-slate-500">
                تحميل الحزمة البرمجية الكاملة للمشروع بما يشمل كافة الملفات، المحركات، الشاشات، وإعدادات التشغيل
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
            TypeScript + React 19 + Tailwind
          </span>
        </div>

        {codeExportNotice && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {codeExportNotice}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ZIP Export Button */}
          <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                  <FileArchive className="w-5 h-5 text-amber-600" />
                  تصدير كامل الكود مضغوط (.ZIP)
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                  DEFLATE .ZIP
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                ملف أرشيف مضغوط يحتوي على الهيكل الشجري للمشروع كاملاً بكافة ملفات المصدر (TSX / TS / CSS)، ملف التبعيات package.json، وإعدادات Vite جاهز لفك الضغط والتشغيل الفوري (npm install & npm run dev).
              </p>
            </div>
            <button
              type="button"
              disabled={isExportingZip}
              onClick={async () => {
                try {
                  setIsExportingZip(true);
                  const result = await exportEntireCodeAsZip(true);
                  setCodeExportNotice(`تم بنجاح تصدير وتحميل الملف المضغوط: ${result.fileName} (${(result.sizeBytes / 1024).toFixed(1)} ك.ب، ${result.fileCount} ملف)`);
                  setTimeout(() => setCodeExportNotice(null), 5000);
                } catch (e) {
                  console.error(e);
                  alert('حدث خطأ أثناء إنشاء الأرشيف المضغوط');
                } finally {
                  setIsExportingZip(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-md shadow-amber-600/20 cursor-pointer"
            >
              <FileArchive className="w-4 h-4" />
              {isExportingZip ? 'جاري ضغط وتجهيز الملف...' : 'تصدير كامل الكود مضغوط (.ZIP)'}
            </button>
          </div>

          {/* JSON Export Button */}
          <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/50 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                  <FileCode className="w-5 h-5 text-blue-600" />
                  تصدير كامل الكود جيسون (.JSON)
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-200/60 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200">
                  STRUCTURED .JSON
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                ملف برمجي كائني بصيغة JSON يضم شجرة الأكواد، محتويات الملفات النصية، المسارات النسبية، والبيانات الحية المعتمدة في النظام، مثالي للتحليل الآلي، النقل المباشر، أو الحفظ في قواعد البيانات.
              </p>
            </div>
            <button
              type="button"
              disabled={isExportingJson}
              onClick={() => {
                try {
                  setIsExportingJson(true);
                  const result = exportEntireCodeAsJson(true);
                  setCodeExportNotice(`تم بنجاح تصدير وتحميل ملف JSON: ${result.fileName} (${(result.sizeBytes / 1024).toFixed(1)} ك.ب، ${result.fileCount} ملف)`);
                  setTimeout(() => setCodeExportNotice(null), 5000);
                } catch (e) {
                  console.error(e);
                  alert('حدث خطأ أثناء تصدير ملف JSON');
                } finally {
                  setIsExportingJson(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <FileCode className="w-4 h-4" />
              {isExportingJson ? 'جاري إنشاء ملف JSON...' : 'تصدير كامل الكود جيسون (.JSON)'}
            </button>
          </div>
        </div>
      </div>

      {/* Backup, Export & Pre-Verification Import Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h4 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          النسخ الاحتياطي والاستيراد المفحوص مسبقاً (Pre-Verified Import)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Box */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white mb-2">
                <Download className="w-4 h-4 text-blue-600" />
                تصدير نسخة احتياطية شاملة
              </div>
              <p className="text-xs text-slate-500 mb-4">
                تنزيل ملف JSON متكامل يحتوي على الأصناف الخام، هندسة البوكسات، التكاليف، مذكرات الاعتماد، وسجل التدقيق الزمني.
              </p>
              <div className="text-[11px] text-slate-400 space-y-1 mb-4 font-mono">
                <div>• المواد الخام: {rawItems.length}</div>
                <div>• البوكسات المجمعة: {boxItems.length}</div>
                <div>• مذكرات الاعتماد: {memos.length}</div>
                <div>• سجلات التدقيق: {auditLogs.length}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              تحميل النسخة الاحتياطية الآن
            </button>
          </div>

          {/* Import Box */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white mb-2">
                <Upload className="w-4 h-4 text-blue-600" />
                استيراد واستعادة مع فحص السلامة المسبق
              </div>
              <p className="text-xs text-slate-500 mb-4">
                يتم فحص بنية الملف، والتحقق من عدم وجود حلقات دائرية أو مراجع مفقودة قبل التطبيق.
              </p>

              <label className="block w-full cursor-pointer py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 text-center transition-colors mb-3">
                <FileCheck className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  اختر ملف النسخة الاحتياطية (.json)
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {/* Validation Result Box */}
              {validationResult && (
                <div
                  className={`p-3 rounded-xl border text-xs mb-3 ${
                    validationResult.valid
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    {validationResult.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>{validationResult.valid ? 'الملف سليم وقابل للاستيراد' : 'الملف يحتوي على أخطاء'}</span>
                  </div>
                  {validationResult.counts && (
                    <div className="text-[10px] space-y-0.5">
                      <div>المواد الخام: {validationResult.counts.rawItems}</div>
                      <div>البوكسات: {validationResult.counts.boxItems}</div>
                    </div>
                  )}
                  {validationResult.errors.length > 0 && (
                    <div className="mt-2 text-rose-600 font-bold space-y-1">
                      {validationResult.errors.map((err: string, i: number) => (
                        <div key={i}>• {err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!pendingImportData}
              onClick={handleConfirmImport}
              className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-colors ${
                pendingImportData
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              تأكيد الاستيراد وتطبيق البيانات
            </button>
          </div>
        </div>

        {/* Reset Danger Zone */}
        <div className="pt-6 border-t border-rose-100 dark:border-rose-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 bg-rose-50/50 dark:bg-rose-950/10 p-4 rounded-2xl">
          <div>
            <h5 className="text-xs font-extrabold text-rose-700 dark:text-rose-400">
              إعادة ضبط المصنع واستعادة البيانات النموذجية الافتراضية
            </h5>
            <p className="text-[11px] text-slate-500 mt-0.5">
              سيتم مسح التعديلات المحلية والعودة إلى الكتالوج والأسعار الأولية المعتمدة.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط المصنع؟ سيتم استبدال البيانات الحالية بالبيانات الافتراضية.')) {
                onResetToDefaults();
              }
            }}
            className="px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/50 hover:bg-rose-200 rounded-xl transition-colors whitespace-nowrap"
          >
            إعادة الضبط الافتراضي
          </button>
        </div>
      </div>
    </div>
  );
};
