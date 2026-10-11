import { reviewedPublishedSource } from './published-source-engine';
/* Faithful published-statement replay. This branch is not a transaction reconstruction.
   It preserves source columns and units and refuses mismatched imported observations. */
import { parseTrialBalance, type TrialBalance } from './tb-import-engine';
import type { FinancialStatements } from './statements-engine';
export type SourcePeriod={kind:'duration'|'instant';start?:string;end:string};
export type SourceCell={value:number|null;status:'reported'|'blank'|'unavailable';display?:string;period?:SourcePeriod;sourceFactId?:string;context?:string};
export type SourceColumn={id:string;label:string;period:SourcePeriod;unit?:string;dimension?:string};
export type SourceRow={id:string;label:string;unit:string;sourcePage:number;level:'line'|'subtotal'|'total';status:'reported';cells:Record<string,SourceCell>;context?:string};
export type SourceTable={id:string;title:string;sourcePages:number[];columns:SourceColumn[];rows:SourceRow[]};
export type SourceCheck={id:string;reported:number|null;computed:number|null;residual:number|null;unit:string;sourcePages:number[];status:'exact'|'rounding-residual'|'mismatch'|'not-tested';assurance:'none';operands?:Array<{sourceFactId:string;sign:number}>;roundingBound?:number};
export type PublishedReplay={schemaVersion:'1.0';mode:'published-statement-replay';tables:SourceTable[];checks:SourceCheck[];unavailable:Array<{id:string;reason:string;sourcePages?:number[]}>;limitations:string[]};
export type ReplayResult=PublishedReplay&{status:'available'|'unavailable';reason?:string};
type Adapter={csv:string;overrides:Record<string,string>;sourceModel:{id:string;replay?:PublishedReplay}};
/** Exact plain-JSON equality. JSON.stringify alone collapses NaN to null and
 * hides unsupported objects, sparse arrays, undefined values and custom getters. */
export function sourceModelsEqual(actual:unknown,expected:unknown):boolean{
 const active=new WeakSet<object>();
 const plain=(v:object)=>{const p=Object.getPrototypeOf(v);return p===null||(Object.getPrototypeOf(p)===null&&Object.prototype.hasOwnProperty.call(p,'constructor')&&p.constructor?.name==='Object');};
 const same=(a:unknown,b:unknown,depth:number):boolean=>{
  if(depth>100||typeof a!==typeof b)return false;
  if(a===null||b===null)return a===b;
  if(typeof a==='number')return Number.isFinite(a)&&Number.isFinite(b)&&Object.is(a,b);
  if(typeof a==='string'||typeof a==='boolean')return a===b;
  if(typeof a!=='object'||typeof b!=='object'||active.has(a))return false;
  if(Array.isArray(a)!==Array.isArray(b))return false;
  if(!Array.isArray(a)&&(!plain(a)||!plain(b)))return false;
  const ak=Reflect.ownKeys(a),bk=Reflect.ownKeys(b);if(ak.some(k=>typeof k!=='string')||bk.some(k=>typeof k!=='string')||ak.length!==bk.length)return false;
  if(Array.isArray(a)&&(ak.length!==a.length+1||a.length!==(b as unknown[]).length))return false;
  active.add(a);
  for(const key of ak){const x=Object.getOwnPropertyDescriptor(a,key),y=Object.getOwnPropertyDescriptor(b,key);if(!x||!y||!('value'in x)||!('value'in y)||!same(x.value,y.value,depth+1)){active.delete(a);return false;}}
  active.delete(a);return true;
 };
 try{return same(actual,expected,0);}catch{return false;}
}
const periodValid=(p:SourcePeriod)=>p&&['duration','instant'].includes(p.kind)&&/^\d{4}-\d{2}-\d{2}$/.test(p.end)&&(p.kind==='instant'||!!p.start&&/^\d{4}-\d{2}-\d{2}$/.test(p.start)&&p.start<=p.end);
function contractValid(r:PublishedReplay){
 if(r.schemaVersion!=='1.0'||r.mode!=='published-statement-replay'||!Array.isArray(r.tables)||!Array.isArray(r.checks)||!Array.isArray(r.unavailable)||!Array.isArray(r.limitations))return false;
 const tableIds=new Set<string>();
 for(const t of r.tables){
  if(!t.id||tableIds.has(t.id)||!t.title||!Array.isArray(t.sourcePages)||!t.sourcePages.length||!t.columns.length||!Array.isArray(t.rows))return false;tableIds.add(t.id);
  const cols=new Set(t.columns.map(c=>c.id));if(cols.size!==t.columns.length||t.columns.some(c=>!c.id||!c.label||!periodValid(c.period)))return false;
  const rows=new Set<string>();
  for(const row of t.rows){
   if(!row.id||rows.has(row.id)||!row.label||!row.unit||row.status!=='reported'||!t.sourcePages.includes(row.sourcePage)||Object.keys(row.cells).length!==cols.size)return false;rows.add(row.id);
   for(const id of cols){const cell=row.cells[id];if(!cell||!['reported','blank','unavailable'].includes(cell.status)||cell.status==='reported'&&(typeof cell.value!=='number'||!Number.isFinite(cell.value))||cell.status!=='reported'&&cell.value!==null||cell.period&&!periodValid(cell.period))return false;}
  }
 }
 return r.checks.every(c=>c.assurance==='none'&&[c.reported,c.computed,c.residual].every(v=>v===null||Number.isFinite(v)));
}
function matchingTransport(tb:TrialBalance,overrides:Record<string,string>,source:Adapter):boolean{
 if(tb.sourceKind!=='published-statements'||tb.sourceId!==source.sourceModel.id||tb.sourceTransport!==source.csv)return false;
 const expected=parseTrialBalance(source.csv);return tb.ok&&!tb.errors.length&&sourceModelsEqual(tb.rows,expected.rows)&&tb.hasPrior===expected.hasPrior&&sourceModelsEqual(overrides,source.overrides);
}
export function reviewedTransportMatches(tb:TrialBalance,overrides:Record<string,string>):boolean{const source=reviewedPublishedSource(tb.sourceId??'');return !!source&&matchingTransport(tb,overrides,source);}
export function validatePublishedReplay(tb:TrialBalance,overrides:Record<string,string>):ReplayResult{
 const source:Adapter|null=reviewedPublishedSource(tb.sourceId??'');
 const unavailable=(reason:string):ReplayResult=>({schemaVersion:'1.0',mode:'published-statement-replay',status:'unavailable',reason,tables:[],checks:[],unavailable:[{id:'source-fidelity',reason}],limitations:['No canonical figures are replayed for an unverified source transport.']});
 if(!source?.sourceModel.replay)return unavailable('Reviewed source replay is unavailable.');
 if(tb.sourceKind!=='published-statements'||tb.sourceId!==source.sourceModel.id)return unavailable('Published source identity does not match.');
 if(tb.sourceTransport!==source.csv)return unavailable('Original source transport is missing or changed; numeric normalization cannot establish source fidelity.');
 if(!matchingTransport(tb,overrides,source))return unavailable('Imported observations or classifications do not match the reviewed source transport.');
 if(!contractValid(source.sourceModel.replay))return unavailable('Published source replay contract is invalid.');
 return {...structuredClone(source.sourceModel.replay),status:'available'};
}
export function buildReplayStatements(tb:TrialBalance,overrides:Record<string,string>):FinancialStatements{
 const reason='Published statements are source observations, not a transaction ledger; operational reconstruction and inferred analytics are unavailable.';
 return {sourceKind:'published-statements',reconstructionStatus:{status:'unavailable',reason},replay:validatePublishedReplay(tb,overrides),hasPrior:false,lines:[],unmapped:[],pl:[],sfp:[],soce:{columns:[],rows:[]},cf:null,keys:{},checks:{balanced:null,difference:null,priorBalanced:null,cashTies:null,cfDifference:null,mappedPct:0},notes:[],cashFlowStatus:{status:'unavailable',check:'not-tested',reason:'Generated cash flow is unavailable; exact published cash-flow rows may be available separately in replay.'},soceStatus:{status:'unavailable',reason:'Generated changes in equity are unavailable; exact source movements may be available separately in replay.'}};
}
