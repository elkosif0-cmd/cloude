import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Layers,
  Scale,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Percent,
  DollarSign,
  ArrowRightLeft,
} from 'lucide-react';
import { BoxItem, RawItem, ExpenseItem } from '../types/pricing';
import { AppSettings } from '../types/settings';
import { computeBoxItem } from '../engine/pricingEngine';
import { formatSAR, formatPercent } from '../utils/formatters';

interface BoxAnalyzerViewProps {
  boxItems: BoxItem[];
  rawItems: RawItem[];
  expenses: ExpenseItem[];
  settings: AppSettings;
}

export const BoxAnalyzerView: React.FC<BoxAnalyzerViewProps> = ({
  boxItems,
  rawItems,
  expenses,
  settings,
}) => {
  const [selectedBoxId, setSelectedBoxId] = useState<string>(boxItems[0]?.id || '');

  const selectedBox = useMemo(() => {
    return boxItems.find((b) => b.id === selectedBoxId) || boxItems[0];
  }, [boxItems, selectedBoxId]);

  const computation = useMemo(() => {
    if (!selectedBox) return null;
    return computeBoxItem(selectedBox, rawItems, boxItems, expenses, settings);
  }, [selectedBox, rawItems, boxItems, expenses, settings]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Selector Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              المختبر التشريحي وتحليل مكونات البوكس (Box Deep Analyzer)
            </h3>
            <p className="text-xs text-slate-500">
              تفكيك هيكل التكلفة والوزن لكل مكون داخلي مع قياس حساسية التغيير
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={selectedBoxId}
            onChange={(e) => setSelectedBoxId(e.target.value)}
            className="w-full sm:w-72 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
          >
            {boxItems.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({formatSAR(b.sellingPriceGross)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedBox && computation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Anatomy Breakdown Table & Weight Distribution */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  مكونات البوكس ومساهمتها في التكلفة والوزن ({selectedBox.name})
                </h4>
                <span className="font-mono text-xs font-bold text-slate-500">
                  إجمالي الوزن: {computation.costBreakdown.totalWeightKg.toFixed(2)} كجم
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                    <tr>
                      <th className="p-2.5">المكون</th>
                      <th className="p-2.5">الكمية / الوزن</th>
                      <th className="p-2.5">نسبة الوزن %</th>
                      <th className="p-2.5">تكلفة المكون</th>
                      <th className="p-2.5">مساهمة التكلفة %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {computation.costBreakdown.ingredientsBreakdown.map((ing, idx) => {
                      const weightShare =
                        computation.costBreakdown.totalWeightKg > 0
                          ? (ing.quantity / computation.costBreakdown.totalWeightKg) * 100
                          : 0;
                      const costShare = ing.costSharePercent * 100;

                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                            {ing.rawName}
                          </td>
                          <td className="p-2.5 font-mono">
                            {ing.quantity} كجم
                          </td>
                          <td className="p-2.5 font-mono">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{ width: `${Math.min(100, weightShare)}%` }}
                                />
                              </div>
                              <span>{weightShare.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="p-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {formatSAR(ing.totalCost)}
                          </td>
                          <td className="p-2.5 font-mono font-bold">
                            {costShare.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Packaging and Overhead Breakdown */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                تفصيل تكاليف التغليف والمصروفات المحملة
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-slate-400 text-[11px]">تكلفة اللحوم الخام الصافية</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white text-base mt-1">
                    {formatSAR(computation.costBreakdown.rawsCost)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-slate-400 text-[11px]">
                    تكلفة الصحون والتغليف ({selectedBox.numberOfDishes} صحون)
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white text-base mt-1">
                    {formatSAR(computation.costBreakdown.dishesCostNet)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-slate-400 text-[11px]">المصروفات التشغيلية الإضافية</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white text-base mt-1">
                    {formatSAR(computation.costBreakdown.expensesCost)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Summary & Sensitivity Simulation */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                مؤشرات الربحية والهامش
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-500">سعر البيع شامل الضريبة:</span>
                  <span className="font-mono font-bold">{formatSAR(selectedBox.sellingPriceGross)}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-500">إجمالي التكلفة الصافية:</span>
                  <span className="font-mono font-bold">{formatSAR(computation.totalCostNet)}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                  <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                    صافي الربح النقدي:
                  </span>
                  <span className="font-mono font-black text-emerald-600">
                    {formatSAR(computation.netProfit)}
                  </span>
                </div>
                <div className="flex justify-between p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                  <span className="text-blue-800 dark:text-blue-300 font-bold">
                    نسبة هامش الربح:
                  </span>
                  <span className="font-mono font-black text-blue-600">
                    {formatPercent(computation.profitMargin)}
                  </span>
                </div>
              </div>

              {/* Stress test */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                  اختبار التحمل (Stress Test):
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <p>
                    لو ارتفعت أسعار اللحوم الخام بنسبة <strong>10%</strong>:
                  </p>
                  <p className="font-mono">
                    تصبح التكلفة: {formatSAR(computation.totalCostNet * 1.08)}
                  </p>
                  <p className="font-mono">
                    وينخفض الهامش إلى:{' '}
                    <strong>
                      {formatPercent(Math.max(0, computation.profitMargin - 0.06))}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
