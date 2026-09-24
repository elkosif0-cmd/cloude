import {
  Customer,
  Order,
  OrderItem,
  Payment,
  SalesLine,
  SalesDescription,
  ImportSession,
  ValueError,
} from '../types/commerce';
import { PriceSnapshot } from '../types/approvals';

const DB_NAME = 'AghnamAlWadiDB_v19';
const DB_VERSION = 2;

export const DB_STORES = {
  CUSTOMERS: 'customers',
  SALES_LINES: 'sales_lines',
  SALES_DESCRIPTIONS: 'sales_descriptions',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  PAYMENTS: 'payments',
  OPS_ORDERS: 'ops_orders',
  IMPORTS: 'imports',
  IMPORT_ERRORS: 'import_errors',
  PRICING_SNAPSHOTS: 'pricing_snapshots',
  CUSTOMER_MASTER_ROWS: 'customer_master_rows',
  META: 'meta',
} as const;

let dbInstance: IDBDatabase | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Customers store
      if (!db.objectStoreNames.contains(DB_STORES.CUSTOMERS)) {
        const store = db.createObjectStore(DB_STORES.CUSTOMERS, { keyPath: 'id' });
        store.createIndex('phone', 'phone', { unique: false });
        store.createIndex('city', 'city', { unique: false });
        store.createIndex('totalSpend', 'totalSpend', { unique: false });
      }

      // 2. Sales Lines
      if (!db.objectStoreNames.contains(DB_STORES.SALES_LINES)) {
        const store = db.createObjectStore(DB_STORES.SALES_LINES, { keyPath: 'id' });
        store.createIndex('orderNumber', 'orderNumber', { unique: false });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('customerPhone', 'customerPhone', { unique: false });
      }

      // 3. Sales Descriptions (for product mapping)
      if (!db.objectStoreNames.contains(DB_STORES.SALES_DESCRIPTIONS)) {
        const store = db.createObjectStore(DB_STORES.SALES_DESCRIPTIONS, { keyPath: 'rawDescription' });
        store.createIndex('catalogItemId', 'catalogItemId', { unique: false });
      }

      // 4. Orders
      if (!db.objectStoreNames.contains(DB_STORES.ORDERS)) {
        const store = db.createObjectStore(DB_STORES.ORDERS, { keyPath: 'id' });
        store.createIndex('orderNumber', 'orderNumber', { unique: true });
        store.createIndex('customerId', 'customerId', { unique: false });
        store.createIndex('orderDate', 'orderDate', { unique: false });
        store.createIndex('paymentStatus', 'paymentStatus', { unique: false });
      }

      // 5. Order Items
      if (!db.objectStoreNames.contains(DB_STORES.ORDER_ITEMS)) {
        const store = db.createObjectStore(DB_STORES.ORDER_ITEMS, { keyPath: 'id' });
        store.createIndex('orderId', 'orderId', { unique: false });
      }

      // 6. Payments
      if (!db.objectStoreNames.contains(DB_STORES.PAYMENTS)) {
        const store = db.createObjectStore(DB_STORES.PAYMENTS, { keyPath: 'id' });
        store.createIndex('orderId', 'orderId', { unique: false });
      }

      // 7. Ops Orders
      if (!db.objectStoreNames.contains(DB_STORES.OPS_ORDERS)) {
        db.createObjectStore(DB_STORES.OPS_ORDERS, { keyPath: 'id' });
      }

      // 8. Imports
      if (!db.objectStoreNames.contains(DB_STORES.IMPORTS)) {
        db.createObjectStore(DB_STORES.IMPORTS, { keyPath: 'id' });
      }

      // 9. Import Errors
      if (!db.objectStoreNames.contains(DB_STORES.IMPORT_ERRORS)) {
        const store = db.createObjectStore(DB_STORES.IMPORT_ERRORS, { keyPath: 'id' });
        store.createIndex('sessionId', 'sessionId', { unique: false });
      }

      // 10. Pricing Snapshots
      if (!db.objectStoreNames.contains(DB_STORES.PRICING_SNAPSHOTS)) {
        db.createObjectStore(DB_STORES.PRICING_SNAPSHOTS, { keyPath: 'id' });
      }

      // 11. Customer Master Rows
      if (!db.objectStoreNames.contains(DB_STORES.CUSTOMER_MASTER_ROWS)) {
        db.createObjectStore(DB_STORES.CUSTOMER_MASTER_ROWS, { keyPath: 'id' });
      }

      // 12. Meta Store
      if (!db.objectStoreNames.contains(DB_STORES.META)) {
        db.createObjectStore(DB_STORES.META, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * جلب جميع السجلات من مخزن معين مع دعم الحد الأقصى
 */
export async function getAllFromStore<T>(storeName: string, limit?: number): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const results: T[] = [];
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        results.push(cursor.value);
        if (limit && results.length >= limit) {
          resolve(results);
          return;
        }
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * إدخال جماعي مع دفعة غير متزامنة (Chunked Async Batching) لمنع تجميد واجهة المستخدم
 */
export async function bulkInsertChunked<T>(
  storeName: string,
  items: T[],
  chunkSize = 250,
  onProgress?: (processed: number, total: number) => void
): Promise<void> {
  const db = await openDatabase();
  const total = items.length;
  let processed = 0;

  for (let i = 0; i < total; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      for (const item of chunk) {
        store.put(item);
      }

      tx.oncomplete = () => {
        processed += chunk.length;
        if (onProgress) onProgress(processed, total);
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });

    // تفريغ وقت لتحديث الـ Event Loop لضمان سلاسة الواجهة
    await new Promise((r) => setTimeout(r, 0));
  }
}

/**
 * عد السجلات في مخزن
 */
export async function countStore(storeName: string): Promise<number> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * مسح مخزن بالكامل
 */
export async function clearStore(storeName: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * إحصائيات التخزين وقاعدة البيانات
 */
export async function getStorageStats() {
  const counts: Record<string, number> = {};
  for (const name of Object.values(DB_STORES)) {
    try {
      counts[name] = await countStore(name);
    } catch {
      counts[name] = 0;
    }
  }

  let quotaInfo = { usageMb: 0, quotaMb: 0, percentUsed: 0 };
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const est = await navigator.storage.estimate();
      const usageMb = (est.usage || 0) / (1024 * 1024);
      const quotaMb = (est.quota || 0) / (1024 * 1024);
      quotaInfo = {
        usageMb: Math.round(usageMb * 10) / 10,
        quotaMb: Math.round(quotaMb * 10) / 10,
        percentUsed: quotaMb > 0 ? Math.round((usageMb / quotaMb) * 100) : 0,
      };
    } catch {
      // ignore
    }
  }

  return { counts, quotaInfo };
}
