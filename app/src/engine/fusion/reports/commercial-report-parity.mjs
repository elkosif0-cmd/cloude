/**
 * KOSIF EARTH commercial report parity model, pure/read-only.
 * Synthetic contract first: only explicit company-owned, monetary source records;
 * never infer amounts, VAT percentages, payment settlement, or company ownership.
 * This is NOT a posting engine or an approved price-list printer.
 */
const OWN=/^[\p{L}\p{N}_.:-]{1,128}$/u;
const id=(v,k)=>{if(typeof v!=='string'||!OWN.test(v))throw Error(k+'_INVALID');return v};
const money=(v,k)=>{
  if(typeof v==='bigint'){if(v<0n)throw Error(k+'_NEGATIVE');if(v>BigInt(Number.MAX_SAFE_INTEGER))throw Error(k+'_TOO_LARGE');return v}
  if(typeof v!=='string'&&!Number.isFinite(v))throw Error(k+'_AMOUNT_MISSING');
  const s=String(v);
  if(!/^\d+(?:\.\d{1,2})?$/.test(s))throw Error(k+'_AMOUNT_INVALID');
  const [units,fraction='']=s.split('.');
  const parsed=BigInt(units)*100n+BigInt(fraction.padEnd(2,'0'));
  if(parsed>BigInt(Number.MAX_SAFE_INTEGER))throw Error(k+'_TOO_LARGE');
  return parsed;
};
const minor=v=>{
  const abs=v<0n?-v:v;
  return (v<0n?'-':'')+(abs/100n).toString()+'.'+(abs%100n).toString().padStart(2,'0');
};
const requireRate=rate=>{
  if(typeof rate!=='number'||!Number.isFinite(rate)||rate<0||rate>1)
    throw Error('COMPANY_VAT_RATE_REQUIRED');
  return rate;
};
const name=x=>String(x??'').slice(0,300);
const list=v=>Array.isArray(v)?v:[];
function checkRow(row,scope){
  if(!row||typeof row!=='object'||Array.isArray(row))throw Error('REPORT_ROW_INVALID');
  if(row.companyId!==scope.companyId)throw Error('REPORT_ROW_OWNER_MISMATCH');
  if(row.workspaceId!==scope.workspaceId)throw Error('REPORT_ROW_WORKSPACE_MISMATCH');
}
function vatDivisor(vat){
  // 100 basis points per 1%, with 0.01% resolution, no implicit 15% defaults.
  const bps=Math.round(vat*10000);
  if(Math.abs(vat-bps/10000)>1e-9)throw Error('COMPANY_VAT_PRECISION_UNSUPPORTED');
  return BigInt(10000+bps);
}
function netOfGrossMinor(gross,vat){
  const denom=vatDivisor(vat);
  // Rounds half up to nearest halala; report output uses exact integer math.
  return (gross*10000n+denom/2n)/denom;
}
const percent=(num,den)=>den===0n?null:Number((num*1000000n)/den)/10000;
// percent() returns percentage to four decimals, not proportion.
const rateString=(value)=>value===null?null:value.toFixed(4)+'%';
function finance(grossMinor,costMinor,vatRate){
  const net=netOfGrossMinor(grossMinor,vatRate);
  const profit=net-costMinor;
  const ratio=net>0n?rateString(percent(profit,net)):null;
  return {sellingGross:minor(grossMinor),sellingNet:minor(net),
    costNet:minor(costMinor),profitNet:minor(profit),marginPercent:ratio};
}
function normalizeScope({companyId,workspaceId,vatRate}={}){
  const exactRate=requireRate(vatRate);
  vatDivisor(exactRate);
  return {companyId:id(companyId,'COMPANY'),workspaceId:id(workspaceId,'WORKSPACE'),
    vatRate:exactRate};
}
function catEntry(row,scope){
  checkRow(row,scope);
  const kind=id(row.kind,'KIND');
  if(!['raw','box'].includes(kind))throw Error('CATALOG_KIND_INVALID');
  return {code:id(row.code,'CATALOG_CODE'),kind,name:name(row.name),category:name(row.category),
    archived:row.archived===true||row.status==='archived',
    gross:money(row.sellingGross,'SELLING_GROSS'),cost:money(row.costNet,'COST_NET'),original:row};
}
function commercialLines(rows,scope){
  const active=list(rows).map(r=>catEntry(r,scope)).filter(r=>!r.archived);
  if(new Set(active.map(x=>x.code.toLowerCase())).size!==active.length)throw Error('DUPLICATE_CATALOG_CODE');
  return active.sort((a,b)=>a.code.localeCompare(b.code,'en'));
}
function catalogMargins(entries,scope){
  return entries.map(e=>({kind:e.kind,code:e.code,name:e.name,category:e.category,
    ...finance(e.gross,e.cost,scope.vatRate)}));
}
function boxEngineering(entries,scope){
  return entries.filter(x=>x.kind==='box').map(x=>{
    const row=x.original,breakdown=row.breakdown;
    if(!breakdown||typeof breakdown!=='object')throw Error('BOX_BREAKDOWN_REQUIRED');
    const components=list(row.components);
    const dishes=Number(row.dishesCount),weight=Number(row.totalWeightKg);
    if(!Number.isInteger(dishes)||dishes<0||!Number.isFinite(weight)||weight<0)
      throw Error('BOX_QUANTITIES_INVALID');
    const compCost=money(breakdown.componentsCostNet,'BOX_COMPONENT_COST'),
      packaging=money(breakdown.packagingCostNet,'BOX_PACKAGING_COST'),
      expenses=money(breakdown.expensesCostNet,'BOX_EXPENSES_COST');
    if(compCost+packaging+expenses!==x.cost)throw Error('BOX_COST_RECONCILIATION_FAILED');
    return {code:x.code,name:x.name,componentCount:components.length,dishesCount:dishes,
      totalWeightKg:weight,breakdown:{componentsCostNet:minor(compCost),
        packagingCostNet:minor(packaging),expensesCostNet:minor(expenses)},
      ...finance(x.gross,x.cost,scope.vatRate)};
  });
}
function prices(entries,scope){
  return entries.map(e=>({kind:e.kind,code:e.code,name:e.name,category:e.category,
    sellingGross:minor(e.gross),vatRate:scope.vatRate,
    priceBasis:'gross-including-company-configured-vat'}));
}
function collections(orders,scope){
  const arr=list(orders).map(row=>{
    checkRow(row,scope);
    const ref=id(row.orderNumber,'ORDER_NUMBER');
    if(row.settlementVerified!==true)throw Error('SETTLEMENT_NOT_VERIFIED');
    const total=money(row.totalGross,'ORDER_TOTAL'),
      paid=money(row.paidTotal,'ORDER_PAID');
    if(paid>total)throw Error('ORDER_OVERPAYMENT_REQUIRES_CREDIT_LEDGER');
    const outstanding=total-paid;
    if(row.remainingTotal!==undefined&&money(row.remainingTotal,'ORDER_REMAINING')!==outstanding)
      throw Error('ORDER_RECONCILIATION_FAILED');
    return {orderNumber:ref,orderDate:name(row.orderDate),customer:name(row.customerName),
      paymentMethod:name(row.paymentMethod),totalGross:minor(total),paidTotal:minor(paid),
      remainingTotal:minor(outstanding),
      status:outstanding===0n?'paid':paid===0n?'unpaid':'partial'};
  });
  if(new Set(arr.map(o=>o.orderNumber.toLowerCase())).size!==arr.length)throw Error('DUPLICATE_ORDER_NUMBER');
  // Aggregation is integer-only. Order sales != receipts.
  const totals=arr.reduce((s,o)=>({
    invoiced:s.invoiced+money(o.totalGross,'INVOICE'),
    collected:s.collected+money(o.paidTotal,'COLLECTED'),
    outstanding:s.outstanding+money(o.remainingTotal,'OUTSTANDING')
  }),{invoiced:0n,collected:0n,outstanding:0n});
  return {rows:arr.sort((a,b)=>a.orderNumber.localeCompare(b.orderNumber,'en')),
    totals:Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,minor(v)]))};
}
export function buildCommercialReport({type,catalog=[],orders=[],scope}={}){
  const binding=normalizeScope(scope);
  if(!['catalog_margins','box_engineering','price_list','sales_collections'].includes(type))
    throw Error('REPORT_TYPE_UNSUPPORTED');
  const entries=type==='sales_collections'?[]:commercialLines(catalog,binding);
  let rows=[],totals=null;
  if(type==='catalog_margins')rows=catalogMargins(entries,binding);
  else if(type==='box_engineering')rows=boxEngineering(entries,binding);
  else if(type==='price_list')rows=prices(entries,binding);
  else {const result=collections(orders,binding);rows=result.rows;totals=result.totals}
  return {schema:'kosif-commercial-report-parity-v1',type,
    scope:{companyId:binding.companyId,workspaceId:binding.workspaceId},
    vatRate:binding.vatRate,classification:'company-confidential-commercial-draft',
    approvalStatus:'not-authorized-for-issuance',amountUnit:'SAR',
    totals,rows,
    warnings:['Numeric parity draft only; verify source ledger, permissions and VAT policy before use.',
      'Paid amounts represent reconciled settlements, not invoiced revenue.']};
}

const REPORT_COLUMNS=Object.freeze({
  catalog_margins:['kind','code','name','category','sellingGross','sellingNet','costNet','profitNet','marginPercent'],
  box_engineering:['code','name','componentCount','dishesCount','totalWeightKg','sellingGross','sellingNet','costNet','profitNet','marginPercent'],
  price_list:['kind','code','name','category','sellingGross','vatRate','priceBasis'],
  sales_collections:['orderNumber','orderDate','customer','paymentMethod','totalGross','paidTotal','remainingTotal','status']
});
function csvQuoted(value){
  const content=String(value??'');
  // Neutralise formula-like strings including Unicode directional/invisible prefixes.
  const unsafe=/^[\s\x00-\x1f\u200b-\u200f\u202a-\u202e\ufeff]*[=+\-@]/u.test(content);
  const cleaned=(unsafe?"'":'')+content;
  return '"'+cleaned.replace(/"/g,'""')+'"';
}
/** Produces an Excel-compatible draft. Only accepts the strict model schema. */
export function serializeCommercialReportCsv(report){
  if(report?.schema!=='kosif-commercial-report-parity-v1'||!REPORT_COLUMNS[report?.type])
    throw Error('COMMERCIAL_CSV_SCHEMA_INVALID');
  if(report.approvalStatus!=='not-authorized-for-issuance')
    throw Error('COMMERCIAL_CSV_APPROVAL_STATUS_INVALID');
  const scope=report.scope;
  id(scope?.companyId,'COMPANY');id(scope?.workspaceId,'WORKSPACE');
  const head=[['Schema',report.schema],['Type',report.type],
    ['Company',scope.companyId],['Workspace',scope.workspaceId],
    ['Classification',report.classification],['Approval',report.approvalStatus]];
  const columns=REPORT_COLUMNS[report.type];
  if(!Array.isArray(report.rows))throw Error('COMMERCIAL_CSV_ROWS_INVALID');
  const output=[...head.map(r=>r.map(csvQuoted).join(',')),'',
    columns.map(csvQuoted).join(','),
    ...report.rows.map(row=>columns.map(key=>csvQuoted(row[key])).join(','))];
  if(report.type==='sales_collections')for(const [k,v] of Object.entries(report.totals||{}))
    output.push([csvQuoted('total-'+k),csvQuoted(v)].join(','));
  return '\uFEFF'+output.join('\r\n')+'\r\n';
}
