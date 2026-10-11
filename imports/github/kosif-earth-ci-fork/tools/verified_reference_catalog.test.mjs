import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {harness,plain,root} from './apple-source-harness.mjs';
const input=JSON.parse(fs.readFileSync(root+'/tools/fixtures/verified-reference-index/companies.json'));
const supported=['apple-2024','pg-2026','homedepot-2025','mcdonalds-2022','mercedes-2025','volkswagen-2025'];
test('both catalog routes use all 50 verified identities and corrected physical page ownership',()=>{
 const {E}=harness(),audit=E.audit.globalBenchmarks.REPORTS,list=E.reports.globalCorpus.reportList();
 assert.equal(audit.length,50);assert.equal(list.length,50);
 assert.equal(new Set(input.map(r=>r.company_id)).size,46);
 for(const r of input){const a=audit.find(x=>x.id===r.id),b=list.find(x=>x.id===r.id);assert.ok(a,r.id);assert.ok(b,r.id);assert.deepEqual(plain(a.pages),[r.from,r.to],r.id);assert.deepEqual([b.from,b.to],[r.from,r.to],r.id);assert.equal(a.reference.company_id,r.company_id);assert.equal(b.reference.review_status,r.review_status);}
 const sorted=[...audit].sort((a,b)=>a.pages[0]-b.pages[0]);let next=2;for(const r of sorted){assert.equal(r.pages[0],next,r.id);next=r.pages[1]+1;}assert.equal(next,12507);
});
test('CBA canonical FY2026 identity keeps legacy lookup and opens one audit file under either id',async()=>{
 const {E,context:W}=harness(),B=E.audit.globalBenchmarks,C=E.reports.corpusCompanies,G=E.reports.globalCorpus;
 assert.equal(B.reportOf('cba-2025').id,'cba-2026');assert.equal(B.reportOf('cba-2026').fy,'FY2026 (ended 2026-06-30)');
 assert.equal(C.corpusCompany('cba-2025').id,'cba-2026');assert.equal(C.corpusCompany('cba-2026').yearEnd,'2026-06-30');assert.deepEqual(plain(G.reportStructure('cba-2025')),plain(G.reportStructure('cba-2026')));
 /* R16 (P5): both ids open the one FY2026 audit file on the corpus model (#143 asserted they never open) */
 const t=C.companyTrialBalance('cba-2026');assert.ok(t);assert.equal(C.companyTrialBalance('cba-2025').csv,t.csv);assert.equal(C.companyTrialBalance('cba-2025').ctx.corpusId,'cba-2026');
 for(const id of ['cba-2025','cba-2026']){assert.equal(C.sourceUnavailableReason(id),null);assert.ok(await W.SKosifTBReview.openClient(id),id);assert.equal(W.__test.compute().d.tbText,t.csv);}
});
test('Panasonic is navigable but pending with unknown accounting and audit basis',async()=>{
 const {E,context:W}=harness(),p=E.audit.globalBenchmarks.reportOf('panasonic-2024');assert.ok(p);assert.equal(p.framework,'Unknown — not reviewed');assert.equal(p.standard,'unknown');assert.equal(p.auditor,'');
 const c=E.reports.corpusCompanies.auditModelCatalog().find(r=>r.id===p.id);assert.equal(c.modelStatus,'pending-review');assert.equal(c.openable,false);assert.equal(E.reports.corpusCompanies.companyTrialBalance(p.id),null);assert.deepEqual(plain(E.reports.globalCorpus.reportStructure(p.id)),[]);
 for(const fn of ['openClient','loadCorpus','showcase'])assert.ok(!await W.SKosifTBReview[fn](p.id));
});
test('Allianz is explicitly parent-company HGB and SoftBank retains report and fiscal year distinction',()=>{
 const {E}=harness(),a=E.audit.globalBenchmarks.reportOf('allianz-2025');assert.equal(a.framework,'HGB');assert.equal(a.kind,'Parent-company annual report');assert.equal(a.sourceAuditLabel,'HGB / EU Audit Regulation / IDW');
 assert.equal(E.reports.globalCorpus.reportList().find(r=>r.id===a.id).fw,'HGB');assert.equal(E.audit.globalBenchmarks.reportOf('softbank-2026').fy,'FY2025 (ended 2026-03-31); report 2026');
});
test('source-review completion never promotes uninstalled adapters or introductory Apple years',()=>{
 const {E}=harness(),catalog=E.reports.corpusCompanies.auditModelCatalog();assert.equal(catalog.length,50);assert.deepEqual(plain(catalog.filter(r=>r.openable).map(r=>r.id).sort()),[...supported].sort());
 const completed=catalog.filter(r=>r.reference.review_status==='complete_source_review');assert.equal(completed.length,8);assert.equal(completed.reduce((n,r)=>n+r.reference.complete_source_review_page_count,0),2387);
 for(const id of ['telekom-2025','bp-2025','unilever-2025','apple-2020','apple-2023'])assert.equal(catalog.find(r=>r.id===id).openable,false,id);
 assert.equal(catalog.find(r=>r.id==='apple-2024').reference.review_status,'partial_source_review');
});
test('current section navigation cannot cross corrected report boundaries and unknown classification is explicit',()=>{
 const {E}=harness(),G=E.reports.globalCorpus;
 for(const r of G.reportList())for(const s of G.reportStructure(r.id)){assert.ok(s.page>=r.from&&s.page<=r.to,r.id+':'+s.page);}
 const pan=G.reportCompatibility([]).find(r=>r.id==='panasonic-2024');assert.equal(pan.structureStatus,'not-classified');
 assert.equal(G.summary().sectionStatisticsReports,49);assert.equal(G.summary().reports,50);assert.equal(G.summary().completeSourceReviewReports,8);
});

test('rendered reference catalog discloses indexing, source-review scope and unclassified sections',()=>{
 const h=harness(),W=h.context;W.document={addEventListener:()=>{}};W.SKCharts={donut:()=>'',hbars:()=>''};
 vm.runInContext(fs.readFileSync(root+'/ui/features/audit-bench.js','utf8').replace(/\}\)\(\);\s*$/, 'window.__referenceTest={corpusTab,cosTab,select:id=>{rep=id;}};})();'),W);
 const ui=W.__referenceTest,html=ui.corpusTab();assert.doesNotMatch(html,/قراءة كاملة لكل صفحة|صُنّفت كل صفحة من الحزمة/);assert.match(html,/50 تقرير/);assert.match(html,/46 شركة/);assert.match(html,/2,387/);assert.match(html,/49 تقرير/);
 ui.select('panasonic-2024');const pan=ui.corpusTab();assert.match(pan,/فحص تعريفي للمصدر/);assert.match(pan,/لم تُفهرس أقسام هذا التقرير/);assert.match(ui.cosTab(),/HGB \/ EU Audit Regulation \/ IDW/);
 ui.select('cba-2025');assert.match(ui.corpusTab(),/FY2026/);
});
test('narrative prompts and integrated appendix never equate page indexing with complete semantic review',()=>{
 const h=harness(),W=h.context,sys=h.E.reports.narrative.systemInstruction();assert.doesNotMatch(sys,/قرأنا حزمة البحث كاملة|أكثر من 30 دولة/);assert.match(sys,/50/);assert.match(sys,/49/);assert.match(sys,/2387/);
 vm.runInContext(fs.readFileSync(root+'/ui/features/integrated-report.js','utf8').replace(/\}\)\(\);\s*$/, 'window.__integratedIndexTest={appendix,compatibilityTable};})();'),W);
 const html=W.__integratedIndexTest.appendix({q:{score:0,items:[]},narr:{source:{},narrative:{}}});assert.doesNotMatch(html,/قرأت SQC حزمة البحث كاملة|التقارير الـ50/);assert.match(html,/50 تقرير/);assert.match(html,/التقارير الـ49/);
 const pan=html.match(/<tr><td><b>Panasonic[\s\S]*?<\/tr>/)?.[0];assert.ok(pan);assert.match(pan,/لم تُفهرس/);assert.doesNotMatch(pan,/مغطى هيكلياً|0%/);
});
test('legacy CBA IDs retain leave-one-out behavior across advisory reference routes',()=>{
 const {E}=harness(),B=E.audit.globalBenchmarks,R=E.audit.corpusReplay;
 assert.deepEqual(plain(B.themePrior({sector:'banking',exclude:'cba-2025'})),plain(B.themePrior({sector:'banking',exclude:'cba-2026'})));
 assert.deepEqual(plain(R.sectorPrior('banking','cba-2025')),plain(R.sectorPrior('banking','cba-2026')));
 assert.equal(R.typicalKamCount('ISA','cba-2025'),R.typicalKamCount('ISA','cba-2026'));
 const review=E.audit.tbReview.reviewTrialBalance(E.reports.tbImport.parseTrialBalance(E.reports.tbImport.SAMPLE_TB_CSV));const input={fs:review.fs,risks:review.risks,materiality:review.materiality.overall,sector:'banking'};assert.deepEqual(plain(E.audit.kam.suggestKams({...input,exclude:'cba-2025'})),plain(E.audit.kam.suggestKams({...input,exclude:'cba-2026'})));
});
test('source-index provenance is reproducible and exposes separate page ownership and review counts',()=>{
 const {E}=harness(),R=E.reports.referenceIndex;for(const [name,sha] of Object.entries(R.REFERENCE_INPUT_HASHES))assert.equal(createHash('sha256').update(fs.readFileSync(root+'/tools/fixtures/verified-reference-index/'+name)).digest('hex'),sha,name);assert.equal(R.canonicalReferenceId('cba-2025'),'cba-2026');assert.equal(R.legacyReferenceId('cba-2026'),'cba-2025');assert.equal(R.canonicalReferenceId('no-such-model'),'no-such-model');assert.equal(R.referenceReport('no-such-model'),undefined);
 assert.equal(R.REFERENCE_METADATA.total_physical_pages,12506);assert.equal(R.REFERENCE_METADATA.report_blocks,50);assert.equal(R.REFERENCE_METADATA.distinct_companies,46);assert.equal(R.REFERENCE_DOCUMENT_GROUPS[0].from_page,1);assert.equal(R.REFERENCE_DOCUMENT_GROUPS[0].to_page,1);assert.equal(R.REFERENCE_METADATA.source_sha256,'8e28ceaac879a1066646152f6dcf567f02457242184068744c0bc37d31812802');
});
test('CI executes verified-index generation parity and catalog regressions',()=>{
 const y=fs.readFileSync(root+'/.github/workflows/sqc-apple-source.yml','utf8');assert.match(y,/python3 tools\/build_reference_index.py --check/);assert.match(y,/--test[^\n]+tools\/verified_reference_catalog.test.mjs/);
 assert.equal((y.match(/- 'tools\/verified_reference_catalog.test.mjs'/g)||[]).length,2);assert.equal((y.match(/- 'tools\/build_reference_index.py'/g)||[]).length,2);
});
test('Audit pickers display source-review status independently from application-model acceptance',()=>{
 const {E,context:W}=harness(),catalog=E.reports.corpusCompanies.auditModelCatalog(),selector=W.__test.corpusPicker();
 for(const id of ['telekom-2025','bp-2025','unilever-2025','panasonic-2024','apple-2024']){
  const c=catalog.find(r=>r.id===id),row=W.__test.bundleRows([c]),option=selector.match(new RegExp('<option value="'+id+'"[^>]*>[\\s\\S]*?</option>'))?.[0];assert.ok(option,id);
  assert.ok(row.includes(c.reference.review_label_ar),id+': row source review');assert.ok(option.includes(c.reference.review_label_ar),id+': selector source review');
  assert.match(row,/نموذج التطبيق:/);assert.match(option,/نموذج التطبيق:/);
  /* R16 (P5): pending review is the model's label, not a lock — a company with a corpus model opens as an audit file;
     one without statements in the bundle (Panasonic) stays disabled */
  if(id!=='apple-2024'){assert.equal(c.modelStatusAr,'بانتظار مراجعة واعتماد نموذج التطبيق');assert.equal(c.openable,false);
   if(id==='panasonic-2024'){assert.equal(c.auditFile,false);assert.match(row,/disabled/);assert.doesNotMatch(row,/data-bundle-add|data-bundle-go/);assert.match(option,/disabled/);}
   else{assert.equal(c.auditFile,true);assert.match(row,/data-bundle-add="[^"]+">فتح كملف مراجعة/);assert.doesNotMatch(option,/disabled/);}}
  if(['telekom-2025','bp-2025','unilever-2025'].includes(id)){assert.equal(c.reference.review_status,'complete_source_review');assert.doesNotMatch(row,/بانتظار مراجعة المصدر/);assert.doesNotMatch(option,/بانتظار مراجعة المصدر/);}
 }
 assert.deepEqual(plain(catalog.filter(r=>r.openable).map(r=>r.id).sort()),[...supported].sort());
});
