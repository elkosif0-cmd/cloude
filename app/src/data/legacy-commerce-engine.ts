export type LegacyCommerceRecord={
  id:string;
  store:string;
  row:any;
};

export type LegacyOrderLineCandidate={
  sourceId:string;
  legacyItemRef:string;
  description:string;
  quantity:number;
  unitPrice:number;
  discount:number;
  mappedItemId?:string;
};

export type LegacyOrderCandidate={
  sourceId:string;
  number:string;
  date:string;
  customerName:string;
  customerPhone:string;
  customerId?:string;
  legacyTotal:number;
  status:string;
  lines:LegacyOrderLineCandidate[];
  confidence:number;
  readiness:'READY'|'REVIEW';
  issues:string[];
};

export type LegacyPaymentCandidate={
  sourceId:string;
  orderRef:string;
  date:string;
  amount:number;
  method:string;
  confidence:number;
};

type CatalogLike={id:string;sku:string;name:string};
type CustomerLike={id:string;name:string;phone?:string};

function clean(value:unknown){return String(value??'').trim();}
function num(value:unknown){
  const n=Number(clean(value).replace(/[,\s]/g,''));
  return Number.isFinite(n)?n:0;
}
function normalized(value:unknown){
  return clean(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
}
function pick(row:any,names:string[]){
  for(const name of names)if(row?.[name]!==undefined&&row?.[name]!==null&&clean(row[name]))return row[name];
  const normalizedKeys=Object.keys(row??{}).map(key=>[key,normalized(key).replace(/\s/g,'')] as const);
  for(const name of names){
    const target=normalized(name).replace(/\s/g,'');
    const found=normalizedKeys.find(([,key])=>key===target);
    if(found&&clean(row[found[0]]))return row[found[0]];
  }
  return undefined;
}

function orderId(row:any){
  return clean(pick(row,['order_id','orderId','order','sale_id','saleId','invoice_id','invoiceId','transaction_id','transactionId']));
}

function rowId(row:any,fallback:string){
  return clean(pick(row,['id','uuid','key','row_id','rowId']))||fallback;
}

function autoItem(ref:string,description:string,items:CatalogLike[]){
  const a=normalized(ref),b=normalized(description);
  return items.find(item=>{
    const id=normalized(item.id),sku=normalized(item.sku),name=normalized(item.name);
    return Boolean(a&&(a===id||a===sku||a===name))||Boolean(b&&(b===name||b===sku));
  })?.id;
}

function autoCustomer(name:string,phone:string,customers:CustomerLike[]){
  const digits=phone.replace(/\D/g,'');
  return customers.find(customer=>{
    const customerDigits=(customer.phone??'').replace(/\D/g,'');
    return Boolean(digits&&customerDigits&&digits===customerDigits)||Boolean(name&&normalized(customer.name)===normalized(name));
  })?.id;
}

export function extractLegacyCommerce(records:LegacyCommerceRecord[],items:CatalogLike[],customers:CustomerLike[]){
  const orders=records.filter(record=>record.store==='orders'||record.store==='ops_orders');
  const lineRecords=records.filter(record=>record.store==='order_items'||record.store==='sales_lines');
  const paymentRecords=records.filter(record=>record.store==='payments');
  const linesByOrder=new Map<string,LegacyCommerceRecord[]>();

  for(const record of lineRecords){
    const oid=orderId(record.row);
    if(!oid)continue;
    const rows=linesByOrder.get(oid)??[];
    rows.push(record);linesByOrder.set(oid,rows);
  }

  const orderCandidates:LegacyOrderCandidate[]=orders.map((record,index)=>{
    const row=record.row??{};
    const oid=orderId(row)||rowId(row,String(index+1));
    const number=clean(pick(row,['number','order_no','orderNo','invoice_no','invoiceNo','reference','ref']))||oid;
    const date=clean(pick(row,['date','order_date','orderDate','created_at','createdAt','issued_at','issuedAt'])).slice(0,10);
    const customerName=clean(pick(row,['customer_name','customerName','customer','name']));
    const customerPhone=clean(pick(row,['customer_phone','customerPhone','phone','mobile']));
    const rawLines=linesByOrder.get(oid)??[];
    const lines:LegacyOrderLineCandidate[]=rawLines.map((lineRecord,lineIndex)=>{
      const x=lineRecord.row??{};
      const legacyItemRef=clean(pick(x,['item_id','itemId','sku','product_id','productId','code']));
      const description=clean(pick(x,['description','item_name','itemName','product_name','productName','name']));
      return {
        sourceId:rowId(x,lineRecord.id||String(lineIndex+1)),
        legacyItemRef,
        description,
        quantity:num(pick(x,['quantity','qty','weight','kg'])),
        unitPrice:num(pick(x,['unit_price','unitPrice','price','selling_price','sellingPrice'])),
        discount:num(pick(x,['discount','discount_amount','discountAmount'])),
        mappedItemId:autoItem(legacyItemRef,description,items),
      };
    });
    const legacyTotal=num(pick(row,['total','grand_total','grandTotal','amount','net_total','netTotal']));
    const issues:string[]=[];
    if(!date)issues.push('MISSING_DATE');
    if(lines.length===0)issues.push('MISSING_LINES');
    if(lines.some(line=>line.quantity<=0))issues.push('INVALID_QUANTITY');
    if(lines.some(line=>!line.mappedItemId))issues.push('UNMAPPED_ITEM');
    const mappedCustomer=autoCustomer(customerName,customerPhone,customers);
    let confidence=20;
    if(date)confidence+=20;
    if(customerName||customerPhone)confidence+=10;
    if(mappedCustomer)confidence+=10;
    if(lines.length)confidence+=20;
    if(lines.length&&lines.every(line=>line.mappedItemId))confidence+=20;
    return {
      sourceId:oid,number,date,customerName,customerPhone,customerId:mappedCustomer,legacyTotal,
      status:clean(pick(row,['status','state']))||'legacy',
      lines,confidence:Math.min(100,confidence),readiness:issues.length===0?'READY':'REVIEW',issues
    };
  });

  const payments:LegacyPaymentCandidate[]=paymentRecords.map((record,index)=>{
    const row=record.row??{};
    const date=clean(pick(row,['date','payment_date','paymentDate','created_at','createdAt'])).slice(0,10);
    const amount=num(pick(row,['amount','paid','value','total']));
    const orderRef=orderId(row)||clean(pick(row,['reference','ref','invoice_no','invoiceNo']));
    let confidence=20;if(date)confidence+=25;if(amount>0)confidence+=35;if(orderRef)confidence+=20;
    return {sourceId:rowId(row,record.id||String(index+1)),orderRef,date,amount,method:clean(pick(row,['method','payment_method','paymentMethod','type']))||'unknown',confidence};
  });

  return {orders:orderCandidates,payments};
}

export function applyItemMappings(order:LegacyOrderCandidate,mappings:Record<string,string>):LegacyOrderCandidate{
  const lines=order.lines.map((line,index)=>({...line,mappedItemId:mappings[order.sourceId+':'+index]||line.mappedItemId}));
  const issues=order.issues.filter(issue=>issue!=='UNMAPPED_ITEM');
  if(lines.some(line=>!line.mappedItemId))issues.push('UNMAPPED_ITEM');
  return {...order,lines,issues,readiness:issues.length===0?'READY':'REVIEW'};
}

export function toHistoricalOrder(order:LegacyOrderCandidate){
  if(order.readiness!=='READY')throw new Error('LEGACY_ORDER_NOT_READY');
  return {
    id:'historical-order-'+order.sourceId,
    legacySourceId:order.sourceId,
    number:order.number,
    date:order.date,
    customerId:order.customerId,
    customerName:order.customerName||undefined,
    customerPhone:order.customerPhone||undefined,
    legacyTotal:order.legacyTotal,
    legacyStatus:order.status,
    lines:order.lines.map(line=>({
      itemId:line.mappedItemId!,
      quantity:line.quantity,
      unitPrice:line.unitPrice,
      discount:line.discount,
      sourceId:line.sourceId,
    })),
    importedAt:new Date().toISOString(),
    postingPolicy:'HISTORICAL_NO_AUTO_POST' as const,
  };
}

export function toHistoricalPayment(payment:LegacyPaymentCandidate){
  if(payment.amount<=0)throw new Error('LEGACY_PAYMENT_AMOUNT_INVALID');
  return {...payment,id:'historical-payment-'+payment.sourceId,importedAt:new Date().toISOString(),postingPolicy:'HISTORICAL_NO_AUTO_POST' as const};
}
