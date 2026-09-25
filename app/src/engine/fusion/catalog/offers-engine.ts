export type OfferStatus='DRAFT'|'PENDING'|'APPROVED'|'REJECTED';

export type Offer={
  id:string;
  itemId:string;
  discountRate:number;
  startDate:string;
  endDate:string;
  status:OfferStatus;
  createdBy?:string;
  approvedBy?:string;
  note?:string;
};

export function offerPrice(basePrice:number,discountRate:number){
  const safePrice=Math.max(0,basePrice);
  const safeDiscount=Math.min(0.99,Math.max(0,discountRate));
  return Math.round((safePrice*(1-safeDiscount)+Number.EPSILON)*100)/100;
}

export function offerMargin(input:{basePrice:number;discountRate:number;cost:number}){
  const price=offerPrice(input.basePrice,input.discountRate);
  const profit=Math.round(((price-Math.max(0,input.cost))+Number.EPSILON)*100)/100;
  const marginPercent=price===0?0:Math.round(((profit/price)*100+Number.EPSILON)*100)/100;
  return {price,profit,marginPercent,belowCost:price<input.cost};
}

const transitions:Record<OfferStatus,OfferStatus[]>={
  DRAFT:['PENDING'],
  PENDING:['APPROVED','REJECTED','DRAFT'],
  APPROVED:[],
  REJECTED:['DRAFT'],
};

export function canTransitionOffer(from:OfferStatus,to:OfferStatus){
  return transitions[from].includes(to);
}

export function transitionOffer(offer:Offer,to:OfferStatus,actor?:string):Offer{
  if(!canTransitionOffer(offer.status,to))throw new Error('INVALID_OFFER_TRANSITION');
  return {...offer,status:to,approvedBy:to==='APPROVED'?actor:offer.approvedBy};
}

export function validateOffer(offer:Offer){
  const issues:string[]=[];
  if(!offer.itemId)issues.push('ITEM_REQUIRED');
  if(offer.discountRate<=0||offer.discountRate>=1)issues.push('DISCOUNT_OUT_OF_RANGE');
  if(!offer.startDate||!offer.endDate)issues.push('DATES_REQUIRED');
  if(offer.startDate&&offer.endDate&&offer.endDate<offer.startDate)issues.push('END_BEFORE_START');
  return {valid:issues.length===0,issues};
}
