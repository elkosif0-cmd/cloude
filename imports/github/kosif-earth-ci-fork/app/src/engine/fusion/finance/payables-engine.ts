export type PayableInvoice={
  id:string;
  supplierId:string;
  invoiceDate:string;
  dueDate:string;
  amount:number;
  paid:number;
};

export type PayablesBucket='current'|'1-30'|'31-60'|'61-90'|'90+';

export type AgedPayable=PayableInvoice&{
  outstanding:number;
  daysPastDue:number;
  bucket:PayablesBucket;
};

export type PayablesSummary={
  rows:AgedPayable[];
  totals:Record<PayablesBucket,number>;
  outstanding:number;
};

function money(v:number){return Math.round((v+Number.EPSILON)*100)/100;}
function days(fromIso:string,toIso:string){
  const from=Date.parse(fromIso+'T00:00:00Z'),to=Date.parse(toIso+'T00:00:00Z');
  if(!Number.isFinite(from)||!Number.isFinite(to))return 0;
  return Math.max(0,Math.floor((to-from)/86_400_000));
}
function bucketFor(value:number):PayablesBucket{
  if(value<=0)return 'current';
  if(value<=30)return '1-30';
  if(value<=60)return '31-60';
  if(value<=90)return '61-90';
  return '90+';
}

export function agePayables(invoices:PayableInvoice[],asOfDate:string):PayablesSummary{
  const rows=invoices.map(invoice=>{
    const outstanding=money(Math.max(0,invoice.amount-invoice.paid));
    const daysPastDue=outstanding===0?0:days(invoice.dueDate,asOfDate);
    return {...invoice,outstanding,daysPastDue,bucket:bucketFor(daysPastDue)};
  }).filter(row=>row.outstanding>0);

  const totals:Record<PayablesBucket,number>={current:0,'1-30':0,'31-60':0,'61-90':0,'90+':0};
  for(const row of rows)totals[row.bucket]=money(totals[row.bucket]+row.outstanding);
  return {rows,totals,outstanding:money(rows.reduce((sum,row)=>sum+row.outstanding,0))};
}
