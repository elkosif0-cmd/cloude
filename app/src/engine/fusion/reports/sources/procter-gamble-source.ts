import { PG_REVIEWED, PG_LABELS } from './procter-gamble-data';
import type { PublishedReplay, SourceTable, SourceCheck, SourcePeriod } from '../source-replay-engine';
const period=(y:number,instant=false):SourcePeriod=>instant?{kind:'instant',end:`${y}-06-30`}:{kind:'duration',start:`${y-1}-07-01`,end:`${y}-06-30`};
const titles:Record<string,string>={income:'Consolidated Statements of Earnings',comprehensive_income:'Consolidated Statements of Comprehensive Income',balance_sheet:'Consolidated Balance Sheets',cash_flow:'Consolidated Statements of Cash Flows'};
const TOTALS:Record<string,Set<string>>={income:new Set(['net_earnings','earnings_attributable_pg']),comprehensive_income:new Set(['comprehensive_income','comprehensive_income_attributable_pg']),balance_sheet:new Set(['total_assets','total_liabilities_equity']),cash_flow:new Set(['ending_cash_equivalents_restricted'])};
const SUBTOTALS:Record<string,Set<string>>={income:new Set(['operating_income','earnings_before_tax']),comprehensive_income:new Set(['other_comprehensive_income']),balance_sheet:new Set(['inventory_total','current_assets','current_liabilities','total_liabilities','total_equity']),cash_flow:new Set(['operating_cash_flow','investing_cash_flow','financing_cash_flow','cash_change'])};
const escapeCsv=(v:unknown)=>'"'+String(v??'').replace(/"/g,'""')+'"';
export function procterGambleSource(id:string){
 if(id!=='pg-2026')return null;
 const facts=structuredClone(PG_REVIEWED);
 const tables:SourceTable[]=Object.entries(PG_LABELS).map(([key,labels])=>{
  const statement=facts.statements[key as keyof typeof facts.statements] as {sourcePhysicalPage:number;periods:number[];rows:Record<string,Record<string,number>>;rowUnitOverrides?:Record<string,string>};
  return {id:key,title:titles[key],sourcePages:[statement.sourcePhysicalPage],columns:statement.periods.map(y=>({id:String(y),label:String(y),period:period(y,key==='balance_sheet')})),rows:Object.entries(labels).map(([rowId,label])=>({id:rowId,label,unit:statement.rowUnitOverrides?.[rowId]??'USD million',sourcePage:statement.sourcePhysicalPage,level:TOTALS[key].has(rowId)?'total':SUBTOTALS[key].has(rowId)?'subtotal':'line',status:'reported',
   ...(key==='income'&&rowId.endsWith('_eps')?{context:'NET EARNINGS PER COMMON SHARE; calculated on Net earnings attributable to Procter & Gamble'}:{}),
   ...(key==='comprehensive_income'&&rowId.endsWith('_net_of_tax')?{context:'OTHER COMPREHENSIVE INCOME/(LOSS), NET OF TAX; source tax qualifiers remain in reviewedFacts and source page 2004'}:{}),
   cells:Object.fromEntries(statement.periods.map(y=>{const value=statement.rows[rowId][y];const instant=key==='cash_flow'&&['beginning_cash_equivalents_restricted','ending_cash_equivalents_restricted'].includes(rowId);return [String(y),{value,status:'reported',...(value===0?{display:'—'}:{}),...(instant?{period:period(rowId.startsWith('beginning')?y-1:y,true)}:{}),sourceFactId:`statements.${key}.rows.${rowId}.${y}`}];}))}))};
 });
 const eq=facts.statements.equity_components;
 const equityColumnLabels=['Common Stock Shares','Common Stock Amount','Preferred Stock','Additional Paid-In Capital','Reserve for ESOP Debt Retirement','Accumulated Other Comprehensive Income/(Loss)','Treasury Stock','Retained Earnings','Noncontrolling Interest',"Total Shareholders’ Equity"];
 for(const[y,p]of Object.entries(eq.periods)){
  const labels=[`BALANCE JUNE 30, ${+y-1}`,'Net earnings','Other comprehensive income/(loss)','Common','Preferred','Treasury stock purchases','Employee stock plans','Preferred stock conversions','ESOP debt impacts','Noncontrolling interest, net',`BALANCE JUNE 30, ${y}`];
  tables.push({id:'equity_'+y,title:"Consolidated Statements of Shareholders' Equity — "+y,sourcePages:[2006],columns:eq.columns.map((col,i)=>({id:col,label:equityColumnLabels[i],dimension:col,period:period(+y),unit:i===0?'thousand shares':'USD million'})),rows:p.rows.map((r,i)=>({id:'movement_'+i,label:labels[i],unit:'USD million',sourcePage:2006,level:i===0||i===p.rows.length-1?'total':'line',status:'reported',...(i===3||i===4?{context:`Dividends and dividend equivalents ($${facts.statements.equity_rollforward_total.rows.dividends_per_common_share[y as '2026']} per share)`}:{}),cells:Object.fromEntries(eq.columns.map(col=>{const value=r.values[col as keyof typeof r.values];return [col,{value,status:value===null?'blank':'reported',...(value===0?{display:'—'}:{}),...(i===0||i===p.rows.length-1?{period:period(i===0?+y-1:+y,true)}:{}),sourceFactId:`statements.equity_components.periods.${y}.rows.${i}.values.${col}`}];}))}))});
 }
 const checks:SourceCheck[]=[];
 function check(statement:'income'|'comprehensive_income'|'balance_sheet'|'cash_flow',year:number,total:string,terms:Array<[string,number]>){
  const st=facts.statements[statement],rows=st.rows as Record<string,Record<string,number>>,reported=rows[total][year],computed=terms.reduce((n,[k,sign])=>n+sign*rows[k][year],0),residual=computed-reported;
  checks.push({id:`${statement}.${total}.${year}`,reported,computed,residual,unit:'USD million',sourcePages:[st.sourcePhysicalPage],status:residual===0?'exact':Math.abs(residual)<=(terms.length+1)*0.5?'rounding-residual':'mismatch',assurance:'none',operands:terms.map(([id,sign])=>({sourceFactId:`statements.${statement}.rows.${id}.${year}`,sign})),roundingBound:(terms.length+1)*0.5});
 }
 for(const y of [2026,2025,2024]){
  check('income',y,'operating_income',[['net_sales',1],['cost_of_products_sold',-1],['selling_general_administrative',-1],['indefinite_lived_intangible_impairment',-1]]);
  check('income',y,'earnings_before_tax',[['operating_income',1],['interest_expense',1],['interest_income',1],['other_nonoperating_income_net',1]]);
  check('income',y,'net_earnings',[['earnings_before_tax',1],['income_tax',-1]]);check('income',y,'earnings_attributable_pg',[['net_earnings',1],['earnings_noncontrolling',-1]]);
  check('comprehensive_income',y,'other_comprehensive_income',[['fx_translation_net_of_tax',1],['investment_unrealized_net_of_tax',1],['defined_benefit_plans_net_of_tax',1]]);
  check('cash_flow',y,'operating_cash_flow',['net_earnings','depreciation_amortization','share_compensation','deferred_income_taxes','gain_loss_on_sale_assets','indefinite_intangible_impairment','change_accounts_receivable','change_inventories','change_accounts_payable','other_operating'].map(k=>[k,1]));
  check('cash_flow',y,'cash_change',['operating_cash_flow','investing_cash_flow','financing_cash_flow','fx_effect_cash'].map(k=>[k,1]));
  check('cash_flow',y,'ending_cash_equivalents_restricted',[['beginning_cash_equivalents_restricted',1],['cash_change',1]]);
 }
 for(const y of [2026,2025]){
  check('balance_sheet',y,'inventory_total',['inventory_materials','inventory_work_in_process','inventory_finished_goods'].map(k=>[k,1]));
  check('balance_sheet',y,'current_assets',['cash_equivalents','accounts_receivable','inventory_total','prepaid_and_other_current_assets'].map(k=>[k,1]));
  check('balance_sheet',y,'current_liabilities',['accounts_payable','accrued_and_other_current_liabilities','debt_due_one_year'].map(k=>[k,1]));
  check('balance_sheet',y,'total_liabilities',['current_liabilities','longterm_debt','deferred_income_taxes','other_noncurrent_liabilities'].map(k=>[k,1]));
  check('balance_sheet',y,'total_equity',['preferred_class_a','preferred_class_b','common_stock','additional_paid_in_capital','esop_debt_retirement_reserve','accumulated_other_comprehensive_loss','treasury_stock','retained_earnings','noncontrolling_interest'].map(k=>[k,1]));
  check('balance_sheet',y,'total_liabilities_equity',[['total_liabilities',1],['total_equity',1]]);
 }
 const limitations=[...facts.assurance.boundaries,...facts.source_exceptions.map(x=>x.finding),'The six prior unequal-value concept checks were not executed application-validator rejections. New tests, if run, are reported separately.','Source cash-flow rows are replayed as published; no transaction ledger, audit evidence or source assurance was reconstructed.'];
 const replay:PublishedReplay={schemaVersion:'1.0',mode:'published-statement-replay',tables,checks,unavailable:[{id:'ledger-reconstruction',reason:'Underlying transactions and ledger are not supplied.'},{id:'full-notes-rendering',reason:'All 15 reviewed note topics and source facts are preserved in reviewedFacts; a standardized note renderer has not been implemented.',sourcePages:Array.from({length:27},(_,i)=>2008+i)},{id:'unreported-2024-balance-sheet',reason:'The source balance sheet presents 2026 and 2025 only.'},{id:'source-derived-analytics',reason:'No validated source definitions of ratios, EBITDA or adjusted non-GAAP measures are admitted by this replay.'}],limitations};
 const transport=tables.filter(t=>Object.hasOwn(PG_LABELS,t.id)).flatMap(t=>t.rows.map(r=>({code:`PG_${t.id}_${r.id}`,label:r.label,current:r.cells['2026'].value!,prior:r.cells['2025'].value!,sourcePage:r.sourcePage,id:`${t.id}.${r.id}`,unit:r.unit,cells:r.cells})));
 const csv=['# SQC source-only: '+id,'code,name,balance,prior',...transport.map(r=>[r.code,r.label,r.current,r.prior].map(escapeCsv).join(','))].join('\n');
 const sourceModel={kind:'published-statements' as const,id,issuer:facts.issuer,issuerCountry:'US',report:'2026 Form 10-K',accountingBasis:'US_GAAP',currency:'USD',unit:'million',scope:'consolidated',entities:facts.issuerScope,periodStart:'2025-07-01',periodEnd:'2026-06-30',priorPeriodEnd:'2025-06-30',sourceFile:'global_financial_and_audit_research_bundle_extended_verified.pdf',sourceSha256:facts.source.bundleSha256,sourcePackageSha256:'c871ddf587f724d48654f6ebfecebd071df20bdb30ab04720116748844180792',reviewedModelSha256:'2a5f3a67336ff1bead2b390a0ac860bc5ab5f0a2ae8484d3811c7f52011153a5',sourcePages:Array.from({length:77},(_,i)=>1963+i),facts:transport.map(r=>({...r,status:'reported'})),reviewedFacts:facts,replay,auditorReference:{name:facts.assurance.auditor,opinion:facts.assurance.financial_opinion,date:facts.assurance.audit_report_date,pages:facts.assurance.financial_report_pages,scope:facts.assurance.financial_scope},cashFlow:{status:'source-replay-only',sourcePage:2007,reason:'Available only as exact published statement replay; not generated from transactions.'}};
 return {csv,overrides:Object.fromEntries(transport.map(r=>[r.code,'__source_observation__'])),sourceModel};
}
