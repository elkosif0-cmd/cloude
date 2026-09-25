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
