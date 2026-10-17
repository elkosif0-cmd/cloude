export type StockMovementType = 'OPENING' | 'PURCHASE' | 'SALE' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT';

export type StockMovement = {
  id: string;
  itemId: string;
  date: string;
  type: StockMovementType;
  quantity: number;
  unitCost?: number;
};

export type StockPosition = {
  itemId: string;
  quantity: number;
  inbound: number;
  outbound: number;
  valueAtKnownCost: number;
};

function isInbound(type: StockMovementType) {
  return type === 'OPENING' || type === 'PURCHASE' || type === 'ADJUSTMENT_IN';
}

export function buildStockPositions(movements: StockMovement[]): StockPosition[] {
  const map = new Map<string, StockPosition>();

  for (const movement of movements) {
    const current = map.get(movement.itemId) ?? {
      itemId: movement.itemId,
      quantity: 0,
      inbound: 0,
      outbound: 0,
      valueAtKnownCost: 0,
    };
    const qty = Math.max(0, movement.quantity);

    if (isInbound(movement.type)) {
      current.inbound += qty;
      current.quantity += qty;
      if (movement.unitCost !== undefined && movement.unitCost >= 0) {
        current.valueAtKnownCost += qty * movement.unitCost;
      }
    } else {
      current.outbound += qty;
      current.quantity -= qty;
    }

    current.quantity = Math.round(current.quantity * 1000) / 1000;
    current.valueAtKnownCost = Math.round(current.valueAtKnownCost * 100) / 100;
    map.set(movement.itemId, current);
  }

  return [...map.values()].sort((a,b)=>a.itemId.localeCompare(b.itemId));
}

export function negativeStockItems(movements: StockMovement[]) {
  return buildStockPositions(movements).filter((row) => row.quantity < 0);
}

export type CostLayer = { itemId: string; quantity: number; unitCost: number };

/** weighted-average unit cost per item over the received layers (quantity-weighted, 4 decimals); `key` groups spellings of one item */
export function weightedAverageCosts(layers: CostLayer[], key: (itemId: string) => string = (id) => id): Record<string, number> {
  const acc = new Map<string, { qty: number; value: number }>();
  for (const layer of layers) {
    const qty = Number(layer.quantity), unit = Number(layer.unitCost);
    if (!(qty > 0) || !(unit > 0)) continue;
    const k = key(layer.itemId), row = acc.get(k) ?? { qty: 0, value: 0 };
    row.qty += qty; row.value += qty * unit; acc.set(k, row);
  }
  const out: Record<string, number> = {};
  acc.forEach((row, k) => { out[k] = Math.round((row.value / row.qty) * 10000) / 10000; });
  return out;
}

/** weighted-average cost from the receipts dated on or before `asOf` only: a sale never takes the cost of goods bought after it */
export function weightedAverageCostsAsOf(layers: (CostLayer & { date: string })[], asOf: string, key: (itemId: string) => string = (id) => id): Record<string, number> {
  return weightedAverageCosts(layers.filter((l) => String(l.date).slice(0, 10) <= String(asOf).slice(0, 10)), key);
}

export type CountLine = { itemId: string; countedQty: number };

/** values a physical stock count at unit cost; items without a cost are listed apart instead of valued at zero */
export function stockCountValuation(lines: CountLine[], unitCost: (itemId: string) => number | null | undefined) {
  const rows: { itemId: string; countedQty: number; unitCost: number | null; value: number }[] = [];
  const uncosted: string[] = [];
  let value = 0;
  for (const line of lines) {
    const qty = Math.max(0, Number(line.countedQty) || 0), c = unitCost(line.itemId);
    const cost = c != null && Number.isFinite(c) && c > 0 ? c : null;
    if (cost == null && qty > 0) uncosted.push(line.itemId);
    const v = cost == null ? 0 : Math.round(qty * cost * 100) / 100;
    value += v;
    rows.push({ itemId: line.itemId, countedQty: qty, unitCost: cost, value: v });
  }
  return { rows, value: Math.round(value * 100) / 100, uncosted };
}

/** brings the inventory account to the counted value: a shortfall goes to the count-variance expense, a surplus reduces it */
export function buildStockCountAdjustment(p: { id: string; date: string; bookValue: number; countedValue: number; inventoryAccountId: string; varianceAccountId: string; reference?: string }) {
  const diff = Math.round((Number(p.countedValue) - Number(p.bookValue)) * 100) / 100;
  if (diff === 0) throw new Error('NO_DIFFERENCE');
  if (!p.inventoryAccountId || !p.varianceAccountId) throw new Error('ACCOUNTS_REQUIRED');
  const amt = Math.abs(diff);
  const lines = diff < 0
    ? [{ accountId: p.varianceAccountId, debit: amt, credit: 0, description: 'عجز الجرد' }, { accountId: p.inventoryAccountId, debit: 0, credit: amt, description: 'عجز الجرد' }]
    : [{ accountId: p.inventoryAccountId, debit: amt, credit: 0, description: 'زيادة الجرد' }, { accountId: p.varianceAccountId, debit: 0, credit: amt, description: 'زيادة الجرد' }];
  return { id: p.id, date: p.date, reference: p.reference ?? 'COUNT-' + p.date, lines, difference: diff };
}
