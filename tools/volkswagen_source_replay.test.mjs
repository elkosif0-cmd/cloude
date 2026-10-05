import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {harness,plain,root} from './apple-source-harness.mjs';
const dir=process.env.SQC_VOLKSWAGEN_ORACLE_DIR||root+'/tools/fixtures/volkswagen-source-evidence',read=p=>JSON.parse(fs.readFileSync(dir+'/'+p,'utf8'));
const oracle=read('primary-source-oracle.json'),core=read('models/source-model.json');
const adapter=h=>{const a=h.E.reports.volkswagenSource?.reviewedVolkswagenSource('volkswagen-2025');assert.ok(a,'Dedicated Volkswagen adapter required');return a;};
test('Volkswagen immutable source freeze authenticates exact independent primary and reviewed models',()=>{
 const m=read('freeze-manifest.json');for(const[p,s]of Object.entries(m.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(dir+'/'+p)).digest('hex'),s,p);assert.equal(m.primaryCells,776);assert.equal(m.ociComponentCells,280);assert.equal(m.equityComponentCells,264);
});
test('Volkswagen adapter has exact Group IFRS identity and retains all four scoped source models',()=>{
 const s=adapter(harness()).sourceModel;
 assert.equal(s.issuer,'Volkswagen Group');assert.equal(s.issuerCountry,'DE');assert.equal(s.accountingBasis,'IFRS_EU');assert.equal(s.currency,'EUR');assert.equal(s.unit,'million');assert.equal(s.scope,'consolidated');assert.equal(s.periodStart,'2025-01-01');assert.equal(s.periodEnd,'2025-12-31');assert.equal(s.priorPeriodEnd,'2024-12-31');assert.equal(s.sourceSha256,core.source_pdf_sha256);
 assert.deepEqual(plain(s.reviewedFacts.core),core);assert.deepEqual(plain(s.reviewedFacts.management),read('management/models/source-model.json'));assert.deepEqual(plain(s.reviewedFacts.annex),read('annex/models/source-model.json'));assert.deepEqual(plain(s.reviewedFacts.sustainability),read('sustainability-divisions/models/source-tables.json'));
 assert.deepEqual(plain(s.reviewedFacts.coreExceptions),read('source-exceptions.json'));assert.deepEqual(plain(s.reviewedFacts.sustainabilityExceptions),read('sustainability-divisions/source-exceptions.json'));
});
test('all 776 primary amounts, exact labels, original dash metadata and explicit zeros survive replay',()=>{
 const r=adapter(harness()).sourceModel.replay;assert.deepEqual(plain(r.tables.map(t=>t.id)),Object.keys(oracle));let cells=0,dashes=0,zeros=0;
 for(const[id,o]of Object.entries(oracle)){const t=r.tables.find(t=>t.id===id);assert.equal(t.rows.length,o.rows.length);assert.deepEqual(plain(t.columns.map(c=>c.id)),o.columns);
 o.rows.forEach((row,i)=>{const got=t.rows[i];assert.equal(got.id,row.id);assert.equal(got.label,row.label);assert.equal(got.sourcePage,row.sourcePage);assert.equal(got.unit,id==='eps'?'EUR per share':'EUR million');o.columns.forEach((c,j)=>{const cell=got.cells[c],dash=row.displays[j]==='–';assert.equal(cell.sourceValue,row.values[j]);assert.equal(cell.sourceStatus,dash?'reported_dash':'reported_number');assert.equal(cell.value,dash?0:row.values[j]);assert.equal(cell.status,'reported');assert.equal(cell.display,dash?'–':row.values[j]===0?'0':undefined);if(dash){assert.match(cell.context,/carrier/);dashes++;}if(row.values[j]===0)zeros++;cells++;});});}
 assert.equal(cells,776);assert.ok(dashes>100);assert.ok(zeros>0);
});
test('OCI attribution periods and equity IAS8 correction retain exact annual versus instant timing',()=>{
 const ts=adapter(harness()).sourceModel.replay.tables;
 for(const y of ['2025','2024']){for(const id of ['oci_'+y,'equity_'+y]){const t=ts.find(x=>x.id===id);for(const c of t.columns)assert.deepEqual(plain(c.period),{kind:'duration',start:y+'-01-01',end:y+'-12-31'});}
 const eq=ts.find(x=>x.id==='equity_'+y);for(const r of eq.rows)if(['unadjusted_opening','opening','correction','closing'].includes(r.id))for(const cell of Object.values(r.cells))assert.deepEqual(plain(cell.period),{kind:'instant',end:y+(r.id==='closing'?'-12-31':'-01-01')});
 const cf=ts.find(x=>x.id==='cashflow');for(const r of cf.rows)if(['opening','closing','closing_liquidity','securities_loans','gross_liquidity','borrowings','net_liquidity'].includes(r.id))assert.deepEqual(plain(r.cells[y].period),{kind:'instant',end:y+(r.id==='opening'?'-01-01':'-12-31')});}
 assert.equal(ts.find(t=>t.id==='equity_2024').rows.find(r=>r.id==='correction').cells.retained.sourceValue,-726);assert.ok(!ts.find(t=>t.id==='equity_2025').rows.some(r=>r.id==='correction'));
});
test('source audit, ICFR, ESEF and narrow sustainability assurance remain attributed boundaries only',()=>{
 const s=adapter(harness()).sourceModel;assert.equal(s.auditorReference.date,'2026-03-06');assert.equal(s.reviewedFacts.core.assurance.icfr_effectiveness_opinion,false);assert.equal(s.reviewedFacts.core.assurance.esef_pdf_covered,false);assert.equal(s.reviewedFacts.core.assurance.sustainability.overall_level,'limited');assert.equal(s.reviewedFacts.core.assurance.sustainability.reasonable_only.length,3);
 for(const id of ['parent-hgb','sustainability','detailed-notes','ledger-reconstruction','audit-assurance','icfr-effectiveness'])assert.ok(s.replay.unavailable.some(x=>x.id===id),id);
 assert.ok(s.replay.checks.length>100);assert.ok(s.replay.checks.some(x=>x.residual!==0));for(const c of s.replay.checks){assert.equal(c.assurance,'none');assert.equal(c.residual,c.computed-c.reported,c.id);assert.ok(c.operands?.length>0,c.id);}
});
const fixture=h=>{const t=h.E.reports.corpusCompanies.companyTrialBalance('volkswagen-2025');assert.equal(t?.ctx?.sourceModel?.id,'volkswagen-2025');return t;};
const output=(h,t)=>h.E.reports.statements.buildStatements(h.E.reports.tbImport.parseTrialBalance(t.csv),t.overrides,{tax:'income'});
test('named Volkswagen selection returns exact source replay and no fabricated ledger metrics or assurance',()=>{
 const h=harness(),t=fixture(h),o=output(h,t);assert.equal(o.replay.status,'available');assert.equal(o.reconstructionStatus.status,'unavailable');assert.equal(t.balanced,null);assert.equal(t.ctx.auditFirm,'');assert.equal(t.ctx.auditStandard,'HGB / EU Audit Regulation / IDW');assert.equal(o.cf,null);assert.deepEqual(plain(o.soce.rows),[]);assert.deepEqual(plain(o.keys),{});assert.deepEqual(plain(o.pl),[]);assert.deepEqual(plain(o.sfp),[]);
 for(const k of ['balanced','difference','priorBalanced','cashTies','cfDifference'])assert.equal(o.checks[k],null);assert.deepEqual(plain(h.E.reports.analysis.ratios(o)),[]);assert.equal(h.E.reports.analysis.freeCashFlow(o),null);assert.throws(()=>h.E.audit.tbReview.reviewTrialBalance(h.E.reports.tbImport.parseTrialBalance(t.csv),{overrides:t.overrides}),/source|published|unavailable/i);
});
test('actual report renderer includes every primary value with source context and no earned audit opinion',async()=>{
 const h=harness(),W=h.context;fixture(h);await W.SKosifTBReview.openClient('volkswagen-2025');const c=W.__test.compute(),x=W.__test.docX(c);assert.equal(x.sourceVerified,true);assert.equal(x.opinion.opinion,'not-assessed');const html=W.SKosifReportDocs.annual(x);let count=0;
 for(const[id,t]of Object.entries(oracle)){const section=html.match(new RegExp('data-source-table="'+id+'">([\\s\\S]*?)</section>'))?.[1];assert.ok(section,id);for(const r of t.rows){const row=section.match(new RegExp('data-source-row="'+r.id+'">([\\s\\S]*?)</tr>'))?.[1];assert.ok(row);const cells=[...row.matchAll(/<td class="n"([^>]*)>([^<]*)(?:<small>[\s\S]*?<\/small>)?<\/td>/g)];assert.equal(cells.length,t.columns.length);t.columns.forEach((col,j)=>{assert.equal(cells[j][2],r.displays[j]==='–'?'–':new Intl.NumberFormat('en-US',{maximumFractionDigits:10}).format(r.values[j]));count++;});}}
 assert.equal(count,776);assert.match(html,/15,009/);assert.match(html,/–178,506|-178,506/);assert.doesNotMatch(html,/قمنا بمراجعة|rd-sign|Apple Inc\./);const au=W.SKosifReportDocs.auditor(x);assert.match(au,/EY GmbH/);assert.match(au,/2026-03-06/);assert.doesNotMatch(au,/قمنا بمراجعة|rd-sign/);assert.deepEqual(plain(W.SKosifTBReview.rows().rows),[]);
});
test('every one of 232 transport-cell edits is rejected before canonical numeric replay',()=>{
 const h=harness(),t=fixture(h),lines=t.csv.split('\n');let count=0;for(let i=2;i<lines.length;i++)for(const n of [2,3]){const ls=[...lines],f=h.E.reports.tbImport.splitLine(ls[i],',');f[n]=String(Number(f[n])+1);ls[i]=f.map(v=>'"'+v.replace(/"/g,'""')+'"').join(',');const o=output(h,{...t,csv:ls.join('\n')});assert.equal(o.replay.status,'unavailable');assert.deepEqual(plain(o.replay.tables),[]);count++;}assert.equal(count,232);
});
test('identity, dash, zero, comparative restatement, scope and assurance tampering fail closed',async()=>{
 const mutants=[d=>d.ctx.company='Volkswagen AG parent',d=>d.ctx.sourceModel.scope='parent',d=>d.ctx.sourceModel.accountingBasis='HGB',d=>d.ctx.sourceModel.currency='USD',d=>d.ctx.sourceModel.unit='billion',d=>d.ctx.periodStart='2025-02-01',d=>d.ctx.sourceModel.sourceSha256='0'.repeat(64),d=>d.ctx.sourceModel.reviewedFacts.core.tables.cashflow.rows.net_liquidity.values[0]=34500,d=>d.ctx.sourceModel.reviewedFacts.core.tables.segment_revenue.notes=[],d=>d.ctx.sourceModel.reviewedFacts.core.assurance.sustainability.overall_level='reasonable',d=>d.ctx.sourceModel.reviewedFacts.core.assurance.icfr_effectiveness_opinion=true,d=>d.ctx.sourceModel.replay.tables.find(t=>t.id==='equity_2024').rows.find(r=>r.id==='correction').cells.retained.value=0,d=>{const c=d.ctx.sourceModel.replay.tables.find(t=>t.id==='oci_2025').rows[1].cells.hybrid;c.sourceStatus='reported_number';c.sourceValue=0;},d=>d.accepted=[{id:'fake-adjustment',amount:1}],d=>d.tbText=d.tbText.replace('321913','321913.001')];
 for(const mutate of mutants){const h=harness(),W=h.context;fixture(h);await W.SKosifTBReview.openClient('volkswagen-2025');mutate(h.state.skosif_tbreview_v1);const c=W.__test.compute(),x=W.__test.docX(c);assert.equal(c.sourceOnly,true);assert.equal(x.sourceVerified,false);assert.equal(W.__test.sourceCsv(c),null);assert.doesNotMatch(W.SKosifReportDocs.annual(x),/321,913/);}
});
test('primary totals retain full statement scope and source heading typography',()=>{
 const ts=adapter(harness()).sourceModel.replay.tables;assert.equal(ts.find(t=>t.id==='eps').title,'Income Statement');assert.equal(ts.find(t=>t.id==='assets').rows.at(-1).context,'Assets');assert.equal(ts.find(t=>t.id==='liabilities').rows.at(-1).context,'Equity and liabilities');
});
test('arithmetic checks independently recompute from exact source operands and keep every nonzero residual',()=>{
 const s=adapter(harness()).sourceModel,facts=new Map(s.facts.map(f=>[f.id,f]));let nonzero=0;
 for(const check of s.replay.checks){const computed=check.operands.reduce((sum,op)=>{const f=facts.get(op.sourceFactId);assert.ok(f,op.sourceFactId);assert.ok(f.status==='reported_number'||f.status==='reported_dash');return sum+op.sign*(f.status==='reported_dash'?0:f.value);},0);assert.equal(check.computed,computed,check.id);assert.equal(check.residual,computed-check.reported);if(check.residual!==0)nonzero++;}
 assert.ok(nonzero>=71);
});
test('company runtime returns fresh data and strict binding rejects every mutated primary cell',()=>{
 const h=harness(),a=adapter(h),canonical=plain(a.sourceModel);let count=0;
 for(const t of a.sourceModel.replay.tables)for(const r of t.rows)for(const c of t.columns){const cell=r.cells[c.id],old=cell.value;cell.value=old+1;assert.equal(h.E.reports.sourceReplay.sourceModelsEqual(a.sourceModel,canonical),false);cell.value=old;count++;}
 assert.equal(count,776);assert.equal(h.E.reports.sourceReplay.sourceModelsEqual(a.sourceModel,canonical),true);a.sourceModel.reviewedFacts.core.tables.income.rows.revenue.values[0]=0;assert.equal(adapter(h).sourceModel.reviewedFacts.core.tables.income.rows.revenue.values[0],321913);
});
test('serialized source CSV distinguishes source dashes, printed zero and numerical carrier for all 776 cells',async()=>{
 const h=harness(),W=h.context;fixture(h);await W.SKosifTBReview.openClient('volkswagen-2025');const x=W.__test.sourceCsv(W.__test.compute());for(const k of ['source_status','source_value','source_display','normalized_value','value_role'])assert.ok(x.headers.includes(k),k);const at=k=>x.headers.indexOf(k);let count=0,dashes=0,zeros=0;
 for(const[id,t]of Object.entries(oracle))for(const r of t.rows)t.columns.forEach((c,j)=>{const row=x.rows.find(z=>z[at('source_fact_id')]===`primary.${id}.${r.id}.${c}`);assert.ok(row);const dash=r.displays[j]==='–';assert.equal(row[at('source_status')],dash?'reported_dash':'reported_number');assert.equal(row[at('source_value')],dash?'':r.values[j]);assert.equal(row[at('source_display')],dash?'–':r.values[j]===0?'0':r.values[j]);assert.equal(row[at('value')],dash?'–':r.values[j]===0?'0':r.values[j]);if(dash){assert.equal(row[at('value_role')],'rendering_only_carrier');dashes++;}if(r.values[j]===0)zeros++;count++;});
 assert.equal(count,776);assert.ok(dashes>100);assert.ok(zeros>0);
});
const serialization=fs.readFileSync(root+'/ui/core/sk.js','utf8').split('\n').filter(l=>/^function (safeCell|csv)\(/.test(l)).join('\n');const serialize=vm.runInNewContext(serialization+';csv');
function csvRows(s){s=s.replace(/^\uFEFF/,'');const out=[],row=[];let value='',quoted=false;for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(quoted&&s[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(!quoted&&(c===','||c==='\n')){row.push(value);value='';if(c==='\n')out.push(row.splice(0));}else if(c!=='\r'||quoted)value+=c;}row.push(value);out.push(row);return out;}
const encoded=v=>/^[=+\-@]/.test(String(v))?"'"+v:String(v);
test('actual serialized Volkswagen CSV retains all original source values, glyphs and periods and refuses operational reimport',async()=>{
 const h=harness(),W=h.context;await W.SKosifTBReview.openClient('volkswagen-2025');const c=W.__test.compute(),x=W.__test.sourceCsv(c),text=serialize(x.headers,x.rows),parsed=csvRows(text),headers=parsed.shift(),rows=parsed.map(v=>Object.fromEntries(headers.map((k,i)=>[k,v[i]])));assert.equal(rows.length,776);let dashes=0,zeros=0;
 for(const[id,t]of Object.entries(oracle))for(const r of t.rows)t.columns.forEach((col,j)=>{const row=rows.find(x=>x.source_fact_id===`primary.${id}.${r.id}.${col}`),dash=r.displays[j]==='–';assert.ok(row);assert.equal(row.source_status,dash?'reported_dash':'reported_number');assert.equal(row.source_value,dash?'':encoded(r.values[j]));assert.equal(row.value,dash?'–':encoded(r.values[j]));assert.equal(row.source_display,row.value);assert.equal(row.line,r.label);assert.equal(row.source_page,String(r.sourcePage));assert.equal(row.unit,id==='eps'?'EUR per share':'EUR million');if(dash){assert.equal(row.normalized_value,'0');assert.equal(row.value_role,'rendering_only_carrier');dashes++;}if(r.values[j]===0){assert.equal(row.value,'0');assert.equal(row.source_status,'reported_number');zeros++;}});
 assert.ok(dashes>100);assert.ok(zeros>0);const fresh=harness();assert.equal(await fresh.context.SKosifTBReview.load(text,'Volkswagen-source.csv'),false);assert.equal(fresh.context.__test.compute(),null);
});
test('final semantic coverage resolves all four current ledger hashes without changing locked core evidence',()=>{
 const c=read('coverage-union-final.json'),s=adapter(harness()).sourceModel;assert.equal(c.semantic_ledger_pages,673);assert.deepEqual(plain(s.reviewedFacts.coverage),c);assert.equal(c.source_coverage_union_passed,true);for(const x of Object.values(c.provenance))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(dir+'/'+x.ledger_path)).digest('hex'),x.ledger_sha256);assert.equal(s.reviewedModelSha256,read('freeze-manifest.json').reviewedCoreSha256);
});
test('Volkswagen is an openable named source model and pending named-company records remain blocked',()=>{
 const h=harness(),rows=h.E.reports.corpusCompanies.auditModelCatalog(),vw=rows.find(r=>r.id==='volkswagen-2025');assert.equal(vw.modelStatus,'source-replayed');assert.equal(vw.company,'Volkswagen Group');assert.equal(vw.openable,true);assert.equal(vw.sourceOnly,true);assert.equal(rows.filter(r=>r.modelStatus==='source-replayed').length,5);assert.equal(rows.filter(r=>r.modelStatus==='partially-supported').length,1);for(const r of rows.filter(r=>r.modelStatus==='pending-review'||r.modelStatus==='unavailable'))assert.equal(h.E.reports.corpusCompanies.companyTrialBalance(r.id),null);
});
test('Volkswagen visible audit context uses reported HGB/EU/IDW basis and excludes the following report cover',async()=>{
 const h=harness(),a=adapter(h),expected='HGB / EU Audit Regulation / IDW';assert.equal(a.sourceModel.sourceAuditLabel,expected);assert.equal(a.sourceModel.auditorReference.name,'EY GmbH & Co. KG Wirtschaftsprüfungsgesellschaft');assert.match(a.sourceModel.auditorReference.scope,/German text is authoritative/);
 const entry=h.E.reports.corpusCompanies.auditModelCatalog().find(r=>r.id==='volkswagen-2025');assert.equal(entry.standard,expected);assert.deepEqual(plain(entry.pages),[3650,4322]);const t=fixture(h);assert.equal(t.ctx.auditStandard,expected);assert.equal(t.company.standard,expected);
 const W=h.context;await W.SKosifTBReview.openClient('volkswagen-2025');const c=W.__test.compute(),x=W.__test.docX(c);assert.equal(x.ctx.auditStandard,expected);assert.doesNotMatch(W.SKosifReportDocs.auditor(x),/\bISA\b|International Standards on Auditing/);
});
test('audit-scope supplement is separately hashed and directly source-bound without rewriting numeric oracles',()=>{
 const o=read('audit-source-scope-oracle.json'),s=adapter(harness()).sourceModel;assert.equal(s.sourceAuditLabel,o.sourceAuditLabel);assert.equal(s.auditorReference.name,o.auditor);assert.equal(o.additionalIsaComplianceClaim,false);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(dir+'/audit-source-scope-oracle.json')).digest('hex'),s.sourceAuditSha256);for(const[p,sha]of Object.entries(o.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(dir+'/'+p)).digest('hex'),sha);assert.equal(read('freeze-manifest.json').primaryOracleSha256,'dd4380bb43f701dd2bf50bdfd6e878f2bcfae00e6a8eaf664a08d3b8f43c24e2');
});
