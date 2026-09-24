import React, { useState, useMemo } from 'react';
import {
  Receipt,
  DollarSign,
  TrendingUp,
  CreditCard,
  Truck,
  Package,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  HelpCircle,
} from 'lucide-react';
import { Order } from '../types/commerce';
import { BoxItem, RawItem } from '../types/pricing';
import { AppSettings } from '../types/settings';
import { formatSAR, formatPercent } from '../utils/formatters';

interface OrderEconomicsViewProps {
  orders: Order[];
  boxItems: BoxItem[];
  rawItems: RawItem[];
  settings: AppSettings;
}

export const OrderEconomicsView: React.FC<OrderEconomicsViewProps> = ({
  orders,
  boxItems,
  rawItems,
  settings,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');

  // Payment gateway fee rates
  const GATEWAY_FEES: Record<string, { pct: number; fixed: number }> = {
    mada: { pct: 0.01, fixed: 1.0 },
    apple_pay: { pct: 0.018, fixed: 1.0 },
    visa_master: { pct: 0.025, fixed: 1.0 },
    tabby: { pct: 0.065, fixed: 1.5 },
    tamara: { pct: 0.065, fixed: 1.5 },
    cod: { pct: 0.0, fixed: 12.0 }, // رسوم التحصيل عند الاستلام
    bank_transfer: { pct: 0.0, fixed: 0.0 },
  };

  const selectedOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedOrderId) || orders[0];
  }, [orders, selectedOrderId]);

  // Compute detailed economics for selected order
  const economics = useMemo(() => {
    if (!selectedOrder) return null;

    const gatewayConfig = GATEWAY_FEES[selectedOrder.paymentMethod] || { pct: 0.01, fixed: 1.0 };
    const gatewayFee = selectedOrder.totalAmount * gatewayConfig.pct + gatewayConfig.fixed;

    // Estimate COGS from catalog
    let cogsNet = 0;
    for (const item of selectedOrder.items) {
      const catId = item.productId;
      const box = catId ? boxItems.find((b) => b.id === catId) : undefined;
      if (box) {
        cogsNet += (box.sellingPriceGross / 1.15) * 0.75 * item.quantity;
      } else {
        const raw = catId ? rawItems.find((r) => r.id === catId) : undefined;
        if (raw) {
          cogsNet += ((raw.purchasePriceGross / 1.15) * (1 + raw.wastePercent)) * item.quantity;
        } else {
          cogsNet += (item.unitPrice / 1.15) * 0.8 * item.quantity;
        }
      }
    }

    const actualDeliveryCost = 35; // تكلفة شركة الشحن المبرد
    const shippingCharged = selectedOrder.shippingFee || 0;
    const deliverySubsidy = Math.max(0, actualDeliveryCost - shippingCharged); // دعم التوصيل
    const packagingCost = 15; // ثلج جاف، كرتون حافظ، فاكيوم

    const netOrderRevenue = selectedOrder.totalAmount / (1 + settings.defaultVatRate);
    const totalOrderCosts = cogsNet + gatewayFee + packagingCost + deliverySubsidy;
    const netOrderContribution = netOrderRevenue - totalOrderCosts;
    const contributionMargin = netOrderRevenue > 0 ? netOrderContribution / netOrderRevenue : 0;

    return {
      totalGross: selectedOrder.totalAmount,
      netRevenue: netOrderRevenue,
      cogsNet,
      gatewayFee,
      actualDeliveryCost,
      deliveryFeeCharged: shippingCharged,
      deliverySubsidy,
      packagingCost,
      totalOrderCosts,
      netOrderContribution,
      contributionMargin,
      isProfitable: netOrderContribution > 0,
    };
  }, [selectedOrder, boxItems, rawItems, settings]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Selector */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              اقتصاديات ومساهمة الطلب الفعلي (Order Unit Economics)
            </h3>
            <p className="text-xs text-slate-500">
              احتساب الربح الحقيقي بعد خصم عمولة الدفع، دعم التوصيل، والتجهيز
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <label className="text-xs font-bold text-slate-500">اختر طلباً للفحص:</label>
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} - {o.customerName} ({formatSAR(o.totalAmount)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {economics && selectedOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Waterfall Economics Breakdown */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  شلال مساهمة الطلب: {selectedOrder.orderNumber}
                </h4>
                <div className="text-xs text-slate-400 mt-0.5">
                  العميل: {selectedOrder.customerName} • بوابة الدفع: {selectedOrder.paymentMethod}
                </div>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  economics.isProfitable
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                {economics.isProfitable ? 'طلب رابح ومساهم' : 'طلب خاسر بعد المصاريف'}
              </span>
            </div>

            {/* Waterfall lines */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  إجمالي قيمة الفاتورة المحصلة من العميل:
                </span>
                <span className="font-mono font-extrabold text-sm">{formatSAR(economics.totalGross)}</span>
              </div>

              <div className="flex justify-between items-center p-2.5 pr-4 text-slate-600 dark:text-slate-400">
                <span>- ضريبة القيمة المضافة (15%):</span>
                <span className="font-mono text-rose-500">
                  -{formatSAR(economics.totalGross - economics.netRevenue)}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 pr-4 text-slate-600 dark:text-slate-400">
                <span>- تكلفة البضاعة المباعة Net COGS:</span>
                <span className="font-mono text-rose-500">-{formatSAR(economics.cogsNet)}</span>
              </div>

              <div className="flex justify-between items-center p-2.5 pr-4 text-slate-600 dark:text-slate-400">
                <span>
                  - عمولة بوابة الدفع ({selectedOrder.paymentMethod}):
                </span>
                <span className="font-mono text-rose-500">-{formatSAR(economics.gatewayFee)}</span>
              </div>

              <div className="flex justify-between items-center p-2.5 pr-4 text-slate-600 dark:text-slate-400">
                <span>- تكاليف التغليف والثلج الجاف والشحن الحافظ:</span>
                <span className="font-mono text-rose-500">-{formatSAR(economics.packagingCost)}</span>
              </div>

              {economics.deliverySubsidy > 0 && (
                <div className="flex justify-between items-center p-2.5 pr-4 text-amber-600">
                  <span>- دعم التوصيل المجاني/المخفض:</span>
                  <span className="font-mono font-bold">-{formatSAR(economics.deliverySubsidy)}</span>
                </div>
              )}

              <div className="flex justify-between items-center p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-700">
                <div>
                  <span className="text-sm font-black text-slate-900 dark:text-white block">
                    صافي المساهمة النقدية للطلب (Net Contribution):
                  </span>
                  <span className="text-[11px] text-slate-400">
                    هامش المساهمة الفعلي:{' '}
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formatPercent(economics.contributionMargin)}
                    </span>
                  </span>
                </div>
                <span
                  className={`font-mono text-xl font-black ${
                    economics.netOrderContribution > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {formatSAR(economics.netOrderContribution)}
                </span>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Key Insights & Recommendations */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-600" />
                تحليل هوامش بوابات الدفع
              </h4>
              <p className="text-xs text-slate-500">
                مقارنة رسوم بوابات الدفع وتأثيرها المباشر على الأرباح الصافية
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                  <span className="font-bold">مدى Mada</span>
                  <span className="font-mono text-emerald-600 font-bold">1% + 1 ر.س (الأوفر)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                  <span className="font-bold">Apple Pay</span>
                  <span className="font-mono text-blue-600 font-bold">1.8% + 1 ر.س</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                  <span className="font-bold">فيزا / ماستركارد</span>
                  <span className="font-mono text-amber-600 font-bold">2.5% + 1 ر.س</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                  <span className="font-bold">تابي / تمارا (BNPL)</span>
                  <span className="font-mono text-rose-600 font-bold">6.5% + 1.5 ر.س (الأعلى)</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                <strong>توصية تسعيرية:</strong> الطلبات المسددة عبر تابي/تمارا تستقطع ~7% من قيمة
                الطلب. في البوكسات ذات الهوامش المنخفضة (أقل من 15%)، يتسبب ذلك في محو الربح! يوصى
                بتطبيق حد أدنى لقيمة السلة لأقساط تابي.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
