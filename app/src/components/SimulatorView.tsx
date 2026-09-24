import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Sparkles,
  Sliders,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { RawItem, BoxItem, ExpenseItem } from '../types/pricing';
import { AppSettings } from '../types/settings';
import {
  computeQuickSimulation,
  computeTargetSellingPrice,
  roundPrice,
} from '../engine/pricingEngine';
import { formatSAR, formatPercent } from '../utils/formatters';

interface SimulatorViewProps {
  rawItems: RawItem[];
  boxItems: BoxItem[];
  expenses: ExpenseItem[];
  settings: AppSettings;
  onApplyToCatalog?: (item: { id: string; type: 'raw' | 'box'; newPrice: number }) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  rawItems,
  boxItems,
  expenses,
  settings,
  onApplyToCatalog,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('custom');

  // Input states
  const [costNet, setCostNet] = useState<number>(300);
  const [sellingPriceGross, setSellingPriceGross] = useState<number>(380);
  const [targetMargin, setTargetMargin] = useState<number>(0.2);
  const [vatRate, setVatRate] = useState<number>(0.15);
  const [marginBasis, setMarginBasis] = useState<'gross' | 'net'>('net');

  // Price adjustment slider
  const [priceDeltaPercent, setPriceDeltaPercent] = useState<number>(0);

  // When item is selected, load its initial numbers
  const handleItemSelect = (id: string) => {
    setSelectedItemId(id);
    setPriceDeltaPercent(0);

    if (id === 'custom') {
      setCostNet(300);
      setSellingPriceGross(380);
      return;
    }

    const [type, actualId] = id.split(':');
    if (type === 'box') {
      const box = boxItems.find((b) => b.id === actualId);
      if (box) {
        setSellingPriceGross(box.sellingPriceGross);
        // Estimate rough net cost
        const estCost = box.sellingPriceGross * 0.78;
        setCostNet(parseFloat(estCost.toFixed(2)));
      }
    } else {
      const raw = rawItems.find((r) => r.id === actualId);
      if (raw) {
        setSellingPriceGross(raw.sellingPriceGross);
        const estCost = (raw.purchasePriceGross / 1.15) * (1 + raw.wastePercent);
        setCostNet(parseFloat(estCost.toFixed(2)));
      }
    }
  };

  // Adjusted gross price via slider
  const effectiveSellingPriceGross = useMemo(() => {
    return roundPrice(sellingPriceGross * (1 + priceDeltaPercent / 100), settings.roundingMethod || 'twoDecimals');
  }, [sellingPriceGross, priceDeltaPercent, settings.roundingMethod]);

  // Simulation result
  const result = useMemo(() => {
    return computeQuickSimulation(
      costNet,
      effectiveSellingPriceGross,
      vatRate,
      marginBasis,
      targetMargin
    );
  }, [costNet, effectiveSellingPriceGross, vatRate, marginBasis, targetMargin]);

  // Solve for Target Selling Price
  const calculatedTargetPrice = useMemo(() => {
    return computeTargetSellingPrice(costNet, targetMargin, vatRate, marginBasis);
  }, [costNet, targetMargin, vatRate, marginBasis]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Selector */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              محاكي ومحدد الأسعار السريع (Pricing Sandbox)
            </h3>
            <p className="text-xs text-slate-500">
              اختبر تأثير تعديل سعر الشراء أو نسبة الهدر أو هامش الربح المستهدف فورياً
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={selectedItemId}
            onChange={(e) => handleItemSelect(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
          >
            <option value="custom">★ سيناريو حر (Custom Ad-hoc)</option>
            <optgroup label="البوكسات الجاهزة">
              {boxItems.map((b) => (
                <option key={b.id} value={`box:${b.id}`}>
                  {b.name} ({formatSAR(b.sellingPriceGross)})
                </option>
              ))}
            </optgroup>
            <optgroup label="المواد الخام">
              {rawItems.map((r) => (
                <option key={r.id} value={`raw:${r.id}`}>
                  {r.name} ({formatSAR(r.sellingPriceGross)})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Main Grid: Inputs on Left, Real-time Simulation & Sensitivity on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Inputs */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              مدخلات التكلفة والبيع
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                إجمالي التكلفة الصافية (Net Cost ر.س)
              </label>
              <input
                type="number"
                step="1"
                value={costNet}
                onChange={(e) => setCostNet(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                سعر البيع الأساسي (شامل الضريبة ر.س)
              </label>
              <input
                type="number"
                step="1"
                value={sellingPriceGross}
                onChange={(e) => setSellingPriceGross(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الهامش المستهدف ({formatPercent(targetMargin)})
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.05"
                  max="0.50"
                  step="0.01"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600"
                />
                <span className="font-mono text-xs font-bold text-blue-600 w-12 text-left">
                  {formatPercent(targetMargin)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <label className="text-slate-600 dark:text-slate-300">قاعدة الهامش:</label>
              <select
                value={marginBasis}
                onChange={(e) => setMarginBasis(e.target.value as any)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 font-semibold"
              >
                <option value="net">صافي البيع (Net Basis)</option>
                <option value="gross">السعر الإجمالي (Gross Basis)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Real-time Gauge & Sensitivity Simulator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Simulation Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center">
              <div className="text-xs text-slate-400">سعر البيع الفعلي</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {formatSAR(effectiveSellingPriceGross)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                صافي البيع: {formatSAR(result.sellingPriceNet)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center">
              <div className="text-xs text-slate-400">صافي الربح النقدي</div>
              <div
                className={`text-xl font-black mt-1 ${
                  result.netProfit > 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatSAR(result.netProfit)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                الضريبة (15%): {formatSAR(result.vatAmountSelling)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center">
              <div className="text-xs text-slate-400">نسبة هامش الربح</div>
              <div
                className={`text-xl font-black mt-1 ${
                  result.profitMargin >= targetMargin
                    ? 'text-emerald-600'
                    : result.profitMargin > 0
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {formatPercent(result.profitMargin)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {result.profitMargin >= targetMargin ? 'محقق للهدف' : 'دون الهدف'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center">
              <div className="text-xs text-slate-400">سعر نقطة التعادل</div>
              <div className="text-xl font-black text-slate-700 dark:text-slate-300 mt-1">
                {formatSAR(result.breakEvenGross)}
              </div>
              <div className="text-[10px] text-blue-600 font-bold mt-0.5">
                المطلوب: {formatSAR(calculatedTargetPrice)}
              </div>
            </div>
          </div>

          {/* Interactive Price Elasticity Slider */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-600" />
                  مؤشر الحساسية وتعديل السعر اللحظي
                </h4>
                <p className="text-xs text-slate-500">
                  حرّك المؤشر لرؤية الفارق الفوري في الأرباح والهامش عند التغيير بنسبة (±%)
                </p>
              </div>

              <div className="font-mono text-sm font-black text-sky-600">
                {priceDeltaPercent > 0 ? `+${priceDeltaPercent}%` : `${priceDeltaPercent}%`}
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="-25"
                max="25"
                step="1"
                value={priceDeltaPercent}
                onChange={(e) => setPriceDeltaPercent(parseInt(e.target.value, 10))}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>-25% تخفيض</span>
                <span
                  onClick={() => setPriceDeltaPercent(0)}
                  className="cursor-pointer font-bold text-slate-600 hover:text-sky-600"
                >
                  السعر الأصلي (0%)
                </span>
                <span>+25% زيادة</span>
              </div>
            </div>

            {/* Quick Adjustment Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[-10, -5, 0, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setPriceDeltaPercent(pct)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-colors ${
                    priceDeltaPercent === pct
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {pct > 0 ? `+${pct}%` : pct === 0 ? 'الأصلي' : `${pct}%`}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  // Calculate percentage needed to reach target price
                  const neededPct = ((calculatedTargetPrice - sellingPriceGross) / sellingPriceGross) * 100;
                  setPriceDeltaPercent(Math.round(neededPct));
                }}
                className="px-3 py-1 text-xs font-bold rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 flex items-center gap-1 mr-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                الوصول للمستهدف ({formatPercent(targetMargin)})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
