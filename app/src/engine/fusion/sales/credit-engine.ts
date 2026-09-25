export type CreditStatus='ACTIVE'|'HOLD';
export type CreditMovementType='SALE'|'RECEIPT'|'ADJUSTMENT';

export type CreditMovement={
  id:string;
  at:string;
  type:CreditMovementType;
  amount:number;
  note?:string;
};

export type CreditAccount={
  id:string;
  customerId:string;
  limit:number;
  balance:number;
  terms:string;
  status:CreditStatus;
  movements:CreditMovement[];
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

export function availableCredit(account:CreditAccount){
  return money(Math.max(0,Math.max(0,account.limit)-Math.max(0,account.balance)));
}

export function creditUtilization(account:CreditAccount){
  const limit=Math.max(0,account.limit);
  if(limit===0)return account.balance>0?100:0;
  return money((Math.max(0,account.balance)/limit)*100);
}

export function canExtendCredit(account:CreditAccount,amount:number){
  if(account.status==='HOLD')return {allowed:false,reason:'ACCOUNT_ON_HOLD',available:availableCredit(account)};
  if(amount<=0)return {allowed:false,reason:'INVALID_AMOUNT',available:availableCredit(account)};
  const available=availableCredit(account);
  if(amount>available)return {allowed:false,reason:'LIMIT_EXCEEDED',available};
  return {allowed:true,reason:'OK',available};
}

export function applyCreditMovement(account:CreditAccount,input:{type:CreditMovementType;amount:number;note?:string;now?:Date;id?:string}):CreditAccount{
  const amount=money(Math.max(0,input.amount));
  if(amount<=0)throw new Error('CREDIT_MOVEMENT_AMOUNT_REQUIRED');
  if(input.type==='SALE'){
    const decision=canExtendCredit(account,amount);
    if(!decision.allowed)throw new Error(decision.reason);
  }
  const balance=money(Math.max(0,account.balance+(input.type==='RECEIPT'?-amount:amount)));
  const movement:CreditMovement={
    id:input.id??crypto.randomUUID(),
    at:(input.now??new Date()).toISOString(),
    type:input.type,
    amount,
    note:input.note?.trim()||undefined,
  };
  return {...account,balance,movements:[movement,...account.movements]};
}
