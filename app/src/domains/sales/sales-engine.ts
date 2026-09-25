export type SalesLine = {
  itemId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  vatRate?: number;
};

export type SalesTotals = {
  subtotal: number;
  discount: number;
  taxable: number;
  vat: number;
  total: number;
};

function money(value:number){
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateSalesTotals(lines:SalesLine[]):SalesTotals{
  let subtotal=0;
  let discount=0;
  let vat=0;

  for(const line of lines){
    const qty=Math.max(0,line.quantity);
    const unit=Math.max(0,line.unitPrice);
    const gross=qty*unit;
    const lineDiscount=Math.min(gross,Math.max(0,line.discount ?? 0));
    const net=gross-lineDiscount;
    const rate=Math.max(0,line.vatRate ?? 0);
    subtotal+=gross;
    discount+=lineDiscount;
    vat+=net*rate;
  }

  const taxable=subtotal-discount;
  return {
    subtotal:money(subtotal),
    discount:money(discount),
    taxable:money(taxable),
    vat:money(vat),
    total:money(taxable+vat),
  };
}

export function grossMargin(params:{revenue:number;cost:number}){
  const revenue=Math.max(0,params.revenue);
  const cost=Math.max(0,params.cost);
  const profit=money(revenue-cost);
  return {
    profit,
    marginPercent: revenue === 0 ? 0 : money((profit/revenue)*100),
  };
}
