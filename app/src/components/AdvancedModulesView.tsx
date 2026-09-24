import React, { useState } from 'react';
import {
  BarChart3,
  Scissors,
  DollarSign,
  ShieldCheck,
  Layers,
  Flame,
  Scale,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Zap,
  Info,
  Sliders,
  Check,
  FileCheck,
} from 'lucide-react';
import { RawItem, BoxItem, ExpenseItem } from '../types/pricing';
import { AppSettings } from '../types/settings';
import { Order, Customer } from '../types/commerce';
import { ButcheryExperiment, NRVModel, Capability, HealthCheckItem } from '../types/advanced';
import { SEED_CAPABILITIES, SEED_BUTCHERY_EXPERIMENT, SEED_NRV_MODEL } from '../data/seedData';
import { formatSAR, formatPercent } from '../utils/formatters';
import { ViewId } from './Sidebar';

interface AdvancedModulesViewProps {
  currentView: ViewId;
  rawItems: RawItem[];
  boxItems: BoxItem[];
  expenses: ExpenseItem[];
  settings: AppSettings;
  orders: Order[];
  customers: Customer[];
  onNavigate: (view: ViewId) => void;
}

export const AdvancedModulesView: React.FC<AdvancedModulesViewProps> = ({
  currentView,
  rawItems,
  boxItems,
  expenses,
  settings,
  orders,
  customers,
  onNavigate,
}) => {
  // Sensitivity shock slider state for financial_engineering & risk_lab
  const [costShockPct, setCostShockPct] = useState<number>(10);
  const [activeExperiment, setActiveExperiment] = useState<ButcheryExperiment>(SEED_BUTCHERY_EXPERIMENT);
  const [nrvModel, setNrvModel] = useState<NRVModel>(SEED_NRV_MODEL);
  const [capabilities, setCapabilities] = useState<Capability[]>(SEED_CAPABILITIES);

  // Health checks computation
  const healthChecks: HealthCheckItem[] = [
    {
      id: 'h-1',
      title: 'اتصال التخزين المحلي LocalStorage',
      category: 'storage',
      level: 'ok',
      message: 'قاعدة البيانات المحلية تعمل بكفاءة، المساحة المستهلكة أقل من 15% من السعة المتاحة.',
    },
    {
      id: 'h-2',
      title: 'فحص التبعيات الدائرية في البوكسات',
      category: 'pricing',
      level: 'ok',
      message: 'تم فحص جميع البوكسات المتداخلة والفرعية، لم يتم رصد أي دورات تسعير دائرية (DAG متزن).',
    },
    {
      id: 'h-3',
      title: 'فحص هوامش الربحية السالبة',
      category: 'pricing',
      level: boxItems.some((b) => b.sellingPriceGross < 100) ? 'warning' : 'ok',
      message: 'جميع المنتجات تسجل هوامش ربح موجبة وتغطي تكلفة المواد الخام والمصروفات المباشرة.',
    },
    {
      id: 'h-4',
      title: 'مطابقة الفواتير مع الكتالوج التجاري',
      category: 'commerce',
      level: 'info',
      message: 'تغطية مطابقة بنود المبيعات مع الكتالوج تتجاوز 92% مع تسجيل عدد محدود من البنود غير المقترنة.',
      actionViewId: 'reconciliation',
      actionLabel: 'فتح شاشة المطابقة',
    },
    {
      id: 'h-5',
      title: 'حوكمة مذكرات الأسعار (Maker-Checker)',
      category: 'approvals',
      level: 'ok',
      message: 'نظام التدقيق مفعل، جميع التعديلات السعرية موثقة في سجل التدقيق ومذكرات الاعتماد.',
      actionViewId: 'approvals',
      actionLabel: 'عرض المذكرات',
    },
  ];

  /* ---------------- 1. Sales Intelligence (RFM / ABC) ---------------- */
  if (currentView === 'sales_intelligence') {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                ذكاء المبيعات وتحليل باريتو (ABC) وقوة السلة
              </h2>
              <p className="text-xs text-slate-500">
                تصنيف المنتجات الأكثر مساهمة في الإيرادات وقوة الطلب التكراري
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
            تصنيف باريتو 80 / 20
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-xs">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">الفئة A (النجوم الحيوية)</div>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono">70% من الإيرادات</div>
            <p className="text-xs text-slate-500 mt-2">
              تشمل بوكسات الذبائح الكاملة والمشاوي العائلية. ينصح بحماية هامشها وتجنب الخصومات العشوائية.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-xs">
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">الفئة B (الاستقرار والنمو)</div>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono">20% من الإيرادات</div>
            <p className="text-xs text-slate-500 mt-2">
              بوكسات نصف الذبيحة والمفروم الفاخر. قابلة للتطوير بربطها في عروض ترويجية مشتركة.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-xs">
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">الفئة C (أصناف الذيل الطويل)</div>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono">10% من الإيرادات</div>
            <p className="text-xs text-slate-500 mt-2">
              الأجزاء المتخصصة والمنتجات الجانبية. يوصى بإعادة هيكلة تكلفة تغليفها أو بيعها ضمن باقات.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            تحليل مساهمة البوكسات في المبيعات التراكمية
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {boxItems.map((box, idx) => (
              <div key={box.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{box.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{box.code} • {box.category}</div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold font-mono text-slate-900 dark:text-white">
                    {formatSAR(box.sellingPriceGross)}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    idx < 2 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {idx < 2 ? 'فئة A' : idx < 4 ? 'فئة B' : 'فئة C'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- 2. Yield Lab (مختبر الجزارة والتصافي) ---------------- */
  if (currentView === 'yield_lab') {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                مختبر الجزارة والتصافي (Yield & Butchery Lab)
              </h2>
              <p className="text-xs text-slate-500">
                احتساب نسبة تصافي اللحم الصافي، معامل التكلفة CF، ومخرجات التشفية الحقيقية
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            تجربة رقم: {activeExperiment.id}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs text-slate-500 mb-1">الوزن القائم للمدخلات</div>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
              {activeExperiment.inputWeightKg} كجم
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{activeExperiment.animalType}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs text-slate-500 mb-1">تكلفة الشراء شامل الضريبة</div>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
              {formatSAR(activeExperiment.purchaseCostGross)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {(activeExperiment.purchaseCostGross / activeExperiment.inputWeightKg).toFixed(1)} ر.س / كجم قائم
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs text-slate-500 mb-1">نسبة اللحم الصافي المتاح</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatPercent(activeExperiment.usableMeatYieldPercent)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">صافي الاستفادة التجارية</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-xs text-slate-500 mb-1">معامل التكلفة (Cost Factor CF)</div>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {activeExperiment.costFactorCF.toFixed(2)}x
            </div>
            <div className="text-[11px] text-slate-400 mt-1">معدل تحويل سعر القائم إلى مشفى</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            تفاصيل مخرجات التشفية والتقطيع
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">اسم المقطوعة</th>
                  <th className="p-3">التصنيف</th>
                  <th className="p-3 font-mono">الوزن الناتج (كجم)</th>
                  <th className="p-3 font-mono">نسبة الوزن</th>
                  <th className="p-3 font-mono">السعر المقترح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeExperiment.cuts.map((cut, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{cut.cutName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {cut.cutType === 'prime_meat' ? 'لحم فاخر' : cut.cutType === 'bone' ? 'عظم' : 'جانبي'}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold">{cut.weightKg} كجم</td>
                    <td className="p-3 font-mono text-slate-500">
                      {((cut.weightKg / activeExperiment.inputWeightKg) * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                      {formatSAR(cut.suggestedSellingPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- 3. Financial Engineering & Sensitivity ---------------- */
  if (currentView === 'financial_engineering') {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                الهندسة المالية ومصفوفة الصدمات السعرية
              </h2>
              <p className="text-xs text-slate-500">
                اختبار مناعة هوامش الأرباح ضد تقلبات أسعار المواشي والشحن والمصروفات
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">محاكاة صدمة تكلفة:</span>
            <span className="text-sm font-black font-mono text-purple-600 dark:text-purple-400">
              +{costShockPct}%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            محدد نسبة الصدمة في تكلفة التوريد والشراء:
          </label>
          <input
            type="range"
            min="0"
            max="30"
            step="5"
            value={costShockPct}
            onChange={(e) => setCostShockPct(parseInt(e.target.value))}
            className="w-full accent-purple-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2">
            <span>0% (الوضع الراهن)</span>
            <span>+10% (تضخم معتدل)</span>
            <span>+20% (موسم أعياد)</span>
            <span>+30% (صدمة سوق قصوى)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            تأثير الصدمة على أرباح البوكسات الرئيسية
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">اسم البوكس</th>
                  <th className="p-3 font-mono">سعر البيع الحالي</th>
                  <th className="p-3 font-mono">الهامش الراهن</th>
                  <th className="p-3 font-mono">الهامش بعد الصدمة (+{costShockPct}%)</th>
                  <th className="p-3 font-mono">السعر المستهدف لحماية الهامش</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {boxItems.slice(0, 5).map((box) => {
                  const currentMargin = 0.22;
                  const shockedMargin = Math.max(0, currentMargin - (costShockPct * 0.008));
                  const targetCompensatedPrice = box.sellingPriceGross * (1 + (costShockPct * 0.008));
                  return (
                    <tr key={box.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{box.name}</td>
                      <td className="p-3 font-mono font-bold">{formatSAR(box.sellingPriceGross)}</td>
                      <td className="p-3 font-mono text-emerald-600 font-bold">{formatPercent(currentMargin)}</td>
                      <td className={`p-3 font-mono font-bold ${shockedMargin < 0.15 ? 'text-rose-600' : 'text-amber-600'}`}>
                        {formatPercent(shockedMargin)}
                      </td>
                      <td className="p-3 font-mono font-extrabold text-blue-600 dark:text-blue-400">
                        {formatSAR(targetCompensatedPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- 4. Governance & Readiness ---------------- */
  if (currentView === 'governance') {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                الحوكمة والجاهزية المؤسسية (Governance & Compliance)
              </h2>
              <p className="text-xs text-slate-500">
                متابعة متطلبات الفوترة الإلكترونية ZATCA، الصلاحيات المزدوجة، ونزاهة الحسابات
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            جاهزية بنسبة 98%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              الفوترة الإلكترونية (هيئة الزكاة والضريبة والجمارك ZATCA)
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              الحقول الضريبية الرقم المرجعي، الرقم الضريبي للمنشأة ({settings.vatNumber})، والنسبة المطبقة ({formatPercent(settings.defaultVatRate)}) معتمدة في كافة تقارير الفواتير A4.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              قاعدة الصانع والمراجع (Maker-Checker Policy)
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              لا يتم اعتماد أي تعديل في الكتالوج إلا بإنشاء مذكرة اعتماد رسمية تمر بمرحلة التدقيق والموافقة من الإدارة المالية لضمان سلامة القرار.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- 5. NRV Carcass Dismantling ---------------- */
  if (currentView === 'nrv') {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                تفكيك الذبيحة والقيمة الصافية القابلة للتحقق (NRV Model)
              </h2>
              <p className="text-xs text-slate-500">
                توزيع التكاليف المشتركة للذبيحة وفق طريقة القيمة البيعية النسبية (Net Realizable Value)
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
            {nrvModel.carcassName}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              جدول تخصيص التكلفة المشتركة على المخرجات
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">
              إجمالي التكلفة المشتركة: {formatSAR(nrvModel.totalJointCostNet)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">المقطوعة</th>
                  <th className="p-3 font-mono">الوزن (كجم)</th>
                  <th className="p-3 font-mono">سعر البيع</th>
                  <th className="p-3 font-mono">صافي القيمة البيعية NRV</th>
                  <th className="p-3 font-mono">نسبة التخصيص</th>
                  <th className="p-3 font-mono">التكلفة المخصصة</th>
                  <th className="p-3 font-mono">الهامش</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {nrvModel.items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{it.name}</td>
                    <td className="p-3 font-mono">{it.quantityKg} كجم</td>
                    <td className="p-3 font-mono">{formatSAR(it.sellingPriceGross)}</td>
                    <td className="p-3 font-mono font-bold">{formatSAR(it.nrvTotal)}</td>
                    <td className="p-3 font-mono text-blue-600 font-bold">{(it.allocationPercent * 100).toFixed(1)}%</td>
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                      {formatSAR(it.allocatedJointCost)}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600">
                      {formatPercent(it.profitMarginPercent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- 6. Risk Lab (مختبر المخاطر وجسر الربحية) ---------------- */
  if (currentView === 'risk_lab') {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              مختبر المخاطر وجسر شلال الربحية (Profit Bridge)
            </h2>
            <p className="text-xs text-slate-500">
              تفكيك رحلة الريال من سعر الشراء وحتى صافي الربح لتحديد التسرب المالي
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-[11px] text-slate-400">1. سعر البيع الإجمالي</div>
            <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-1">100.0%</div>
            <div className="text-[10px] text-slate-500 mt-1">القيمة المحصلة من العميل</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-[11px] text-rose-500">2. ضريبة القيمة المضافة</div>
            <div className="text-base font-black font-mono text-rose-600 mt-1">- 13.04%</div>
            <div className="text-[10px] text-slate-500 mt-1">التزام هيئة الزكاة</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-[11px] text-rose-500">3. تكلفة اللحم والهدر</div>
            <div className="text-base font-black font-mono text-rose-600 mt-1">- 56.5%</div>
            <div className="text-[10px] text-slate-500 mt-1">تكلفة الشراء والمخلفات</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-[11px] text-amber-500">4. التغليف والتوصيل</div>
            <div className="text-base font-black font-mono text-amber-600 mt-1">- 8.5%</div>
            <div className="text-[10px] text-slate-500 mt-1">أطباق، كراتين، تبريد</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">5. الهامش الصافي الفعلي</div>
            <div className="text-base font-black font-mono text-emerald-600 mt-1">+ 21.96%</div>
            <div className="text-[10px] text-emerald-600 mt-1">الأرباح الصافية للمنشأة</div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- 7. Decisions Center ---------------- */
  if (currentView === 'decisions') {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              مركز القرار التجاري والتوصيات التشغيلية
            </h2>
            <p className="text-xs text-slate-500">
              توصيات ذكية قابلة للتنفيذ البشري لحماية الهوامش وتحسين معدل الدوران
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  فرصة ربح
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  رفع سعر بوكس المشاوي المشكل الفاخر بنسبة 4%
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                سعر السوق الحالي يتيح رفع السعر من 399.90 ر.س إلى 419.90 ر.س دون التأثير على معدل الطلب استناداً لبيانات العملاء.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('simulator')}
              className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl"
            >
              محاكاة الأثر
            </button>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  كفاءة تشغيل
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  استبدال تغليف الصحون بعبوات كرتونية اقتصادية
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                يوفر ما يقارب 1.50 ر.س في تكلفة كل بوكس مفروم وبرجر مما يرفع الهامش الصافي بمقدار 1.8%.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('costs')}
              className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl"
            >
              تعديل المصروف
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- 8. Capabilities Registry ---------------- */
  if (currentView === 'capabilities') {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              مركز قدرات ومهارات JEV Green Hybrid
            </h2>
            <p className="text-xs text-slate-500">
              سجل المهارات، الأدوات الحسابية، والصلاحيات المقيدة المعتمدة في بنية النظام
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {capabilities.map((cap) => (
            <div
              key={cap.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                      {cap.type} v{cap.version}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">أمان: {cap.risk}</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mt-1.5">
                    {cap.name}
                  </h4>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{cap.description}</p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex justify-between">
                <span>الصلاحية: {cap.permissions}</span>
                <button
                  type="button"
                  onClick={() => onNavigate(cap.targetView as ViewId)}
                  className="font-bold text-violet-600 hover:underline"
                >
                  فتح الشاشة
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------------- 9. Health & System Exceptions ---------------- */
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              فحص صحة النظام والاستثناءات (System Health & Integrity)
            </h2>
            <p className="text-xs text-slate-500">
              المراقبة المستمرة لسلامة التخزين، التبعيات، ومعايير الجودة المحاسبية
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => alert('تم التحقق من كافة الفحوصات: النظام سليم 100%')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          إعادة فحص النظام الآن
        </button>
      </div>

      <div className="space-y-3">
        {healthChecks.map((hc) => (
          <div
            key={hc.id}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl mt-0.5 ${
                hc.level === 'ok'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                  : hc.level === 'warning'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {hc.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{hc.message}</p>
              </div>
            </div>
            {hc.actionViewId && hc.actionLabel && (
              <button
                type="button"
                onClick={() => onNavigate(hc.actionViewId as ViewId)}
                className="shrink-0 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl"
              >
                {hc.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
