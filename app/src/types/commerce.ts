export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  district?: string;
  totalSpend: number;
  orderCount: number;
  firstOrderDate: string;
  lastOrderDate: string;
  averageOrderValue: number;
  rfmSegment?: 'VIP' | 'Loyal' | 'Promising' | 'At Risk' | 'New' | 'Lost';
  rfmScore?: number;
}

export type OrderStatus = 'completed' | 'processing' | 'cancelled' | 'delivered';
export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'refunded';
export type PaymentMethod = 'mada' | 'apple_pay' | 'visa_mastercard' | 'tabby' | 'tamara' | 'cash_on_delivery' | 'bank_transfer';

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string; // linked catalog item id if mapped
  productName: string; // original description
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitCostNet?: number;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  feeAmount: number; // رسوم بوابة الدفع
  netReceived: number;
  paidAt: string;
  status: 'captured' | 'settled' | 'disputed';
}

export interface Order {
  id: string;
  orderNumber: string; // ORD-8890
  customerId: string;
  customerName: string;
  customerPhone: string;
  city: string;
  district?: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  vatAmount: number;
  shippingFee: number;
  paymentGatewayFee: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface SalesLine {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  city: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalSales: number;
  catalogItemId?: string;
}

export interface ProductMapping {
  rawDescription: string;
  catalogItemId: string; // Raw or Box ID
  catalogItemName: string;
  confidenceScore: number;
  matchType: 'exact' | 'alias' | 'fuzzy' | 'manual' | 'ignored';
  updatedAt: string;
}

export interface ImportSession {
  id: string;
  type: 'customers' | 'sales' | 'orders' | 'catalog';
  filename: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  timestamp: string;
}

export interface ValueError {
  id: string;
  sessionId: string;
  rowNumber: number;
  rawContent: string;
  errorMessage: string;
  timestamp: string;
}

export interface SalesDescription {
  rawDescription: string;
  catalogItemId?: string;
  count?: number;
  lastSeen?: string;
}
