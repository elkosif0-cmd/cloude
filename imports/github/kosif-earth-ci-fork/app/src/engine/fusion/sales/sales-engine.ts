export type SalesLine = {
  itemId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  vatRate?: number;
  /** the unit price and discount already include VAT (a till receipt): the tax is taken out of the amount paid, never added to it */
  priceIncludesVat?: boolean;
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
  let taxable=0;
  let vat=0;

  for(const line of lines){
    const qty=Math.max(0,line.quantity);
    const unit=Math.max(0,line.unitPrice);
    const gross=qty*unit;
    const lineDiscount=Math.min(gross,Math.max(0,line.discount ?? 0));
    const net=gross-lineDiscount;
    const rate=Math.max(0,line.vatRate ?? 0);
    if(line.priceIncludesVat){
      const split=splitVatInclusive(net,rate);
      const discountEx=money(lineDiscount/(1+rate));
      subtotal+=split.net+discountEx;
      discount+=discountEx;
      taxable+=split.net;
      vat+=split.vat;
    }else{
      subtotal+=gross;
      discount+=lineDiscount;
      taxable+=net;
      vat+=net*rate;
    }
  }

  const taxableMoney=money(taxable);
  const vatMoney=money(vat);
  return {
    subtotal:money(subtotal),
    discount:money(discount),
    taxable:taxableMoney,
    vat:vatMoney,
    /* the total is the sum of the rounded parts, so a journal built from them always balances */
    total:money(taxableMoney+vatMoney),
  };
}

/** splits an amount that already includes VAT: net = round(gross ÷ (1+rate)), VAT = gross − net, so the parts add back to the halala */
export function splitVatInclusive(gross:number,rate:number){
  const g=money(Math.max(0,gross));
  const r=Math.max(0,rate);
  const net=money(g/(1+r));
  return {gross:g,net,vat:money(g-net)};
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
