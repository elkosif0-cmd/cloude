import type {JournalEntry} from '../finance/ledger-engine';
import type {PayableInvoice} from '../finance/payables-engine';
import type {StockMovement} from '../stock/inventory-engine';

export type PurchaseDocumentLine={
  itemId:string;
  quantity:number;
  unitCostExVat:number;
  vatRate:number;
};

export type PurchaseOrderDocument={
  id:string;
  number:string;
  date:string;
  dueDate:string;
  supplierId:string;
  lines:PurchaseDocumentLine[];
  status:'DRAFT'|'OPEN'|'CLOSED'|'VOID';
};

export type GoodsReceiptDocument={
  id:string;
  number:string;
  date:string;
  purchaseOrderId:string;
  lines:Array<{itemId:string;quantity:number}>;
  status:'DRAFT'|'POSTED'|'VOID';
};

export type ProcurementPostingAccounts={
  inventoryAccountId:string;
  inputVatAccountId:string;
  payableAccountId:string;
  /** the stock account of an item when a sector keeps some goods apart (meat: carcasses → 1310); default inventoryAccountId */
  inventoryAccountFor?:(itemId:string)=>string|undefined;
};

export type ReceiptPostingBundle={
  journal:JournalEntry;
  payable:PayableInvoice;
  stockMovements:StockMovement[];
  taxable:number;
  vat:number;
  total:number;
};

function money(v:number){return Math.round((v+Number.EPSILON)*100)/100;}

export function buildReceiptPosting(order:PurchaseOrderDocument,receipt:GoodsReceiptDocument,accounts:ProcurementPostingAccounts):ReceiptPostingBundle{
  if(order.status==='VOID'||receipt.status==='VOID')throw new Error('VOID_DOCUMENT');
  if(receipt.purchaseOrderId!==order.id)throw new Error('RECEIPT_ORDER_MISMATCH');
  if(!accounts.inventoryAccountId||!accounts.inputVatAccountId||!accounts.payableAccountId)throw new Error('POSTING_ACCOUNTS_REQUIRED');

  const orderLines=new Map(order.lines.map(line=>[line.itemId,line]));
  let taxable=0;
  let vat=0;
  const stockMovements:StockMovement[]=[];
  const byAccount=new Map<string,number>();

  receipt.lines.forEach((received,index)=>{
    const source=orderLines.get(received.itemId);
    if(!source)throw new Error('UNPLANNED_RECEIPT_ITEM');
    const qty=Math.max(0,received.quantity);
    if(qty<=0)throw new Error('RECEIPT_QUANTITY_REQUIRED');
    const lineTaxable=qty*Math.max(0,source.unitCostExVat);
    taxable+=lineTaxable;
    const acc=accounts.inventoryAccountFor?.(received.itemId)||accounts.inventoryAccountId;
    byAccount.set(acc,(byAccount.get(acc)??0)+lineTaxable);
    vat+=lineTaxable*Math.max(0,source.vatRate);
    stockMovements.push({
      id:'purchase-stock-'+receipt.id+'-'+index,
      itemId:received.itemId,
      date:receipt.date,
      type:'PURCHASE',
      quantity:qty,
      unitCost:source.unitCostExVat,
    });
  });

  /* each stock account carries its own goods, rounded per account; the payable is their sum plus the VAT */
  const stock=[...byAccount].map(([accountId,v])=>({accountId,amount:money(v)})).filter(x=>x.amount>0);
  taxable=money(stock.reduce((s,x)=>s+x.amount,0));
  vat=money(vat);
  const total=money(taxable+vat);
  if(total<=0)throw new Error('RECEIPT_TOTAL_MUST_BE_POSITIVE');

  const journal:JournalEntry={
    id:'purchase-journal-'+receipt.id,
    date:receipt.date,
    reference:receipt.number,
    lines:[
      ...stock.map(x=>({accountId:x.accountId,debit:x.amount,credit:0,description:'استلام مخزون - '+receipt.number})),
      ...(vat>0?[{accountId:accounts.inputVatAccountId,debit:vat,credit:0,description:'ضريبة مدخلات - '+receipt.number}]:[]),
      {accountId:accounts.payableAccountId,debit:0,credit:total,description:'ذمم موردين - '+receipt.number},
    ],
  };

  const payable:PayableInvoice={
    id:'purchase-ap-'+receipt.id,
    supplierId:order.supplierId,
    invoiceDate:receipt.date,
    dueDate:order.dueDate,
    amount:total,
    paid:0,
  };

  return {journal,payable,stockMovements,taxable,vat,total};
}
