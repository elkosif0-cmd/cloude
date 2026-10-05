import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {harness,plain,root} from './apple-source-harness.mjs';
const legacy=JSON.parse(fs.readFileSync(root+'/tools/fixtures/legacy-corpus-transports.json')).records;
function unavailable(h,c){assert.equal(c.sourceOnly,true);assert.equal(c.sourceVerified,false);assert.equal(c.derived.opinion,'not-assessed');assert.equal(c.fsAfterAdj.cf,null);assert.equal(c.fsAfterAdj.checks.cashTies,null);assert.equal(h.context.__test.sourceCsv(c),null);assert.deepEqual(plain(h.context.SKosifTBReview.rows().rows),[]);}
test('all43 pending and unavailable models refuse every callable selection and generic adapter',async()=>{
 const h=harness(),W=h.context,list=h.E.reports.corpusCompanies.auditModelCatalog().filter(x=>!x.openable);assert.equal(list.length,44);
 for(const c of list){assert.equal(h.E.reports.corpusCompanies.companyTrialBalance(c.id),null,c.id);for(const fn of ['openClient','loadCorpus','showcase']){assert.ok(!await W.SKosifTBReview[fn](c.id),fn+':'+c.id);assert.equal(W.__test.compute(),null);}}
});
test('every legacy generic/bundle transport is source-only even without metadata and never produces operational cash flows',()=>{
 const h=harness();assert.equal(legacy.length,94);for(const r of legacy){const tb=h.E.reports.tbImport.parseTrialBalance(r.csv),f=h.E.reports.statements.buildStatements(tb,r.overrides);assert.equal(tb.sourceKind,'published-statements',r.id);assert.equal(tb.sourceId,r.id);assert.equal(f.reconstructionStatus.status,'unavailable',r.id);assert.equal(f.cf,null);assert.equal(f.checks.cashTies,null);assert.deepEqual(plain(f.keys),{});assert.throws(()=>h.E.audit.tbReview.reviewTrialBalance(tb,{overrides:r.overrides}),/source|published|unavailable/i);}
});
test('all43 pending source contextual imports and saved legacy identities fail closed',async()=>{
 const catalog=harness().E.reports.corpusCompanies.auditModelCatalog().filter(x=>x.modelStatus==='pending-review');assert.equal(catalog.length,43);
 for(const c of catalog){const old=legacy.find(r=>r.id===c.id&&r.route==='generic-f909');assert.ok(old,c.id);for(const ctx of [old.ctx,{corpusId:c.id},{sourceModel:{id:c.id}}]){const h=harness();const accepted=await h.context.SKosifTBReview.load(old.csv,'legacy',ctx);if(accepted)unavailable(h,h.context.__test.compute());else assert.equal(h.context.__test.compute(),null);}
  for(const provenance of [{bundleId:c.id},{sourceId:c.id},{ctx:{corpusId:c.id}}]){const h=harness(),d={...h.context.__test.blank(),tbText:old.csv.replace(/,(\d+),/,(_,n)=>','+(Number(n)+1)+','),overrides:old.overrides,ctx:{company:old.ctx.company,country:old.ctx.country},...provenance};h.state.skosif_tbreview_v1=plain(d);unavailable(h,h.context.__test.compute());}
 }
});
test('names alone never quarantine legitimate ordinary ledger imports',async()=>{
 for(const name of ['Saudi Arabian Oil Company (Aramco)','Toyota Motor Corporation',"L’Oréal"]){const h=harness(),W=h.context;assert.equal(await W.SKosifTBReview.load(h.E.reports.tbImport.SAMPLE_TB_CSV,'actual-ledger',{company:name,country:'SA'}),true);const c=W.__test.compute();assert.equal(c.sourceOnly,false);assert.notEqual(c.fsAfterAdj.cf,null);assert.equal(c.tb.sourceKind,undefined);}
});
async function analyzeThroughActualHandler(h,text){const events={};const node={innerHTML:'',querySelector:selector=>selector==='[data-tbtext]'?{value:text}:null,querySelectorAll:()=>[],addEventListener:(type,fn)=>{events[type]=fn;}};h.context.__test.setTestRoot(node);h.context.__test.bind(node);await events.click({target:{closest:selector=>selector==='[data-a]'?{dataset:{a:'analyze'}}:null}});}
test('actual file/paste Analyze handler rejects all43 pending carriers before saving',async()=>{
 const ids=harness().E.reports.corpusCompanies.auditModelCatalog().filter(x=>x.modelStatus==='pending-review').map(x=>x.id);
 for(const id of ids){const h=harness(),old=legacy.find(r=>r.id===id);await analyzeThroughActualHandler(h,old.csv);assert.equal(h.context.__test.compute(),null,id);assert.equal(h.state.skosif_tbreview_v1,undefined,id);}
});
test('manual paste of a known reviewed carrier persists provenance across later edits',async()=>{
 const h=harness(),t=h.E.reports.corpusCompanies.companyTrialBalance('pg-2026');await analyzeThroughActualHandler(h,t.csv);assert.equal(h.state.skosif_tbreview_v1.sourceKind,'published-statements');assert.equal(h.state.skosif_tbreview_v1.sourceId,'pg-2026');h.state.skosif_tbreview_v1.tbText=t.csv.replace(/^#.*\n/,'').replace('87032','87033');unavailable(h,h.context.__test.compute());
});
