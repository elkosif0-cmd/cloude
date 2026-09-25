export type SubscriptionCycle='WEEKLY'|'MONTHLY'|'CUSTOM';
export type SubscriptionStatus='ACTIVE'|'PAUSED'|'CANCELLED';

export type MeatSubscription={
  id:string;
  customerId?:string;
  customerName:string;
  phone?:string;
  planCode:string;
  planName:string;
  cycle:SubscriptionCycle;
  price:number;
  address?:string;
  status:SubscriptionStatus;
  nextDeliveryDate?:string;
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

export function monthlyRecurringRevenue(subscriptions:MeatSubscription[]){
  return money(subscriptions.filter(row=>row.status==='ACTIVE').reduce((sum,row)=>{
    if(row.cycle==='WEEKLY')return sum+Math.max(0,row.price)*(52/12);
    return sum+Math.max(0,row.price);
  },0));
}

export function subscriptionAnnualValue(subscription:MeatSubscription){
  if(subscription.status==='CANCELLED')return 0;
  const factor=subscription.cycle==='WEEKLY'?52:12;
  return money(Math.max(0,subscription.price)*factor);
}

export function subscriptionDue(subscription:MeatSubscription,asOfDate:string){
  if(subscription.status!=='ACTIVE'||!subscription.nextDeliveryDate)return false;
  return subscription.nextDeliveryDate<=asOfDate;
}

export function advanceDelivery(subscription:MeatSubscription,fromDate:string){
  const base=new Date((subscription.nextDeliveryDate||fromDate)+'T00:00:00Z');
  if(Number.isNaN(base.getTime()))throw new Error('INVALID_DELIVERY_DATE');
  if(subscription.cycle==='WEEKLY')base.setUTCDate(base.getUTCDate()+7);
  else if(subscription.cycle==='MONTHLY')base.setUTCMonth(base.getUTCMonth()+1);
  else base.setUTCDate(base.getUTCDate()+30);
  return {...subscription,nextDeliveryDate:base.toISOString().slice(0,10)};
}
