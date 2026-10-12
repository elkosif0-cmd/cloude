// Independent synthetic meat factory audit: accounting cycle + ISA-focused trial balance risk review.
// No real ledger, customer documents, or secrets are accessed.
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const browser=await chromium.launch();
try{
 const p=await browser.newPage();
 await p.goto(process.argv[2]||'http://127.0.0.1:8877/app-safe.html',{waitUntil:'load'});
 await p.waitForFunction(()=>window.SKEngines?.system?.modelBooks?.modelBooks&&window.SKEngines?.audit?.tbReview?.reviewTrialBalance,null,{timeout:60000});
 const result=await p.evaluate(()=>{
  const E=SKEngines,b=E.system.modelBooks.modelBooks('model-meat-factory'),rows=b.accounts.map(([code,name,type])=>({id:code,code,name,type})),
  trial=E.finance.ledger.buildTrialBalance(b.entries),
  drRows=trial.rows.map(r=>({code:r.accountId,name:rows.find(a=>a.code===r.accountId)?.name||r.accountId,debit:r.debit,credit:r.credit})),
  overrides=Object.fromEntries(rows.map(a=>[a.code,a.type])),
  tb=E.reports.tbImport.fromRows(drRows,{overrides}),
  review=E.audit.tbReview.reviewTrialBalance(tb,{framework:'IFRS',currency:'SAR',overrides}),
  cycle=E.reports.cycleProof.cycleProof({accounts:rows,entries:b.entries,end:b.lockDate,lockDate:b.lockDate}),
  rel=E.system.relationshipHealth.relationshipHealth({accounts:rows,entries:b.entries,packCodes:rows.map(a=>a.code),asOf:b.lockDate}),
  totals=E.system.modelBooks.checkModelBooks(b),
  findingList=review.findings.map(f=>({severity:f.severity,kind:f.kind,title:f.title,account:f.code||'',standard:f.standard,action:f.action}));
  return {company:b.name,year:b.year,months:b.months,closedAt:b.lockDate,synthetic:true,entries:b.entries.length,batches:b.ledger.productionBatches?.length,
    debitHalalas:Math.round(trial.totals.debit*100),creditHalalas:Math.round(trial.totals.credit*100),
    modelCheck:{ok:totals.ok,issues:totals.issues,revenueHalalas:totals.revenueHalalas},
    cycle:{ok:cycle.ok,steps:cycle.steps.map(s=>({id:s.id,status:s.status,detail:s.detail}))},
    relationship:{status:rel.status,checked:rel.checked,findings:rel.findings},
    audit:{overallMaterialityHalalas:review.materiality.overall,performanceHalalas:review.materiality.performance,
     findingsCount:findingList.length,risksCount:review.risks.length,significant:review.risks.filter(r=>r.significant).length,
     requestsCount:review.requests.length,findings:findingList.slice(0,30),
     topRequestedDocuments:review.requests.slice(0,12).map(x=>({title:x.title,priority:x.priority,standard:x.standard}))}};
 });
 console.log('SYNTHETIC_MEAT_AUDIT='+JSON.stringify(result));
 if(!result.modelCheck.ok || !result.cycle.ok || result.relationship.status==='fail' || result.debitHalalas!==result.creditHalalas)process.exitCode=1;
}finally{await browser.close();}
