import type {Account} from './accounts-engine';
import type {JournalEntry} from './ledger-engine';

export type CashFlowClass='operating'|'investing'|'financing'|'unclassified';

export type CashFlowActivity={
  entryId:string;
  date:string;
  reference?:string;
  amount:number;
  classification:CashFlowClass;
  counterpartAccountIds:string[];
};

export type CashFlowSummary={
  activities:CashFlowActivity[];
  operating:number;
  investing:number;
  financing:number;
  unclassified:number;
  netChange:number;
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

function defaultClass(account:Account|undefined):CashFlowClass{
  if(!account)return 'unclassified';
  if(account.type==='revenue'||account.type==='expense')return 'operating';
  if(account.type==='asset')return 'investing';
  if(account.type==='liability'||account.type==='equity')return 'financing';
  return 'unclassified';
}

export function buildCashFlow(input:{
  journals:JournalEntry[];
  accounts:Account[];
  cashAccountIds:string[];
  overrides?:Record<string,CashFlowClass>;
}):CashFlowSummary{
  const cashSet=new Set(input.cashAccountIds);
  const accountMap=new Map(input.accounts.map(account=>[account.id,account]));
  const activities:CashFlowActivity[]=[];

  for(const entry of input.journals){
    let cashChange=0;
    const counterpart=new Set<string>();
    for(const line of entry.lines){
      if(cashSet.has(line.accountId))cashChange+=(line.debit??0)-(line.credit??0);
      else if((line.debit??0)!==0||(line.credit??0)!==0)counterpart.add(line.accountId);
    }
    cashChange=money(cashChange);
    if(cashChange===0)continue;

    const classes=[...counterpart].map(id=>input.overrides?.[id]??defaultClass(accountMap.get(id)));
    const distinct=[...new Set(classes)];
    const classification:CashFlowClass=distinct.length===1?distinct[0]:'unclassified';
    activities.push({
      entryId:entry.id,
      date:entry.date,
      reference:entry.reference,
      amount:cashChange,
      classification,
      counterpartAccountIds:[...counterpart],
    });
  }

  const total=(kind:CashFlowClass)=>money(activities.filter(a=>a.classification===kind).reduce((sum,a)=>sum+a.amount,0));
  return {
    activities,
    operating:total('operating'),
    investing:total('investing'),
    financing:total('financing'),
    unclassified:total('unclassified'),
    netChange:money(activities.reduce((sum,a)=>sum+a.amount,0)),
  };
}
