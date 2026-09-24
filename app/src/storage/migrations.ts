import { CURRENT_SCHEMA_VERSION, STORAGE_KEYS } from './localStorage';

export function runSchemaMigrations(): void {
  try {
    const currentVer = parseInt(localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION) || '0', 10);
    if (currentVer >= CURRENT_SCHEMA_VERSION) {
      return;
    }

    // Migration logic if upgrading from older versions
    // Ensures all required fields exist without wiping user data
    const rawRaws = localStorage.getItem(STORAGE_KEYS.RAW_ITEMS);
    if (rawRaws) {
      try {
        const parsed = JSON.parse(rawRaws);
        if (Array.isArray(parsed)) {
          const migrated = parsed.map((item: any) => ({
            ...item,
            isPurchaseVatReclaimable: item.isPurchaseVatReclaimable ?? true,
            purchaseVatRate: item.purchaseVatRate ?? 0.15,
            wastePercent: item.wastePercent ?? 0.05,
            isByProduct: item.isByProduct ?? false,
          }));
          localStorage.setItem(STORAGE_KEYS.RAW_ITEMS, JSON.stringify(migrated));
        }
      } catch (e) {
        console.warn('Migration warning on raw items:', e);
      }
    }

    localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION.toString());
  } catch (err) {
    console.error('Schema migration error:', err);
  }
}
