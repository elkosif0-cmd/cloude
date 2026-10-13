import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createEngagement} from '../ui/audit/v5/engagement-machine.js';
import {createCouncilReceipt,attachCouncilReceipt} from '../ui/audit/v5/ai-session-receipts.js';
import {buildCouncilRoundReport,serializeCouncilRoundCsv} from '../ui/audit/v5/council-round-export.js';
const sha='a'.repeat(64),at='2026-10-11T00:00:00.000Z';
function example(){
 const e={...createEngagement({id:'ENG-A',entity:'Synthetic entity',createdAt:at}),companyId:'company-A',workspaceId:'workspace-A',aiSessionReceipts:[]};
 e.documents=[{id:'DOC-1',companyId:'company-A',sha256:sha,content:'PRIVATE_DOCUMENT_BODY_NEVER_EXPORT'}];
 e.evidence=[{id:'EV-1',documentIds:['DOC-1'],title:'Supporting statement',reviewStatus:'reviewed'},
             {id:'EV-2',documentIds:[],reviewStatus:'received'}];
 e.issues=[{id:'ISS-1',title:'A finding',status:'open'}, {id:'ISS-2',title:'Another finding',status:'closed'}];
 e.requests=[{id:'PBC-1',title:'Confirmation',status:'requested',riskIds:['R-1']}];
 e.councilRounds=[{id:'RND-1',number:1,status:'completed',evidenceIds:['EV-1'],issueIds:['ISS-1'],
   positions:[{seatId:'isa',stance:'caution',statement:'=HYPERLINK("http://bad.test")'},
              {seatId:'tax',stance:'objection',statement:'[independent objection]'}],
   conflicts:[{id:'C-1',title:'Difference',resolution:null}]},
  {id:'RND-2',number:2,status:'completed',evidenceIds:['EV-2'],issueIds:['ISS-2'],
   positions:[{seatId:'isa',stance:'clear',statement:'Agrees after new documents'}]}];
 e.secret='ENGAGEMENT_ACCESS_TOKEN_DO_NOT_EXPORT';
 return e;
}
const build=e=>buildCouncilRoundReport({engagement:e,companyId:'company-A',workspaceId:'workspace-A',at});
test('generates company-scoped advisory report with round differences and genuine logged dissents',async()=>{
 const e=example(),r=await build(e);
 assert.equal(r.classification,'company-confidential-advisory');
 assert.equal(r.authorization,'not-server-attested');
 assert.equal(r.aiRuntimeVerified,false);
 assert.equal(r.roundSummary.length,2);
 assert.deepEqual(r.roundSummary[1].evidenceDelta,{added:['EV-2'],removed:['EV-1']});
 assert.deepEqual(r.roundSummary[1].issueDelta,{added:['ISS-2'],removed:['ISS-1']});
 assert.equal(r.rows.filter(x=>x.section==='council-conflict').length,1);
 assert.equal(r.rows.filter(x=>x.section==='stance-divergence').length,1);
 assert.ok(r.rows.some(x=>x.section==='round-delta'&&x.itemId==='EV-1'&&x.status==='removed'));
 assert.ok(r.rows.some(x=>x.section==='pbc-request'&&x.itemId==='PBC-1'));
 assert.ok(r.rows.some(x=>x.section==='finding'&&x.itemId==='ISS-2'));
 assert.deepEqual(r.scope,{companyId:'company-A',workspaceId:'workspace-A',engagementId:'ENG-A'});
 const json=JSON.stringify(r);
 assert.doesNotMatch(json,/PRIVATE_DOCUMENT_BODY_NEVER_EXPORT|ENGAGEMENT_ACCESS_TOKEN_DO_NOT_EXPORT/);
 assert.equal(e.documents[0].content,'PRIVATE_DOCUMENT_BODY_NEVER_EXPORT');
});
test('exports declared document hashes and marks missing source hashes without certifying custody',async()=>{
 const r=await build(example());
 assert.equal(r.rows.find(x=>x.section==='source-document').sha256,sha);
 assert.equal(r.rows.find(x=>x.section==='round-evidence'&&x.itemId==='EV-2').sourceStatus,'document-hashes-incomplete');
 assert.equal(r.sourceIntegrity,'hashes-are-declared-not-server-signed');
});
test('refuses scope mismatch, null company, wrong workspace, and explicitly cross-tagged content',async()=>{
 await assert.rejects(buildCouncilRoundReport({engagement:example(),companyId:'company-B',workspaceId:'workspace-A'}),/EXPORT_SCOPE_MISMATCH/);
 await assert.rejects(buildCouncilRoundReport({engagement:example(),companyId:null,workspaceId:'workspace-A'}),/COMPANY_INVALID/);
 const e=example();e.documents[0].companyId='company-B';
 await assert.rejects(build(e),/DOCUMENT_CROSS_COMPANY_SOURCE/);
 const f=example();f.evidence[0].workspaceId='workspace-B';
 await assert.rejects(build(f),/EVIDENCE_CROSS_WORKSPACE_SOURCE/);
 const g=example();g.councilRounds[0].positions[0].companyId='company-B';
 await assert.rejects(build(g),/COUNCIL_POSITION_CROSS_COMPANY_SOURCE/);
 const h=example();h.councilRounds[0].conflicts[0].workspaceId='workspace-B';
 await assert.rejects(build(h),/COUNCIL_CONFLICT_CROSS_WORKSPACE_SOURCE/);
});
test('tampered advisory receipt prevents reporting; valid declared provider is never promoted to a live attestation',async()=>{
 let e=example();e.councilRounds=e.councilRounds.slice(0,1);
 const response={kind:'provider',seatId:'model-seat',providerId:'provider-a',modelId:'model-a',status:'completed',claims:[{text:'Opinion is only advisory',evidenceIds:['EV-1']}]};
 const receipt=await createCouncilReceipt({engagement:e,companyId:e.companyId,roundId:'RND-1',responses:[response],at});
 e=await attachCouncilReceipt(e,receipt);
 const r=await build(e);
 assert.equal(r.receiptSummaries.length,1);
 assert.equal(r.receiptSummaries[0].responseIndependence.independenceVerified,false);
 assert.equal(r.rows.find(x=>x.section==='receipt-response').sourceStatus,'provider-unverified');
 const tampered=structuredClone(e);tampered.aiSessionReceipts[0].responses[0].claims[0].text='forged';
 await assert.rejects(build(tampered),/COUNCIL_RECEIPTS_TAMPERED/);
});
test('CSV uses UTF-8 BOM, stable headers and escapes spreadsheet injection attempts',async()=>{
 const r=await build(example()),csv=serializeCouncilRoundCsv(r);
 assert.ok(csv.startsWith('\uFEFF'));
 assert.match(csv,/section.*roundId.*itemId/);
 assert.match(csv,/"'=HYPERLINK\(""http:\/\/bad.test""\)"/);
 assert.doesNotMatch(csv,/PRIVATE_DOCUMENT_BODY_NEVER_EXPORT/);
 r.rows.push({section:'finding',description:' \t@SUM(1,2)',itemId:'-3',status:'+1'});
 const safe=serializeCouncilRoundCsv(r);
 assert.match(safe,/"' \t@SUM\(1,2\)"/);
 assert.match(safe,/"'-3"/);
 assert.match(safe,/"'\+1"/);
 r.rows.push({section:'finding',description:'\u200f\t=HYPERLINK(1,2)',itemId:'safe'});
 assert.match(serializeCouncilRoundCsv(r),/"'\u200f\t=HYPERLINK\(1,2\)"/);
});
test('CSV schema is explicit and no client export can mark records server approved',async()=>{
 const r=await build(example());
 assert.throws(()=>serializeCouncilRoundCsv({}),/EXPORT_SCHEMA_INVALID/);
 assert.equal(r.humanApprovalVerified,false);
 const ui=fs.readFileSync(new URL('../ui/audit/v5/council-round-export-ui.js',import.meta.url),'utf8');
 const wired=fs.readFileSync(new URL('../ui/audit/v5/continuous-council.js',import.meta.url),'utf8');
 assert.match(ui,/buildCouncilRoundReport\(activeScope\(start\)\)/);
 assert.match(ui,/getEngagement\(\)!==start/);
 assert.match(ui,/SK\?\.company\?\.current/);
 assert.match(wired,/installCouncilRoundExport/);
 assert.match(wired,/refreshCouncilExport/);
});
test('uncoupled demo must not download any engagement data',async()=>{
 const e=example();e.companyId=null;
 await assert.rejects(buildCouncilRoundReport({engagement:e,companyId:null,workspaceId:'workspace-A'}),/COMPANY_INVALID/);
});
