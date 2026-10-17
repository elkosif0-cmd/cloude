export type PurchaseOrderLine = {
  itemId: string;
  orderedQty: number;
  unitCost: number;
};

export type GoodsReceiptLine = {
  itemId: string;
  receivedQty: number;
};

export type ReceiptVariance = {
  itemId: string;
  orderedQty: number;
  receivedQty: number;
  varianceQty: number;
  status: 'MATCH' | 'SHORT' | 'OVER' | 'UNPLANNED';
};

export function matchReceipt(order:PurchaseOrderLine[],receipt:GoodsReceiptLine[]):ReceiptVariance[]{
  const orderMap=new Map(order.map((line)=>[line.itemId,line]));
  const receiptMap=new Map<string,number>();

  for(const line of receipt){
    receiptMap.set(line.itemId,(receiptMap.get(line.itemId)??0)+Math.max(0,line.receivedQty));
  }

  const itemIds=new Set([...orderMap.keys(),...receiptMap.keys()]);
  const rows:ReceiptVariance[]=[];

  for(const itemId of itemIds){
    const ordered=Math.max(0,orderMap.get(itemId)?.orderedQty??0);
    const received=receiptMap.get(itemId)??0;
    const variance=received-ordered;
    let status:ReceiptVariance['status']='MATCH';
    if(!orderMap.has(itemId)) status='UNPLANNED';
    else if(variance<0) status='SHORT';
    else if(variance>0) status='OVER';
    rows.push({itemId,orderedQty:ordered,receivedQty:received,varianceQty:variance,status});
  }

  return rows.sort((a,b)=>a.itemId.localeCompare(b.itemId));
}

export function purchaseOrderValue(lines:PurchaseOrderLine[]){
  return Math.round(lines.reduce((sum,line)=>sum+Math.max(0,line.orderedQty)*Math.max(0,line.unitCost),0)*100)/100;
}
