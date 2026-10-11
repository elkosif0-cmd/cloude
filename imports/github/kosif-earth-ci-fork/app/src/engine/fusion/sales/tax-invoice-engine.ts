import {calculateInvoice,type InvoiceLine} from './invoice-engine';

export type PaymentMethod='cash'|'mada'|'transfer'|'credit';

export type PaymentSplit={method:PaymentMethod;amount:number};

export type TaxInvoice={
  id:string;
  number:string;
  issuedAt:string;
  sellerName:string;
  sellerVatNumber:string;
  customerId?:string;
  customerName?:string;
  lines:InvoiceLine[];
  subtotalExVat:number;
  vat:number;
  totalIncVat:number;
  zatcaTlvBase64:string;
  payments:PaymentSplit[];
  paid:number;
  balance:number;
  status:'OPEN'|'PAID'|'VOID';
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

function utf8(value:string){return new TextEncoder().encode(value);}

function bytesToBase64(bytes:number[]){
  let binary='';
  for(const byte of bytes)binary+=String.fromCharCode(byte);
  return btoa(binary);
}

export function buildZatcaTlv(input:{sellerName:string;vatNumber:string;timestamp:string;total:number;vat:number}){
  const fields=[input.sellerName,input.vatNumber,input.timestamp,String(money(input.total)),String(money(input.vat))];
  const bytes:number[]=[];
  fields.forEach((field,index)=>{
    const encoded=utf8(field);
    if(encoded.length>255)throw new Error('TLV_FIELD_TOO_LONG');
    bytes.push(index+1,encoded.length,...encoded);
  });
  return bytesToBase64(bytes);
}

export function summarizePayments(total:number,payments:PaymentSplit[]){
  const paid=money(payments.reduce((sum,p)=>sum+Math.max(0,p.amount),0));
  const balance=money(Math.max(0,total-paid));
  const change=money(Math.max(0,paid-total));
  return {paid,balance,change,settled:balance===0};
}

export function createTaxInvoice(input:{
  id:string;
  number:string;
  issuedAt:string;
  sellerName:string;
  sellerVatNumber:string;
  customerId?:string;
  customerName?:string;
  lines:InvoiceLine[];
  payments?:PaymentSplit[];
}):TaxInvoice{
  if(!input.sellerName.trim())throw new Error('SELLER_NAME_REQUIRED');
  if(!input.sellerVatNumber.trim())throw new Error('SELLER_VAT_REQUIRED');
  if(input.lines.length===0)throw new Error('INVOICE_LINES_REQUIRED');
  const totals=calculateInvoice(input.lines);
  const payments=(input.payments??[]).filter(p=>p.amount>0);
  const settlement=summarizePayments(totals.totalIncVat,payments);
  return {
    id:input.id,
    number:input.number,
    issuedAt:input.issuedAt,
    sellerName:input.sellerName.trim(),
    sellerVatNumber:input.sellerVatNumber.trim(),
    customerId:input.customerId,
    customerName:input.customerName?.trim()||undefined,
    lines:input.lines,
    subtotalExVat:totals.subtotalExVat,
    vat:totals.vat,
    totalIncVat:totals.totalIncVat,
    zatcaTlvBase64:buildZatcaTlv({
      sellerName:input.sellerName.trim(),
      vatNumber:input.sellerVatNumber.trim(),
      timestamp:input.issuedAt,
      total:totals.totalIncVat,
      vat:totals.vat,
    }),
    payments,
    paid:settlement.paid,
    balance:settlement.balance,
    status:settlement.settled?'PAID':'OPEN',
  };
}

export function applyInvoicePayment(invoice:TaxInvoice,payment:PaymentSplit):TaxInvoice{
  if(invoice.status==='VOID')throw new Error('VOID_INVOICE');
  if(payment.amount<=0)throw new Error('PAYMENT_AMOUNT_REQUIRED');
  const payments=[...invoice.payments,payment];
  const settlement=summarizePayments(invoice.totalIncVat,payments);
  return {...invoice,payments,paid:settlement.paid,balance:settlement.balance,status:settlement.settled?'PAID':'OPEN'};
}
