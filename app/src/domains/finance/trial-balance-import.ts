import {csvObjects} from '../../data/csv';
import {validateTrialBalance,type TrialBalanceRow,type TrialBalanceValidation} from './trial-balance-engine';

export type TrialBalanceBatch={
  id:string;
  label:string;
  importedAt:string;
  sourceName?:string;
  rows:TrialBalanceRow[];
  validation:TrialBalanceValidation;
};

const aliases={
  accountId:['accountid','account_id','account','code','accountcode','account_code','رقمالحساب','كودالحساب','الحساب'],
  accountName:['accountname','account_name','name','اسم الحساب','اسمالحساب'],
  debit:['debit','currentdebit','current_debit','مدين','الحركةالمدينة'],
  credit:['credit','currentcredit','current_credit','دائن','الحركةالدائنة'],
  openingDebit:['openingdebit','opening_debit','openingdr','رصيدافتتاحيمدين','افتتاحيمدين'],
  openingCredit:['openingcredit','opening_credit','openingcr','رصيدافتتاحيدائن','افتتاحيدائن'],
  priorDebit:['priordebit','prior_debit','previousdebit','previous_debit','سابقمدين','العامالسابقمدين'],
  priorCredit:['priorcredit','prior_credit','previouscredit','previous_credit','سابقدائن','العامالسابقدائن'],
} as const;

function normalizeHeader(value:string){
  return value.trim().toLowerCase().replace(/[\s\-./\\()]+/g,'').replace(/_/g,'');
}

function valueFor(record:Record<string,string>,names:readonly string[]){
  for(const [key,value] of Object.entries(record)){
    const normalized=normalizeHeader(key);
    if(names.some(name=>normalizeHeader(name)===normalized))return value;
  }
  return '';
}

function numeric(value:string){
  const cleaned=value.replace(/,/g,'').replace(/\s/g,'').replace(/[()]/g,'');
  if(!cleaned)return 0;
  const parsed=Number(cleaned);
  if(!Number.isFinite(parsed))return 0;
  return /^\(.*\)$/.test(value.trim())?-Math.abs(parsed):parsed;
}

export function parseTrialBalanceCsv(text:string):TrialBalanceRow[]{
  return csvObjects(text).map(record=>({
    accountId:valueFor(record,aliases.accountId).trim(),
    accountName:valueFor(record,aliases.accountName).trim()||undefined,
    openingDebit:numeric(valueFor(record,aliases.openingDebit)),
    openingCredit:numeric(valueFor(record,aliases.openingCredit)),
    debit:numeric(valueFor(record,aliases.debit)),
    credit:numeric(valueFor(record,aliases.credit)),
    priorDebit:numeric(valueFor(record,aliases.priorDebit)),
    priorCredit:numeric(valueFor(record,aliases.priorCredit)),
  })).filter(row=>row.accountId||row.accountName||row.debit||row.credit||row.openingDebit||row.openingCredit||row.priorDebit||row.priorCredit);
}

export function createTrialBalanceBatch(input:{label:string;csv:string;sourceName?:string;now?:Date}):TrialBalanceBatch{
  const rows=parseTrialBalanceCsv(input.csv);
  const importedAt=(input.now??new Date()).toISOString();
  return {
    id:'tb-'+importedAt.replace(/[^0-9]/g,'')+'-'+Math.random().toString(36).slice(2,8),
    label:input.label.trim()||'ميزان مراجعة',
    importedAt,
    sourceName:input.sourceName,
    rows,
    validation:validateTrialBalance(rows),
  };
}
