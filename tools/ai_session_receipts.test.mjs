import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngagement } from '../ui/audit/v5/engagement-machine.js';
import { createCouncilReceipt, attachCouncilReceipt, verifyCouncilReceipts } from '../ui/audit/v5/ai-session-receipts.js';

const DIGEST = 'a'.repeat(64);
const when = '2026-10-10T22:00:00.000Z';
function sample({ companyId='company-A', workspaceId='workspace-A', roundId='RND-001', evidenceHash=DIGEST } = {}) {
  const e = createEngagement({ id:'ENG-A', entity:'Synthetic only',companyId,workspaceId,createdAt:when });
  e.documents.push({ id:'DOC-1', sha256:evidenceHash });
  e.evidence.push({id:'EVD-1', documentIds:['DOC-1'], reviewStatus:'reviewed'});
  e.councilRounds.push({id:roundId, evidenceIds:['EVD-1'], positions:[{seatId:'rules',stance:'clear'}], status:'completed'});
  return e;
}
const deterministic = {kind:'deterministic',seatId:'rules',status:'completed',claims:[{text:'Advisory automated analysis, not model output',evidenceIds:['EVD-1']}]};
const provider = {kind:'provider',seatId:'ISA',providerId:'anthropic',modelId:'synthetic-model',status:'completed',claims:[{text:'Synthetic independent perspective', evidenceIds:['EVD-1']}]};
const create = (e, args = {}) => createCouncilReceipt({ engagement:e,companyId:e.companyId,roundId:e.councilRounds.at(-1).id,at:when,responses:[deterministic],...args });
test('creates SHA-256 bound advisory-only receipt with snapshot and no authority',async()=>{
 const e=sample(),r=await create(e);
 assert.match(r.receiptHash,/^[a-f0-9]{64}$/);
 assert.match(r.snapshotHash,/^[a-f0-9]{64}$/);
 assert.equal(r.humanReview,'required');
 assert.equal(r.sourceType,'advisory-not-authorized');
 assert.equal(r.evidenceStatus,'hashes-present');
 assert.equal(r.evidenceSnapshot[0].documents[0].sha256,DIGEST);
 assert.equal(r.responses[0].kind,'deterministic');
 assert.equal(r.responses[0].modelId,null);
 assert.equal(await verifyCouncilReceipts(await attachCouncilReceipt(e,r)),true);
});
test('rejects a company mismatch, even if the engagement ID matches',async()=>{
 const e=sample();
 await assert.rejects(create(e,{companyId:'company-B'}),/COMPANY_SCOPE_MISMATCH/);
});
test('rejects missing company or workspace binding by default',async()=>{
 await assert.rejects(create(sample({companyId:null})),/COMPANY_ID_INVALID/);
 await assert.rejects(create(sample({workspaceId:null})),/WORKSPACE_ID_INVALID/);
});
test('cannot rebind a receipt to another company or workspace',async()=>{
 const e=sample(),r=await create(e);
 await assert.rejects(attachCouncilReceipt(sample({companyId:'company-B'}),r),/RECEIPT_SCOPE_MISMATCH/);
 await assert.rejects(attachCouncilReceipt(sample({workspaceId:'workspace-B'}),r),/RECEIPT_SCOPE_MISMATCH/);
});
test('rejects an absent round, source evidence from another engagement, and unknown claim evidence',async()=>{
 const e=sample();e.councilRounds[0].evidenceIds=['EVD-OUTSIDE'];
 await assert.rejects(create(e),/EVIDENCE_NOT_IN_ENGAGEMENT/);
 const f=sample();
 await assert.rejects(create(f,{responses:[{...provider,claims:[{text:'wrong source',evidenceIds:['EVD-OUTSIDE']}]}]}),/CLAIM_EVIDENCE_OUTSIDE_SNAPSHOT/);
 await assert.rejects(create(f,{roundId:'RND-OTHER'}),/ROUND_NOT_IN_ENGAGEMENT/);
});
test('marks absent document digest as missing rather than manufactured verification',async()=>{
 const r=await create(sample({evidenceHash:null}));
 assert.equal(r.evidenceStatus,'missing-source-hashes');
 assert.equal(r.evidenceSnapshot[0].documents[0].sha256,null);
});
test('independent provider receipts cannot spoof a deterministic analysis',async()=>{
 const e=sample();
 await assert.rejects(create(e,{responses:[{...deterministic,providerId:'openai'}]}),/DETERMINISTIC_PROVIDER_SPOOF/);
 await assert.rejects(create(e,{responses:[{...provider,modelId:undefined}]}),/MODEL_ID_INVALID/);
});
test('AI responses cannot smuggle authority to issue opinions or post entries',async()=>{
 for(const key of ['final_opinion','posted_entry','approved_adjustment','authority']){
  await assert.rejects(create(sample(),{responses:[{...provider,[key]:'yes'}]}),/FORBIDDEN_AI_AUTHORITY/);
 }
});
test('repeated same round and duplicated model seat cannot be inserted',async()=>{
 const e=sample(),r=await create(e),t=await attachCouncilReceipt(e,r);
 await assert.rejects(create(t),/COUNCIL_RECEIPT_ALREADY_EXISTS/);
 await assert.rejects(attachCouncilReceipt(t,r),/RECEIPT_DUPLICATE/);
 await assert.rejects(create(e,{responses:[provider,provider]}),/DUPLICATE_INDEPENDENT_SEAT/);
});
test('detects tampering with snapshot, response and chained receipt',async()=>{
 const e=sample(),r=await create(e),state=await attachCouncilReceipt(e,r);
 const wrong=structuredClone(state);wrong.aiSessionReceipts[0].responses[0].status='blocked';
 assert.equal(await verifyCouncilReceipts(wrong),false);
 const bad=structuredClone(state);bad.aiSessionReceipts[0].evidenceSnapshot[0].documents[0].sha256='b'.repeat(64);
 assert.equal(await verifyCouncilReceipts(bad),false);
 const second=structuredClone(state);second.councilRounds.push({id:'RND-002',evidenceIds:['EVD-1']});
 const x=await create(second,{roundId:'RND-002',responses:[provider]});
 assert.equal(x.previousHash,r.receiptHash);
 assert.equal(await verifyCouncilReceipts(await attachCouncilReceipt(second,x)),true);
 second.aiSessionReceipts[0].receiptHash='0'.repeat(64);
 assert.equal(await verifyCouncilReceipts(second),false);
});
test('does not overwrite report, ledger, source files or other engagement state',async()=>{
 const e=sample();e.reports=[{id:'REPORT-1',status:'draft'}];const initial=structuredClone(e);
 const x=await attachCouncilReceipt(e,await create(e));
 assert.deepEqual(e,initial);
 assert.deepEqual(x.reports,initial.reports);
 assert.equal(x.aiSessionReceipts.length,1);
});

test('rejects a forged detached receipt and refuses to chain from a tampered earlier receipt',async()=>{
 const e=sample(),r=await create(e);
 const fake=structuredClone(r);fake.humanReview='approved';
 await assert.rejects(attachCouncilReceipt(e,fake),/RECEIPT_HASH_INVALID/);
 const valid=await attachCouncilReceipt(e,r);
 valid.aiSessionReceipts[0].responses[0].claims[0].text='modified';
 valid.councilRounds.push({id:'RND-002',evidenceIds:['EVD-1']});
 await assert.rejects(create(valid,{roundId:'RND-002'}),/PREVIOUS_RECEIPT_TAMPERED/);
});
