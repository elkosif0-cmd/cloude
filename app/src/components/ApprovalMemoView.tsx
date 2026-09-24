import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  UserCheck,
  Calendar,
} from 'lucide-react';
import { ApprovalMemo, ApprovalItem, ApprovalStatus } from '../types/approvals';
import { RawItem, BoxItem, ItemType } from '../types/pricing';
import { AppSettings } from '../types/settings';
import { formatSAR, formatPercent, formatDateAr } from '../utils/formatters';

interface ApprovalMemoViewProps {
  memos: ApprovalMemo[];
  rawItems: RawItem[];
  boxItems: BoxItem[];
  settings: AppSettings;
  onSaveMemo: (memo: ApprovalMemo) => void;
  onApproveMemo: (memo: ApprovalMemo) => void;
}

export const ApprovalMemoView: React.FC<ApprovalMemoViewProps> = ({
  memos,
  rawItems,
  boxItems,
  settings,
  onSaveMemo,
  onApproveMemo,
}) => {
  const [selectedMemo, setSelectedMemo] = useState<ApprovalMemo | null>(memos[0] || null);
  const [isCreating, setIsCreating] = useState(false);

  // New memo form state
  const [newTitle, setNewTitle] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newCategoryScope, setNewCategoryScope] = useState('عام');
  const [newItems, setNewItems] = useState<ApprovalItem[]>([]);

  const handleAddItem = (itemId: string, itemType: ItemType) => {
    const raw = itemType === 'raw' ? rawItems.find((r) => r.id === itemId) : null;
    const box = itemType === 'box' ? boxItems.find((b) => b.id === itemId) : null;
    if (!raw && !box) return;

    const name = raw ? raw.name : box!.name;
    const code = raw ? raw.code : box!.code;
    const oldPriceGross = raw ? raw.sellingPriceGross : box!.sellingPriceGross;
    const newPriceGross = Math.round(oldPriceGross * 1.05 * 10) / 10;
    const costNet = raw ? raw.purchasePriceGross / 1.15 : (box!.sellingPriceGross / 1.15) * 0.7;

    const oldNet = oldPriceGross / 1.15;
    const newNet = newPriceGross / 1.15;
    const oldProfit = oldNet - costNet;
    const newProfit = newNet - costNet;
    const oldMargin = oldNet > 0 ? oldProfit / oldNet : 0;
    const newMargin = newNet > 0 ? newProfit / newNet : 0;

    const item: ApprovalItem = {
      itemId,
      itemType,
      name,
      code,
      oldPriceGross,
      newPriceGross,
      costNet,
      oldMarginPercent: oldMargin,
      newMarginPercent: newMargin,
      oldProfitNet: oldProfit,
      newProfitNet: newProfit,
      oldTier: oldMargin >= settings.targetProfitMargin ? 'excellent' : 'good',
      newTier: newMargin >= settings.targetProfitMargin ? 'excellent' : 'good',
      targetAchieved: newMargin >= settings.targetProfitMargin,
    };

    setNewItems([...newItems.filter((i) => i.itemId !== itemId), item]);
  };

  const handleUpdateItemPrice = (itemId: string, newPrice: number) => {
    const updated = newItems.map((item) => {
      if (item.itemId === itemId) {
        const newNet = newPrice / 1.15;
        const newProfit = newNet - item.costNet;
        const newMargin = newNet > 0 ? newProfit / newNet : 0;
        return {
          ...item,
          newPriceGross: newPrice,
          newMarginPercent: newMargin,
          newProfitNet: newProfit,
          newTier: (newMargin >= settings.targetProfitMargin ? 'excellent' : 'good') as any,
          targetAchieved: newMargin >= settings.targetProfitMargin,
        };
      }
      return item;
    });
    setNewItems(updated);
  };

  const handleSaveNewMemo = () => {
    if (!newTitle.trim()) {
      alert('يرجى إدخال عنوان المذكرة.');
      return;
    }
    if (newItems.length === 0) {
      alert('يرجى إضافة صنف مقترح واحد على الأقل للمذكرة.');
      return;
    }

    const created: ApprovalMemo = {
      id: `memo-${Date.now()}`,
      referenceNumber: `MEMO-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      title: newTitle,
      reason: newReason || 'مواءمة الأسعار مع تكاليف السوق',
      categoryScope: newCategoryScope,
      status: 'pending',
      preparerName: settings.reportPreparerName || 'مدير التسعير والعمليات',
      createdAt: new Date().toISOString(),
      items: newItems,
    };

    onSaveMemo(created);
    setSelectedMemo(created);
    setIsCreating(false);
    setNewTitle('');
    setNewReason('');
    setNewItems([]);
  };

  const statusBadge: Record<ApprovalStatus, { label: string; bg: string }> = {
    pending: { label: 'قيد المراجعة والاعتماد', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
    approved: { label: 'معتمدة ومطبقة', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
    rejected: { label: 'مرفوضة', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              حوكمة واعتماد تعديلات الأسعار
            </h3>
            <p className="text-xs text-slate-500">
              دورة رسمية لحوكمة أي تغيير في أسعار البيع والتكاليف قبل تعميمها على المنظومة
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm shadow-purple-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إنشاء مذكرة اعتماد جديدة
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of Memos */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 px-1">
            سجل مذكرات التسعير ({memos.length})
          </div>
          {memos.map((memo) => {
            const badge = statusBadge[memo.status] || statusBadge.pending;
            const isSelected = selectedMemo?.id === memo.id;
            return (
              <div
                key={memo.id}
                onClick={() => setSelectedMemo(memo)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-right ${
                  isSelected
                    ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400">
                    {memo.referenceNumber}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug mb-1">
                  {memo.title}
                </h4>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>الأصناف: {memo.items?.length || 0}</span>
                  <span>التاريخ: {formatDateAr(memo.date)}</span>
                </div>
              </div>
            );
          })}
          {memos.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              لا توجد أي مذكرات اعتماد مسجلة حالياً.
            </div>
          )}
        </div>

        {/* Selected Memo Details & Decision Actions */}
        <div className="lg:col-span-2">
          {selectedMemo ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              {/* Memo Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                      {selectedMemo.referenceNumber}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        (statusBadge[selectedMemo.status] || statusBadge.pending).bg
                      }`}
                    >
                      {(statusBadge[selectedMemo.status] || statusBadge.pending).label}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {selectedMemo.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    إعداد: {selectedMemo.preparerName} • تاريخ المذكرة: {formatDateAr(selectedMemo.date)}
                  </p>
                </div>

                {/* Print button */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl self-start sm:self-auto"
                >
                  <Printer className="w-3.5 h-3.5" />
                  طباعة المذكرة A4
                </button>
              </div>

              {/* Reason Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  مبررات ودوافع التعديل:
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedMemo.reason}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                  جدول التعديلات المقترحة للأسعار ({selectedMemo.items?.length || 0} أصناف):
                </div>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                      <tr>
                        <th className="p-3">الصنف والكود</th>
                        <th className="p-3">السعر الحالي</th>
                        <th className="p-3">السعر المقترح</th>
                        <th className="p-3">الهامش السابق</th>
                        <th className="p-3">الهامش المقترح</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedMemo.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                            {item.name}
                            <span className="block text-[10px] text-slate-400 font-mono">
                              {item.code}
                            </span>
                          </td>
                          <td className="p-3 font-mono">{formatSAR(item.oldPriceGross)}</td>
                          <td className="p-3 font-mono font-bold text-purple-700 dark:text-purple-400">
                            {formatSAR(item.newPriceGross)}
                          </td>
                          <td className="p-3 font-mono">{formatPercent(item.oldMarginPercent)}</td>
                          <td className="p-3 font-mono font-bold text-emerald-600">
                            {formatPercent(item.newMarginPercent)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signoff / Approver Actions */}
              {selectedMemo.status === 'pending' && (
                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-black text-amber-900 dark:text-amber-300">
                      قرار الإدارة المالية والتنفيذية
                    </h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                      عند الضغط على "اعتماد وتطبيق الأسعار"، سيتم تحديث أسعار الكتالوج فورياً وتسجيل حركة في سجل التدقيق.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const updated: ApprovalMemo = {
                          ...selectedMemo,
                          status: 'rejected',
                          approverName: 'لجنة التسعير',
                          decisionDate: new Date().toISOString(),
                        };
                        onSaveMemo(updated);
                        setSelectedMemo(updated);
                      }}
                      className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-xl transition-colors"
                    >
                      رفض المذكرة
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated: ApprovalMemo = {
                          ...selectedMemo,
                          status: 'approved',
                          approverName: 'المدير التنفيذي - معتمد',
                          decisionDate: new Date().toISOString(),
                        };
                        onApproveMemo(updated);
                        setSelectedMemo(updated);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      اعتماد وتطبيق الأسعار
                    </button>
                  </div>
                </div>
              )}

              {selectedMemo.status === 'approved' && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>تم اعتماد هذه المذكرة وتطبيق الأسعار بالكتالوج بواسطة: {selectedMemo.approverName || 'الإدارة'}</span>
                  </div>
                  {selectedMemo.decisionDate && (
                    <span className="font-mono text-[11px]">{formatDateAr(selectedMemo.decisionDate)}</span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              اختر مذكرة من القائمة لمراجعة بنودها واتخاذ القرار.
            </div>
          )}
        </div>
      </div>

      {/* Create Memo Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-right space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              إنشاء مذكرة اعتماد تعديل أسعار جديدة
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                عنوان المذكرة
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: تعديل أسعار الربع الأول 2026 لمواءمة تكاليف الأعلاف"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                مبررات التعديل والأثر المتوقع
              </label>
              <textarea
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                rows={3}
                placeholder="شرح أسباب الزيادة أو التخفيض، تغير تكاليف الموردين، أو عروض ترويجية..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200"
              />
            </div>

            {/* Select items to add */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                اختر صنفاً لإدراجه في المذكرة:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddItem(e.target.value, 'box');
                      e.target.value = '';
                    }
                  }}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 font-bold"
                >
                  <option value="">+ إضافة بوكس جاهز...</option>
                  {boxItems.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({formatSAR(b.sellingPriceGross)})
                    </option>
                  ))}
                </select>

                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddItem(e.target.value, 'raw');
                      e.target.value = '';
                    }
                  }}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 font-bold"
                >
                  <option value="">+ إضافة مادة خام...</option>
                  {rawItems.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({formatSAR(r.sellingPriceGross)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List of items added */}
            {newItems.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <div className="text-xs font-bold text-slate-600">الأصناف المضافة ({newItems.length}):</div>
                {newItems.map((item) => (
                  <div
                    key={item.itemId}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold">{item.name}</span>
                      <span className="text-slate-400 mr-2">الحالي: {formatSAR(item.oldPriceGross)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-slate-500">المقترح:</label>
                      <input
                        type="number"
                        step="0.5"
                        value={item.newPriceGross}
                        onChange={(e) => handleUpdateItemPrice(item.itemId, parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 text-xs rounded-lg border border-slate-200 font-mono font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveNewMemo}
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                حفظ وإنشاء المذكرة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
