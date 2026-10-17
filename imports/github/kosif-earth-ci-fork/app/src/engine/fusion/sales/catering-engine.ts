export type CateringProfile='bbq'|'family'|'formal'|'keto'|'custom';

export type CateringQuote={
  id:string;
  title:string;
  customerId?:string;
  customerName?:string;
  customerPhone?:string;
  guests:number;
  profile:CateringProfile;
  gramsPerGuest?:number;
  meatCostPerKg:number;
  marginPercent:number;
  vatRate:number;
  marinated:boolean;
  marinationCostPerKg:number;
  toolsPack:boolean;
  toolsCostPerGuest:number;
  notes?:string;
  createdAt:string;
};

export type CateringEconomics={
  gramsPerGuest:number;
  totalRawKg:number;
  meatCost:number;
  marinationCost:number;
  toolsCost:number;
  totalCostExVat:number;
  targetPriceExVat:number;
  vat:number;
  finalPriceIncVat:number;
  pricePerGuestIncVat:number;
  expectedProfitExVat:number;
};

const PROFILE_GRAMS:Record<Exclude<CateringProfile,'custom'>,number>={
  bbq:450,
  family:350,
  formal:500,
  keto:300,
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

export function cateringGrams(profile:CateringProfile,custom?:number){
  if(profile==='custom')return Math.max(1,custom??350);
  return PROFILE_GRAMS[profile];
}

export function calculateCatering(quote:CateringQuote):CateringEconomics{
  const guests=Math.max(1,quote.guests);
  const gramsPerGuest=cateringGrams(quote.profile,quote.gramsPerGuest);
  const totalRawKg=(guests*gramsPerGuest)/1000;
  const meatCost=totalRawKg*Math.max(0,quote.meatCostPerKg);
  const marinationCost=quote.marinated?totalRawKg*Math.max(0,quote.marinationCostPerKg):0;
  const toolsCost=quote.toolsPack?guests*Math.max(0,quote.toolsCostPerGuest):0;
  const totalCostExVat=meatCost+marinationCost+toolsCost;
  const margin=Math.min(.9,Math.max(0,quote.marginPercent/100));
  const targetPriceExVat=margin>=1?0:totalCostExVat/(1-margin);
  const vat=targetPriceExVat*Math.max(0,quote.vatRate);
  const finalPriceIncVat=targetPriceExVat+vat;
  return {
    gramsPerGuest:money(gramsPerGuest),
    totalRawKg:money(totalRawKg),
    meatCost:money(meatCost),
    marinationCost:money(marinationCost),
    toolsCost:money(toolsCost),
    totalCostExVat:money(totalCostExVat),
    targetPriceExVat:money(targetPriceExVat),
    vat:money(vat),
    finalPriceIncVat:money(finalPriceIncVat),
    pricePerGuestIncVat:money(finalPriceIncVat/guests),
    expectedProfitExVat:money(targetPriceExVat-totalCostExVat),
  };
}

export function validateCateringQuote(quote:CateringQuote){
  const issues:string[]=[];
  if(!quote.title.trim())issues.push('TITLE_REQUIRED');
  if(quote.guests<=0)issues.push('GUESTS_REQUIRED');
  if(quote.meatCostPerKg<0)issues.push('INVALID_MEAT_COST');
  if(quote.marginPercent<0||quote.marginPercent>=100)issues.push('INVALID_MARGIN');
  if(quote.vatRate<0||quote.vatRate>1)issues.push('INVALID_VAT');
  return {valid:issues.length===0,issues};
}
