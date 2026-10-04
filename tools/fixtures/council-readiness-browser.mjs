import { convene } from '../../ui/audit/council.js';
import { createEngagement, reportReadiness } from '../../ui/audit/v5/engagement-machine.js';
import { recordCouncilRound, ingestEvidenceBatch, reviewLoopStatus } from '../../ui/audit/v5/review-loop.js';
import { completionStatus, recordCompletionDecision } from '../../ui/audit/v5/completion-engine.js';
import { buildProfessionalReportModel } from '../../ui/audit/v5/report-model.js';
import { reviewReportSection, reportIssueReadiness, issueReport } from '../../ui/audit/v5/report-approval.js';
import { buildEngagementTraceability, traceabilityMetrics } from '../../ui/audit/v5/traceability.js';
import { reportSourceFingerprint } from '../../ui/audit/v5/report-source.js';
import { store } from '../../ui/audit/v5/continuous-store.js';
import { renderCompletion } from '../../ui/audit/v5/continuous-completion.js';

// All identities, monetary values and evidence here are synthetic and in memory.
// Actual convene, recording, completion, model, review, issue and render functions run unchanged.
const at = '2026-10-04T12:00:00.000Z';
const human = { actor: 'Synthetic reviewer', actorType: 'human', rationale: 'Synthetic regression control', at };
const ctx = { materiality: { overall: 100n }, recipeId: 'audit-report', traceabilityMetrics: { isolated: [] } };
function base({ evidence = true } = {}) {
  let e = createEngagement({ id: 'ENG-SYNTHETIC', entity: 'Synthetic entity', period: '2026', createdAt: at });
  e.documents.push({ id: 'DOC-1', name: 'Synthetic source', status: 'classified', sha256: 'a'.repeat(64), version: 1 });
  if (evidence) e = ingestEvidenceBatch(e, [{ id: 'EVD-1', title: 'Synthetic reviewed source', documentIds: ['DOC-1'], sourceType: 'external', reviewStatus: 'reviewed' }], { receivedAt: at }).engagement;
  return e;
}
function actualSession(overrides = {}) {
  return convene({
    analysis: { balanced: true, imbalance: 0n, metrics: { accounts: 1, categories: 1, duplicates: 0 } },
    materiality: ctx.materiality,
    risks: [{ id: 'RISK-1', title: 'Synthetic risk', severity: 'low', status: 'closed' }],
    workpapers: [{ id: 'WP-1', riskIds: ['RISK-1'] }],
    evidence: [{ id: 'EVD-1', status: 'reviewed', sourceType: 'external', obtainedDirectly: true, fileHash: 'a'.repeat(64), documentDate: '2026-01-01', riskIds: ['RISK-1'] }],
    journalReview: { summary: { total: 1, flagged: 0, pendingReview: 0 }, entries: [] },
    now: at, ...overrides
  });
}
function recorded(session = actualSession(), engagement = base()) {
  return recordCouncilRound(engagement, session, { recordedAt: at }).engagement;
}
function complete(e) {
  for (const check of completionStatus(e, ctx).requirements.filter(r => r.mode === 'human')) {
    e = recordCompletionDecision(e, { ...human, checkId: check.id, status: 'satisfied' }, { at }).engagement;
  }
  return e;
}
function reportFor(e) {
  let report = buildProfessionalReportModel({ engagement: e, recipe: { id: 'audit-report', title: 'Synthetic report', sections: ['cover', 'opinion', 'council-summary', 'evidence-coverage'] }, materiality: ctx.materiality, traceabilityMetrics: traceabilityMetrics(buildEngagementTraceability(e)), createdAt: at });
  // Match continuous-reporting.buildDraft's section-to-report source aggregation.
  report.sourceIds = [...new Set(report.sections.flatMap(section => section.sourceIds || []))];
  return reviewReportSection(report, 'opinion', { ...human, decision: 'approved' }, e);
}

import { runCouncil } from '../../ui/audit/v5/continuous-council.js';
import { resetEngagement } from '../../ui/audit/v5/continuous-store.js';
import { initCompletion } from '../../ui/audit/v5/continuous-completion.js';
window.__kxRoot=()=>document;
function viaUi(balanced=true){
 const e=createEngagement({id:'NATIVE-SYNTHETIC',entity:'Synthetic native fixture',engagementType:'audit'});
 e.documents=[{id:'D',status:'classified',sha256:'a'.repeat(64),version:1}];
 e.evidence=[{id:'E',documentIds:['D'],reviewStatus:'reviewed',sourceType:'external',provenance:{sha256:'a'.repeat(64)},documentDate:'2026-01-01',riskIds:['R']}];
 resetEngagement(e);store.analysis={balanced,imbalance:balanced?0n:1n,metrics:{accounts:1,categories:1,duplicates:0}};store.materiality={overall:100n};store.tbRisks=[{id:'R',title:'Synthetic risk',severity:'low',status:'closed'}];runCouncil();return structuredClone(store.engagement);
}

function setup(kind='valid'){
 let e=kind==='empty'?recorded({}):viaUi(kind!=='blocked');
 if(kind==='malformed')e.councilRounds.at(-1).positions=[{}];
 if(kind==='missing-evidence')e.evidence=[];
 e=complete(e);const report=reportFor(e);
 if(kind==='legacy')delete report.sourceFingerprint;
 if(kind==='stale')e.documents[0].version=2;
 store.engagement=e;store.engagement.reports=[report];store.materiality=ctx.materiality;
 document.querySelector('main').innerHTML='<section class="report-panel"></section>';
 initCompletion({renderAll:renderCompletion});renderCompletion();
 return {ready:completionStatus(e,ctx).ready,reportReady:reportIssueReadiness(report,completionStatus(e,ctx),e).ready,verdict:e.councilRounds.at(-1).verdict};
}
window.councilFixture={setup,render:renderCompletion,state:()=>({engagement:store.engagement,report:store.engagement.reports.at(-1)})};
setup('valid');
