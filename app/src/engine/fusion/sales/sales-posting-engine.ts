import type {JournalEntry,JournalLine} from '../finance/ledger-engine';
import type {ReceivableInvoice} from '../finance/receivables-engine';
import type {StockMovement} from '../stock/inventory-engine';
import {calculateSalesTotals,type SalesLine} from './sales-engine';

export type SalesDocumentStatus='DRAFT'|'POSTED'|'VOID';

export type SalesDocument={
  id:string;
  number:string;
  date:string;
  dueDate:string;
  customerId:string;
  lines:SalesLine[];
  status:SalesDocumentStatus;
};

export type SalesPostingAccounts={
  receivableAccountId:string;
  revenueAccountId:string;
  vatPayableAccountId:string;
};

/** perpetual inventory: each sale also moves its cost from inventory to cost of sales */
export type SalesCosting={
  cogsAccountId:string;
  inventoryAccountId:string;
  /** unit cost excluding VAT, or null/undefined when the item has no known cost */
  unitCost:(itemId:string)=>number|null|undefined;
};

export type SalesPostingBundle={
  journal:JournalEntry;
  receivable:ReceivableInvoice;
  stockMovements:StockMovement[];
  /** cost of sales posted with the sale (0 when no costing was given) */
  cost:number;
  /** items sold without a known cost: their cost is not posted */
  uncosted:string[];
};

function money(value:number){
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function buildCogsLines(lines:SalesDocument['lines'],costing:SalesCosting,reference:string){
  let cost=0;const uncosted:string[]=[];
  for(const line of lines){
    const unit=costing.unitCost(line.itemId);
    if(unit==null||!Number.isFinite(unit)||unit<=0){if(!uncosted.includes(line.itemId))uncosted.push(line.itemId);continue}
    cost+=Math.max(0,line.quantity)*unit;
  }
  cost=money(cost);
  const out:JournalLine[]=cost>0?[
    {accountId:costing.cogsAccountId,debit:cost,credit:0,description:'تكلفة المبيعات - '+reference},
    {accountId:costing.inventoryAccountId,debit:0,credit:cost,description:'صرف من المخزون - '+reference},
  ]:[];
  return {lines:out,cost,uncosted};
}

export function buildSalesPosting(document:SalesDocument,accounts:SalesPostingAccounts,costing?:SalesCosting):SalesPostingBundle{
  if(document.status==='VOID')throw new Error('CANNOT_POST_VOID_SALE');
  if(!document.customerId.trim())throw new Error('CUSTOMER_REQUIRED');
  if(document.lines.length===0)throw new Error('SALES_LINES_REQUIRED');
  if(!accounts.receivableAccountId||!accounts.revenueAccountId||!accounts.vatPayableAccountId)throw new Error('POSTING_ACCOUNTS_REQUIRED');

  const totals=calculateSalesTotals(document.lines);
  if(totals.total<=0)throw new Error('SALE_TOTAL_MUST_BE_POSITIVE');
  if(costing&&(!costing.cogsAccountId||!costing.inventoryAccountId))throw new Error('COSTING_ACCOUNTS_REQUIRED');
  const cogs=costing?buildCogsLines(document.lines,costing,document.number):{lines:[],cost:0,uncosted:[]};

  const journal:JournalEntry={
    id:'sales-journal-'+document.id,
    date:document.date,
    reference:document.number,
    lines:[
      {accountId:accounts.receivableAccountId,debit:totals.total,credit:0,description:'ذمم مدينة - '+document.number},
      {accountId:accounts.revenueAccountId,debit:0,credit:totals.taxable,description:'مبيعات - '+document.number},
      ...(totals.vat>0?[{accountId:accounts.vatPayableAccountId,debit:0,credit:totals.vat,description:'ضريبة مخرجات - '+document.number}]:[]),
      ...cogs.lines,
    ],
  };

  const receivable:ReceivableInvoice={
    id:'sales-ar-'+document.id,
    customerId:document.customerId,
    invoiceDate:document.date,
    dueDate:document.dueDate,
    amount:totals.total,
    paid:0,
  };

  const stockMovements:StockMovement[]=document.lines.map((line,index)=>({
    id:'sales-stock-'+document.id+'-'+index,
    itemId:line.itemId,
    date:document.date,
    type:'SALE',
    quantity:Math.max(0,line.quantity),
  }));

  return {journal,receivable,stockMovements,cost:cogs.cost,uncosted:cogs.uncosted};
}
