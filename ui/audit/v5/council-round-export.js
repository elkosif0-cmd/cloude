/**
 * Company-scoped ADVISORY export of recorded council rounds and evidence deltas.
 * Not a regulatory audit opinion, not proof of a live AI invocation or authorization.
 * Never serializes uploaded document content, credentials or arbitrary engagement state.
 */
import { verifyCouncilReceipts } from './ai-session-receipts.js';
const VALID_ID=/^[\p{L}\p{N}_.:-]{1,128}$/u;
const requireId=(value,name)=>{
  if(typeof value!=='string'||!VALID_ID.test(value))throw new Error(name+'_INVALID');
  return value;
};
const asList=value=>Array.isArray(value)?value:[];
const text=value=>value===null||value===undefined?'':String(value).slice(0,4000);
const ids=value=>[...new Set(asList(value).map(v=>text(v)).filter(Boolean))].sort();
const change=(before=[],after=[])=>{
  const a=new Set(ids(before)),b=new Set(ids(after));
  return {added:[...b].filter(id=>!a.has(id)),removed:[...a].filter(id=>!b.has(id))};
};
const safeDate=value=>typeof value==='string'&&Number.isFinite(Date.parse(value))?value:'';
function asScope(engagement,companyId,workspaceId){
  if(!engagement||typeof engagement!=='object')throw new Error('ENGAGEMENT_REQUIRED');
  const scope={companyId:requireId(companyId,'COMPANY'),workspaceId:requireId(workspaceId,'WORKSPACE'),
    engagementId:requireId(engagement.id,'ENGAGEMENT')};
  if(engagement.companyId!==scope.companyId||engagement.workspaceId!==scope.workspaceId)
    throw new Error('EXPORT_SCOPE_MISMATCH');
  return scope;
}
function assertSourceOwned(records,scope,label){
  for(const value of records){
    if(value?.companyId&&value.companyId!==scope.companyId)throw new Error(label+'_CROSS_COMPANY_SOURCE');
    if(value?.workspaceId&&value.workspaceId!==scope.workspaceId)throw new Error(label+'_CROSS_WORKSPACE_SOURCE');
  }
}
const item=(section,roundId,itemId,status,description,sourceIds=[],other={})=>({
  section,roundId:roundId||'',itemId:itemId||'',status:text(status),
  description:text(description),sourceIds:ids(sourceIds),...other
});
export async function buildCouncilRoundReport({engagement,companyId,workspaceId,at=new Date().toISOString()}){
  const scope=asScope(engagement,companyId,workspaceId);
  if(!safeDate(at))throw new Error('EXPORT_TIME_INVALID');
  if(!await verifyCouncilReceipts(engagement))throw new Error('COUNCIL_RECEIPTS_TAMPERED');
  const rounds=asList(engagement.councilRounds),allEvidence=asList(engagement.evidence),
    allDocuments=asList(engagement.documents),receipts=asList(engagement.aiSessionReceipts);
  for(const [label,records] of [['EVIDENCE',allEvidence],['DOCUMENT',allDocuments],['REQUEST',asList(engagement.requests)],['ISSUE',asList(engagement.issues)]])
    assertSourceOwned(records,scope,label);
  const evidenceById=new Map(allEvidence.map(e=>[e.id,e]));
  const docsById=new Map(allDocuments.map(d=>[d.id,d]));
  const requests=asList(engagement.requests),issues=asList(engagement.issues);
  const rows=[];
  const roundSummary=[];
  let prior=null;
  for(const round of rounds){
    assertSourceOwned([round],scope,'ROUND');
    assertSourceOwned(asList(round.positions),scope,'COUNCIL_POSITION');
    assertSourceOwned(asList(round.conflicts),scope,'COUNCIL_CONFLICT');
    const roundId=requireId(round.id,'ROUND');
    const evidenceDelta=change(prior?.evidenceIds,round.evidenceIds);
    const issueDelta=change(prior?.issueIds,round.issueIds);
    roundSummary.push({roundId,number:round.number??null,status:text(round.status),
      recordedAt:safeDate(round.recordedAt),evidenceDelta,issueDelta,
      verdict:text(round.verdict),positions:asList(round.positions).length,
      conflicts:asList(round.conflicts).length});
    rows.push(item('round',roundId,roundId,round.status,
      round.verdictText||round.verdict||'Council round',
      round.evidenceIds,{referenceId:'',sha256:'',sourceStatus:'advisory'}));
    for(const [category,delta] of [['evidence',evidenceDelta],['issue',issueDelta]]){
      for(const action of ['added','removed'])for(const id of delta[action]){
        rows.push(item('round-delta',roundId,id,action,
          category==='evidence'?'Evidence '+action:'Finding '+action,[id],{referenceId:category,sha256:'',sourceStatus:'delta-not-proof-of-resolution'}));
      }
    }
    const stances=new Set();
    for(const pos of asList(round.positions)){
      if(!pos?.seatId)continue;
      if(pos.stance)stances.add(text(pos.stance));
      rows.push(item('council-seat',roundId,text(pos.seatId),pos.stance,
        pos.statement||pos.title, pos.evidenceIds||pos.sourceIds||[],{
          referenceId:'',sha256:'',sourceStatus:'local-advisory-position',
          providerId:'',modelId:''}));
    }
    if(stances.size>1)rows.push(item('stance-divergence',roundId,roundId,'disagreement',
      'Multiple stances: '+[...stances].sort().join(', '),[],{referenceId:'',sha256:'',sourceStatus:'reported-position-only'}));
    for(const conflict of asList(round.conflicts)){
      rows.push(item('council-conflict',roundId,text(conflict.id||'unspecified'),
        conflict.resolution?'resolved-in-round':'unresolved',
        conflict.title||conflict.description||conflict.reason||'Recorded council conflict',
        conflict.evidenceIds||[],{referenceId:'',sha256:'',sourceStatus:'recorded-conflict'}));
    }
    for(const eid of ids(round.evidenceIds)){
      const evidence=evidenceById.get(eid);
      if(!evidence){
        rows.push(item('round-evidence',roundId,eid,'missing','Evidence ID is absent from current engagement',
          [eid],{referenceId:'',sha256:'',sourceStatus:'missing'}));
        continue;
      }
      const hashes=ids(evidence.documentIds).map(docId=>{
        const doc=docsById.get(docId);
        const hash=doc?.sha256||doc?.provenance?.sha256||'';
        const verified=/^[a-f0-9]{64}$/i.test(hash);
        return {docId,sha256:verified?hash.toLowerCase():'',sourceStatus:verified?'source-hash-declared':'hash-missing'};
      });
      rows.push(item('round-evidence',roundId,eid,evidence.reviewStatus||'unknown',
        evidence.title||'Evidence linked to council round',evidence.documentIds||[],{
          referenceId:ids(evidence.documentIds).join(' | '),
          sha256: /^[a-f0-9]{64}$/i.test(evidence.sha256||evidence.provenance?.sha256||'')
            ?String(evidence.sha256||evidence.provenance?.sha256).toLowerCase():'',
          sourceStatus:hashes.length&&hashes.every(x=>x.sha256)?'document-hashes-declared':'document-hashes-incomplete'
        }));
      for(const d of hashes)rows.push(item('source-document',roundId,d.docId,
        d.sourceStatus,'Document SHA-256 digest recorded, not independently revalidated',[eid],
        {referenceId:eid,sha256:d.sha256,sourceStatus:d.sourceStatus}));
    }
    prior=round;
  }
  for(const request of requests)rows.push(item('pbc-request','',text(request.id),
    request.status,request.title,request.evidenceIds||request.riskIds||[],
    {referenceId:text(request.councilRoundId),sha256:'',sourceStatus:'current-request-status'}));
  for(const finding of issues)rows.push(item('finding','',text(finding.id),
    finding.status,finding.title||finding.description,finding.evidenceIds||[],
    {referenceId:text(finding.severity),sha256:'',sourceStatus:'current-finding-status'}));
  const receiptSummaries=[];
  for(const receipt of receipts){
    const roundId=requireId(receipt.scope?.roundId,'RECEIPT_ROUND');
    receiptSummaries.push({roundId,receiptHash:text(receipt.receiptHash),
      sourceType:text(receipt.sourceType),evidenceStatus:text(receipt.evidenceStatus),
      responseIndependence:receipt.responseIndependence||null,humanReview:text(receipt.humanReview)});
    rows.push(item('council-receipt',roundId,text(receipt.id),receipt.humanReview,
      'Advisory local receipt, NOT signed by an authenticated audit server',[],
      {referenceId:text(receipt.snapshotHash),sha256:text(receipt.receiptHash),
        sourceStatus:text(receipt.evidenceStatus)}));
    for(const response of asList(receipt.responses)){
      rows.push(item('receipt-response',roundId,text(response.seatId),response.status,
        asList(response.claims).map(c=>c.text).join(' | '),
        asList(response.claims).flatMap(c=>asList(c.evidenceIds)),
        {referenceId:text(response.kind),sha256:'',sourceStatus:'provider-unverified',
          providerId:text(response.providerId),modelId:text(response.modelId)}));
    }
  }
  return {
    schema:'kosif-council-round-report-v1',scope,generatedAt:at,
    classification:'company-confidential-advisory',authorization:'not-server-attested',
    aiRuntimeVerified:false,humanApprovalVerified:false,
    sourceIntegrity:'hashes-are-declared-not-server-signed',
    notices:['Local evidence links and SHA-256 values do not establish custody or source validity.',
      'A round absence/delta is not proof that an issue was resolved.',
      'Provider identity, independence, and live invocation remain unverified.'],
    roundSummary,receiptSummaries,rows
  };
}
const FIELDS=['section','roundId','itemId','status','description','sourceIds',
              'referenceId','sha256','sourceStatus','providerId','modelId'];
function csvCell(value){
  const input=Array.isArray(value)?value.join(' | '):text(value);
  // Guard Excel/LibreOffice formula injection, including whitespace/control-prefix bypasses.
  const danger=/^[\s\x00-\x1f\u200b-\u200f\u202a-\u202e\ufeff]*[=+\-@]/u.test(input);
  const safe=(danger?"'":'')+input;
  return '"'+safe.replace(/"/g,'""')+'"';
}
export function serializeCouncilRoundCsv(report){
  if(report?.schema!=='kosif-council-round-report-v1')throw new Error('EXPORT_SCHEMA_INVALID');
  const metadata=[
    ['Report schema',report.schema],['Company',report.scope.companyId],
    ['Workspace',report.scope.workspaceId],['Engagement',report.scope.engagementId],
    ['Classification',report.classification],['Authorization',report.authorization],
    ['Generated at',report.generatedAt],
  ].map(([a,b])=>[csvCell(a),csvCell(b)].join(','));
  return '\uFEFF'+metadata.join('\r\n')+'\r\n\r\n'+FIELDS.map(csvCell).join(',')+'\r\n'+
    report.rows.map(row=>FIELDS.map(k=>csvCell(row[k]??'')).join(',')).join('\r\n')+'\r\n';
}
