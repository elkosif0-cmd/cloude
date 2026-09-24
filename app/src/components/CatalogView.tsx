import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Boxes,
  Tags,
  Eye,
  Edit2,
  Archive,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  FileCheck,
  Percent,
} from 'lucide-react';
import { RawItem, BoxItem, ExpenseItem, ProfitTier, PriceRule } from '../types/pricing';
import { AppSettings } from '../types/settings';
import { computeBoxItem, computeRawItem } from '../engine/pricingEngine';
import { formatSAR, formatPercent } from '../utils/formatters';
import { normalizeArabic } from '../utils/arabicNormalize';

interface CatalogViewProps {
  rawItems: RawItem[];
  boxItems: BoxItem[];
  expenses: ExpenseItem[];
  settings: AppSettings;
  priceRules: PriceRule[];
  onSaveRaw: (item: RawItem) => void;
  onSaveBox: (item: BoxItem) => void;
  onOpenProduct360: (id: string, type: 'raw' | 'box') => void;
  onAddToMemoDraft?: (item: { id: string; type: 'raw' | 'box'; name: string; code: string; currentPrice: number }) => void;
  onOpenNewRawModal: () => void;
  onOpenNewBoxModal: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  rawItems,
  boxItems,
  expenses,
  settings,
  priceRules,
  onSaveRaw,
  onSaveBox,
  onOpenProduct360,
  onAddToMemoDraft,
  onOpenNewRawModal,
  onOpenNewBoxModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'raw' | 'box' | 'archived'>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'cost' | 'profit' | 'margin'>('margin');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Quick edit modal state
  const [editingItem, setEditingItem] = useState<{
    id: string;
    type: 'raw' | 'box';
    name: string;
    sellingPriceGross: number;
    purchasePriceGross?: number;
    wastePercent?: number;
  } | null>(null);

  // Compute all items with Pricing Engine
  const computedList = useMemo(() => {
    const list: Array<{
      id: string;
      code: string;
      name: string;
      category: string;
      type: 'raw' | 'box';
      archived: boolean;
      sellingPriceGross: number;
      netSales: number;
      totalCostNet: number;
      netProfit: number;
      profitMargin: number;
      targetPriceGross: number;
      tier: ProfitTier;
      targetAchieved: boolean;
      wastePercent?: number;
      supplier?: string;
      originalRaw?: RawItem;
      originalBox?: BoxItem;
    }> = [];

    // Raw items
    for (const r of rawItems) {
      const comp = computeRawItem(r, settings);
      list.push({
        id: r.id,
        code: r.code,
        name: r.name,
        category: r.category,
        type: 'raw',
        archived: !!r.archived,
        sellingPriceGross: r.sellingPriceGross,
        netSales: comp.sellingPriceNet,
        totalCostNet: comp.usableKgCost,
        netProfit: comp.netProfit,
        profitMargin: comp.profitMargin,
        targetPriceGross: comp.targetPriceGross,
        tier: comp.tier,
        targetAchieved: comp.targetAchieved,
        wastePercent: r.wastePercent,
        supplier: r.supplier,
        originalRaw: r,
      });
    }

    // Box items
    for (const b of boxItems) {
      const comp = computeBoxItem(b, rawItems, boxItems, expenses, settings);
      list.push({
        id: b.id,
        code: b.code,
        name: b.name,
        category: b.category,
        type: 'box',
        archived: !!b.archived,
        sellingPriceGross: b.sellingPriceGross,
        netSales: comp.sellingPriceNet,
        totalCostNet: comp.totalCostNet,
        netProfit: comp.netProfit,
        profitMargin: comp.profitMargin,
        targetPriceGross: comp.targetPriceGross,
        tier: comp.tier,
        targetAchieved: comp.targetAchieved,
        originalBox: b,
      });
    }

    return list;
  }, [rawItems, boxItems, expenses, settings]);

  // Filtering
  const filteredList = useMemo(() => {
    const normSearch = normalizeArabic(searchTerm);

    return computedList
      .filter((item) => {
        // Tab Filter
        if (activeTab === 'archived') {
          if (!item.archived) return false;
        } else {
          if (item.archived) return false;
          if (activeTab === 'raw' && item.type !== 'raw') return false;
          if (activeTab === 'box' && item.type !== 'box') return false;
        }

        // Tier Filter
        if (tierFilter !== 'all' && item.tier !== tierFilter) {
          return false;
        }

        // Search
        if (normSearch) {
          const normName = normalizeArabic(item.name);
          const normCode = normalizeArabic(item.code);
          const normCategory = normalizeArabic(item.category);
          if (!normName.includes(normSearch) && !normCode.includes(normSearch) && !normCategory.includes(normSearch)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a.profitMargin;
        let valB: any = b.profitMargin;

        if (sortBy === 'name') {
          valA = a.name;
          valB = b.name;
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else if (sortBy === 'price') {
          valA = a.sellingPriceGross;
          valB = b.sellingPriceGross;
        } else if (sortBy === 'cost') {
          valA = a.totalCostNet;
          valB = b.totalCostNet;
        } else if (sortBy === 'profit') {
          valA = a.netProfit;
          valB = b.netProfit;
        }

        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [computedList, activeTab, tierFilter, searchTerm, sortBy, sortOrder]);

  const handleToggleArchive = (item: any) => {
    if (item.type === 'raw' && item.originalRaw) {
      onSaveRaw({ ...item.originalRaw, archived: !item.archived });
    } else if (item.type === 'box' && item.originalBox) {
      onSaveBox({ ...item.originalBox, archived: !item.archived });
    }
  };

  const handleQuickSave = () => {
    if (!editingItem) return;
    if (editingItem.type === 'raw') {
      const orig = rawItems.find((r) => r.id === editingItem.id);
      if (orig) {
        onSaveRaw({
          ...orig,
          sellingPriceGross: editingItem.sellingPriceGross,
          purchasePriceGross: editingItem.purchasePriceGross ?? orig.purchasePriceGross,
          wastePercent: editingItem.wastePercent ?? orig.wastePercent,
        });
      }
    } else {
      const orig = boxItems.find((b) => b.id === editingItem.id);
      if (orig) {
        onSaveBox({
          ...orig,
          sellingPriceGross: editingItem.sellingPriceGross,
        });
      }
    }
    setEditingItem(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الكل ({rawItems.filter((r) => !r.archived).length + boxItems.filter((b) => !b.archived).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'raw'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            المواد الخام ({rawItems.filter((r) => !r.archived).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('box')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'box'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            البوكسات ({boxItems.filter((b) => !b.archived).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('archived')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'archived'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            المؤرشفة ({rawItems.filter((r) => r.archived).length + boxItems.filter((b) => b.archived).length})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewBoxModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/20 transition-colors"
          >
            <Boxes className="w-4 h-4" />
            بناء بوكس جديد
          </button>
          <button
            type="button"
            onClick={onOpenNewRawModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-colors border border-emerald-200 dark:border-emerald-800"
          >
            <Plus className="w-4 h-4" />
            إضافة مادة خام
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث عربي ذكي (اسم الصنف، الكود، التصنيف)..."
            className="w-full pl-4 pr-10 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Tier filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">جميع مستويات الربحية</option>
            <option value="excellent">ممتاز (≥25%)</option>
            <option value="good">جيد (15% - 25%)</option>
            <option value="low">منخفض (0% - 15%)</option>
            <option value="loss">خسارة (≤ 0%)</option>
            <option value="byproduct">منتجات جانبية</option>
          </select>
        </div>

        {/* Sort by */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full md:w-auto px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="margin">الفرز حسب نسبة الهامش</option>
            <option value="profit">الفرز حسب صافي الربح</option>
            <option value="price">الفرز حسب سعر البيع</option>
            <option value="cost">الفرز حسب التكلفة</option>
            <option value="name">الفرز حسب الاسم أبجدياً</option>
          </select>
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            title={sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
              <tr>
                <th className="p-3.5 pr-5">الصنف والكود</th>
                <th className="p-3.5">النوع والتصنيف</th>
                <th className="p-3.5">التكلفة الصافية</th>
                <th className="p-3.5">سعر البيع (شامل ضريبة)</th>
                <th className="p-3.5">صافي البيع</th>
                <th className="p-3.5">صافي الربح</th>
                <th className="p-3.5">الهامش</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5">سعر الهدف</th>
                <th className="p-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredList.map((item) => {
                const tierClass = {
                  excellent: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                  good: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
                  low: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
                  loss: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
                  byproduct: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
                }[item.tier];

                const tierText = {
                  excellent: 'ممتاز',
                  good: 'جيد',
                  low: 'منخفض',
                  loss: 'خسارة',
                  byproduct: 'جانبي',
                }[item.tier];

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Item name & code */}
                    <td className="p-3.5 pr-5">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => onOpenProduct360(item.id, item.type)}
                          className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-right transition-colors"
                        >
                          {item.name}
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.code}</div>
                    </td>

                    {/* Type & Category */}
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        {item.type === 'raw' ? (
                          <span className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                            مادة خام
                          </span>
                        ) : (
                          <span className="p-1 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px]">
                            بوكس
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">{item.category}</span>
                      </div>
                    </td>

                    {/* Net Cost */}
                    <td className="p-3.5 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {formatSAR(item.totalCostNet)}
                      {item.wastePercent !== undefined && item.wastePercent > 0 && (
                        <div className="text-[10px] text-slate-400">
                          هدر: {formatPercent(item.wastePercent)}
                        </div>
                      )}
                    </td>

                    {/* Gross Selling Price */}
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {formatSAR(item.sellingPriceGross)}
                    </td>

                    {/* Net Sales */}
                    <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">
                      {formatSAR(item.netSales)}
                    </td>

                    {/* Net Profit */}
                    <td
                      className={`p-3.5 font-mono font-bold ${
                        item.netProfit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatSAR(item.netProfit)}
                    </td>

                    {/* Margin % */}
                    <td
                      className={`p-3.5 font-mono font-extrabold ${
                        item.profitMargin >= settings.targetProfitMargin
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : item.profitMargin > 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatPercent(item.profitMargin)}
                    </td>

                    {/* Tier badge */}
                    <td className="p-3.5">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${tierClass}`}>
                        {tierText}
                      </span>
                    </td>

                    {/* Target Price */}
                    <td className="p-3.5 font-mono text-blue-600 dark:text-blue-400">
                      {formatSAR(item.targetPriceGross)}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* 360 View */}
                        <button
                          type="button"
                          onClick={() => onOpenProduct360(item.id, item.type)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="عرض ملف الصنف Product 360"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Quick edit */}
                        <button
                          type="button"
                          onClick={() =>
                            setEditingItem({
                              id: item.id,
                              type: item.type,
                              name: item.name,
                              sellingPriceGross: item.sellingPriceGross,
                              purchasePriceGross: item.originalRaw?.purchasePriceGross,
                              wastePercent: item.originalRaw?.wastePercent,
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="تعديل سريع"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Add to Memo Draft */}
                        {onAddToMemoDraft && (
                          <button
                            type="button"
                            onClick={() =>
                              onAddToMemoDraft({
                                id: item.id,
                                type: item.type,
                                name: item.name,
                                code: item.code,
                                currentPrice: item.sellingPriceGross,
                              })
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="إضافة لمذكرة تعديل أسعار"
                          >
                            <FileCheck className="w-4 h-4" />
                          </button>
                        )}

                        {/* Archive / Restore */}
                        <button
                          type="button"
                          onClick={() => handleToggleArchive(item)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.archived
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title={item.archived ? 'استعادة من الأرشيف' : 'أرشفة الصنف'}
                        >
                          {item.archived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    لا توجد أصناف مطابقة لمعايير البحث أو الفلترة المحددة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-right animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
              تعديل سريع: {editingItem.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              تعديل مباشر على السعر أو التكلفة. يتم تحديث محرك التسعير لحظياً.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  سعر البيع المقترح (شامل الضريبة ر.س)
                </label>
                <input
                  type="number"
                  step="0.10"
                  value={editingItem.sellingPriceGross}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      sellingPriceGross: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-left"
                />
              </div>

              {editingItem.type === 'raw' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      سعر الشراء (شامل الضريبة ر.س)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={editingItem.purchasePriceGross ?? 0}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          purchasePriceGross: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-left"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نسبة الهدر (مثال: 0.05 = 5%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingItem.wastePercent ?? 0}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          wastePercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-left"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleQuickSave}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/20"
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
