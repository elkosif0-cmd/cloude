import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createEngagement } from '../ui/audit/v5/engagement-machine.js';
import { assessCouncilResponseIndependence, createCouncilReceipt, attachCouncilReceipt, verifyCouncilReceipts } from '../ui/audit/v5/ai-session-receipts.js';
const sha='a'.repeat(64), now='2026-10-11T00:10:00.000Z';
function engagement(){
 const e=createEngagement({id:'E-1',entity:'Synthetic',companyId:'company-A',workspaceId:'ws-A',createdAt:now});
 e.documents.push({id:'D-1',sha256:sha});
 e.evidence.push({id:'EV-1',documentIds:['D-1']});
 e.councilRounds.push({id:'R-1',evidenceIds:['EV-1']});
 return e;
}
const response=(seat,provider='provider-a',model='model-1')=>({
 kind:'provider',seatId:seat,providerId:provider,modelId:model,status:'completed',
 claims:[{text:'Advisory position only',evidenceIds:['EV-1']}]
});
const receipt=(e,responses)=>createCouncilReceipt({engagement:e,companyId:e.companyId,roundId:'R-1',responses,at:now});
test('two seats using the same declared provider and model are ONE counted identity, not two independent votes',async()=>{
 const e=engagement(),r=await receipt(e,[response('seat-a'),response('seat-b'),response('seat-c','provider-b','model-2')]);
 const s=r.responseIndependence;
 assert.equal(s.declaredProviderResponses,3);
 assert.equal(s.uniqueDeclaredProviderModelPairs,2);
 assert.equal(s.potentiallyCorrelatedResponses,1);
 assert.deepEqual(s.duplicateProviderModelGroups[0].seatIds,['seat-a','seat-b']);
 assert.equal(s.independenceVerified,false);
 assert.equal(s.liveInvocationVerified,false);
 assert.equal(await verifyCouncilReceipts(await attachCouncilReceipt(e,r)),true);
});
test('identity grouping is case-insensitive and unverified even for distinct upstream labels',()=>{
 const s=assessCouncilResponseIndependence([response('seat-1','PROVIDER-A','MODEL-1'),response('seat-2','provider-a','model-1'),response('seat-3','provider-b','model-9')]);
 assert.equal(s.uniqueDeclaredProviderModelPairs,2);
 assert.equal(s.potentiallyCorrelatedResponses,1);
 assert.equal(s.basis,'self-declared-provider-model-only');
 assert.equal(s.independenceVerified,false);
});
test('unavailable provider responses and deterministic rules cannot inflate independent provider identity count',async()=>{
 const r=await receipt(engagement(),[
  {kind:'deterministic',seatId:'rules',status:'completed',claims:[]},
  {...response('seat-1'),status:'unavailable'},
  response('seat-2')]);
 assert.equal(r.responseIndependence.deterministicCount,1);
 assert.equal(r.responseIndependence.unavailableCount,1);
 assert.equal(r.responseIndependence.declaredProviderResponses,1);
 assert.equal(r.responseIndependence.uniqueDeclaredProviderModelPairs,1);
});
test('one seat cannot impersonate two distinct providers or model identities',async()=>{
 await assert.rejects(receipt(engagement(),[response('seat-1'),response('seat-1','provider-b','model-2')]),/DUPLICATE_INDEPENDENT_SEAT/);
 await assert.rejects(receipt(engagement(),[response('Seat-1'),response('seat-1','provider-b','model-2')]),/DUPLICATE_INDEPENDENT_SEAT/);
});
test('tampered identity counts reject verification and attachment; legacy receipts without new field still verify',async()=>{
 const e=engagement(),r=await receipt(e,[response('seat-1'),response('seat-2')]);
 const forged=structuredClone(r);
 forged.responseIndependence.uniqueDeclaredProviderModelPairs=2;
 assert.equal(await verifyCouncilReceipts({...e,aiSessionReceipts:[forged]}),false);
 await assert.rejects(attachCouncilReceipt(e,forged),/RECEIPT_HASH_INVALID/);
 const old=structuredClone(r);delete old.responseIndependence;
 const {receiptHash,...body}=old;
 // Legacy v1 records have no independence summary; re-hash the legacy shape.
 const stable=(v)=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'
  ?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,stable(v[k])])):v;
 const bytes=new TextEncoder().encode(JSON.stringify(stable(body)));
 old.receiptHash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
 assert.equal(await verifyCouncilReceipts({...e,aiSessionReceipts:[old]}),true);
});
test('council screen discloses unverified identities instead of claiming live independent model execution',()=>{
 const source=fs.readFileSync(new URL('../ui/audit/v5/continuous-council.js',import.meta.url),'utf8');
 assert.match(source,/responseIndependence/);
 assert.match(source,/الاستقلال والتشغيل الحي غير موثقين/);
 assert.doesNotMatch(source,/الاستقلال موثق/);
});
