import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ArrowRightLeft,
  Download,
  Search,
  Filter,
  ShieldAlert,
} from 'lucide-react';
import { Order } from '../types/commerce';
import { BoxItem, RawItem } from '../types/pricing';
import { formatSAR, formatPercent } from '../utils/formatters';

interface ReconciliationViewProps {
  orders: Order[];
  boxItems: BoxItem[];
  rawItems: RawItem[];
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({
  orders,
  boxItems,
  rawItems,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyDiscrepancies, setOnlyDiscrepancies] = useState(true);

  // Compute item sales vs official catalog price
  const reconciliationRows = useMemo(() => {
    const rows: Array<{
      orderNumber: string;
      orderDate: string;
      customerName: string;
      itemCode: string;
      itemName: string;
      quantity: number;
      actualSoldGross: number;
      catalogOfficialGross: number;
      priceDiff: number;
      priceDiffPercent: number;
      hasDiscrepancy: boolean;
      status: 'matched' | 'discounted' | 'overpriced' | 'unmapped';
    }> = [];

    for (const order of orders) {
      for (const item of order.items) {
        // Find matching catalog item
        const box = boxItems.find((b) => (item.productId && b.id === item.productId) || b.name === item.productName);
        const raw = rawItems.find((r) => (item.productId && r.id === item.productId) || r.name === item.productName);

        const officialGross = box
          ? box.sellingPriceGross
          : raw
          ? raw.sellingPriceGross
          : null;

        if (officialGross === null) {
          rows.push({
            orderNumber: order.orderNumber,
            orderDate: order.orderDate,
            customerName: order.customerName,
            itemCode: item.productId || 'N/A',
            itemName: item.productName,
            quantity: item.quantity,
            actualSoldGross: item.unitPrice,
            catalogOfficialGross: 0,
            priceDiff: 0,
            priceDiffPercent: 0,
            hasDiscrepancy: true,
            status: 'unmapped',
          });
        } else {
          const diff = item.unitPrice - officialGross;
          const diffPct = officialGross > 0 ? diff / officialGross : 0;
          const hasDiscrepancy = Math.abs(diff) > 0.5;

          rows.push({
            orderNumber: order.orderNumber,
            orderDate: order.orderDate,
            customerName: order.customerName,
            itemCode: box ? box.code : raw!.code,
            itemName: item.productName,
            quantity: item.quantity,
            actualSoldGross: item.unitPrice,
            catalogOfficialGross: officialGross,
            priceDiff: diff,
            priceDiffPercent: diffPct,
            hasDiscrepancy,
            status: !hasDiscrepancy ? 'matched' : diff < 0 ? 'discounted' : 'overpriced',
          });
        }
      }
    }

    return rows;
  }, [orders, boxItems, rawItems]);

  const filteredRows = useMemo(() => {
    return reconciliationRows.filter((r) => {
      if (onlyDiscrepancies && !r.hasDiscrepancy) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        if (
          !r.itemName.toLowerCase().includes(s) &&
          !r.orderNumber.toLowerCase().includes(s) &&
          !r.customerName.toLowerCase().includes(s)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [reconciliationRows, onlyDiscrepancies, searchTerm]);

  // Total variance amount in SAR
  const totalVarianceLoss = useMemo(() => {
    return reconciliationRows
      .filter((r) => r.status === 'discounted')
      .reduce((sum, r) => sum + Math.abs(r.priceDiff) * r.quantity, 0);
  }, [reconciliationRows]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner & Stats */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              مطابقة المبيعات بالكتالوج المعتمد (Sales Audit & Reconciliation)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              كشف الفروقات بين أسعار الفواتير المنفذة والأسعار الرسمية المعتمدة في النظام
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-left">
            <div className="text-xs text-slate-400">فروقات الخصومات المنفذة</div>
            <div className="text-xl font-black text-rose-600 font-mono">
              -{formatSAR(totalVarianceLoss)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث برقم الطلب، اسم الصنف، أو العميل..."
            className="w-full pl-3 pr-9 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyDiscrepancies}
            onChange={(e) => setOnlyDiscrepancies(e.target.checked)}
            className="rounded text-blue-600"
          />
          <span>إظهار الفروقات والانحرافات فقط ({reconciliationRows.filter((r) => r.hasDiscrepancy).length})</span>
        </label>
      </div>

      {/* Reconciliation Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 pr-5">الطلب والتاريخ</th>
                <th className="p-3">العميل</th>
                <th className="p-3">الصنف المباع</th>
                <th className="p-3">الكمية</th>
                <th className="p-3">سعر البيع الفعلي</th>
                <th className="p-3">السعر الرسمي المعتمد</th>
                <th className="p-3">الفارق في السعر</th>
                <th className="p-3">الحالة والتدقيق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRows.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 pr-5 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {r.orderNumber}
                    <span className="block text-[10px] text-slate-400 font-normal">
                      {r.orderDate}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                    {r.customerName}
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {r.itemName}
                  </td>
                  <td className="p-3 font-mono font-bold">{r.quantity}</td>
                  <td className="p-3 font-mono font-bold">{formatSAR(r.actualSoldGross)}</td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                    {r.catalogOfficialGross > 0 ? formatSAR(r.catalogOfficialGross) : 'غير مسجل'}
                  </td>
                  <td className="p-3 font-mono font-bold">
                    {r.status === 'matched' ? (
                      <span className="text-emerald-600">مطابق (0.00 ر.س)</span>
                    ) : r.status === 'discounted' ? (
                      <span className="text-rose-600 font-black">
                        -{formatSAR(Math.abs(r.priceDiff))} ({formatPercent(Math.abs(r.priceDiffPercent))})
                      </span>
                    ) : r.status === 'overpriced' ? (
                      <span className="text-emerald-600">
                        +{formatSAR(r.priceDiff)} ({formatPercent(r.priceDiffPercent)})
                      </span>
                    ) : (
                      <span className="text-amber-600">صنف غير مقيد</span>
                    )}
                  </td>
                  <td className="p-3">
                    {r.status === 'matched' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        سعر نظامي
                      </span>
                    )}
                    {r.status === 'discounted' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                        خصم غير مدرج
                      </span>
                    )}
                    {r.status === 'overpriced' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                        سعر أعلى
                      </span>
                    )}
                    {r.status === 'unmapped' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        غير معرف بالكتالوج
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    لا توجد فروقات أسعار مسجلة في البيانات الحالية.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
