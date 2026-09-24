import React, { useMemo } from 'react';
import {
  TrendingUp,
  Users,
  Award,
  AlertTriangle,
  MapPin,
  Flame,
  Zap,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { Customer, Order } from '../types/commerce';
import { BoxItem } from '../types/pricing';
import { formatSAR, formatPercent } from '../utils/formatters';

interface CustomerDemandIntelligenceViewProps {
  customers: Customer[];
  orders: Order[];
  boxItems: BoxItem[];
}

export const CustomerDemandIntelligenceView: React.FC<CustomerDemandIntelligenceViewProps> = ({
  customers,
  orders,
  boxItems,
}) => {
  // RFM Segment Breakdown
  const rfmSegments = useMemo(() => {
    const vip = customers.filter((c) => c.rfmSegment === 'VIP');
    const regular = customers.filter((c) => c.rfmSegment === 'Loyal' || c.rfmSegment === 'Promising');
    const atRisk = customers.filter((c) => c.rfmSegment === 'At Risk' || c.rfmSegment === 'Lost');
    const newCust = customers.filter((c) => c.rfmSegment === 'New');

    return [
      {
        name: 'عملاء النخبة VIP',
        count: vip.length,
        sharePct: customers.length > 0 ? (vip.length / customers.length) * 100 : 0,
        totalSpent: vip.reduce((sum, c) => sum + (c.totalSpend || 0), 0),
        avgTicket: vip.length > 0 ? vip.reduce((sum, c) => sum + c.averageOrderValue, 0) / vip.length : 0,
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
        advice: 'حساسية منخفضة للأسعار، يفضلون الجودة العالية والتغليف الفاخر والتوصيل السريع.',
      },
      {
        name: 'العملاء المنتظمين',
        count: regular.length,
        sharePct: customers.length > 0 ? (regular.length / customers.length) * 100 : 0,
        totalSpent: regular.reduce((sum, c) => sum + (c.totalSpend || 0), 0),
        avgTicket: regular.length > 0 ? regular.reduce((sum, c) => sum + c.averageOrderValue, 0) / regular.length : 0,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
        advice: 'العمود الفقري للإيرادات المستمرة، حساسيتهم معتدلة، ينصح ببرامج ولاء وبوكسات عائلية.',
      },
      {
        name: 'عملاء مهددون بالفقد (At-Risk)',
        count: atRisk.length,
        sharePct: customers.length > 0 ? (atRisk.length / customers.length) * 100 : 0,
        totalSpent: atRisk.reduce((sum, c) => sum + (c.totalSpend || 0), 0),
        avgTicket: atRisk.length > 0 ? atRisk.reduce((sum, c) => sum + c.averageOrderValue, 0) / atRisk.length : 0,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
        advice: 'لم يطلبوا خلال آخر 45 يوماً، إرسال رسائل تذكير أو كوبون توصيل مجاني لتنشيط الطلب.',
      },
      {
        name: 'العملاء الجدد',
        count: newCust.length,
        sharePct: customers.length > 0 ? (newCust.length / customers.length) * 100 : 0,
        totalSpent: newCust.reduce((sum, c) => sum + (c.totalSpend || 0), 0),
        avgTicket: newCust.length > 0 ? newCust.reduce((sum, c) => sum + c.averageOrderValue, 0) / newCust.length : 0,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
        advice: 'أول تجربة شراء، متابعة رضا العميل وتقديم توصيات بالبوكسات الأكثر طلباً.',
      },
    ];
  }, [customers]);

  // Regional Distribution
  const cityDistribution = useMemo(() => {
    const map = new Map<string, { count: number; totalSales: number }>();
    for (const c of customers) {
      const city = c.city || 'أخرى';
      const existing = map.get(city) || { count: 0, totalSales: 0 };
      map.set(city, {
        count: existing.count + 1,
        totalSales: existing.totalSales + (c.totalSpend || 0),
      });
    }
    return Array.from(map.entries()).map(([city, data]) => ({
      city,
      count: data.count,
      totalSales: data.totalSales,
    }));
  }, [customers]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            ذكاء العملاء وتوقعات حجم الطلب
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            تحليل RFM لسلوك العملاء، حساسية الأسعار، وتأثير تغير السعر على معدل الاحتفاظ والطلب
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-left">
            <div className="text-xs text-slate-400">إجمالي قيمة قاعدة العملاء</div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {formatSAR(customers.reduce((acc, c) => acc + (c.totalSpend || 0), 0))}
            </div>
          </div>
        </div>
      </div>

      {/* RFM Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rfmSegments.map((seg, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border ${seg.bg} flex flex-col justify-between space-y-4`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black ${seg.color}`}>{seg.name}</span>
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80">
                  {seg.count} عملاء ({seg.sharePct.toFixed(0)}%)
                </span>
              </div>

              <div className="mt-3">
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {formatSAR(seg.totalSpent)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  متوسط السلة: {formatSAR(seg.avgTicket)}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pt-3 border-t border-black/5 dark:border-white/10">
              {seg.advice}
            </p>
          </div>
        ))}
      </div>

      {/* Price Elasticity & Regional Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Elasticity Insights */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            تحليل مرونة الطلب السعرية للبوكسات
          </h4>
          <p className="text-xs text-slate-500">
            تصنيف المنتجات حسب استجابة العملاء لتعديل السعر لضمان عدم تأثر حجم المبيعات الإجمالي
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div>
                <div className="font-bold text-emerald-900 dark:text-emerald-200">
                  بوكسات غير حساسة للسعر (Inelastic)
                </div>
                <div className="text-emerald-700 dark:text-emerald-300 text-[11px] mt-0.5">
                  مثل: بوكس النعيمي البلدي الفاخر وبوكس نصف الحري الملكي. العملاء يبحثون عن الجودة
                  والذوق الرفيع. يمكن رفع السعر بنسبة 5% دون فقد ملحوظ في الطلب.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
              <div>
                <div className="font-bold text-amber-900 dark:text-amber-200">
                  بوكسات متوسطة الحساسية (Unit Elastic)
                </div>
                <div className="text-amber-700 dark:text-amber-300 text-[11px] mt-0.5">
                  مثل: بوكس المشاوي المشكل وبوكس اللحم المفروم. يقارن العميل الأسعار مع محلات الجزارة
                  المحلية. يوصى بتقديم قيمة مضافة (توابل أو تتبيلة مجانية) عند تعديل السعر.
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
              <div>
                <div className="font-bold text-rose-900 dark:text-rose-200">
                  بوكسات عالية الحساسية للسعر (High Elasticity)
                </div>
                <div className="text-rose-700 dark:text-rose-300 text-[11px] mt-0.5">
                  مثل: بوكس الشوربة والمقلقل الاقتصادي. أي رفع في السعر يتسبب في انخفاض مباشر بنسبة
                  15% في حجم المبيعات. الأفضل الحفاظ على السعر والتحكم في تكلفة التغليف والهدر.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            التوزيع الجغرافي للمبيعات وحجم الطلب
          </h4>
          <p className="text-xs text-slate-500">
            تركيز العملاء ومجموع الإيرادات حسب المدن والمناطق
          </p>

          <div className="space-y-2 text-xs">
            {cityDistribution.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-900 dark:text-white">{item.city}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">{item.count} عملاء</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatSAR(item.totalSales)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
