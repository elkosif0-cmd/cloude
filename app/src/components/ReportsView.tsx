import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  Filter,
  Boxes,
  Tags,
  Receipt,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { RawItem, BoxItem, ExpenseItem } from '../types/pricing';
import { AppSettings } from '../types/settings';
import { Order } from '../types/commerce';
import { computeBoxItem, computeRawItem } from '../engine/pricingEngine';
import { formatSAR, formatPercent, formatDateAr } from '../utils/formatters';

interface ReportsViewProps {
  rawItems: RawItem[];
  boxItems: BoxItem[];
  expenses: ExpenseItem[];
  settings: AppSettings;
  orders: Order[];
}

export type ReportType =
  | 'catalog_margins'
  | 'box_engineering'
  | 'price_list'
  | 'sales_collections';

export const ReportsView: React.FC<ReportsViewProps> = ({
  rawItems,
  boxItems,
  expenses,
  settings,
  orders,
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('catalog_margins');

  // Compute live items
  const rawComps = useMemo(() => {
    return rawItems.map((r) => ({ item: r, comp: computeRawItem(r, settings) }));
  }, [rawItems, settings]);

  const boxComps = useMemo(() => {
    return boxItems.map((b) => ({
      item: b,
      comp: computeBoxItem(b, rawItems, boxItems, expenses, settings),
    }));
  }, [boxItems, rawItems, expenses, settings]);

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // CSV Export
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (selectedReport === 'catalog_margins') {
      headers = ['النوع', 'الكود', 'الاسم', 'التصنيف', 'سعر البيع شامل الضريبة', 'التكلفة الصافية', 'صافي الربح', 'الهامش', 'الحالة'];
      for (const b of boxComps) {
        rows.push([
          'بوكس',
          b.item.code,
          b.item.name,
          b.item.category,
          b.item.sellingPriceGross.toString(),
          b.comp.totalCostNet.toFixed(2),
          b.comp.netProfit.toFixed(2),
          (b.comp.profitMargin * 100).toFixed(1) + '%',
          b.comp.tier,
        ]);
      }
      for (const r of rawComps) {
        rows.push([
          'خام',
          r.item.code,
          r.item.name,
          r.item.category,
          r.item.sellingPriceGross.toString(),
          r.comp.usableKgCost.toFixed(2),
          r.comp.netProfit.toFixed(2),
          (r.comp.profitMargin * 100).toFixed(1) + '%',
          r.comp.tier,
        ]);
      }
    } else if (selectedReport === 'box_engineering') {
      headers = ['الكود', 'اسم البوكس', 'عدد المكونات', 'عدد الصحون', 'الوزن التقريبي كجم', 'التكلفة الصافية', 'سعر البيع', 'صافي الربح', 'الهامش'];
      for (const b of boxComps) {
        rows.push([
          b.item.code,
          b.item.name,
          b.item.ingredients.length.toString(),
          b.item.numberOfDishes.toString(),
          b.comp.costBreakdown.totalWeightKg.toFixed(2),
          b.comp.totalCostNet.toFixed(2),
          b.item.sellingPriceGross.toString(),
          b.comp.netProfit.toFixed(2),
          (b.comp.profitMargin * 100).toFixed(1) + '%',
        ]);
      }
    } else if (selectedReport === 'price_list') {
      headers = ['النوع', 'كود الصنف', 'اسم الصنف', 'التصنيف', 'السعر شامل ضريبة 15%'];
      for (const b of boxItems.filter((i) => !i.archived)) {
        rows.push(['بوكس', b.code, b.name, b.category, b.sellingPriceGross.toString()]);
      }
      for (const r of rawItems.filter((i) => !i.archived)) {
        rows.push(['خام', r.code, r.name, r.category, r.sellingPriceGross.toString()]);
      }
    } else if (selectedReport === 'sales_collections') {
      headers = ['رقم الطلب', 'تاريخ الطلب', 'اسم العميل', 'طريقة الدفع', 'إجمالي الفاتورة', 'المسدد', 'المتبقي', 'الحالة'];
      for (const o of orders) {
        rows.push([
          o.orderNumber,
          o.orderDate,
          o.customerName,
          o.paymentMethod,
          o.totalAmount.toString(),
          o.paidAmount.toString(),
          o.remainingAmount.toString(),
          o.paymentStatus,
        ]);
      }
    }

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))].join(
        '\n'
      );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `تقرير_${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header & Report Chooser */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              مركز التقارير القياسية والطباعة الرسمية
            </h3>
            <p className="text-xs text-slate-500">
              توليد تقارير دقيقة جاهزة للطباعة بصيغة A4 وتصدير CSV
            </p>
          </div>
        </div>

        {/* Report Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => setSelectedReport('catalog_margins')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedReport === 'catalog_margins'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            تقرير ربحية الكتالوج
          </button>

          <button
            type="button"
            onClick={() => setSelectedReport('box_engineering')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedReport === 'box_engineering'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            هندسة وهوامش البوكسات
          </button>

          <button
            type="button"
            onClick={() => setSelectedReport('price_list')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedReport === 'price_list'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            قائمة الأسعار المعتمدة
          </button>

          <button
            type="button"
            onClick={() => setSelectedReport('sales_collections')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedReport === 'sales_collections'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            المبيعات والتحصيل
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
            title="تصدير ملف إكسل CSV"
          >
            <Download className="w-4 h-4" />
            تصدير CSV
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
          >
            <Printer className="w-4 h-4" />
            طباعة A4
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 print-page print:border-none print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-white pb-6 mb-6">
          <div className="text-right">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              منظومة أغنام الوادي
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              محرك التسعير وهندسة البوكسات • السجل التجاري: {settings.commercialRegister || '1010892019'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              الرقم الضريبي ZATCA: {settings.vatNumber || '310928472900003'}
            </p>
          </div>

          <div className="text-left">
            <div className="text-base font-extrabold text-blue-700 dark:text-blue-400">
              {selectedReport === 'catalog_margins' && 'تقرير ربحية ومصفوفة الكتالوج'}
              {selectedReport === 'box_engineering' && 'تقرير هندسة وتكاليف البوكسات'}
              {selectedReport === 'price_list' && 'قائمة الأسعار المعتمدة للبيع'}
              {selectedReport === 'sales_collections' && 'تقرير مبيعات وتحصيل الطلبات'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              العملة: ر.س شامل الضريبة (15%)
            </div>
          </div>
        </div>

        {/* Report Content Table */}
        <div className="overflow-x-auto">
          {selectedReport === 'catalog_margins' && (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold border-y border-slate-300 dark:border-slate-700">
                <tr>
                  <th className="p-2.5">النوع</th>
                  <th className="p-2.5">الكود</th>
                  <th className="p-2.5">اسم الصنف</th>
                  <th className="p-2.5">التصنيف</th>
                  <th className="p-2.5">التكلفة الصافية</th>
                  <th className="p-2.5">سعر البيع</th>
                  <th className="p-2.5">صافي الربح</th>
                  <th className="p-2.5">الهامش %</th>
                  <th className="p-2.5">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {boxComps.map((b) => (
                  <tr key={b.item.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-600">بوكس</td>
                    <td className="p-2.5 font-mono">{b.item.code}</td>
                    <td className="p-2.5 font-bold">{b.item.name}</td>
                    <td className="p-2.5 text-slate-500">{b.item.category}</td>
                    <td className="p-2.5 font-mono">{formatSAR(b.comp.totalCostNet)}</td>
                    <td className="p-2.5 font-mono font-bold">{formatSAR(b.item.sellingPriceGross)}</td>
                    <td className="p-2.5 font-mono text-emerald-600 font-bold">{formatSAR(b.comp.netProfit)}</td>
                    <td className="p-2.5 font-mono font-extrabold">{formatPercent(b.comp.profitMargin)}</td>
                    <td className="p-2.5">{b.comp.tier}</td>
                  </tr>
                ))}
                {rawComps.map((r) => (
                  <tr key={r.item.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-500">مادة خام</td>
                    <td className="p-2.5 font-mono">{r.item.code}</td>
                    <td className="p-2.5 font-bold">{r.item.name}</td>
                    <td className="p-2.5 text-slate-500">{r.item.category}</td>
                    <td className="p-2.5 font-mono">{formatSAR(r.comp.usableKgCost)}</td>
                    <td className="p-2.5 font-mono font-bold">{formatSAR(r.item.sellingPriceGross)}</td>
                    <td className="p-2.5 font-mono text-emerald-600 font-bold">{formatSAR(r.comp.netProfit)}</td>
                    <td className="p-2.5 font-mono font-extrabold">{formatPercent(r.comp.profitMargin)}</td>
                    <td className="p-2.5">{r.comp.tier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'box_engineering' && (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold border-y border-slate-300 dark:border-slate-700">
                <tr>
                  <th className="p-2.5">الكود</th>
                  <th className="p-2.5">اسم البوكس</th>
                  <th className="p-2.5">المكونات</th>
                  <th className="p-2.5">الصحون</th>
                  <th className="p-2.5">الوزن التقديري</th>
                  <th className="p-2.5">التكلفة الصافية</th>
                  <th className="p-2.5">سعر البيع</th>
                  <th className="p-2.5">صافي الربح</th>
                  <th className="p-2.5">الهامش %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {boxComps.map((b) => (
                  <tr key={b.item.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono">{b.item.code}</td>
                    <td className="p-2.5 font-bold">{b.item.name}</td>
                    <td className="p-2.5">{b.item.ingredients.length} أصناف</td>
                    <td className="p-2.5">{b.item.numberOfDishes} صحن</td>
                    <td className="p-2.5 font-mono">{b.comp.costBreakdown.totalWeightKg.toFixed(2)} كجم</td>
                    <td className="p-2.5 font-mono">{formatSAR(b.comp.totalCostNet)}</td>
                    <td className="p-2.5 font-mono font-bold">{formatSAR(b.item.sellingPriceGross)}</td>
                    <td className="p-2.5 font-mono font-bold text-emerald-600">{formatSAR(b.comp.netProfit)}</td>
                    <td className="p-2.5 font-mono font-extrabold">{formatPercent(b.comp.profitMargin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'price_list' && (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold border-y border-slate-300 dark:border-slate-700">
                <tr>
                  <th className="p-3">النوع</th>
                  <th className="p-3">كود الصنف</th>
                  <th className="p-3">اسم المنتج</th>
                  <th className="p-3">التصنيف</th>
                  <th className="p-3">السعر شامل الضريبة (15%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {boxItems.filter((i) => !i.archived).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-blue-600">بوكس لحوم</td>
                    <td className="p-3 font-mono">{b.code}</td>
                    <td className="p-3 font-bold text-sm">{b.name}</td>
                    <td className="p-3 text-slate-500">{b.category}</td>
                    <td className="p-3 font-mono font-extrabold text-sm">{formatSAR(b.sellingPriceGross)}</td>
                  </tr>
                ))}
                {rawItems.filter((i) => !i.archived).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-500">صنف خام</td>
                    <td className="p-3 font-mono">{r.code}</td>
                    <td className="p-3 font-bold text-sm">{r.name}</td>
                    <td className="p-3 text-slate-500">{r.category}</td>
                    <td className="p-3 font-mono font-extrabold text-sm">{formatSAR(r.sellingPriceGross)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'sales_collections' && (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold border-y border-slate-300 dark:border-slate-700">
                <tr>
                  <th className="p-2.5">رقم الطلب</th>
                  <th className="p-2.5">التاريخ</th>
                  <th className="p-2.5">العميل</th>
                  <th className="p-2.5">طريقة الدفع</th>
                  <th className="p-2.5">إجمالي الفاتورة</th>
                  <th className="p-2.5">المسدد</th>
                  <th className="p-2.5">المتبقي</th>
                  <th className="p-2.5">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-bold">{o.orderNumber}</td>
                    <td className="p-2.5">{formatDateAr(o.orderDate)}</td>
                    <td className="p-2.5 font-semibold">{o.customerName}</td>
                    <td className="p-2.5">{o.paymentMethod}</td>
                    <td className="p-2.5 font-mono font-bold">{formatSAR(o.totalAmount)}</td>
                    <td className="p-2.5 font-mono text-emerald-600">{formatSAR(o.paidAmount)}</td>
                    <td className="p-2.5 font-mono text-amber-600">{formatSAR(o.remainingAmount)}</td>
                    <td className="p-2.5">{o.paymentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Printable Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>منظومة أغنام الوادي v19.10 JEV Green Hybrid</span>
          <span>صفحة 1 من 1</span>
          <span>توقيع وختم الإدارة: ________________</span>
        </div>
      </div>
    </div>
  );
};
