import type {JournalEntry} from '../finance/ledger-engine';
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

export type SalesPostingBundle={
  journal:JournalEntry;
  receivable:ReceivableInvoice;
  stockMovements:StockMovement[];
};

export function buildSalesPosting(document:SalesDocument,accounts:SalesPostingAccounts):SalesPostingBundle{
  if(document.status==='VOID')throw new Error('CANNOT_POST_VOID_SALE');
  if(!document.customerId.trim())throw new Error('CUSTOMER_REQUIRED');
  if(document.lines.length===0)throw new Error('SALES_LINES_REQUIRED');
  if(!accounts.receivableAccountId||!accounts.revenueAccountId||!accounts.vatPayableAccountId)throw new Error('POSTING_ACCOUNTS_REQUIRED');

  const totals=calculateSalesTotals(document.lines);
  if(totals.total<=0)throw new Error('SALE_TOTAL_MUST_BE_POSITIVE');

  const journal:JournalEntry={
    id:'sales-journal-'+document.id,
    date:document.date,
    reference:document.number,
    lines:[
      {accountId:accounts.receivableAccountId,debit:totals.total,credit:0,description:'ذمم مدينة - '+document.number},
      {accountId:accounts.revenueAccountId,debit:0,credit:totals.taxable,description:'مبيعات - '+document.number},
      ...(totals.vat>0?[{accountId:accounts.vatPayableAccountId,debit:0,credit:totals.vat,description:'ضريبة مخرجات - '+document.number}]:[]),
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

  return {journal,receivable,stockMovements};
}
