import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Plus,
  Activity,
  Boxes,
  Download,
  FileArchive,
  FileCode,
  Check,
  ChevronDown,
} from 'lucide-react';
import { ViewId } from './Sidebar';
import { exportEntireCodeAsJson, exportEntireCodeAsZip } from '../utils/codeExporter';

interface TopbarProps {
  currentView: ViewId;
  onOpenMobileSidebar: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  navMode: 'standard' | 'advanced';
  onToggleNavMode: (mode: 'standard' | 'advanced') => void;
  onQuickAction: (action: 'add_raw' | 'build_box' | 'print_report' | 'open_health') => void;
  healthCriticalCount?: number;
}

const VIEW_TITLES: Record<ViewId, { title: string; subtitle: string }> = {
  dashboard: { title: 'لوحة العمل التنفيذية', subtitle: 'نظرة شمولية على هوامش الربحية، تنبيهات التكلفة، وأداء المبيعات' },
  catalog: { title: 'سجل الأسعار والكتالوج', subtitle: 'إدارة المواد الخام، البوكسات، أسعار الشراء، الهدر، وضريبة القيمة المضافة' },
  box_builder: { title: 'بناء وهندسة البوكسات', subtitle: 'تركيب البوكسات، البوكسات المتداخلة، تكلفة الصحون، والمصروفات' },
  orders: { title: 'الطلبات والتحصيل التجاري', subtitle: 'إدارة الفواتير، طرق الدفع (مدى، آبل باي، تابي)، والتحصيل' },
  customers: { title: 'السوق وقاعدة العملاء 360', subtitle: 'تحليل سلوك الشراء، المناطق، والعملاء الأكثر قيمة' },
  approvals: { title: 'مذكرات اعتماد تعديل الأسعار', subtitle: 'إدارة دورة حوكمة الأسعار (مسودة، مراجعة، اعتماد، أرشيف)' },
  customer_intelligence: { title: 'ذكاء العملاء والطلب', subtitle: 'تقسيم RFM، تكرار الشراء، وتأثير تغير الأسعار على العملاء' },
  order_economics: { title: 'اقتصاديات الطلب الفعلي', subtitle: 'احتساب الهامش الحقيقي بعد رسوم الدفع والشحن والتشغيل' },
  simulator: { title: 'محاكي ومحدد الأسعار السريع', subtitle: 'اختبار فوري لتأثير تعديل السعر أو الوصول للهامش المستهدف' },
  reports: { title: 'مركز التقارير القياسية والمطبوعة', subtitle: 'توليد تقارير مالية وتحليلية جاهزة للطباعة بصيغة A4' },
  archive: { title: 'الأرشيف وسجل التدقيق Audit Log', subtitle: 'سجل كامل لكل تعديل في الأسعار أو التكاليف أو المذكرات' },
  costs: { title: 'التكاليف والمصروفات المشتركة', subtitle: 'إدارة أسعار الشراء، نسب الهدر، ومصروفات التجهيز والتوصيل' },
  box_analyzer: { title: 'تحليل مكونات وحساسية البوكس', subtitle: 'مخطط تفكيك التكلفة واختبار حساسية ربحية البوكس للمكونات' },
  compare: { title: 'المقارنة التحليلية للبوكسات', subtitle: 'مقارنة مباشرة بين عدة بوكسات من حيث الهامش والوزن والتكلفة' },
  reconciliation: { title: 'مطابقة المبيعات بالكتالوج', subtitle: 'تنظيف النصوص والربط الذكي لنصوص الفواتير بمنتجات النظام' },
  settings_data: { title: 'إعدادات المنشأة ومركز البيانات', subtitle: 'بيانات الشركة، ضريبة القيمة المضافة، النسخ الاحتياطي، والاستيراد' },
  sales_intelligence: { title: 'ذكاء المبيعات وتحليل السلة', subtitle: 'تحليل باريتو ABC، المنتجات المكملة، وتوقع الاتجاه' },
  yield_lab: { title: 'مختبر الجزارة والتصافي', subtitle: 'تجارب التشفية، معامل التكلفة CF، ومخرجات الذبيحة' },
  financial_engineering: { title: 'الهندسة المالية وصدمات التكلفة', subtitle: 'مقارنة هوامش الإجمالي والصافي ومصفوفة الصدمات' },
  governance: { title: 'الحوكمة وفصل الصلاحيات', subtitle: 'نموذج الجاهزية المؤسسية والربط مع الفوترة الإلكترونية ZATCA' },
  nrv: { title: 'تفكيك الذبيحة والقيمة الصافية NRV', subtitle: 'توزيع التكلفة المشتركة للذبيحة حسب القيمة البيعية للمخرجات' },
  risk_lab: { title: 'مختبر المخاطر وجسر الربحية', subtitle: 'شلال جسر الأرباح وتحليل الحساسية لمواجهة تقلبات السوق' },
  decisions: { title: 'مركز القرار التجاري التفاعلي', subtitle: 'توصيات ذكية قابلة للتنفيذ البشري لحماية الهوامش' },
  capabilities: { title: 'مركز قدرات JEV Green Hybrid', subtitle: 'سجل القدرات، المهارات، والأدوات المصرح بها' },
  health: { title: 'صحة النظام والاستثناءات', subtitle: 'فحص فوري للبيانات، مساحة التخزين، وأخطاء الربط' },
};

export const Topbar: React.FC<TopbarProps> = ({
  currentView,
  onOpenMobileSidebar,
  theme,
  onToggleTheme,
  navMode,
  onToggleNavMode,
  onQuickAction,
  healthCriticalCount = 0,
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportZip = async () => {
    try {
      setIsExporting(true);
      await exportEntireCodeAsZip(true);
      setExportSuccess('ZIP');
      setTimeout(() => setExportSuccess(null), 3000);
      setIsExportOpen(false);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تصدير الملف المضغوط');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    try {
      setIsExporting(true);
      exportEntireCodeAsJson(true);
      setExportSuccess('JSON');
      setTimeout(() => setExportSuccess(null), 3000);
      setIsExportOpen(false);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تصدير ملف JSON');
    } finally {
      setIsExporting(false);
    }
  };

  const current = VIEW_TITLES[currentView] || {
    title: 'منظومة أغنام الوادي',
    subtitle: 'نظام إدارة وهوامش التسعير',
  };

  return (
    <header
      id="app-topbar"
      className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between gap-4"
    >
      {/* Right side: Mobile toggle & View title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="فتح القائمة الرئيسية"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
            {current.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Left side: Quick actions & controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Export Code Dropdown */}
        <div className="relative" ref={exportRef}>
          <button
            type="button"
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-xs"
            title="تصدير كامل كود المنظومة (JSON / ZIP)"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">تصدير الكود</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isExportOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xl shadow-slate-900/10 dark:shadow-black/40 z-50 animate-in fade-in zoom-in-95 duration-150 text-right">
              <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                تصدير سورس كود المنظومة
              </div>

              <button
                type="button"
                onClick={handleExportZip}
                disabled={isExporting}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileArchive className="w-4 h-4 text-amber-500" />
                  <span>كامل الكود مضغوط (.ZIP)</span>
                </div>
                {exportSuccess === 'ZIP' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">مضغوط</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleExportJson}
                disabled={isExporting}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors mt-0.5"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-500" />
                  <span>كامل الكود جيسون (.JSON)</span>
                </div>
                {exportSuccess === 'JSON' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">هيكلي</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Quick action: Build box */}
        <button
          type="button"
          onClick={() => onQuickAction('build_box')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-colors"
        >
          <Boxes className="w-3.5 h-3.5" />
          بناء بوكس
        </button>

        {/* Quick action: Add Raw */}
        <button
          type="button"
          onClick={() => onQuickAction('add_raw')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          صنف جديد
        </button>

        {/* Health status indicator */}
        <button
          type="button"
          onClick={() => onQuickAction('open_health')}
          title="فحص صحة النظام"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            healthCriticalCount > 0
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 animate-pulse'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">الصحة</span>
          {healthCriticalCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={theme === 'dark' ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
          title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
};
