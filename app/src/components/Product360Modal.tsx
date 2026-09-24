import React from 'react';
import {
  X,
  Printer,
  TrendingUp,
  Boxes,
  Tags,
  AlertCircle,
  FileText,
  Clock,
  ShoppingCart,
  Users,
  CheckCircle2,
  DollarSign,
  Layers,
} from 'lucide-react';
import { RawItem, BoxItem, ExpenseItem } from '../types/pricing';
import { AppSettings } from '../types/settings';
import { AuditLogEntry } from '../types/audit';
import { SalesLine, Order } from '../types/commerce';
import { computeRawItem, computeBoxItem } from '../engine/pricingEngine';
import { formatSAR, formatPercent, formatDateAr } from '../utils/formatters';

interface Product360ModalProps {
  itemId: string | null;
  itemType: 'raw' | 'box';
  rawItems: RawItem[];
  boxItems: BoxItem[];
  expenses: ExpenseItem[];
  settings: AppSettings;
  auditLogs: AuditLogEntry[];
  salesLines: SalesLine[];
  orders: Order[];
  onClose: () => void;
  onPrintItem?: () => void;
}

export const Product360Modal: React.FC<Product360ModalProps> = ({
  itemId,
  itemType,
  rawItems,
  boxItems,
  expenses,
  settings,
  auditLogs,
  salesLines,
  orders,
  onClose,
  onPrintItem,
}) => {
  if (!itemId) return null;

  const raw = itemType === 'raw' ? rawItems.find((r) => r.id === itemId) : null;
  const box = itemType === 'box' ? boxItems.find((b) => b.id === itemId) : null;

  if (!raw && !box) return null;

  const name = raw ? raw.name : box!.name;
  const code = raw ? raw.code : box!.code;
  const category = raw ? raw.category : box!.category;
  const notes = raw ? raw.notes : box!.notes;

  const rawComp = raw ? computeRawItem(raw, settings) : null;
  const boxComp = box ? computeBoxItem(box, rawItems, boxItems, expenses, settings) : null;

  const sellingPriceGross = raw ? raw.sellingPriceGross : box!.sellingPriceGross;
  const netSales = rawComp ? rawComp.sellingPriceNet : boxComp!.sellingPriceNet;
  const totalCostNet = rawComp ? rawComp.usableKgCost : boxComp!.totalCostNet;
  const netProfit = rawComp ? rawComp.netProfit : boxComp!.netProfit;
  const margin = rawComp ? rawComp.profitMargin : boxComp!.profitMargin;
  const breakEven = rawComp ? rawComp.breakEvenGross : boxComp!.breakEvenGross;
  const targetPrice = rawComp ? rawComp.targetPriceGross : boxComp!.targetPriceGross;
  const tier = rawComp ? rawComp.tier : boxComp!.tier;

  // سجل التغييرات للصنف
  const itemAuditLogs = auditLogs.filter(
    (log) => log.itemId === itemId || log.itemName === name
  );

  // المبيعات المرتبطة بهذا الصنف
  const linkedSales = salesLines.filter(
    (sl) => sl.catalogItemId === itemId || sl.description.includes(name)
  );

  const totalSalesRevenue = linkedSales.reduce((acc, curr) => acc + curr.totalSales, 0);
  const totalQuantitySold = linkedSales.reduce((acc, curr) => acc + curr.quantity, 0);

  const tierBadge = {
    excellent: { label: 'ممتاز', bg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
    good: { label: 'جيد', bg: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300' },
    low: { label: 'منخفض', bg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' },
    loss: { label: 'خسارة', bg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300' },
    byproduct: { label: 'منتج جانبي', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
  }[tier];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 text-right animate-in zoom-in-95 duration-150 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:px-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              {raw ? <Tags className="w-6 h-6" /> : <Boxes className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {name}
                </h3>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tierBadge.bg}`}>
                  {tierBadge.label}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span className="font-mono">{code}</span>
                <span>•</span>
                <span>{category}</span>
                {raw && raw.supplier && (
                  <>
                    <span>•</span>
                    <span>المورد: {raw.supplier}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="طباعة بطاقة الصنف"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 custom-scroll">
          {/* Financial Highlights Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">سعر البيع (شامل الضريبة)</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {formatSAR(sellingPriceGross)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                صافي البيع: {formatSAR(netSales)}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">التكلفة الصافية للوحدة</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {formatSAR(totalCostNet)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                نقطة التعادل: {formatSAR(breakEven)}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">صافي الربح للوحدة</div>
              <div
                className={`text-xl font-black mt-1 ${
                  netProfit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatSAR(netProfit)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                هامش الربح: <span className="font-bold">{formatPercent(margin)}</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                سعر تحقيق الهدف ({formatPercent(settings.targetProfitMargin)})
              </div>
              <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {formatSAR(targetPrice)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {margin >= settings.targetProfitMargin ? 'محقق للهدف' : 'أقل من المستهدف'}
              </div>
            </div>
          </div>

          {/* If Box: Composition Breakdown */}
          {box && boxComp && (
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                هندسة وتركيب البوكس
              </h4>
              <div className="space-y-2 text-xs">
                {boxComp.costBreakdown.ingredientsBreakdown.map((ing) => (
                  <div
                    key={ing.rawItemId}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{ing.rawName}</span>
                      <span className="text-slate-400 mr-2">({ing.quantity} كجم @ {formatSAR(ing.unitCost)})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{formatSAR(ing.totalCost)}</span>
                      <span className="text-[11px] text-slate-400 w-12 text-left">
                        {ing.costSharePercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
                <span>
                  الصحون ({box.numberOfDishes} صحن):{' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatSAR(boxComp.costBreakdown.dishesCostNet)}
                  </span>
                </span>
                <span>
                  المصروفات المشتركة:{' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatSAR(boxComp.costBreakdown.expensesCost)}
                  </span>
                </span>
                <span>
                  الوزن الإجمالي:{' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {boxComp.costBreakdown.totalWeightKg.toFixed(2)} كجم
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Sales Performance */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              أداء المبيعات والطلبات الفعلية
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-400">إجمالي المبيعات المحققة</div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {formatSAR(totalSalesRevenue)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-400">الكمية المباعة</div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {totalQuantitySold} وحدة
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
                <div className="text-[11px] text-slate-400">عدد العمليات المسجلة</div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {linkedSales.length} عملية
                </div>
              </div>
            </div>
          </div>

          {/* Audit Trail / History */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              سجل التعديلات والقرارات السابقة
            </h4>
            {itemAuditLogs.length > 0 ? (
              <div className="space-y-2 text-xs">
                {itemAuditLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{log.field}:</span>{' '}
                      <span className="text-rose-500 line-through mr-1">{String(log.previousValue)}</span>{' '}
                      <span className="text-emerald-600 font-bold mr-1">← {String(log.newValue)}</span>
                      {log.referenceNumber && (
                        <span className="text-[10px] text-purple-600 mr-2 font-mono">({log.referenceNumber})</span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{formatDateAr(log.timestamp)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-3 text-center">لا توجد سجلات تعديل سابقة لهذا الصنف.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
