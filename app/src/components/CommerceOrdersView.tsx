import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Plus,
  Receipt,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  DollarSign,
  User,
  Truck,
  FileSpreadsheet,
} from 'lucide-react';
import { Order, Customer, SalesLine, PaymentMethod } from '../types/commerce';
import { BoxItem, RawItem } from '../types/pricing';
import { formatSAR, formatDateAr } from '../utils/formatters';

interface CommerceOrdersViewProps {
  orders: Order[];
  customers: Customer[];
  boxItems: BoxItem[];
  rawItems: RawItem[];
  onSaveOrder: (order: Order) => void;
  onSelectOrderForEconomics?: (order: Order) => void;
}

export const CommerceOrdersView: React.FC<CommerceOrdersViewProps> = ({
  orders,
  customers,
  boxItems,
  rawItems,
  onSaveOrder,
  onSelectOrderForEconomics,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // New order modal
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [newOrderCustomer, setNewOrderCustomer] = useState(customers[0]?.id || '');
  const [newOrderMethod, setNewOrderMethod] = useState<PaymentMethod>('mada');
  const [newOrderDeliveryFee, setNewOrderDeliveryFee] = useState(30);
  const [newOrderLines, setNewOrderLines] = useState<
    Array<{ catalogItemId: string; name: string; quantity: number; unitPriceGross: number }>
  >([]);

  // Collect payment modal
  const [collectingOrder, setCollectingOrder] = useState<Order | null>(null);
  const [collectionAmount, setCollectionAmount] = useState<number>(0);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) return false;
      if (methodFilter !== 'all' && o.paymentMethod !== methodFilter) return false;

      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const numMatch = o.orderNumber.toLowerCase().includes(s);
        const nameMatch = o.customerName.toLowerCase().includes(s);
        if (!numMatch && !nameMatch) return false;
      }

      return true;
    });
  }, [orders, paymentFilter, methodFilter, searchTerm]);

  // Aggregate stats
  const totalOrdersAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalPaid = orders.reduce((sum, o) => sum + o.paidAmount, 0);
  const totalRemaining = orders.reduce((sum, o) => sum + o.remainingAmount, 0);

  const handleAddLineToNewOrder = (catalogId: string) => {
    const box = boxItems.find((b) => b.id === catalogId);
    const raw = rawItems.find((r) => r.id === catalogId);
    const name = box ? box.name : raw ? raw.name : 'صنف';
    const price = box ? box.sellingPriceGross : raw ? raw.sellingPriceGross : 0;

    setNewOrderLines([
      ...newOrderLines,
      { catalogItemId: catalogId, name, quantity: 1, unitPriceGross: price },
    ]);
  };

  const handleSaveNewOrder = () => {
    if (!newOrderLines.length) {
      alert('يرجى إضافة صنف واحد على الأقل للطلب.');
      return;
    }
    const customer = customers.find((c) => c.id === newOrderCustomer);
    const subtotal = newOrderLines.reduce((acc, l) => acc + l.quantity * l.unitPriceGross, 0);
    const total = subtotal + newOrderDeliveryFee;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      customerId: newOrderCustomer,
      customerName: customer ? customer.name : 'عميل نقدي',
      customerPhone: customer?.phone || '0500000000',
      city: customer?.city || 'الرياض',
      orderDate: new Date().toISOString(),
      items: newOrderLines.map((l, i) => ({
        id: `item-${Date.now()}-${i}`,
        orderId: `ord-${Date.now()}`,
        productId: l.catalogItemId,
        productName: l.name,
        quantity: l.quantity,
        unitPrice: l.unitPriceGross,
        totalPrice: l.quantity * l.unitPriceGross,
        unitCostNet: l.unitPriceGross * 0.7,
      })),
      subtotal: subtotal,
      vatAmount: subtotal * 0.15,
      shippingFee: newOrderDeliveryFee,
      paymentGatewayFee: 0,
      discount: 0,
      totalAmount: total,
      paidAmount: total,
      remainingAmount: 0,
      paymentMethod: newOrderMethod,
      paymentStatus: 'paid',
      status: 'processing',
    };

    onSaveOrder(newOrder);
    setIsCreatingOrder(false);
    setNewOrderLines([]);
  };

  const handleSaveCollection = () => {
    if (!collectingOrder) return;
    const newPaid = collectingOrder.paidAmount + collectionAmount;
    const newRemaining = Math.max(0, collectingOrder.totalAmount - newPaid);
    const newStatus = newRemaining === 0 ? 'paid' : newPaid > 0 ? 'partial' : 'pending';

    onSaveOrder({
      ...collectingOrder,
      paidAmount: newPaid,
      remainingAmount: newRemaining,
      paymentStatus: newStatus,
    });
    setCollectingOrder(null);
  };

  const paymentBadge: Record<string, { label: string; bg: string }> = {
    paid: { label: 'مسدد بالكامل', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
    pending: { label: 'معلق / آجل', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
    failed: { label: 'فشل السداد', bg: 'bg-rose-200 text-rose-900 dark:bg-rose-950 dark:text-rose-200' },
    refunded: { label: 'مسترجع', bg: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  };

  const paymentMethodLabel: Record<string, string> = {
    card: 'بطاقة ائتمان / مدى',
    cash: 'نقداً',
    apple_pay: 'Apple Pay',
    tabby: 'تابي (أقساط)',
    tamara: 'تمارا (أقساط)',
    cash_on_delivery: 'دفع عند الاستلام',
    bank_transfer: 'تحويل بنكي',
    other: 'أخرى',
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-500 mb-2">إجمالي قيمة المبيعات</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatSAR(totalOrdersAmount)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">عدد الطلبات: {orders.length} طلب</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-500 mb-2">المبالغ المحصلة فعلياً</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatSAR(totalPaid)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            نسبة التحصيل: {orders.length > 0 ? ((totalPaid / totalOrdersAmount) * 100).toFixed(1) : 0}%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-500 mb-2">المبالغ المستحقة والآجلة</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatSAR(totalRemaining)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">يتطلب متابعة التحصيل التجاري</div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث برقم الطلب أو اسم العميل..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">جميع حالات السداد</option>
            <option value="paid">مسدد بالكامل</option>
            <option value="partial">سداد جزئي</option>
            <option value="pending">معلق / غير مسدد</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">جميع بوابات وطرق الدفع</option>
            <option value="mada">مدى Mada</option>
            <option value="apple_pay">Apple Pay</option>
            <option value="visa_master">فيزا / ماستركارد</option>
            <option value="tabby">تابي</option>
            <option value="tamara">تمارا</option>
            <option value="cod">عند الاستلام</option>
            <option value="bank_transfer">تحويل بنكي</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingOrder(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-600/20 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          تسجيل طلب جديد
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
              <tr>
                <th className="p-3.5 pr-5">رقم الطلب والتاريخ</th>
                <th className="p-3.5">العميل</th>
                <th className="p-3.5">طريقة الدفع</th>
                <th className="p-3.5">إجمالي الفاتورة</th>
                <th className="p-3.5">المسدد</th>
                <th className="p-3.5">المتبقي</th>
                <th className="p-3.5">حالة السداد</th>
                <th className="p-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.map((order) => {
                const badge = paymentBadge[order.paymentStatus];
                return (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 pr-5">
                      <div className="font-bold text-slate-900 dark:text-white font-mono">
                        {order.orderNumber}
                      </div>
                      <div className="text-[11px] text-slate-400">{formatDateAr(order.orderDate)}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {order.customerName}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {paymentMethodLabel[order.paymentMethod] || order.paymentMethod}
                    </td>
                    <td className="p-3.5 font-bold font-mono text-slate-900 dark:text-white">
                      {formatSAR(order.totalAmount)}
                    </td>
                    <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400">
                      {formatSAR(order.paidAmount)}
                    </td>
                    <td className="p-3.5 font-mono text-amber-600 dark:text-amber-400">
                      {formatSAR(order.remainingAmount)}
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="تفاصيل الطلب"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {order.remainingAmount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCollectingOrder(order);
                              setCollectionAmount(order.remainingAmount);
                            }}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            title="تسجيل سداد"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    لا توجد طلبات مطابقة للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  تفاصيل الطلب {selectedOrder.orderNumber}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  العميل: {selectedOrder.customerName} • {formatDateAr(selectedOrder.orderDate)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">الأصناف المطلوبة:</div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between bg-white dark:bg-slate-900">
                    <div>
                      <span className="font-bold">{it.productName}</span>
                      <span className="text-slate-400 mr-2">
                        ({it.quantity} × {formatSAR(it.unitPrice)})
                      </span>
                    </div>
                    <span className="font-bold font-mono">{formatSAR(it.totalPrice)}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono">{formatSAR(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>رسوم التوصيل:</span>
                  <span className="font-mono">{formatSAR(selectedOrder.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white font-bold pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>الإجمالي شامل الضريبة:</span>
                  <span className="font-mono">{formatSAR(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {collectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-right">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
              تسجيل تحصيل مالي للطلب {collectingOrder.orderNumber}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              المبلغ المتبقي الحالي: {formatSAR(collectingOrder.remainingAmount)}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المبلغ المحصل (ر.س)
                </label>
                <input
                  type="number"
                  step="1"
                  max={collectingOrder.remainingAmount}
                  value={collectionAmount}
                  onChange={(e) => setCollectionAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold text-left"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCollectingOrder(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveCollection}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                تأكيد التحصيل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {isCreatingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-right">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
              تسجيل طلب عميل جديد
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اختيار العميل
                </label>
                <select
                  value={newOrderCustomer}
                  onChange={(e) => setNewOrderCustomer(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 font-bold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  طريقة الدفع
                </label>
                <select
                  value={newOrderMethod}
                  onChange={(e) => setNewOrderMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 font-bold"
                >
                  <option value="mada">مدى Mada</option>
                  <option value="apple_pay">Apple Pay</option>
                  <option value="visa_master">فيزا / ماستركارد</option>
                  <option value="tabby">تابي</option>
                  <option value="tamara">تمارا</option>
                  <option value="cod">الدفع عند الاستلام</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                </select>
              </div>
            </div>

            {/* Quick add catalog item */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                إضافة بوكس أو صنف من الكتالوج
              </label>
              <div className="flex gap-2">
                <select
                  id="catalog-quick-add"
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200"
                >
                  {boxItems.map((b) => (
                    <option key={b.id} value={b.id}>
                      [بوكس] {b.name} - {formatSAR(b.sellingPriceGross)}
                    </option>
                  ))}
                  {rawItems.map((r) => (
                    <option key={r.id} value={r.id}>
                      [خام] {r.name} - {formatSAR(r.sellingPriceGross)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('catalog-quick-add') as HTMLSelectElement;
                    if (el) handleAddLineToNewOrder(el.value);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  إضافة
                </button>
              </div>
            </div>

            {/* Order lines list */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {newOrderLines.map((line, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <span>{line.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono">{formatSAR(line.unitPriceGross)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const up = [...newOrderLines];
                        up.splice(idx, 1);
                        setNewOrderLines(up);
                      }}
                      className="text-rose-600 font-bold"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setIsCreatingOrder(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveNewOrder}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                حفظ الطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
