import React, { useState, useMemo } from 'react';
import {
  Columns,
  Scale,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { BoxItem, RawItem, ExpenseItem } from '../types/pricing';
import { AppSettings } from '../types/settings';
import { computeBoxItem } from '../engine/pricingEngine';
import { formatSAR, formatPercent } from '../utils/formatters';

interface CompareStudioViewProps {
  boxItems: BoxItem[];
  rawItems: RawItem[];
  expenses: ExpenseItem[];
  settings: AppSettings;
}

export const CompareStudioView: React.FC<CompareStudioViewProps> = ({
  boxItems,
  rawItems,
  expenses,
  settings,
}) => {
  // Default to first 2 or 3 boxes
  const [selectedBoxIds, setSelectedBoxIds] = useState<string[]>(
    boxItems.slice(0, 3).map((b) => b.id)
  );

  const selectedBoxes = useMemo(() => {
    return selectedBoxIds
      .map((id) => boxItems.find((b) => b.id === id))
      .filter((b): b is BoxItem => Boolean(b));
  }, [boxItems, selectedBoxIds]);

  const computedBoxes = useMemo(() => {
    return selectedBoxes.map((b) => ({
      box: b,
      comp: computeBoxItem(b, rawItems, boxItems, expenses, settings),
    }));
  }, [selectedBoxes, rawItems, boxItems, expenses, settings]);

  const handleAddBox = (id: string) => {
    if (!selectedBoxIds.includes(id) && selectedBoxIds.length < 4) {
      setSelectedBoxIds([...selectedBoxIds, id]);
    }
  };

  const handleRemoveBox = (id: string) => {
    if (selectedBoxIds.length > 1) {
      setSelectedBoxIds(selectedBoxIds.filter((bId) => bId !== id));
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Columns className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              استوديو المقارنة التحليلية للبوكسات (Compare Studio)
            </h3>
            <p className="text-xs text-slate-500">
              مقارنة تفاعلية حتى 4 بوكسات جنباً إلى جنب في التكلفة والوزن والهامش وسعر الكيلو
            </p>
          </div>
        </div>

        {/* Add box selector */}
        {selectedBoxIds.length < 4 && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddBox(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            >
              <option value="" disabled>
                + إضافة بوكس للمقارنة...
              </option>
              {boxItems
                .filter((b) => !selectedBoxIds.includes(b.id))
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {computedBoxes.map(({ box, comp }) => {
          const pricePerKg =
            comp.costBreakdown.totalWeightKg > 0
              ? box.sellingPriceGross / comp.costBreakdown.totalWeightKg
              : 0;
          const costPerKg =
            comp.costBreakdown.totalWeightKg > 0
              ? comp.totalCostNet / comp.costBreakdown.totalWeightKg
              : 0;

          return (
            <div
              key={box.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 text-right"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 block">{box.code}</span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                      {box.name}
                    </h4>
                  </div>
                  {selectedBoxIds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBox(box.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="إزالة من المقارنة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Primary Metrics */}
                <div className="space-y-2.5 pt-3 text-xs">
                  <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-500">سعر البيع (شامل):</span>
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {formatSAR(box.sellingPriceGross)}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-500">إجمالي التكلفة الصافية:</span>
                    <span className="font-mono font-bold">{formatSAR(comp.totalCostNet)}</span>
                  </div>

                  <div className="flex justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                    <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                      صافي الربح:
                    </span>
                    <span className="font-mono font-black text-emerald-600">
                      {formatSAR(comp.netProfit)}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30">
                    <span className="text-blue-800 dark:text-blue-300 font-bold">
                      هامش الربح:
                    </span>
                    <span className="font-mono font-black text-blue-600">
                      {formatPercent(comp.profitMargin)}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 text-slate-600 dark:text-slate-300">
                    <span>إجمالي الوزن:</span>
                    <span className="font-mono font-bold">
                      {comp.costBreakdown.totalWeightKg.toFixed(2)} كجم
                    </span>
                  </div>

                  <div className="flex justify-between p-2 text-slate-600 dark:text-slate-300">
                    <span>سعر البيع / كجم:</span>
                    <span className="font-mono font-bold text-blue-600">
                      {formatSAR(pricePerKg)}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 text-slate-600 dark:text-slate-300">
                    <span>التكلفة الصافية / كجم:</span>
                    <span className="font-mono font-bold">
                      {formatSAR(costPerKg)}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 text-slate-600 dark:text-slate-300">
                    <span>عدد الصحون:</span>
                    <span className="font-mono font-bold">{box.numberOfDishes} صحون</span>
                  </div>
                </div>

                {/* Ingredients list mini */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 mb-1.5">
                    المكونات ({box.ingredients.length}):
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    {box.ingredients.map((ing, i) => {
                      const raw = rawItems.find((r) => r.id === ing.rawItemId);
                      return (
                        <div key={i} className="flex justify-between">
                          <span>• {raw ? raw.name : 'مادة خام'}</span>
                          <span className="font-mono text-slate-400">
                            {ing.quantity} {raw?.unit || 'كجم'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  التصنيف: {comp.tier}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
