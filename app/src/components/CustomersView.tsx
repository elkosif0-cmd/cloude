import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Crown,
  TrendingUp,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ShoppingBag,
  Award,
  AlertCircle,
} from 'lucide-react';
import { Customer, Order } from '../types/commerce';
import { formatSAR, formatDateAr } from '../utils/formatters';

interface CustomersViewProps {
  customers: Customer[];
  orders: Order[];
  onSaveCustomer: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  orders,
  onSaveCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New Customer Modal
  const [isCreating, setIsCreating] = useState(false);
  const [newCust, setNewCust] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    city: 'الرياض',
    rfmSegment: 'Loyal',
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (segmentFilter !== 'all' && c.rfmSegment !== segmentFilter) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const matchName = c.name.toLowerCase().includes(s);
        const matchPhone = c.phone?.toLowerCase().includes(s);
        const matchCity = c.city.toLowerCase().includes(s);
        if (!matchName && !matchPhone && !matchCity) return false;
      }
      return true;
    });
  }, [customers, segmentFilter, searchTerm]);

  // Selected customer orders
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter((o) => o.customerId === selectedCustomer.id);
  }, [selectedCustomer, orders]);

  const handleSaveNew = () => {
    if (!newCust.name?.trim()) {
      alert('يرجى كتابة اسم العميل.');
      return;
    }
    const created: Customer = {
      id: `cust-${Date.now()}`,
      name: newCust.name,
      phone: newCust.phone || '',
      email: newCust.email || '',
      city: newCust.city || 'الرياض',
      district: 'وسط المدينة',
      rfmSegment: newCust.rfmSegment || 'Loyal',
      totalSpend: 0,
      orderCount: 0,
      averageOrderValue: 0,
      firstOrderDate: new Date().toISOString().split('T')[0],
      lastOrderDate: new Date().toISOString().split('T')[0],
      rfmScore: 75,
    };
    onSaveCustomer(created);
    setIsCreating(false);
    setNewCust({ name: '', phone: '', email: '', city: 'الرياض', rfmSegment: 'Loyal' });
  };

  const segmentBadge: Record<string, { label: string; bg: string }> = {
    VIP: { label: 'عميل مميز VIP', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
    Loyal: { label: 'عميل منتظم', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
    Promising: { label: 'واعد', bg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300' },
    'At Risk': { label: 'معرض للفقد', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
    Lost: { label: 'منقطع', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
    New: { label: 'عميل جديد', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالاسم أو الهاتف أو المدينة..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
          >
            <option value="all">جميع الشرائح</option>
            <option value="VIP">عملاء VIP</option>
            <option value="Loyal">عملاء دائمين (Loyal)</option>
            <option value="Promising">واعدين (Promising)</option>
            <option value="At Risk">معرضين للفقد (At Risk)</option>
            <option value="New">عملاء جدد (New)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة عميل جديد
        </button>
      </div>

      {/* Grid of Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const segKey = cust.rfmSegment || 'Loyal';
          const badge = segmentBadge[segKey] || segmentBadge.Loyal;
          return (
            <div
              key={cust.id}
              onClick={() => setSelectedCustomer(cust)}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-xs cursor-pointer transition-all hover:shadow-md text-right group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cust.name}
                  </h4>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>{cust.city}</span>
                    {cust.phone && <span>• {cust.phone}</span>}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center text-xs mb-3">
                <div>
                  <div className="text-[10px] text-slate-400">إجمالي الشراء</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {formatSAR(cust.totalSpend)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">الطلبات</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {cust.orderCount}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">متوسط السلة</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {formatSAR(cust.averageOrderValue)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>آخر طلب: {formatDateAr(cust.lastOrderDate)}</span>
                <span className="text-blue-600 font-semibold group-hover:underline">عرض الملف</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer 360 Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  ملف العميل: {selectedCustomer.name}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {selectedCustomer.city} • {selectedCustomer.phone}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400">إجمالي المشتريات</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1 font-mono">
                    {formatSAR(selectedCustomer.totalSpend)}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400">عدد الطلبات</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1 font-mono">
                    {selectedCustomer.orderCount} طلبات
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400">متوسط قيمة السلة (AOV)</div>
                  <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">
                    {formatSAR(selectedCustomer.averageOrderValue)}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  سجل طلبات العميل:
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customerOrders.map((o) => (
                    <div
                      key={o.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold">{o.orderNumber}</span>
                        <span className="text-slate-400 mr-3">{formatDateAr(o.orderDate)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {formatSAR(o.totalAmount)}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            o.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.paymentStatus === 'paid' ? 'مسدد' : 'متبقي'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {customerOrders.length === 0 && (
                    <div className="text-xs text-slate-400 p-4 text-center">لا توجد طلبات سابقة.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Customer Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-right">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
              إضافة عميل جديد
            </h3>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم العميل
                </label>
                <input
                  type="text"
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الجوال
                </label>
                <input
                  type="text"
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  placeholder="05xxxxxxxx"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المدينة
                </label>
                <input
                  type="text"
                  value={newCust.city}
                  onChange={(e) => setNewCust({ ...newCust, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تصنيف الشريحة
                </label>
                <select
                  value={newCust.rfmSegment}
                  onChange={(e) => setNewCust({ ...newCust, rfmSegment: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 font-bold"
                >
                  <option value="Loyal">منتظم (Loyal)</option>
                  <option value="VIP">VIP</option>
                  <option value="Promising">واعد (Promising)</option>
                  <option value="New">جديد (New)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveNew}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                حفظ العميل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
