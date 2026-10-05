/* Source observations only. No synthetic ledger balances or earned assurance. */
import { MERCEDES_REVIEWED, MERCEDES_PRIMARY_ROWS } from './source-data/mercedes';
import type { PublishedReplay, SourceTable, SourceCheck, SourcePeriod } from './source-replay-engine';
const TITLES:Record<string,string>={income:'Consolidated Statement of Income',eps:'Earnings per share (in euros)',oci:'Consolidated Statement of Comprehensive Income',assets:'Consolidated Statement of Financial Position',equity_liabilities:'Consolidated Statement of Financial Position',cash_flow:'Consolidated Statement of Cash Flows',equity_2024:'Consolidated Statement of Changes in Equity',equity_2025:'Consolidated Statement of Changes in Equity'};
const EQ_COLUMNS=[['share_capital','Share capital'],['capital_reserves','Capital reserves'],['retained_earnings','Retained earnings'],['currency_translation','Difference of currency translation'],['equity_debt_instruments','Equity instruments/debt instruments'],['derivative_financial_instruments','Derivative financial instruments'],['treasury_shares','Treasury shares'],['parent_equity','Equity attributable to shareholders of Mercedes-Benz Group AG'],['noncontrolling_interests','Non-controlling interests'],['total_equity','Total equity']];
const instant=(end:string):SourcePeriod=>({kind:'instant',end});
const annual=(year:string):SourcePeriod=>({kind:'duration',start:year+'-01-01',end:year+'-12-31'});
const eqId=(id:string)=>id==='equity_2024'||id==='equity_2025';
function context(table:string,row:string,index:number){
 if(table==='assets'&&row==='total_assets')return 'Assets';
 if(table==='equity_liabilities'&&row==='total_equity_liabilities')return 'Equity and liabilities';
 if(table==='oci'&&row==='equity_method_reclassifiable')return 'Items that may be reclassified to profit/loss in the Consolidated Statement of Income in the future';
 if(table==='oci'&&row==='equity_method_nonreclassifiable')return 'Items that will not be reclassified to profit/loss in the Consolidated Statement of Income in the future';
 if(table==='eps')return 'For profit attributable to shareholders of Mercedes-Benz Group AG';
 if(table==='assets')return index<11?'Assets / Non-current assets':'Assets / Current assets';
 if(table==='equity_liabilities')return index<8?'Equity and liabilities / Equity':index<17?'Equity and liabilities / Non-current liabilities':'Equity and liabilities / Current liabilities';
 if(table==='oci'&&row==='derivatives')return 'Footnote 1: Reclassifications of gains/losses from other comprehensive income relating to derivative financial instruments into the Consolidated Statement of Income are shown in Note 31.';
 if(table==='oci'&&row==='oci')return 'Footnote 2: For more information on income taxes included in other comprehensive income see Note 9.';
 if(table==='cash_flow'&&index>=4&&index<=8)return 'Change in operating assets and liabilities';
 if(table==='cash_flow'&&row.startsWith('opening_'))return 'Beginning-of-year stock; cash-flow total includes cash held for sale, balance-sheet amount excludes it.';
 if(table==='cash_flow'&&row.startsWith('closing_'))return 'End-of-year stock; cash-flow total includes cash held for sale, balance-sheet amount excludes it.';
 return '';
}
const FORMULAS:Record<string,Record<string,Record<string,number>>>= {
 income:{gross_profit:{revenue:1,cost_sales:1},ebit:{gross_profit:1,selling:1,administration:1,research_noncapitalized:1,other_operating_income:1,other_operating_expense:1,equity_method:1,other_financial:1},pretax:{ebit:1,interest_income:1,interest_expense:1},net_profit:{pretax:1,tax:1},parent_profit:{net_profit:1,nci_profit:-1}},
 oci:{reclassifiable_total:{currency_translation:1,debt:1,derivatives:1,equity_method_reclassifiable:1},nonreclassifiable_total:{pensions:1,equity:1,equity_method_nonreclassifiable:1},oci:{reclassifiable_total:1,nonreclassifiable_total:1},comprehensive:{net_profit:1,oci:1}},
 assets:{noncurrent_total:{intangible:1,ppe_rou:1,operating_leases:1,equity_method:1,fs_noncurrent:1,securities_noncurrent:1,other_financial_noncurrent:1,deferred_tax:1,income_tax_noncurrent:1,other_noncurrent:1},current_total:{inventory:1,trade_receivables:1,fs_current:1,cash:1,securities_current:1,other_financial_current:1,income_tax_current:1,other_current:1,held_for_sale:1},total_assets:{noncurrent_total:1,current_total:1}},
 equity_liabilities:{parent_equity:{share_capital:1,capital_reserves:1,retained_earnings:1,other_reserves:1,treasury_shares:1},equity:{parent_equity:1,nci:1},noncurrent_total:{pension:1,provisions_noncurrent:1,debt_noncurrent:1,financial_noncurrent:1,deferred_tax:1,contract_refund_noncurrent:1,income_tax_noncurrent:1,other_noncurrent:1},current_total:{trade_payables:1,provisions_current:1,debt_current:1,financial_current:1,contract_refund_current:1,income_tax_current:1,other_current:1,held_for_sale:1},total_equity_liabilities:{equity:1,noncurrent_total:1,current_total:1}},
 cash_flow:{cfo:{pretax:1,da_impairment:1,other_noncash:1,disposal_gains_losses:1,inventory_change:1,trade_change:1,fs_receivable_change:1,leased_vehicle_change:1,other_operating_change:1,equity_method_dividends:1,tax_paid:1},cfi:{ppe_acquisition:1,intangible_acquisition:1,ppe_intangible_disposal:1,shareholding_acquisition:1,shareholding_disposal:1,securities_acquisition:1,securities_disposal:1,other_investing:1},cff:{short_financing_change:1,long_financing_additions:1,long_financing_repayment:1,parent_dividend:1,nci_dividend:1,treasury_purchase_cash:1,other_financing:1},cash_change:{cfo:1,cfi:1,cff:1,fx:1},closing_total:{opening_total:1,cash_change:1},opening_balance_sheet:{opening_total:1,opening_hfs:-1},closing_balance_sheet:{closing_total:1,closing_hfs:-1}}
};
const TABLE_ORDER=['income','eps','oci','assets','equity_liabilities','cash_flow','equity_2024','equity_2025'];
const TOTALS=new Set(['net_profit','comprehensive','total_assets','total_equity_liabilities','closing','closing_balance_sheet']);
const quote=(v:unknown)=>'"'+String(v??'').replace(/"/g,'""')+'"';
export function reviewedMercedesSource(id:string){
 if(id!=='mercedes-2025')return null;
 const reviewedFacts=structuredClone(MERCEDES_REVIEWED);
 const tables:SourceTable[]=Object.entries(MERCEDES_PRIMARY_ROWS).sort(([a],[b])=>TABLE_ORDER.indexOf(a)-TABLE_ORDER.indexOf(b)).map(([tableId,rows])=>{
  const equity=eqId(tableId),year=tableId.slice(-4),stock=tableId==='assets'||tableId==='equity_liabilities';
  const columns=equity?EQ_COLUMNS.map(([id,label])=>({id,label,dimension:id,unit:'EUR million',period:annual(year)})):['2025','2024'].map(id=>({id,label:id,period:stock?instant(id+'-12-31'):annual(id)}));
  return {id:tableId,title:TITLES[tableId],sourcePages:[...new Set(rows.map(r=>r.sourcePage))],columns,
   rows:rows.map((r,index)=>({id:r.id,label:r.label,unit:tableId==='eps'?'EUR per share':'EUR million',sourcePage:r.sourcePage,level:TOTALS.has(r.id)?'total':FORMULAS[tableId]?.[r.id]?'subtotal':'line',status:'reported',context:context(tableId,r.id,index),cells:Object.fromEntries(columns.map((c,i)=>{
    const period=equity&&(index===0||index===10)?instant(year+(index===0?'-01-01':'-12-31')):tableId==='cash_flow'&&/^opening_|^closing_/.test(r.id)?instant(c.id+(r.id.startsWith('opening_')?'-01-01':'-12-31')):undefined;
    return [c.id,{value:r.values[i],status:'reported',...(r.displays[i]==='–'?{display:'–'}:{}),...(period?{period}:{}),sourceFactId:`primary.${tableId}.${r.id}.${c.id}`}];
   }))}))};
 });
 const checks:SourceCheck[]=[];
 function appendCheck(t:SourceTable,cid:string,target:string,terms:Record<string,number>){
  const val=(id:string)=>t.rows.find(r=>r.id===id)!.cells[cid].value!;
  const reported=val(target),computed=Object.entries(terms).reduce((n,[id,sign])=>n+sign*val(id),0),residual=computed-reported,roundingBound=(Object.keys(terms).length+1)*0.5;
  checks.push({id:`${t.id}.${target}.${cid}`,reported,computed,residual,unit:'EUR million',sourcePages:t.sourcePages,status:residual===0?'exact':Math.abs(residual)<=roundingBound?'rounding-residual':'mismatch',assurance:'none',operands:Object.entries(terms).map(([id,sign])=>({sourceFactId:`primary.${t.id}.${id}.${cid}`,sign})),roundingBound});
 }
 for(const t of tables){
  for(const [target,terms] of Object.entries(FORMULAS[t.id]??{}))for(const c of t.columns)appendCheck(t,c.id,target,terms);
  if(eqId(t.id))for(const c of t.columns){appendCheck(t,c.id,'comprehensive',{net_profit:1,oci:1});appendCheck(t,c.id,'closing',{opening:1,comprehensive:1,dividends:1,scope_changes:1,capital_increase:1,treasury_purchase_accrual:1,treasury_issue:1,other:1});}
 }
 // Preserve the unresolved one-million cross-presentation difference as a diagnostic.
 // Its cause is not established, so do not label it rounding or change either source.
 {const reported=Number(reviewedFacts.core.tables.financial_instruments.rows.cash['2024']),computed=Number(reviewedFacts.core.tables.cash_bridge.rows.closing_total['2024']);checks.push({id:'unresolved-prior-cash-cross-presentation-2024',reported,computed,residual:computed-reported,unit:'EUR million',sourcePages:[3497,3577],status:'mismatch',assurance:'none',operands:[{sourceFactId:'reviewedFacts.core.tables.cash_bridge.rows.closing_total.2024',sign:1}]});}
 const limitations=[...reviewedFacts.core.scope_warnings,
  'Only the supplied corpus bytes have been authenticated. No independent official-publisher authenticity comparison or audit engagement has been performed.',
  'Source cash-flow closing cash 12276 EUR million equals balance-sheet cash 12254 EUR million plus 22 EUR million held for sale; no amount is substituted.',
  'Only consolidated Group IFRS primary statements are rendered. Parent HGB, associate-own figures, narrative forecasts and sustainability facts keep their own metadata in reviewedFacts and are not presented as Group IFRS actuals.',
  'The financial audit is attributed to the original source and does not provide a separate opinion on ICFR effectiveness. The app, transcription and compiled PDF have no audit assurance.',
  'The sustainability assurance is limited except the five precisely specified starred disclosure categories; it is not financial-statement audit assurance.',
  'In the source equity matrix, Difference of currency translation, Equity instruments/debt instruments and Derivative financial instruments are grouped under Other reserves.',
  'Full source equity components were independently extracted from physical page 3498, report page 258, and compared with the reviewed total-equity movements. Source dashes on financial statement rows are reported zeros; other narrative dashes retain their original meaning.',
  'Arithmetic checks are recomputed separately from reported amounts; nonzero rounding residuals are retained and do not modify source totals.',
  ...reviewedFacts.coreExceptions.items.map(x=>x.status),...reviewedFacts.narrativeExceptions.map(x=>x.id+': '+x.action)];
 const replay:PublishedReplay={schemaVersion:'1.0',mode:'published-statement-replay',tables,checks,limitations,unavailable:[
  {id:'parent-hgb',reason:'Parent-company HGB statements have different entity and accounting scope; preserved separately in reviewedFacts.narrative and not rendered under Group IFRS.',sourcePages:[3343,3344,3345]},
  {id:'forecasts',reason:'The 16 FY2026 forecasts are prospective, not actuals. Their bands, tariff assumption date 2026-02-19 and exclusions remain in reviewedFacts.narrative.',sourcePages:[3321,3323,3324]},
  {id:'sustainability',reason:'Selected sustainability tables retain their distinct units, perimeters and assurance boundaries in reviewedFacts; v1 does not render them as financial statements.',sourcePages:[3379,3490]},
  {id:'detailed-notes',reason:'All 38 reviewed core table models are preserved. Full note-layout replay, including ECL scope and recast comparative disclosures, is not implemented.',sourcePages:[3499,3627]},
  {id:'associate-period-comparison',reason:'Daimler Truck 2025 income covers nine months and its assets are at September 30; 2024 is annual/December 31. Direct annual growth or year-end substitution is not available.',sourcePages:[3544]},
  {id:'ledger-reconstruction',reason:'Published statement observations are not transactions, journal entries or a real trial balance.'},
  {id:'ratio-analytics',reason:'No validated transaction reconstruction, generated ratios, cash flows or EBITDA are admitted by source replay.'},
  {id:'icfr-effectiveness',reason:'No separate source opinion on ICFR effectiveness, and no application assurance procedures performed.',sourcePages:[3630,3639]},
  {id:'audit-assurance',reason:'Source auditor attribution is not an audit or assurance engagement by the application.'}
 ]};
 // Raw signed source observations; deliberately no ledger classification or balancing plug.
 const transport=tables.filter(t=>!eqId(t.id)).flatMap(t=>t.rows.map(r=>({code:`MB_${t.id}_${r.id}`,label:r.label,current:r.cells['2025'].value!,prior:r.cells['2024'].value!,unit:r.unit,sourcePage:r.sourcePage})));
 const csv=['# SQC source-only: '+id,'code,name,balance,prior',...transport.map(r=>[r.code,r.label,r.current,r.prior].map(quote).join(','))].join('\n');
 const sourceModel={kind:'published-statements' as const,id,issuer:'Mercedes-Benz Group AG',issuerCountry:'DE',report:'Annual Report 2025',accountingBasis:'IFRS_EU',currency:'EUR',unit:'million',scope:'consolidated',entities:'Mercedes-Benz Group AG and its consolidated subsidiaries',periodStart:'2025-01-01',periodEnd:'2025-12-31',priorPeriodEnd:'2024-12-31',
  sourceFile:'global_financial_and_audit_research_bundle_extended_verified.pdf',sourceSha256:reviewedFacts.core.source_pdf_sha256,sourcePackageSha256:'d3389e9e0eff5ac1de876e0905d35b4a3e9b54dde5f0d828f991848c79949ad4',narrativePackageSha256:'97e5b9f8489377cb3bea0ce309e9ef98802e18c012ab83aa9b17be4c239773f9',reviewedModelSha256:'dd83f48a95700e34b736eb6c5b93c57fb9e504ae6d470f450d3642dc7e02e9f7',sourcePages:[3492,3493,3494,3495,3496,3497,3498],reviewedPageRange:[3241,3649],sourceReportPages:[252,253,254,255,256,257,258],
  facts:tables.flatMap(t=>t.rows.flatMap(r=>t.columns.map(c=>({id:r.cells[c.id].sourceFactId,label:r.label,value:r.cells[c.id].value,unit:r.unit,period:r.cells[c.id].period??c.period,context:r.context,sourcePage:r.sourcePage,status:'reported'})))),reviewedFacts,replay,
  auditorReference:{name:reviewedFacts.core.assurance.financial_statement_audit.auditor,opinion:reviewedFacts.core.assurance.financial_statement_audit.opinion,date:'2026-03-03',pages:reviewedFacts.core.assurance.financial_statement_audit.source_physical_pages,scope:'Audit conducted under §317 HGB and the EU Audit Regulation, German Generally Accepted Standards for Financial Statement Audits promulgated by IDW, and supplementary compliance with ISAs. Original FY2025 consolidated financial statements and Group management report subject to the source exclusions. No separate ICFR effectiveness or key-audit-matter opinions; no application, model, or compilation assurance.'},
  cashFlow:{status:'source-replay-only',sourcePage:3496,reason:'Exact source cash flows and held-for-sale reconciliation; unavailable as transaction reconstruction.'}};
 return {csv,overrides:Object.fromEntries(transport.map(r=>[r.code,'__source_observation__'])),sourceModel};
}
