import React from 'react';
import {
  LayoutDashboard,
  Tags,
  Boxes,
  ShoppingCart,
  Users,
  CheckSquare,
  TrendingUp,
  Receipt,
  Calculator,
  FileText,
  Archive,
  CircleDollarSign,
  PieChart,
  GitCompare,
  FileSpreadsheet,
  Settings,
  Sparkles,
  BarChart3,
  Scissors,
  DollarSign,
  ShieldCheck,
  Layers,
  Flame,
  Scale,
  Cpu,
  Activity,
  ChevronLeft,
  X,
  Zap,
} from 'lucide-react';

export type ViewId =
  | 'dashboard'
  | 'catalog'
  | 'box_builder'
  | 'orders'
  | 'customers'
  | 'approvals'
  | 'customer_intelligence'
  | 'order_economics'
  | 'simulator'
  | 'reports'
  | 'archive'
  | 'costs'
  | 'box_analyzer'
  | 'compare'
  | 'reconciliation'
  | 'settings_data'
  | 'sales_intelligence'
  | 'yield_lab'
  | 'financial_engineering'
  | 'governance'
  | 'nrv'
  | 'risk_lab'
  | 'decisions'
  | 'capabilities'
  | 'health';

interface SidebarProps {
  currentView: ViewId;
  onSelectView: (view: ViewId) => void;
  navMode: 'standard' | 'advanced';
  onToggleNavMode: (mode: 'standard' | 'advanced') => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  healthAlertsCount?: number;
  pendingApprovalsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  navMode,
  onToggleNavMode,
  isOpenMobile,
  onCloseMobile,
  healthAlertsCount = 0,
  pendingApprovalsCount = 0,
}) => {
  const isAdvanced = navMode === 'advanced';

  const operationalNav = [
    { id: 'dashboard', label: 'لوحة العمل', icon: LayoutDashboard },
    { id: 'catalog', label: 'سجل الأسعار والكتالوج', icon: Tags },
    { id: 'box_builder', label: 'بناء وهندسة البوكسات', icon: Boxes },
    { id: 'orders', label: 'الطلبات والتحصيل', icon: ShoppingCart },
    { id: 'customers', label: 'السوق والعملاء', icon: Users },
    {
      id: 'approvals',
      label: 'مذكرة اعتماد الأسعار',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    },
  ];

  const analysisNav = [
    { id: 'customer_intelligence', label: 'ذكاء العملاء والطلب', icon: TrendingUp },
    { id: 'order_economics', label: 'اقتصاديات الطلب', icon: Receipt },
    { id: 'simulator', label: 'تحليل وتسعير سريع', icon: Calculator },
    { id: 'reports', label: 'مركز التقارير A4', icon: FileText },
    { id: 'archive', label: 'الأرشيف وسجل التدقيق', icon: Archive },
  ];

  const advancedNav = [
    { id: 'costs', label: 'التكاليف والمصروفات', icon: CircleDollarSign },
    { id: 'box_analyzer', label: 'تحليل مكونات البوكس', icon: PieChart },
    { id: 'compare', label: 'المقارنة التحليلية', icon: GitCompare },
    { id: 'reconciliation', label: 'مطابقة المبيعات بالكتالوج', icon: FileSpreadsheet },
    { id: 'settings_data', label: 'الإعدادات ومركز البيانات', icon: Settings },
  ];

  const extendedUpgradesNav = [
    { id: 'sales_intelligence', label: 'ذكاء المبيعات (RFM/ABC)', icon: BarChart3 },
    { id: 'yield_lab', label: 'مختبر الجزارة والتصافي', icon: Scissors },
    { id: 'financial_engineering', label: 'الهندسة المالية والحساسية', icon: DollarSign },
    { id: 'governance', label: 'الحوكمة والجاهزية', icon: ShieldCheck },
    { id: 'nrv', label: 'تفكيك الذبيحة وقيمة NRV', icon: Layers },
    { id: 'risk_lab', label: 'المخاطر وجسر الربحية', icon: Flame },
    { id: 'decisions', label: 'مركز القرار التجاري', icon: Scale },
    { id: 'capabilities', label: 'مركز قدرات JEV', icon: Cpu },
    {
      id: 'health',
      label: 'الصحة والاستثناءات',
      icon: Activity,
      badge: healthAlertsCount > 0 ? healthAlertsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
  ];

  const handleNavClick = (viewId: string) => {
    onSelectView(viewId as ViewId);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop / Scrim */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 right-0 z-40 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / Brand */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
              S
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                S.kosif
              </div>
              <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                V30 Fusion + JEV
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Mode Switcher */}
        <div className="p-3">
          <div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => onToggleNavMode('standard')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                !isAdvanced
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              القياسي Standard
            </button>
            <button
              type="button"
              onClick={() => onToggleNavMode('advanced')}
              className={`flex-1 py-1.5 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                isAdvanced
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              المتقدم
            </button>
          </div>
        </div>

        {/* Navigation Links Scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5 custom-scroll text-sm">
          {/* 1. العمليات التشغيلية */}
          <div>
            <div className="px-3 pb-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              الشاشات التشغيلية
            </div>
            <div className="space-y-0.5">
              {operationalNav.map((item) => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-right transition-all font-medium ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-blue-100 text-blue-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. التحليل والتقارير */}
          <div>
            <div className="px-3 pb-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              التحليل والتقارير
            </div>
            <div className="space-y-0.5">
              {analysisNav.map((item) => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-right transition-all font-medium ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. الشاشات المتقدمة (تظهر بشكل أكبر في الوضع المتقدم) */}
          {(isAdvanced || ['costs', 'compare', 'settings_data'].includes(currentView)) && (
            <div>
              <div className="px-3 pb-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>الهندسة والتكاليف</span>
                <span className="text-[10px] text-blue-500 font-normal">Advanced</span>
              </div>
              <div className="space-y-0.5">
                {advancedNav.map((item) => {
                  const Icon = item.icon;
                  const active = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-right transition-all font-medium ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. الترقيات والوحدات المتقدمة (JEV Hybrid Upgrades) */}
          {isAdvanced && (
            <div>
              <div className="px-3 pb-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>وحدات الذكاء والجزارة</span>
                <Sparkles className="w-3 h-3 text-amber-500" />
              </div>
              <div className="space-y-0.5">
                {extendedUpgradesNav.map((item) => {
                  const Icon = item.icon;
                  const active = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-right transition-all font-medium ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-amber-100 text-amber-700'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span>التخزين: محلي Local-First</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">سليم 100%</span>
        </div>
      </aside>
    </>
  );
};
