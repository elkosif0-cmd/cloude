import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  DollarSign,
  ShoppingCart,
  Users,
  ShieldAlert,
  ChevronRight,
  Activity,
  Receipt,
} from 'lucide-react';
import { RawItem, BoxItem, ExpenseItem } from '../types/pricing';
import { AppSettings } from '../types/settings';
import { ApprovalMemo } from '../types/approvals';
import { Order } from '../types/commerce';
import { computeBoxItem, computeRawItem } from '../engine/pricingEngine';
import { formatSAR, formatPercent } from '../utils/formatters';
import { ViewId } from './Sidebar';

interface DashboardViewProps {
  rawItems: RawItem[];
  boxItems: BoxItem[];
  expenses: ExpenseItem[];
  settings: AppSettings;
  approvalMemos: ApprovalMemo[];
  orders: Order[];
  onNavigate: (view: ViewId) => void;
  onOpenRawModal: () => void;
  onOpenBoxModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  rawItems,
  boxItems,
  expenses,
  settings,
  approvalMemos,
  orders,
  onNavigate,
  onOpenRawModal,
  onOpenBoxModal,
}) => {
  // حسابات محرك التسعير الحية
  const rawComps = rawItems.map((r) => ({ item: r, comp: computeRawItem(r, settings) }));
  const boxComps = boxItems.map((b) => ({ item: b, comp: computeBoxItem(b, rawItems, boxItems, expenses, settings) }));
  const allComps = [...rawComps, ...boxComps];

  // 1. متوسط هامش البوكسات
  const avgBoxMargin =
    boxComps.length > 0
      ? boxComps.reduce((acc, curr) => acc + curr.comp.profitMargin, 0) / boxComps.length
      : 0;

  // 2. البوكسات المحققة للهدف
  const boxesOnTarget = boxComps.filter((b) => b.comp.targetAchieved).length;

  // 3. الأصناف دون الهدف
  const itemsBelowTarget = allComps.filter((c) => !c.comp.targetAchieved);

  // 4. البنود الخاسرة (أقل من التكلفة)
  const lossItems = allComps.filter((c) => c.comp.netProfit <= 0);

  // 5. أعلى ربح نقدي
  let highestCashProfit = { name: 'لا يوجد', profit: 0 };
  for (const c of allComps) {
    if (c.comp.netProfit > highestCashProfit.profit) {
      highestCashProfit = { name: c.item.name, profit: c.comp.netProfit };
    }
  }

  // 6. توزيع شرائح الربحية
  const tierCounts = {
    excellent: allComps.filter((c) => c.comp.tier === 'excellent').length,
    good: allComps.filter((c) => c.comp.tier === 'good').length,
    low: allComps.filter((c) => c.comp.tier === 'low').length,
    loss: allComps.filter((c) => c.comp.tier === 'loss').length,
  };

  // 7. مبيعات وطلبات فعلية
  const totalSalesRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const pendingCollection = orders
    .filter((o) => o.paymentStatus === 'pending')
    .reduce((acc, o) => acc + o.remainingAmount, 0);

  // 8. مذكرات اعتماد معلقة
  const pendingMemos = approvalMemos.filter((m) => m.status === 'pending');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Loss alert banner if needed */}
      {lossItems.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-rose-900 dark:text-rose-200">
                تنبيه حرج: توجد {lossItems.length} أصناف تباع بخسارة أو دون نقطة التعادل!
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                تتطلب هذه البنود مراجعة عاجلة لسعر الشراء، نسبة الهدر، أو زيادة سعر البيع لتغطية التكلفة.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shrink-0 shadow-sm shadow-rose-600/20"
          >
            معالجة الأسعار
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: متوسط هامش البوكسات */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold">متوسط هامش البوكسات</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatPercent(avgBoxMargin)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {boxesOnTarget} من {boxComps.length} بوكس
            </span>
            <span>يحقق الهدف ({formatPercent(settings.targetProfitMargin)})</span>
          </div>
        </div>

        {/* KPI 2: أعلى ربح نقدي */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold">أعلى ربح نقدي للوحدة</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatSAR(highestCashProfit.profit)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate" title={highestCashProfit.name}>
            الصنف: <span className="font-semibold text-slate-800 dark:text-slate-200">{highestCashProfit.name}</span>
          </div>
        </div>

        {/* KPI 3: إجمالي الإيرادات المسجلة */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold">مبيعات الطلبات المسجلة</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatSAR(totalSalesRevenue)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>عدد الطلبات: {orders.length}</span>
            {pendingCollection > 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                متبقي: {formatSAR(pendingCollection)}
              </span>
            )}
          </div>
        </div>

        {/* KPI 4: مهام وقرارات معلقة */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold">حوكمة واعتماد الأسعار</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {pendingMemos.length}
            <span className="text-xs font-normal text-slate-500 mr-2">مذكرة بانتظار الاعتماد</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>أصناف تحت الهدف: {itemsBelowTarget.length}</span>
            <button
              type="button"
              onClick={() => onNavigate('approvals')}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              عرض
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Profitability distribution & Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profitability Status Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                توزيع مستويات الربحية للكتالوج
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تصنيف الأصناف حسب الهامش مقارنة بمستهدف المنشأة ({formatPercent(settings.targetProfitMargin)})
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('reports')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
            >
              تقرير تفصيلي
              <ChevronRight className="w-4 h-4 rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-center">
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">ممتاز (≥25%)</div>
              <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1">
                {tierCounts.excellent}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 text-center">
              <div className="text-xs font-bold text-sky-700 dark:text-sky-400">جيد (15% - 25%)</div>
              <div className="text-2xl font-black text-sky-800 dark:text-sky-300 mt-1">
                {tierCounts.good}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 text-center">
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400">منخفض (0% - 15%)</div>
              <div className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1">
                {tierCounts.low}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 text-center">
              <div className="text-xs font-bold text-rose-700 dark:text-rose-400">خسارة (≤ 0%)</div>
              <div className="text-2xl font-black text-rose-800 dark:text-rose-300 mt-1">
                {tierCounts.loss}
              </div>
            </div>
          </div>

          {/* Quick List: Items under target */}
          <div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between">
              <span>أصناف تحت المراقبة والمستهدف</span>
              <span className="text-[11px] text-slate-400">الربح الصافي / الهامش</span>
            </div>
            <div className="space-y-2">
              {itemsBelowTarget.slice(0, 4).map((itemComp) => (
                <div
                  key={itemComp.item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        itemComp.comp.tier === 'loss' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {itemComp.item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        السعر: {formatSAR(itemComp.item.sellingPriceGross)} | المطلوب للهدف:{' '}
                        {formatSAR(itemComp.comp.targetPriceGross)}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div
                      className={`text-xs font-extrabold ${
                        itemComp.comp.netProfit <= 0 ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    >
                      {formatPercent(itemComp.comp.profitMargin)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatSAR(itemComp.comp.netProfit)}
                    </div>
                  </div>
                </div>
              ))}
              {itemsBelowTarget.length === 0 && (
                <div className="text-center py-6 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  جميع أصناف الكتالوج تحقق أو تتجاوز نسبة الهامش المستهدفة!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Operations Center */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
              الإجراءات السريعة
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              اختصارات سريعة لإدارة التسعير وهندسة البوكسات
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={onOpenRawModal}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 border border-slate-200 dark:border-slate-700/60 transition-all text-right group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 group-hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">إضافة مادة خام جديدة</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">لحوم، ذبائح، أو مقطعات</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 rotate-180 group-hover:-translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={onOpenBoxModal}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 border border-slate-200 dark:border-slate-700/60 transition-all text-right group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 group-hover:scale-105 transition-transform">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">بناء بوكس تجاري جديد</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">تركيب المكونات وتكلفة الصحون</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 rotate-180 group-hover:-translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('orders')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 border border-slate-200 dark:border-slate-700/60 transition-all text-right group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 group-hover:scale-105 transition-transform">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">الطلبات والتحصيل</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">إدارة الفواتير والتحصيل المالي</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 rotate-180 group-hover:-translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('simulator')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 border border-slate-200 dark:border-slate-700/60 transition-all text-right group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">محاكي التسعير الفوري</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">اختبار الأسعار والهوامش المستهدفة</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 rotate-180 group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>قاعدة الاحتساب: {settings.marginBasis === 'net' ? 'الربح ÷ صافي البيع' : 'الربح ÷ السعر الإجمالي'}</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">ضريبة 15%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
