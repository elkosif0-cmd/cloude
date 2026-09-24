import React, { useState } from 'react';
import {
  CircleDollarSign,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  Percent,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { RawItem, ExpenseItem, ExpenseType } from '../types/pricing';
import { AppSettings } from '../types/settings';
import { computeRawItem } from '../engine/pricingEngine';
import { formatSAR, formatPercent } from '../utils/formatters';

interface CostsExpensesViewProps {
  rawItems: RawItem[];
  expenses: ExpenseItem[];
  settings: AppSettings;
  onSaveRawItem: (item: RawItem) => void;
  onSaveExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const CostsExpensesView: React.FC<CostsExpensesViewProps> = ({
  rawItems,
  expenses,
  settings,
  onSaveRawItem,
  onSaveExpense,
  onDeleteExpense,
}) => {
  // New Expense state
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseType, setNewExpenseType] = useState<ExpenseType>('fixed_amount');
  const [newExpenseAmount, setNewExpenseAmount] = useState<number>(5);
  const [newExpenseApplyAll, setNewExpenseApplyAll] = useState<boolean>(false);

  // Quick edit raw cost state
  const [editingRawId, setEditingRawId] = useState<string | null>(null);
  const [editPurchaseGross, setEditPurchaseGross] = useState<number>(0);
  const [editWastePct, setEditWastePct] = useState<number>(0);

  const handleStartEditRaw = (r: RawItem) => {
    setEditingRawId(r.id);
    setEditPurchaseGross(r.purchasePriceGross);
    setEditWastePct(r.wastePercent);
  };

  const handleSaveRaw = (r: RawItem) => {
    onSaveRawItem({
      ...r,
      purchasePriceGross: editPurchaseGross,
      wastePercent: editWastePct,
    });
    setEditingRawId(null);
  };

  const handleSaveNewExpense = () => {
    if (!newExpenseName.trim()) {
      alert('يرجى إدخال اسم المصروف.');
      return;
    }

    const exp: ExpenseItem = {
      id: editingExpense ? editingExpense.id : `exp-${Date.now()}`,
      name: newExpenseName,
      type: newExpenseType,
      amount: newExpenseAmount,
      applyToAll: newExpenseApplyAll,
      vatRate: 0.15,
      notes: '',
    };

    onSaveExpense(exp);
    setIsAddingExpense(false);
    setEditingExpense(null);
    setNewExpenseName('');
    setNewExpenseAmount(5);
  };

  const expenseTypeLabels: Record<ExpenseType, string> = {
    fixed_amount: 'مبلغ ثابت لكل بوكس',
    per_unit: 'مبلغ لكل وحدة/كجم',
    percentage_of_cost: 'نسبة مئوية من التكلفة',
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <CircleDollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              إدارة التكاليف وهندسة المصروفات التشغيلية
            </h3>
            <p className="text-xs text-slate-500">
              تحديث أسعار شراء المواد الخام، نسب الهدر، والمصروفات الإضافية المحملة على البوكسات
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingExpense(null);
            setNewExpenseName('');
            setNewExpenseAmount(5);
            setNewExpenseType('fixed_amount');
            setNewExpenseApplyAll(false);
            setIsAddingExpense(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة بند مصروف
        </button>
      </div>

      {/* Grid: 1. Raw Materials Costs & Waste */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              أسعار شراء المواد الخام ونسب الهدر والتصافي
            </h4>
            <p className="text-xs text-slate-500">
              يتم استرداد ضريبة مدخلات الشراء بنسبة 15% واحتساب تكلفة الكيلو الصافي الصالح للاستخدام
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
              <tr>
                <th className="p-3">المادة الخام</th>
                <th className="p-3">سعر الشراء (شامل الضريبة)</th>
                <th className="p-3">صافي الشراء</th>
                <th className="p-3">نسبة الهدر</th>
                <th className="p-3">تكلفة الكيلو الصافي النهائي</th>
                <th className="p-3 text-center">تعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rawItems.map((r) => {
                const comp = computeRawItem(r, settings);
                const isEditing = editingRawId === r.id;

                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {r.name}
                      <span className="block text-[10px] text-slate-400 font-mono">{r.code}</span>
                    </td>

                    {/* Purchase Price Gross */}
                    <td className="p-3 font-mono font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.5"
                          value={editPurchaseGross}
                          onChange={(e) => setEditPurchaseGross(parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 text-xs rounded bg-white dark:bg-slate-900 border border-slate-300 font-mono font-bold text-left"
                        />
                      ) : (
                        formatSAR(r.purchasePriceGross)
                      )}
                    </td>

                    {/* Net Purchase */}
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                      {formatSAR(comp.purchasePriceNet)}
                    </td>

                    {/* Waste % */}
                    <td className="p-3 font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editWastePct}
                          onChange={(e) => setEditWastePct(parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-xs rounded bg-white dark:bg-slate-900 border border-slate-300 font-mono text-left"
                        />
                      ) : (
                        formatPercent(r.wastePercent)
                      )}
                    </td>

                    {/* Usable kg cost */}
                    <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                      {formatSAR(comp.usableKgCost)}
                    </td>

                    {/* Action */}
                    <td className="p-3 text-center">
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => handleSaveRaw(r)}
                          className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                          title="حفظ"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEditRaw(r)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="تعديل سريع"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: 2. Operational Expenses */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              المصروفات والتكاليف المشتركة المضافة
            </h4>
            <p className="text-xs text-slate-500">
              تحدد تكلفة التغليف، أكياس الفاكيوم، الشحن المبرد، والعمالة المحملة على كل بوكس
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">{exp.name}</h5>
                  <span className="text-[10px] text-slate-400">
                    {expenseTypeLabels[exp.type]}
                  </span>
                </div>
                {exp.applyToAll && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    يطبق على الكل
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {exp.type === 'percentage_of_cost'
                    ? `${(exp.amount * 100).toFixed(1)}%`
                    : formatSAR(exp.amount)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExpense(exp);
                      setNewExpenseName(exp.name);
                      setNewExpenseAmount(exp.amount);
                      setNewExpenseType(exp.type);
                      setNewExpenseApplyAll(!!exp.applyToAll);
                      setIsAddingExpense(true);
                    }}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    title="تعديل"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteExpense(exp.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isAddingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-right">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
              {editingExpense ? 'تعديل بند المصروف' : 'إضافة بند مصروف جديد'}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المصروف
                </label>
                <input
                  type="text"
                  value={newExpenseName}
                  onChange={(e) => setNewExpenseName(e.target.value)}
                  placeholder="مثال: تغليف فاكيوم وثلج جاف"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  طريقة التحميل والاحتساب
                </label>
                <select
                  value={newExpenseType}
                  onChange={(e) => setNewExpenseType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 font-semibold"
                >
                  <option value="fixed_amount">مبلغ ثابت لكل بوكس (Fixed Amount)</option>
                  <option value="per_unit">مبلغ لكل وحدة/كجم (Per Unit)</option>
                  <option value="percentage_of_cost">نسبة مئوية من التكلفة (% of Cost)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  القيمة ({newExpenseType === 'percentage_of_cost' ? 'نسبة مئوية مثال: 0.05' : 'ر.س'})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 font-mono font-bold text-left"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newExpenseApplyAll}
                  onChange={(e) => setNewExpenseApplyAll(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>تطبيق هذا المصروف تلقائياً على كافة البوكسات في الكتالوج</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingExpense(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveNewExpense}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                حفظ المصروف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
