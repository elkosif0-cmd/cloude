export type InvoiceLine={
  description:string;
  quantity:number;
  unitPriceExVat:number;
  vatRate:number;
  discountExVat?:number;
};

export type InvoiceLineTotal={
  description:string;
  netExVat:number;
  vat:number;
  totalIncVat:number;
};

export type InvoiceTotals={
  lines:InvoiceLineTotal[];
  subtotalExVat:number;
  vat:number;
  totalIncVat:number;
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

export function calculateInvoice(lines:InvoiceLine[]):InvoiceTotals{
  const totals=lines.map((line)=>{
    const gross=Math.max(0,line.quantity)*Math.max(0,line.unitPriceExVat);
    const discount=Math.min(gross,Math.max(0,line.discountExVat??0));
    const net=gross-discount;
    const vat=net*Math.max(0,line.vatRate);
    return {description:line.description,netExVat:money(net),vat:money(vat),totalIncVat:money(net+vat)};
  });
  return {
    lines:totals,
    subtotalExVat:money(totals.reduce((sum,row)=>sum+row.netExVat,0)),
    vat:money(totals.reduce((sum,row)=>sum+row.vat,0)),
    totalIncVat:money(totals.reduce((sum,row)=>sum+row.totalIncVat,0)),
  };
}
