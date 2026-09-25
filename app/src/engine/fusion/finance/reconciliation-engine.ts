import type {LedgerRow} from './ledger-engine';
import type {TrialBalanceRow} from './trial-balance-engine';

export type ReconciliationStatus='MATCH'|'DIFFERENCE'|'MISSING_TB'|'MISSING_GL';

export type AccountReconciliation={
  accountId:string;
  tbBalance:number;
  glBalance:number;
  difference:number;
  status:ReconciliationStatus;
};

export type ReconciliationSummary={
  rows:AccountReconciliation[];
  matched:number;
  exceptions:number;
  absoluteDifference:number;
};

function money(value:number){return Math.round((value+Number.EPSILON)*100)/100;}

function tbBalance(row:TrialBalanceRow){
  return money((row.debit??0)-(row.credit??0));
}

export function reconcileTrialBalanceToLedger(tb:TrialBalanceRow[],ledger:LedgerRow[],tolerance=0.005):ReconciliationSummary{
  const tbMap=new Map(tb.map(row=>[row.accountId.trim(),row]));
  const glMap=new Map(ledger.map(row=>[row.accountId.trim(),row]));
  const ids=[...new Set([...tbMap.keys(),...glMap.keys()])].filter(Boolean).sort();

  const rows=ids.map(accountId=>{
    const tbRow=tbMap.get(accountId);
    const glRow=glMap.get(accountId);
    const tbValue=tbRow?tbBalance(tbRow):0;
    const glValue=glRow?money(glRow.balance):0;
    const difference=money(tbValue-glValue);
    let status:ReconciliationStatus='MATCH';
    if(!tbRow)status='MISSING_TB';
    else if(!glRow)status='MISSING_GL';
    else if(Math.abs(difference)>tolerance)status='DIFFERENCE';
    return {accountId,tbBalance:tbValue,glBalance:glValue,difference,status};
  });

  return {
    rows,
    matched:rows.filter(row=>row.status==='MATCH').length,
    exceptions:rows.filter(row=>row.status!=='MATCH').length,
    absoluteDifference:money(rows.reduce((sum,row)=>sum+Math.abs(row.difference),0)),
  };
}

export type SubledgerReconciliation={
  glAccountId:string;
  glBalance:number;
  subledgerBalance:number;
  difference:number;
  matched:boolean;
};

export function reconcileSubledger(input:{glAccountId:string;ledger:LedgerRow[];subledgerBalance:number;tolerance?:number}):SubledgerReconciliation{
  const tolerance=input.tolerance??0.005;
  const glBalance=money(input.ledger.find(row=>row.accountId===input.glAccountId)?.balance??0);
  const subledgerBalance=money(input.subledgerBalance);
  const difference=money(glBalance-subledgerBalance);
  return {glAccountId:input.glAccountId,glBalance,subledgerBalance,difference,matched:Math.abs(difference)<=tolerance};
}
