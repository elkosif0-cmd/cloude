import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {harness,plain,root} from './apple-source-harness.mjs';

const SOURCE_LABEL='HGB / EU Audit Regulation / IDW';
const ID='volkswagen-2025';
function referenceView(){
 const h=harness(),W=h.context,events={};let view;
 W.document={addEventListener(){}};
 W.SKCharts={donut:()=>'',hbars:()=>''};
 W.SK.view=(id,value)=>{if(id==='auditbench')view=value;};
 vm.runInContext(fs.readFileSync(root+'/ui/features/audit-bench.js','utf8'),W);
 const node={dataset:{},innerHTML:'',addEventListener:(kind,fn)=>{events[kind]=fn;},querySelector:()=>null};
 view.render(node);
 const click=(attr,key,value)=>events.click({target:{closest:selector=>selector===`[${attr}]`?{dataset:{[key]:value}}:null}});
 const tab=value=>click('data-ab-tab','abTab',value);
 const standard=value=>click('data-ab-std','abStd',value);
 const report=value=>events.change({target:{matches:selector=>selector==='[data-ab-rep]',value}});
 return{h,node,tab,standard,report};
}
const companyRow=html=>(html.match(/<tr>[\s\S]*?<\/tr>/g)||[]).find(r=>r.includes('Volkswagen Group'));
const volkswagenCards=html=>(html.match(/<article class="ab-kam">[\s\S]*?<\/article>/g)||[]).filter(r=>r.includes('Volkswagen Group'));

test('Volkswagen source audit label is separate from the unchanged operational standard enum and filter',()=>{
 const h=harness(),G=h.E.audit.globalBenchmarks,report=G.reportOf(ID),rows=G.kamLibrary({q:'Volkswagen'});
 assert.equal(report.standard,'ISA');assert.equal(report.sourceAuditLabel,SOURCE_LABEL);assert.equal(rows.length,5);assert.ok(rows.every(r=>r.standard==='ISA'&&r.sourceAuditLabel===SOURCE_LABEL));
 assert.equal(G.kamLibrary({standard:'ISA',q:'Volkswagen'}).length,5,'legacy operational filter is unchanged');
 assert.equal(G.kamLibrary({sourceAuditLabel:'ISA',q:'Volkswagen'}).length,0,'source reference filter must use the disclosed basis');
 assert.equal(G.kamLibrary({sourceAuditLabel:SOURCE_LABEL,q:'Volkswagen'}).length,5);
 assert.equal(G.kamLibrary({sourceAuditLabel:'not-a-source-basis'}).length,0);
 assert.equal(h.E.reports.corpusCompanies.auditModelCatalog().find(r=>r.id===ID).standard,SOURCE_LABEL);
});
test('actual global-reference companies table displays Volkswagen HGB/EU/IDW without ISA substitution',()=>{
 const v=referenceView();v.tab('cos');const row=companyRow(v.node.innerHTML);assert.ok(row?.includes(SOURCE_LABEL));assert.doesNotMatch(row,/<td>ISA<\/td>/);assert.match(row,/3,650–4,322/);
});
test('actual global-reference KAM cards display the original source basis on all five Volkswagen matters',()=>{
 const v=referenceView();v.tab('kams');const cards=volkswagenCards(v.node.innerHTML);assert.equal(cards.length,5);assert.ok(cards.every(card=>card.includes(SOURCE_LABEL)&&!card.includes('KAM · ISA')));
});
test('actual source-reference filters exclude Volkswagen from ISA and retain it under its own disclosed basis',()=>{
 const v=referenceView();v.tab('kams');assert.ok(v.node.innerHTML.includes(`data-ab-std="${SOURCE_LABEL}"`));
 v.standard('ISA');assert.equal(volkswagenCards(v.node.innerHTML).length,0);assert.match(v.node.innerHTML,/KAM · ISA/);
 v.standard(SOURCE_LABEL);assert.equal(volkswagenCards(v.node.innerHTML).length,5);assert.equal((v.node.innerHTML.match(/<article class="ab-kam">/g)||[]).length,5);
 v.standard('PCAOB');assert.equal(volkswagenCards(v.node.innerHTML).length,0);assert.match(v.node.innerHTML,/CAM · PCAOB/);
 v.standard('');assert.equal(volkswagenCards(v.node.innerHTML).length,5);assert.equal((v.node.innerHTML.match(/<article class="ab-kam">/g)||[]).length,v.h.E.audit.globalBenchmarks.KAMS.length);
});
test('source-reference headline counts Volkswagen separately without altering operational totals',()=>{
 const v=referenceView(),G=v.h.E.audit.globalBenchmarks,s=G.summary();assert.ok(Array.isArray(s.sourceAuditStandards),'source-aware summary counts required');
 const groups=Object.fromEntries(s.sourceAuditStandards.map(g=>[g.label,g.count]));assert.equal(groups[SOURCE_LABEL],5);assert.equal(groups.ISA,s.isa-5);assert.equal(groups.PCAOB,s.pcaob);
 assert.equal(Object.values(groups).reduce((sum,count)=>sum+count,0),s.kams);assert.equal(s.isa+s.pcaob,s.kams,'operational summary stays backward compatible');
 assert.ok(v.node.innerHTML.includes(`${groups.ISA} وفق ISA`));assert.ok(v.node.innerHTML.includes(`5 وفق ${SOURCE_LABEL}`));assert.ok(!v.node.innerHTML.includes(`${s.isa} وفق ISA`));
});
test('both report registries and actual source selector assign page 4323 to Telekom',()=>{
 const v=referenceView(),G=v.h.E.audit.globalBenchmarks,C=v.h.E.reports.globalCorpus;
 const vw=C.reportList().find(r=>r.id===ID),telekom=C.reportList().find(r=>r.id==='telekom-2025');assert.deepEqual([vw.from,vw.to],[3650,4322]);assert.deepEqual([telekom.from,telekom.to],[4323,4704]);
 assert.deepEqual(plain(G.reportOf(ID).pages),[vw.from,vw.to]);assert.deepEqual(plain(G.reportOf('telekom-2025').pages),[telekom.from,telekom.to]);
 v.report(ID);assert.match(v.node.innerHTML,/3,650–4,322/);assert.doesNotMatch(v.node.innerHTML,/3,650–4,323/);v.report('telekom-2025');assert.match(v.node.innerHTML,/4,323–4,704/);
});
test('stale missing or operational audit labels are canonicalized in source context without mutating storage',async()=>{
 for(const value of ['ISA','PCAOB',null]){
  const h=harness(),W=h.context;await W.SKosifTBReview.openClient(ID);if(value===null)delete h.state.skosif_tbreview_v1.ctx.auditStandard;else h.state.skosif_tbreview_v1.ctx.auditStandard=value;
  const before=JSON.stringify(h.state),c=W.__test.compute(),x=W.__test.docX(c);assert.equal(c.sourceVerified,true);assert.equal(c.d.ctx.auditStandard,SOURCE_LABEL);assert.equal(x.ctx.auditStandard,SOURCE_LABEL);assert.equal(JSON.stringify(h.state),before,'canonicalization is a pure derived-context operation');assert.equal(x.sourceModel.accountingBasis,'IFRS_EU');assert.equal(x.opinion.opinion,'not-assessed');
 }
});
test('source audit context normalization does not bypass tampered-model rejection or change other companies',async()=>{
 const h=harness(),W=h.context;await W.SKosifTBReview.openClient(ID);h.state.skosif_tbreview_v1.ctx.sourceModel.sourceAuditLabel='ISA';assert.equal(W.__test.compute().sourceVerified,false);
 for(const [id,expected]of [['mercedes-2025','ISA'],['pg-2026','PCAOB']]){const other=harness();await other.context.SKosifTBReview.openClient(id);const c=other.context.__test.compute();assert.equal(c.sourceVerified,true);assert.equal(c.d.ctx.auditStandard,expected);}
});
