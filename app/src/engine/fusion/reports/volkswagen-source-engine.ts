/* Faithful published source observations, not underlying ledger data or earned audit assurance. */
import { VOLKSWAGEN_REVIEWED, VOLKSWAGEN_PRIMARY_ROWS, VOLKSWAGEN_HASHES } from './source-data/volkswagen';
import type { PublishedReplay, SourceTable, SourceCheck, SourcePeriod, SourceCell } from './source-replay-engine';
export type VolkswagenSourceCell=SourceCell & {sourceStatus:'reported_number'|'reported_dash';sourceValue:number|null};
const annual=(y:string):SourcePeriod=>({kind:'duration',start:y+'-01-01',end:y+'-12-31'});
const instant=(end:string):SourcePeriod=>({kind:'instant',end});
const TITLES:Record<string,string>={income:'Income Statement',eps:'Income Statement',oci_2025:'Statement of Comprehensive Income',oci_2024:'Statement of Comprehensive Income',assets:'Balance Sheet',liabilities:'Balance Sheet',equity_2024:'Statement of Changes in Equity',equity_2025:'Statement of Changes in Equity',cashflow:'Cash Flow Statement'};
const OCI_COLS:Record<string,string>={total:'Total',shareholders:'Income attributable to Volkswagen AG shareholders',hybrid:'Income attributable to Volkswagen AG hybrid capital investors',nci:'Income attributable to non-controlling interests'};
const EQUITY_COLS:Record<string,string>={subscribed:'Subscribed capital',capital:'Capital reserve',retained:'Retained earnings',currency:'Currency translation reserve',hedge1:'Cash flow hedges (OCI I)',hedge2:'Deferred costs of hedging (OCI II)',equity_debt:'Equity and debt instruments',equity_accounted:'Equity-accounted investments',hybrid:'Equity attributable to Volkswagen AG hybrid capital investors',parent_and_hybrid:'Equity attributable to Volkswagen AG shareholders and hybrid capital investors',nci:'Non-controlling interests',total:'Total equity'};
const TOTALS=new Set(['profit','total','closing','closing_liquidity','net_liquidity']);
const OCI_FORMULAS:Record<string,Record<string,number>>={pension_net:{pension_before:1,pension_tax:1},equity_net:{equity_before:1,equity_tax:1},nonreclass:{pension_net:1,equity_net:1,associate_nonreclass:1},fx_before:{fx_gains:1,fx_reclassified:1},fx_net:{fx_before:1,fx_tax:1},hedge1_before:{hedge1_fair:1,hedge1_transfer:1},hedge1_net:{hedge1_before:1,hedge1_tax:1},hedge2_before:{hedge2_fair:1,hedge2_transfer:1},hedge2_net:{hedge2_before:1,hedge2_tax:1},debt_before:{debt_fair:1,debt_transfer:1},debt_net:{debt_before:1,debt_tax:1},reclass:{fx_net:1,hedge1_net:1,hedge2_net:1,debt_net:1,associate_reclass:1},oci_before:{pension_before:1,equity_before:1,associate_nonreclass:1,fx_before:1,hedge1_before:1,hedge2_before:1,debt_before:1,associate_reclass:1},oci_tax:{pension_tax:1,equity_tax:1,fx_tax:1,hedge1_tax:1,hedge2_tax:1,debt_tax:1},oci:{nonreclass:1,reclass:1},total:{profit:1,oci:1}};
function rowContext(id:string,rid:string,index:number):string{
 if(id==='income'&&['current_tax','deferred_tax'].includes(rid))return 'Income tax income/expense';
 if(id==='income'&&['nci','hybrid','parent'].includes(rid))return 'of which attributable to';
 if(id==='eps')return 'Per-share amounts in EUR, ordinary and preferred share classes; not EUR million.';
 if(id==='assets'&&rid==='total')return 'Assets';
 if(id==='liabilities'&&rid==='total')return 'Equity and liabilities';
 if(id==='assets')return 'Assets / '+(index<12?'Non-current assets':'Current assets');
 if(id==='liabilities')return 'Equity and liabilities / '+(index<8?'Equity':index<16?'Non-current liabilities':'Current liabilities');
 if(id==='cashflow')return '2024 commercial paper comparatives reclassified to 2025 presentation. Footnote 1: net of impairment reversals; footnote 2: commercial paper separately presented from fiscal 2025.';
 if(id.startsWith('oci_'))return 'Consolidated Volkswagen Group; separate attribution columns. '+(['fx_gains','fx_reclassified'].includes(rid)?'Exchange differences on translating foreign operations.':rid.startsWith('debt_')?'Fair value valuation of debt instruments that may be reclassified to profit or loss.':'');
 if(id.startsWith('equity_'))return 'Consolidated Volkswagen Group; Other reserves comprises currency translation, hedging (OCI I and OCI II), equity/debt instruments and equity-accounted investments. Hybrid investor equity is distinct from shareholders.';
 return '';
}
export function reviewedVolkswagenSource(id:string){
 if(id!=='volkswagen-2025')return null;
 const reviewedFacts=structuredClone(VOLKSWAGEN_REVIEWED);
 const tables:SourceTable[]=Object.entries(VOLKSWAGEN_PRIMARY_ROWS).map(([tid,t])=>{
  const matrix=tid.startsWith('oci_')||tid.startsWith('equity_'),eq=tid.startsWith('equity_'),y=tid.slice(-4),stock=['assets','liabilities'].includes(tid);
  const columns=t.columns.map(cid=>({id:cid,label:matrix?(eq?EQUITY_COLS:OCI_COLS)[cid]:cid,period:matrix?annual(y):stock?instant(cid+'-12-31'):annual(cid),...(matrix?{dimension:cid,unit:'EUR million'}:{})}));
  return {id:tid,title:TITLES[tid],sourcePages:[...new Set(t.rows.map(r=>r.sourcePage))],columns,rows:t.rows.map((r,i)=>{
   const cells=Object.fromEntries(columns.map((c,j)=>{
    let period:SourcePeriod|undefined;
    if(eq&&['unadjusted_opening','opening','correction','closing'].includes(r.id))period=instant(y+(r.id==='closing'?'-12-31':'-01-01'));
    if(tid==='cashflow'&&['opening','closing','closing_liquidity','securities_loans','gross_liquidity','borrowings','net_liquidity'].includes(r.id))period=instant(c.id+(r.id==='opening'?'-01-01':'-12-31'));
    const dash=r.displays[j]==='–';const cell:VolkswagenSourceCell={value:dash?0:r.values[j],status:'reported',sourceStatus:dash?'reported_dash':'reported_number',sourceValue:r.values[j],sourceFactId:`primary.${tid}.${r.id}.${c.id}`,...(period?{period}:{}),...(dash?{display:'–',context:'Reported source dash. Numeric 0 is a rendering carrier only; no reported numeric zero. It denotes no additive movement only within the stated arithmetic checks.'}:r.values[j]===0?{display:'0'}:{})};return [c.id,cell];
   }));
   return {id:r.id,label:r.label,unit:tid==='eps'?'EUR per share':'EUR million',sourcePage:r.sourcePage,level:TOTALS.has(r.id)?'total':eq&&r.id==='comprehensive'||!!OCI_FORMULAS[r.id]&&tid.startsWith('oci_')||reviewedFacts.core.equations.some(e=>e.table===tid&&e.target===r.id)?'subtotal':'line',status:'reported',context:[rowContext(tid,r.id,i),r.context].filter(Boolean).join(' '),cells};
  })};
 });
 const checks:SourceCheck[]=[];
 function check(t:SourceTable,targetRow:string,targetCol:string,terms:Array<[string,string,number]>,idSuffix=''){
  const get=(r:string,c:string)=>t.rows.find(x=>x.id===r)!.cells[c];
  const target=get(targetRow,targetCol),reported=target.value!,computed=terms.reduce((v,[r,c,s])=>v+s*get(r,c).value!,0),residual=computed-reported,roundingBound=(terms.length+1)*0.5;
  checks.push({id:`${t.id}.${targetRow}.${targetCol}${idSuffix}`,reported,computed,residual,unit:'EUR million',sourcePages:t.sourcePages,status:residual===0?'exact':Math.abs(residual)<=roundingBound?'rounding-residual':'mismatch',assurance:'none',operands:terms.map(([r,c,sign])=>({sourceFactId:get(r,c).sourceFactId!,sign})),roundingBound});
 }
 for(const t of tables){
  if(['income','assets','liabilities','cashflow'].includes(t.id))for(const eq of reviewedFacts.core.equations.filter(e=>e.table===t.id))for(const c of t.columns)check(t,eq.target,c.id,Object.entries(eq.terms).map(([rid,sign])=>[rid,c.id,sign!]));
  if(t.id.startsWith('oci_')){for(const[target,terms]of Object.entries(OCI_FORMULAS))for(const c of t.columns)check(t,target,c.id,Object.entries(terms).map(([rid,sign])=>[rid,c.id,sign]));for(const r of t.rows)check(t,r.id,'total',['shareholders','hybrid','nci'].map(c=>[r.id,c,1]),'.attribution');}
  if(t.id.startsWith('equity_')){for(const c of t.columns){check(t,'comprehensive',c.id,[['profit',c.id,1],['oci',c.id,1]]);check(t,'closing',c.id,['opening','comprehensive','disposal','capital','dividends','ownership','other'].map(r=>[r,c.id,1]));if(t.id==='equity_2024')check(t,'opening',c.id,[['unadjusted_opening',c.id,1],['correction',c.id,1]]);}for(const r of t.rows){check(t,r.id,'parent_and_hybrid',t.columns.slice(0,9).map(c=>[r.id,c.id,1]),'.components');check(t,r.id,'total',['parent_and_hybrid','nci'].map(c=>[r.id,c,1]),'.attribution');}}
 }
 const limitations=[
  'All 673 report pages have disjoint semantic source-review records. Numeric replay covers 776 primary-statement cells only; it is not a transcription of all note, governance or sustainability tables.',
  'The locked core revision 2 remains unchanged: 26 selected tables and 536 cells. Separately hashed direct-source primary evidence completes OCI attribution and all equity components, including IAS 8 restatement rows.',
  'A source dash remains sourceValue null and sourceStatus reported_dash. The shared renderer uses numeric 0 only as a carrier for the exact dash glyph. Explicit printed zeros remain reported_number and display 0. Additive source checks alone interpret a dash as no movement; no inferred ratio or availability follows.',
  'The supplied corpus byte hash is verified; official-publisher authenticity is not independently established. Source replay is not underlying ledger reconstruction or an audit assurance engagement.',
  'Parent HGB, consolidated Group IFRS, divisions, brand groups, Chinese joint ventures and other investees retain separate scopes in reviewedFacts. Chinese joint-venture volume measures do not make joint-venture revenue consolidated Group revenue.',
  '2025 segment reporting recasts 2024. The cash-flow commercial-paper comparative is adjusted. Mobility VaR confidence and horizon changed; its growth is not like-for-like. Associate periods are not assumed calendar years.',
  'Reported source totals are preserved even when displayed rounded components sum differently. Source exceptions remain unresolved unless the source review records a specific resolution.',
  'EY financial audit attribution is reasonable assurance over its specified source scope, not app/model assurance, a separate KAM opinion or an ICFR-effectiveness opinion. Separate sustainability assurance is limited overall, reasonable only for EU Taxonomy and the named DCI tables; carbon-certificate effectiveness was not assured. ESEF assurance does not cover this compiled English PDF.',
  ...reviewedFacts.core.source_exceptions.map(x=>x.id+': '+x.detail)
 ];
 const replay:PublishedReplay={schemaVersion:'1.0',mode:'published-statement-replay',tables,checks,limitations,unavailable:[
  {id:'parent-hgb',reason:'Separate parent HGB disclosures remain in reviewedFacts.management; not consolidated Group IFRS actuals.'},
  {id:'sustainability',reason:'Selected sustainability facts, geographic annex and brand/division facts retain their original units, periods, perimeters, exceptions and narrow assurance. They are not financial-statement replay.',sourcePages:[3863,4110]},
  {id:'detailed-notes',reason:'All reviewed source models are retained, including core selected notes; full note-layout replay and all-note numerical transcription are not implemented.',sourcePages:[4119,4293]},
  {id:'forecasts',reason:'Management forecasts, targets, scenarios and risk scores remain separately scoped, not presented as actual financial statement amounts.'},
  {id:'ledger-reconstruction',reason:'Source observations are not transactions, journal entries or a genuine trial balance.'},
  {id:'ratio-analytics',reason:'No validated transaction reconstruction, generated ratios, EBITDA or ledger-derived statements are available.'},
  {id:'icfr-effectiveness',reason:'No separate source ICFR-effectiveness opinion; no app audit procedures.',sourcePages:[4294,4307]},
  {id:'audit-assurance',reason:'Attribution to the source auditor does not earn audit assurance for source replay, the compiled corpus, model or app.'}
 ]};
 const quote=(v:unknown)=>'"'+String(v??'').replace(/"/g,'""')+'"';
 const transport=tables.filter(t=>t.columns[0].id==='2025').flatMap(t=>t.rows.map(r=>({code:`VW_${t.id}_${r.id}`,label:r.label,current:r.cells['2025'].value,prior:r.cells['2024'].value})));
 const csv=['# SQC source-only: '+id,'code,name,balance,prior',...transport.map(r=>[r.code,r.label,r.current,r.prior].map(quote).join(','))].join('\n');
 const sourceModel={kind:'published-statements' as const,id,issuer:'Volkswagen Group',legalParent:'Volkswagen Aktiengesellschaft',issuerCountry:'DE',report:'Annual Report 2025',accountingBasis:'IFRS_EU',currency:'EUR',unit:'million',scope:'consolidated',entities:'Volkswagen Aktiengesellschaft and its consolidated subsidiaries',periodStart:'2025-01-01',periodEnd:'2025-12-31',priorPeriodEnd:'2024-12-31',sourceFile:'global_financial_and_audit_research_bundle_extended_verified.pdf',sourceSha256:reviewedFacts.core.source_pdf_sha256,reviewedModelSha256:VOLKSWAGEN_HASHES.core,primarySourceSha256:VOLKSWAGEN_HASHES.primary,sourceMatrixSha256:VOLKSWAGEN_HASHES.sourceMatrix,sourceAuditLabel:'HGB / EU Audit Regulation / IDW',sourceAuditSha256:'8246f467959e81ee912ab45e404e6a16ddce60a576746e74217f529f9da7b5de',reviewedEvidenceHashes:{...VOLKSWAGEN_HASHES},sourcePages:[4112,4113,4114,4115,4116,4117,4118],sourceReportPages:[461,462,463,464,465,466,467],reviewedPageRange:[3650,4322],reviewedFacts,replay,
  facts:tables.flatMap(t=>t.rows.flatMap(r=>t.columns.map(c=>{const cell=r.cells[c.id] as VolkswagenSourceCell;return {id:cell.sourceFactId,label:r.label,value:cell.sourceValue,status:cell.sourceStatus,unit:c.unit??r.unit,period:cell.period??c.period,sourcePage:r.sourcePage,context:r.context};}))),
  auditorReference:{name:reviewedFacts.core.assurance.financial.auditor+' Wirtschaftsprüfungsgesellschaft',opinion:reviewedFacts.core.assurance.financial.opinion,date:reviewedFacts.core.assurance.financial.date,pages:reviewedFacts.core.assurance.financial.pages,scope:'Original FY2025 consolidated financial statements and specified Group management report under Sec. 317 HGB, EU Audit Regulation (No 537/2014) and German Generally Accepted Standards for Financial Statement Audits promulgated by IDW; the German text is authoritative and this English text is a translation, excluding sustainability and specified other information. No separate KAM or ICFR-effectiveness opinion; no application, transcription or corpus assurance.'},
  cashFlow:{status:'source-replay-only',sourcePage:4118,reason:'Exact reported cash flows and Group liquidity reconciliation; generated cash flows unavailable.'}};
 return {csv,overrides:Object.fromEntries(transport.map(r=>[r.code,'__source_observation__'])),sourceModel};
}
