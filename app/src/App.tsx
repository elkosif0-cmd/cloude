/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, ViewId } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { Product360Modal } from './components/Product360Modal';

// Views
import { DashboardView } from './components/DashboardView';
import { CatalogView } from './components/CatalogView';
import { BoxBuilderView } from './components/BoxBuilderView';
import { CommerceOrdersView } from './components/CommerceOrdersView';
import { CustomersView } from './components/CustomersView';
import { ApprovalMemoView } from './components/ApprovalMemoView';
import { CustomerDemandIntelligenceView } from './components/CustomerDemandIntelligenceView';
import { OrderEconomicsView } from './components/OrderEconomicsView';
import { SimulatorView } from './components/SimulatorView';
import { ReportsView } from './components/ReportsView';
import { ArchiveView } from './components/ArchiveView';
import { CostsExpensesView } from './components/CostsExpensesView';
import { BoxAnalyzerView } from './components/BoxAnalyzerView';
import { CompareStudioView } from './components/CompareStudioView';
import { ReconciliationView } from './components/ReconciliationView';
import { SettingsDataView } from './components/SettingsDataView';
import { AdvancedModulesView } from './components/AdvancedModulesView';

// Storage & Domain
import {
  loadSettings,
  saveSettings,
  loadRawItems,
  saveRawItems,
  loadBoxItems,
  saveBoxItems,
  loadExpenses,
  saveExpenses,
  loadApprovalMemos,
  saveApprovalMemos,
  loadAuditLogs,
  addAuditLog,
  saveAuditLogs,
  loadPriceRules,
  savePriceRules,
  loadTheme,
  saveTheme,
  loadNavMode,
  saveNavMode,
} from './storage/localStorage';
import { BackupPayload, restoreBackup } from './storage/backup';
import {
  SEED_SETTINGS,
  SEED_RAWS,
  SEED_BOXES,
  SEED_EXPS,
  SEED_ORDERS,
  SEED_CUSTOMERS,
  SEED_SALES_LINES,
} from './data/seedData';
import { RawItem, BoxItem, ExpenseItem, PriceRule } from './types/pricing';
import { AppSettings } from './types/settings';
import { Order, Customer, SalesLine } from './types/commerce';
import { ApprovalMemo } from './types/approvals';
import { AuditLogEntry } from './types/audit';

export default function App() {
  // Navigation & Shell State
  const [currentView, setCurrentView] = useState<ViewId>('dashboard');
  const [navMode, setNavMode] = useState<'standard' | 'advanced'>(loadNavMode());
  const [theme, setTheme] = useState<'light' | 'dark'>(loadTheme());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Domain Data State
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [rawItems, setRawItems] = useState<RawItem[]>(loadRawItems());
  const [boxItems, setBoxItems] = useState<BoxItem[]>(loadBoxItems());
  const [expenses, setExpenses] = useState<ExpenseItem[]>(loadExpenses());
  const [approvalMemos, setApprovalMemos] = useState<ApprovalMemo[]>(loadApprovalMemos());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(loadAuditLogs());
  const [priceRules, setPriceRules] = useState<PriceRule[]>(loadPriceRules());
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('aghn_orders_v19');
    return saved ? JSON.parse(saved) : SEED_ORDERS;
  });
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('aghn_customers_v19');
    return saved ? JSON.parse(saved) : SEED_CUSTOMERS;
  });
  const [salesLines] = useState<SalesLine[]>(SEED_SALES_LINES);

  // Modals & Floating UI State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [product360State, setProduct360State] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemType: 'raw' | 'box';
  }>({
    isOpen: false,
    itemId: null,
    itemType: 'box',
  });

  const [selectedBoxIdToEdit, setSelectedBoxIdToEdit] = useState<string | null>(null);
  const [isNewRawModalOpen, setIsNewRawModalOpen] = useState(false);
  const [newRawDraft, setNewRawDraft] = useState<Partial<RawItem>>({
    name: '',
    category: 'ذبائح كاملة',
    unit: 'كجم',
    purchasePriceGross: 100,
    wastePercent: 0.08,
    sellingPriceGross: 130,
    supplier: 'مزارع الوادي للإنتاج الحيواني',
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    danger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    danger: false,
  });

  // Apply Theme on load
  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  // Toast Helpers
  const addToast = useCallback(
    (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration: 4000 }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Handlers for App Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    addAuditLog({
      user: newSettings.reportPreparerName || 'مدير النظام',
      group: 'settings',
      field: 'global_settings',
      previousValue: null,
      newValue: 'updated',
      source: 'manual',
      notes: 'تم تحديث البيانات المالية وإعدادات الهامش والضريبة',
    });
    setAuditLogs(loadAuditLogs());
    addToast('success', 'تم حفظ الإعدادات بنجاح');
  };

  // Handlers for Raw Items
  const handleSaveRaw = (updated: RawItem) => {
    const existing = rawItems.find((r) => r.id === updated.id);
    let updatedList: RawItem[];
    if (existing) {
      updatedList = rawItems.map((r) => (r.id === updated.id ? updated : r));
    } else {
      updatedList = [...rawItems, updated];
    }
    setRawItems(updatedList);
    saveRawItems(updatedList);
    addAuditLog({
      user: settings.reportPreparerName || 'أخصائي التسعير',
      group: 'catalog',
      itemId: updated.id,
      itemName: updated.name,
      field: 'sellingPriceGross',
      previousValue: existing ? existing.sellingPriceGross : null,
      newValue: updated.sellingPriceGross,
      source: 'manual',
      notes: existing
        ? `تعديل سعر شراء/بيع المادة الخام: ${updated.name}`
        : `إضافة مادة خام جديدة: ${updated.name}`,
    });
    setAuditLogs(loadAuditLogs());
    addToast('success', 'تم حفظ بيانات المادة الخام');
  };

  // Handlers for Box Items
  const handleSaveBox = (updated: BoxItem) => {
    const existing = boxItems.find((b) => b.id === updated.id);
    let updatedList: BoxItem[];
    if (existing) {
      updatedList = boxItems.map((b) => (b.id === updated.id ? updated : b));
    } else {
      updatedList = [...boxItems, updated];
    }
    setBoxItems(updatedList);
    saveBoxItems(updatedList);
    addAuditLog({
      user: settings.reportPreparerName || 'مهندس البوكسات',
      group: 'box_formulations',
      itemId: updated.id,
      itemName: updated.name,
      field: 'box_recipe',
      previousValue: existing ? existing.sellingPriceGross : null,
      newValue: updated.sellingPriceGross,
      source: 'manual',
      notes: existing
        ? `تحديث تركيبة وتسعير البوكس: ${updated.name}`
        : `ابتكار وهندسة بوكس جديد: ${updated.name}`,
    });
    setAuditLogs(loadAuditLogs());
    addToast('success', 'تم حفظ وتحديث البوكس في الكتالوج');
  };

  // Handlers for Expenses
  const handleSaveExpense = (updated: ExpenseItem) => {
    const existing = expenses.find((e) => e.id === updated.id);
    let updatedList: ExpenseItem[];
    if (existing) {
      updatedList = expenses.map((e) => (e.id === updated.id ? updated : e));
    } else {
      updatedList = [...expenses, updated];
    }
    setExpenses(updatedList);
    saveExpenses(updatedList);
    addAuditLog({
      user: settings.reportPreparerName || 'أخصائي التكاليف',
      group: 'expenses',
      itemId: updated.id,
      itemName: updated.name,
      field: 'amount',
      previousValue: existing ? existing.amount : null,
      newValue: updated.amount,
      source: 'manual',
      notes: `تحديث بند المصروف: ${updated.name}`,
    });
    setAuditLogs(loadAuditLogs());
    addToast('success', 'تم حفظ المصروف بنجاح');
  };

  const handleDeleteExpense = (expId: string) => {
    const updatedList = expenses.filter((e) => e.id !== expId);
    setExpenses(updatedList);
    saveExpenses(updatedList);
    addToast('info', 'تم حذف بند المصروف');
  };

  // Handlers for Orders
  const handleSaveOrder = (newOrder: Order) => {
    const existing = orders.find((o) => o.id === newOrder.id);
    let updatedList: Order[];
    if (existing) {
      updatedList = orders.map((o) => (o.id === newOrder.id ? newOrder : o));
    } else {
      updatedList = [newOrder, ...orders];
    }
    setOrders(updatedList);
    localStorage.setItem('aghn_orders_v19', JSON.stringify(updatedList));
    addToast('success', 'تم تسجيل وتحديث الطلب التجاري');
  };

  // Handlers for Customers
  const handleSaveCustomer = (customer: Customer) => {
    const existing = customers.find((c) => c.id === customer.id);
    let updatedList: Customer[];
    if (existing) {
      updatedList = customers.map((c) => (c.id === customer.id ? customer : c));
    } else {
      updatedList = [customer, ...customers];
    }
    setCustomers(updatedList);
    localStorage.setItem('aghn_customers_v19', JSON.stringify(updatedList));
    addToast('success', 'تم حفظ بيانات العميل بنجاح');
  };

  // Handlers for Approval Memos
  const handleSaveMemo = (memo: ApprovalMemo) => {
    const existing = approvalMemos.find((m) => m.id === memo.id);
    let updatedList: ApprovalMemo[];
    if (existing) {
      updatedList = approvalMemos.map((m) => (m.id === memo.id ? memo : m));
    } else {
      updatedList = [memo, ...approvalMemos];
    }
    setApprovalMemos(updatedList);
    saveApprovalMemos(updatedList);
    addAuditLog({
      user: memo.preparerName,
      group: 'decisions',
      itemId: memo.id,
      itemName: memo.title,
      field: 'approval_memo',
      previousValue: null,
      newValue: memo.status,
      source: 'memo_approval',
      referenceNumber: memo.referenceNumber,
      notes: `تعديل وحفظ مسودة مذكرة الاعتماد: ${memo.referenceNumber}`,
    });
    setAuditLogs(loadAuditLogs());
    addToast('success', 'تم حفظ مذكرة الاعتماد');
  };

  const handleApproveMemo = (memo: ApprovalMemo) => {
    // Apply the memo's proposed prices directly to the catalog!
    let updatedRaws = [...rawItems];
    let updatedBoxes = [...boxItems];

    for (const item of memo.items) {
      if (item.itemType === 'raw') {
        updatedRaws = updatedRaws.map((r) =>
          r.id === item.itemId ? { ...r, sellingPriceGross: item.newPriceGross } : r
        );
      } else {
        updatedBoxes = updatedBoxes.map((b) =>
          b.id === item.itemId ? { ...b, sellingPriceGross: item.newPriceGross } : b
        );
      }
    }

    setRawItems(updatedRaws);
    saveRawItems(updatedRaws);
    setBoxItems(updatedBoxes);
    saveBoxItems(updatedBoxes);

    const updatedMemos = approvalMemos.map((m) => (m.id === memo.id ? memo : m));
    setApprovalMemos(updatedMemos);
    saveApprovalMemos(updatedMemos);

    addAuditLog({
      user: memo.approverName || settings.reportPreparerName || 'المدير المالي',
      group: 'selling_prices',
      itemId: memo.id,
      itemName: memo.title,
      field: 'selling_price',
      previousValue: 'pending',
      newValue: 'approved',
      source: 'memo_approval',
      referenceNumber: memo.referenceNumber,
      notes: `اعتماد وتطبيق أسعار المذكرة رسمياً في الكتالوج: ${memo.referenceNumber}`,
    });
    setAuditLogs(loadAuditLogs());
    addToast('success', 'تم اعتماد المذكرة وتحديث أسعار الكتالوج فورياً!');
  };

  // Restore Backup
  const handleRestoreBackup = (importedData: BackupPayload) => {
    try {
      restoreBackup(importedData);
      setSettings(loadSettings());
      setRawItems(loadRawItems());
      setBoxItems(loadBoxItems());
      setExpenses(loadExpenses());
      setApprovalMemos(loadApprovalMemos());
      setAuditLogs(loadAuditLogs());
      setPriceRules(loadPriceRules());
      addToast('success', 'تمت استعادة النسخة الاحتياطية بنجاح');
    } catch {
      addToast('error', 'فشلت استعادة النسخة الاحتياطية. تحقق من سلامة الملف.');
    }
  };

  // Reset to Factory Defaults
  const handleResetToDefaults = () => {
    setConfirmModal({
      isOpen: true,
      title: 'استعادة ضبط المصنع',
      message: 'هل أنت متأكد من رغبتك في إعادة تعيين كافة البيانات والأسعار والبوكسات إلى القيم الأولية؟ سيتم مسح أي تعديلات غير محفوظة خارجياً.',
      danger: true,
      onConfirm: () => {
        saveSettings(SEED_SETTINGS);
        saveRawItems(SEED_RAWS);
        saveBoxItems(SEED_BOXES);
        saveExpenses(SEED_EXPS);
        saveApprovalMemos([]);
        saveAuditLogs([]);
        savePriceRules([]);
        localStorage.setItem('aghn_orders_v19', JSON.stringify(SEED_ORDERS));
        localStorage.setItem('aghn_customers_v19', JSON.stringify(SEED_CUSTOMERS));

        setSettings(SEED_SETTINGS);
        setRawItems(SEED_RAWS);
        setBoxItems(SEED_BOXES);
        setExpenses(SEED_EXPS);
        setApprovalMemos([]);
        setAuditLogs([]);
        setPriceRules([]);
        setOrders(SEED_ORDERS);
        setCustomers(SEED_CUSTOMERS);

        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        addToast('info', 'تمت إعادة تعيين النظام إلى القيم الافتراضية بنجاح');
      },
    });
  };

  // Handle Quick Action from Topbar
  const handleQuickAction = (action: 'add_raw' | 'build_box' | 'print_report' | 'open_health') => {
    if (action === 'add_raw') {
      setIsNewRawModalOpen(true);
    } else if (action === 'build_box') {
      setSelectedBoxIdToEdit(null);
      setCurrentView('box_builder');
    } else if (action === 'print_report') {
      setCurrentView('reports');
    } else if (action === 'open_health') {
      setNavMode('advanced');
      saveNavMode('advanced');
      setCurrentView('health');
    }
  };

  // Save new Raw item from modal
  const handleSaveNewRawDraft = () => {
    if (!newRawDraft.name?.trim()) {
      alert('يرجى كتابة اسم المادة الخام.');
      return;
    }

    const newRaw: RawItem = {
      id: `raw-${Date.now()}`,
      code: `RW-${Math.floor(100 + Math.random() * 900)}`,
      name: newRawDraft.name,
      category: newRawDraft.category || 'ذبائح كاملة',
      unit: newRawDraft.unit || 'كجم',
      purchasePriceGross: newRawDraft.purchasePriceGross || 0,
      purchaseVatRate: 0.15,
      isPurchaseVatReclaimable: true,
      wastePercent: (newRawDraft.wastePercent || 8) / 100,
      sellingPriceGross: newRawDraft.sellingPriceGross || 0,
      supplier: newRawDraft.supplier || 'مزارع الوادي للإنتاج الحيواني',
      notes: '',
    };

    handleSaveRaw(newRaw);
    setIsNewRawModalOpen(false);
    setNewRawDraft({
      name: '',
      category: 'ذبائح كاملة',
      unit: 'كجم',
      purchasePriceGross: 100,
      wastePercent: 0.08,
      sellingPriceGross: 130,
      supplier: 'مزارع الوادي للإنتاج الحيواني',
    });
  };

  // Pending approvals counter for badge
  const pendingApprovalsCount = approvalMemos.filter((m) => m.status === 'pending').length;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'} antialiased flex flex-col font-['Cairo',sans-serif]`}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        navMode={navMode}
        onToggleNavMode={(mode) => {
          setNavMode(mode);
          saveNavMode(mode);
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        healthAlertsCount={0}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main App Layout */}
      <div className="lg:mr-72 flex-1 flex flex-col transition-all duration-300">
        <Topbar
          currentView={currentView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          theme={theme}
          onToggleTheme={() => {
            const next = theme === 'light' ? 'dark' : 'light';
            setTheme(next);
            saveTheme(next);
          }}
          navMode={navMode}
          onToggleNavMode={(mode) => {
            setNavMode(mode);
            saveNavMode(mode);
          }}
          onQuickAction={handleQuickAction}
          healthCriticalCount={0}
        />

        {/* View Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              rawItems={rawItems}
              boxItems={boxItems}
              expenses={expenses}
              settings={settings}
              approvalMemos={approvalMemos}
              orders={orders}
              onNavigate={(v) => setCurrentView(v)}
              onOpenRawModal={() => setIsNewRawModalOpen(true)}
              onOpenBoxModal={() => {
                setSelectedBoxIdToEdit(null);
                setCurrentView('box_builder');
              }}
            />
          )}

          {currentView === 'catalog' && (
            <CatalogView
              rawItems={rawItems}
              boxItems={boxItems}
              expenses={expenses}
              settings={settings}
              priceRules={priceRules}
              onSaveRaw={handleSaveRaw}
              onSaveBox={handleSaveBox}
              onOpenProduct360={(id, type) => {
                setProduct360State({ isOpen: true, itemId: id, itemType: type });
              }}
              onAddToMemoDraft={(item) => {
                setCurrentView('approvals');
                addToast('info', 'تم التوجيه إلى مذكرات الاعتماد لإضافة الصنف');
              }}
              onOpenNewRawModal={() => setIsNewRawModalOpen(true)}
              onOpenNewBoxModal={() => {
                setSelectedBoxIdToEdit(null);
                setCurrentView('box_builder');
              }}
            />
          )}

          {currentView === 'box_builder' && (
            <BoxBuilderView
              boxItems={boxItems}
              rawItems={rawItems}
              expenses={expenses}
              settings={settings}
              onSaveBox={handleSaveBox}
              selectedBoxIdToEdit={selectedBoxIdToEdit}
            />
          )}

          {currentView === 'orders' && (
            <CommerceOrdersView
              orders={orders}
              customers={customers}
              boxItems={boxItems}
              rawItems={rawItems}
              onSaveOrder={handleSaveOrder}
              onSelectOrderForEconomics={(orderId) => {
                setCurrentView('order_economics');
              }}
            />
          )}

          {currentView === 'customers' && (
            <CustomersView
              customers={customers}
              orders={orders}
              onSaveCustomer={handleSaveCustomer}
            />
          )}

          {currentView === 'approvals' && (
            <ApprovalMemoView
              memos={approvalMemos}
              rawItems={rawItems}
              boxItems={boxItems}
              settings={settings}
              onSaveMemo={handleSaveMemo}
              onApproveMemo={handleApproveMemo}
            />
          )}

          {currentView === 'customer_intelligence' && (
            <CustomerDemandIntelligenceView
              customers={customers}
              orders={orders}
              boxItems={boxItems}
            />
          )}

          {currentView === 'order_economics' && (
            <OrderEconomicsView
              orders={orders}
              boxItems={boxItems}
              rawItems={rawItems}
              settings={settings}
            />
          )}

          {currentView === 'simulator' && (
            <SimulatorView
              rawItems={rawItems}
              boxItems={boxItems}
              expenses={expenses}
              settings={settings}
              onApplyToCatalog={(item) => {
                if (item.type === 'raw') {
                  const target = rawItems.find((r) => r.id === item.id);
                  if (target) handleSaveRaw({ ...target, sellingPriceGross: item.newPrice });
                } else {
                  const target = boxItems.find((b) => b.id === item.id);
                  if (target) handleSaveBox({ ...target, sellingPriceGross: item.newPrice });
                }
              }}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              rawItems={rawItems}
              boxItems={boxItems}
              expenses={expenses}
              settings={settings}
              orders={orders}
            />
          )}

          {currentView === 'archive' && (
            <ArchiveView
              auditLogs={auditLogs}
              onClearLogs={() => {
                saveAuditLogs([]);
                setAuditLogs([]);
                addToast('info', 'تم إفراغ سجل التدقيق');
              }}
            />
          )}

          {currentView === 'costs' && (
            <CostsExpensesView
              rawItems={rawItems}
              expenses={expenses}
              settings={settings}
              onSaveRawItem={handleSaveRaw}
              onSaveExpense={handleSaveExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {currentView === 'box_analyzer' && (
            <BoxAnalyzerView
              boxItems={boxItems}
              rawItems={rawItems}
              expenses={expenses}
              settings={settings}
            />
          )}

          {currentView === 'compare' && (
            <CompareStudioView
              boxItems={boxItems}
              rawItems={rawItems}
              expenses={expenses}
              settings={settings}
            />
          )}

          {currentView === 'reconciliation' && (
            <ReconciliationView
              orders={orders}
              boxItems={boxItems}
              rawItems={rawItems}
            />
          )}

          {currentView === 'settings_data' && (
            <SettingsDataView
              settings={settings}
              rawItems={rawItems}
              boxItems={boxItems}
              expenses={expenses}
              orders={orders}
              customers={customers}
              memos={approvalMemos}
              auditLogs={auditLogs}
              onSaveSettings={handleSaveSettings}
              onRestoreBackup={handleRestoreBackup}
              onResetToDefaults={handleResetToDefaults}
            />
          )}

          {/* Extended Upgrades Nav Views */}
          {(currentView === 'sales_intelligence' ||
            currentView === 'yield_lab' ||
            currentView === 'financial_engineering' ||
            currentView === 'governance' ||
            currentView === 'nrv' ||
            currentView === 'risk_lab' ||
            currentView === 'decisions' ||
            currentView === 'capabilities' ||
            currentView === 'health') && (
            <AdvancedModulesView
              currentView={currentView}
              rawItems={rawItems}
              boxItems={boxItems}
              expenses={expenses}
              settings={settings}
              orders={orders}
              customers={customers}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}
        </main>
      </div>

      {/* Product 360 Degree Inspection Modal */}
      {product360State.isOpen && (
        <Product360Modal
          itemId={product360State.itemId}
          itemType={product360State.itemType}
          rawItems={rawItems}
          boxItems={boxItems}
          expenses={expenses}
          settings={settings}
          auditLogs={auditLogs}
          salesLines={salesLines}
          orders={orders}
          onClose={() => setProduct360State({ isOpen: false, itemId: null, itemType: 'box' })}
        />
      )}

      {/* New Raw Item Creation Modal */}
      {isNewRawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-right animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
              إضافة مادة خام جديدة إلى الكتالوج
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المادة الخام
                </label>
                <input
                  type="text"
                  placeholder="مثال: كتف حري طازج بالعظم"
                  value={newRawDraft.name || ''}
                  onChange={(e) => setNewRawDraft({ ...newRawDraft, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التصنيف
                  </label>
                  <input
                    type="text"
                    value={newRawDraft.category || 'ذبائح كاملة'}
                    onChange={(e) => setNewRawDraft({ ...newRawDraft, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الوحدة
                  </label>
                  <input
                    type="text"
                    value={newRawDraft.unit || 'كجم'}
                    onChange={(e) => setNewRawDraft({ ...newRawDraft, unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سعر الشراء شامل الضريبة
                  </label>
                  <input
                    type="number"
                    value={newRawDraft.purchasePriceGross || 0}
                    onChange={(e) =>
                      setNewRawDraft({ ...newRawDraft, purchasePriceGross: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نسبة الهدر (%)
                  </label>
                  <input
                    type="number"
                    value={((newRawDraft.wastePercent || 0.08) * 100).toFixed(0)}
                    onChange={(e) =>
                      setNewRawDraft({ ...newRawDraft, wastePercent: (parseFloat(e.target.value) || 0) / 100 })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سعر البيع المقترح شامل
                  </label>
                  <input
                    type="number"
                    value={newRawDraft.sellingPriceGross || 0}
                    onChange={(e) =>
                      setNewRawDraft({ ...newRawDraft, sellingPriceGross: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewRawModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveNewRawDraft}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                حفظ المادة الخام
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        danger={confirmModal.danger}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
