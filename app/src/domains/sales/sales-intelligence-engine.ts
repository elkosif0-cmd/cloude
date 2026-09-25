import type {Customer} from './customers-engine';
import type {TaxInvoice} from './tax-invoice-engine';

export type CustomerSalesClass='A'|'B'|'C';

export type CustomerSalesMetric={
  customerId:string;
  customerName:string;
  invoiceCount:number;
  revenueIncVat:number;
  vat:number;
  paid:number;
  outstanding:number;
  averageInvoice:number;
  firstInvoiceDate?:string;
  lastInvoiceDate?:string;
  daysSinceLastInvoice?:number;
  revenueSharePercent:number;
  cumulativeRevenuePercent:number;
  abcClass:CustomerSalesClass;
};

export type SalesIntelligenceSummary={
  rows:CustomerSalesMetric[];
  totalRevenueIncVat:number;
  totalVat:number;
  totalPaid:number;
  totalOutstanding:number;
  invoices:number;
  customersWithSales:number;
  averageInvoice:number;
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}
function percent(value:number){return Math.round((value+Number.EPSILON)*100)/100;}
function daysBetween(fromIso:string,toIso:string){
  const from=Date.parse(fromIso.slice(0,10)+'T00:00:00Z');
  const to=Date.parse(toIso.slice(0,10)+'T00:00:00Z');
  if(!Number.isFinite(from)||!Number.isFinite(to))return undefined;
  return Math.max(0,Math.floor((to-from)/86_400_000));
}

export function buildSalesIntelligence(input:{customers:Customer[];invoices:TaxInvoice[];asOfDate:string}):SalesIntelligenceSummary{
  const customerMap=new Map(input.customers.map(customer=>[customer.id,customer]));
  const valid=input.invoices.filter(invoice=>invoice.status!=='VOID');
  const groups=new Map<string,{name:string;invoices:TaxInvoice[]}>();

  valid.forEach(invoice=>{
    const id=invoice.customerId||('walk-in:'+String(invoice.customerName||'بدون عميل').trim().toLowerCase());
    const customer=invoice.customerId?customerMap.get(invoice.customerId):undefined;
    const name=customer?.name||invoice.customerName||'بدون عميل';
    const group=groups.get(id)??{name,invoices:[]};
    group.invoices.push(invoice);
    groups.set(id,group);
  });

  const totalRevenueIncVat=money(valid.reduce((sum,invoice)=>sum+invoice.totalIncVat,0));
  const totalVat=money(valid.reduce((sum,invoice)=>sum+invoice.vat,0));
  const totalPaid=money(valid.reduce((sum,invoice)=>sum+invoice.paid,0));
  const totalOutstanding=money(valid.reduce((sum,invoice)=>sum+invoice.balance,0));

  const raw=[...groups.entries()].map(([customerId,group])=>{
    const ordered=[...group.invoices].sort((a,b)=>a.issuedAt.localeCompare(b.issuedAt));
    const revenueIncVat=money(ordered.reduce((sum,invoice)=>sum+invoice.totalIncVat,0));
    const vat=money(ordered.reduce((sum,invoice)=>sum+invoice.vat,0));
    const paid=money(ordered.reduce((sum,invoice)=>sum+invoice.paid,0));
    const outstanding=money(ordered.reduce((sum,invoice)=>sum+invoice.balance,0));
    const firstInvoiceDate=ordered[0]?.issuedAt;
    const lastInvoiceDate=ordered.at(-1)?.issuedAt;
    return {
      customerId,
      customerName:group.name,
      invoiceCount:ordered.length,
      revenueIncVat,
      vat,
      paid,
      outstanding,
      averageInvoice:ordered.length?money(revenueIncVat/ordered.length):0,
      firstInvoiceDate,
      lastInvoiceDate,
      daysSinceLastInvoice:lastInvoiceDate?daysBetween(lastInvoiceDate,input.asOfDate):undefined,
    };
  }).sort((a,b)=>b.revenueIncVat-a.revenueIncVat||a.customerName.localeCompare(b.customerName,'ar'));

  let cumulative=0;
  const rows:CustomerSalesMetric[]=raw.map(row=>{
    const share=totalRevenueIncVat===0?0:(row.revenueIncVat/totalRevenueIncVat)*100;
    const before=cumulative;
    cumulative+=share;
    const abcClass:CustomerSalesClass=before<80?'A':before<95?'B':'C';
    return {...row,revenueSharePercent:percent(share),cumulativeRevenuePercent:percent(cumulative),abcClass};
  });

  return {
    rows,
    totalRevenueIncVat,
    totalVat,
    totalPaid,
    totalOutstanding,
    invoices:valid.length,
    customersWithSales:rows.length,
    averageInvoice:valid.length?money(totalRevenueIncVat/valid.length):0,
  };
}
