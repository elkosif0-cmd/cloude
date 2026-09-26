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
