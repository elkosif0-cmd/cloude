import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Package,
  DollarSign,
  PieChart,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  RawItem,
  BoxItem,
  ExpenseItem,
  BoxIngredient,
  SubBoxIngredient,
} from '../types/pricing';
import { AppSettings } from '../types/settings';
import {
  computeBoxCostBreakdown,
  computeBoxItem,
  hasCircularDependency,
  roundPrice,
} from '../engine/pricingEngine';
import { formatSAR, formatPercent } from '../utils/formatters';

interface BoxBuilderViewProps {
  boxItems: BoxItem[];
  rawItems: RawItem[];
  expenses: ExpenseItem[];
  settings: AppSettings;
  onSaveBox: (box: BoxItem) => void;
  selectedBoxIdToEdit?: string | null;
}

export const BoxBuilderView: React.FC<BoxBuilderViewProps> = ({
  boxItems,
  rawItems,
  expenses,
  settings,
  onSaveBox,
  selectedBoxIdToEdit,
}) => {
  // Selected existing box or empty template
  const initialBox: BoxItem = useMemo(() => {
    if (selectedBoxIdToEdit) {
      const found = boxItems.find((b) => b.id === selectedBoxIdToEdit);
      if (found) return JSON.parse(JSON.stringify(found));
    }
    return {
      id: `box-${Date.now()}`,
      code: `BX-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      category: 'بوكسات اللحوم الطازجة',
      sellingPriceGross: 0,
      ingredients: [],
      subBoxes: [],
      numberOfDishes: 4,
      dishCostEachGross: 2.875, // 2.5 net
      linkedExpenseIds: ['exp-vacuum-dryice'],
      notes: '',
    };
  }, [selectedBoxIdToEdit, boxItems]);

  const [currentBox, setCurrentBox] = useState<BoxItem>(initialBox);
  const [selectedBoxSelectId, setSelectedBoxSelectId] = useState<string>(
    selectedBoxIdToEdit || 'new'
  );
  const [circularError, setCircularError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Compute live calculations
  const computation = useMemo(() => {
    return computeBoxItem(currentBox, rawItems, boxItems, expenses, settings);
  }, [currentBox, rawItems, boxItems, expenses, settings]);

  const handleSelectBoxChange = (id: string) => {
    setSelectedBoxSelectId(id);
    setCircularError(null);
    setSaveSuccess(false);

    if (id === 'new') {
      setCurrentBox({
        id: `box-${Date.now()}`,
        code: `BX-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        category: 'بوكسات اللحوم الطازجة',
        sellingPriceGross: 0,
        ingredients: [],
        subBoxes: [],
        numberOfDishes: 4,
        dishCostEachGross: 2.875,
        linkedExpenseIds: ['exp-vacuum-dryice'],
        notes: '',
      });
    } else {
      const found = boxItems.find((b) => b.id === id);
      if (found) {
        setCurrentBox(JSON.parse(JSON.stringify(found)));
      }
    }
  };

  // Add raw ingredient
  const handleAddIngredient = () => {
    const firstRaw = rawItems[0];
    if (!firstRaw) return;
    setCurrentBox({
      ...currentBox,
      ingredients: [
        ...currentBox.ingredients,
        {
          rawItemId: firstRaw.id,
          quantity: 1.0,
          applyWaste: true,
        },
      ],
    });
  };

  // Remove ingredient
  const handleRemoveIngredient = (index: number) => {
    const updated = [...currentBox.ingredients];
    updated.splice(index, 1);
    setCurrentBox({ ...currentBox, ingredients: updated });
  };

  // Update ingredient
  const handleUpdateIngredient = (index: number, patch: Partial<BoxIngredient>) => {
    const updated = [...currentBox.ingredients];
    updated[index] = { ...updated[index], ...patch };
    setCurrentBox({ ...currentBox, ingredients: updated });
  };

  // Add sub box with circular dependency check
  const handleAddSubBox = () => {
    // Find candidate boxes excluding current box
    const available = boxItems.filter((b) => b.id !== currentBox.id);
    if (!available.length) return;

    const candidate = available[0];
    if (hasCircularDependency(currentBox.id, candidate.id, boxItems)) {
      setCircularError(`لا يمكن إضافة البوكس "${candidate.name}" لأنه يسبب حلقة اعتماد دائرية.`);
      return;
    }

    setCircularError(null);
    setCurrentBox({
      ...currentBox,
      subBoxes: [...(currentBox.subBoxes || []), { subBoxId: candidate.id, quantity: 1 }],
    });
  };

  const handleUpdateSubBox = (index: number, subBoxId: string, quantity: number) => {
    if (hasCircularDependency(currentBox.id, subBoxId, boxItems)) {
      setCircularError(`تحذير: اختيار هذا البوكس يسبب حلقة دائرية مفرغة وتم إلغاء العملية.`);
      return;
    }
    setCircularError(null);
    const updated = [...(currentBox.subBoxes || [])];
    updated[index] = { subBoxId, quantity };
    setCurrentBox({ ...currentBox, subBoxes: updated });
  };

  const handleRemoveSubBox = (index: number) => {
    const updated = [...(currentBox.subBoxes || [])];
    updated.splice(index, 1);
    setCurrentBox({ ...currentBox, subBoxes: updated });
  };

  const handleToggleExpense = (expId: string) => {
    const current = currentBox.linkedExpenseIds || [];
    const exists = current.includes(expId);
    const updated = exists ? current.filter((id) => id !== expId) : [...current, expId];
    setCurrentBox({ ...currentBox, linkedExpenseIds: updated });
  };

  const handleSave = () => {
    if (!currentBox.name.trim()) {
      alert('يرجى إدخال اسم البوكس أولاً.');
      return;
    }
    onSaveBox(currentBox);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleApplyTargetPrice = () => {
    setCurrentBox({
      ...currentBox,
      sellingPriceGross: computation.targetPriceGross,
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Bar: Selector & Actions */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
            البوكس المراد هندسته:
          </label>
          <select
            value={selectedBoxSelectId}
            onChange={(e) => handleSelectBoxChange(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          >
            <option value="new">+ إنشاء بوكس تجاري جديد</option>
            {boxItems.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {saveSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              تم الحفظ بنجاح!
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/20 transition-colors"
          >
            <Save className="w-4 h-4" />
            حفظ البوكس في الكتالوج
          </button>
        </div>
      </div>

      {circularError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-rose-800 dark:text-rose-300 text-xs font-bold">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{circularError}</span>
        </div>
      )}

      {/* Main Grid: Left is Box Engineering, Right is Live Pricing Engine Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Box Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Box Header Info */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-600" />
              البيانات الأساسية للبوكس
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم البوكس التجاري
                </label>
                <input
                  type="text"
                  value={currentBox.name}
                  onChange={(e) => setCurrentBox({ ...currentBox, name: e.target.value })}
                  placeholder="مثال: بوكس النعيمي العائلي الفاخر"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  كود الصنف SKU
                </label>
                <input
                  type="text"
                  value={currentBox.code}
                  onChange={(e) => setCurrentBox({ ...currentBox, code: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  التصنيف
                </label>
                <input
                  type="text"
                  value={currentBox.category}
                  onChange={(e) => setCurrentBox({ ...currentBox, category: e.target.value })}
                  placeholder="مثال: بوكسات اللحوم الطازجة"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  سعر البيع المقترح (شامل الضريبة ر.س)
                </label>
                <input
                  type="number"
                  step="0.10"
                  value={currentBox.sellingPriceGross}
                  onChange={(e) =>
                    setCurrentBox({
                      ...currentBox,
                      sellingPriceGross: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-left"
                />
              </div>
            </div>
          </div>

          {/* Raw Materials Ingredients */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  مكونات اللحوم والمواد الخام
                </h3>
                <p className="text-xs text-slate-500">
                  حدد الأصناف، الكميات بالكيلو، وتفعيل احتساب الهدر لكل مادة
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة مكوّن
              </button>
            </div>

            <div className="space-y-3">
              {currentBox.ingredients.map((ing, idx) => {
                const raw = rawItems.find((r) => r.id === ing.rawItemId);
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <select
                        value={ing.rawItemId}
                        onChange={(e) => handleUpdateIngredient(idx, { rawItemId: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                      >
                        {rawItems.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] text-slate-500">الكمية:</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={ing.quantity}
                          onChange={(e) =>
                            handleUpdateIngredient(idx, {
                              quantity: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 px-2 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-center"
                        />
                        <span className="text-[11px] text-slate-400">{raw?.unit || 'كجم'}</span>
                      </div>

                      <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={ing.applyWaste}
                          onChange={(e) =>
                            handleUpdateIngredient(idx, { applyWaste: e.target.checked })
                          }
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>تطبيق الهدر</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="حذف المكون"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {currentBox.ingredients.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  لم يتم إضافة أي مكونات خام لهذا البوكس بعد. انقر على «إضافة مكوّن» أعلاه.
                </div>
              )}
            </div>
          </div>

          {/* Nested Sub-boxes */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  البوكسات المتداخلة (Sub-Boxes)
                </h3>
                <p className="text-xs text-slate-500">
                  إدراج بوكس جاهز آخر داخل هذا البوكس كحزمة مع فحص آلي لمنع الحلقات
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSubBox}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                إدراج بوكس فرعي
              </button>
            </div>

            <div className="space-y-3">
              {(currentBox.subBoxes || []).map((sub, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <select
                      value={sub.subBoxId}
                      onChange={(e) => handleUpdateSubBox(idx, e.target.value, sub.quantity)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
                    >
                      {boxItems
                        .filter((b) => b.id !== currentBox.id)
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.code})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">العدد:</span>
                    <input
                      type="number"
                      min="1"
                      value={sub.quantity}
                      onChange={(e) =>
                        handleUpdateSubBox(idx, sub.subBoxId, parseInt(e.target.value, 10) || 1)
                      }
                      className="w-16 px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-center"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSubBox(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dish Packaging & Expenses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Dish packaging calculation */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                تكلفة الصحون والتغليف
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عدد الصحون في البوكس
                </label>
                <input
                  type="number"
                  min="0"
                  value={currentBox.numberOfDishes}
                  onChange={(e) =>
                    setCurrentBox({
                      ...currentBox,
                      numberOfDishes: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  سعر الصحن الواحد (شامل الضريبة ر.س)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={currentBox.dishCostEachGross}
                  onChange={(e) =>
                    setCurrentBox({
                      ...currentBox,
                      dishCostEachGross: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  صافي الصحن الواحد:{' '}
                  {formatSAR(currentBox.dishCostEachGross / (1 + settings.defaultVatRate))} | إجمالي
                  الصحون: {formatSAR(computation.costBreakdown.dishesCostNet)}
                </div>
              </div>
            </div>

            {/* Linked Expenses */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600" />
                المصروفات والتكاليف الإضافية
              </h3>

              <div className="space-y-2 text-xs">
                {expenses.map((exp) => {
                  const isChecked =
                    exp.applyToAll || (currentBox.linkedExpenseIds || []).includes(exp.id);
                  return (
                    <label
                      key={exp.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          disabled={exp.applyToAll}
                          checked={isChecked}
                          onChange={() => handleToggleExpense(exp.id)}
                          className="rounded text-blue-600"
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{exp.name}</span>
                      </div>
                      <span className="font-mono text-slate-500">
                        {exp.type === 'percentage_of_cost'
                          ? `${(exp.amount * 100).toFixed(1)}% من التكلفة`
                          : formatSAR(exp.amount)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Real-time Pricing Engine Gauge */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 sticky top-20">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                مؤشرات التسعير اللحظية
              </h3>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  computation.tier === 'excellent'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : computation.tier === 'good'
                    ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                    : computation.tier === 'low'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                {computation.tier === 'excellent'
                  ? 'ممتاز'
                  : computation.tier === 'good'
                  ? 'جيد'
                  : computation.tier === 'low'
                  ? 'منخفض'
                  : 'خسارة'}
              </span>
            </div>

            {/* Profit Margin Big Gauge */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">نسبة هامش الربح</div>
              <div
                className={`text-4xl font-black ${
                  computation.netProfit > 0
                    ? computation.profitMargin >= settings.targetProfitMargin
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatPercent(computation.profitMargin)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                المستهدف: {formatPercent(settings.targetProfitMargin)} (
                {computation.targetAchieved ? 'محقق' : 'دون الهدف'})
              </div>
            </div>

            {/* Cost and Profit Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">إجمالي التكلفة الصافية:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {formatSAR(computation.totalCostNet)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">صافي سعر البيع:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {formatSAR(computation.sellingPriceNet)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">ضريبة البيع (15%):</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {formatSAR(computation.vatAmountSelling)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">صافي الربح النقدي:</span>
                <span
                  className={`font-mono font-extrabold ${
                    computation.netProfit > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {formatSAR(computation.netProfit)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">سعر التعادل (0% ربح):</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {formatSAR(computation.breakEvenGross)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">السعر المطلوب للمستهدف:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {formatSAR(computation.targetPriceGross)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">الوزن التقديري الإجمالي:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {computation.costBreakdown.totalWeightKg.toFixed(2)} كجم
                </span>
              </div>
            </div>

            {/* Target Price One-Click Sync */}
            <button
              type="button"
              onClick={handleApplyTargetPrice}
              className="w-full py-2.5 px-4 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition-colors border border-blue-200 dark:border-blue-800 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              تطبيق السعر المستهدف ({formatSAR(computation.targetPriceGross)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
