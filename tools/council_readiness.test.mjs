import test from 'node:test';
import assert from 'node:assert/strict';
import { convene } from '../ui/audit/council.js';
import { createEngagement, reportReadiness } from '../ui/audit/v5/engagement-machine.js';
import { recordCouncilRound, ingestEvidenceBatch, reviewLoopStatus } from '../ui/audit/v5/review-loop.js';
import { completionStatus, recordCompletionDecision } from '../ui/audit/v5/completion-engine.js';
import { buildProfessionalReportModel } from '../ui/audit/v5/report-model.js';
import { reviewReportSection, reportIssueReadiness, issueReport } from '../ui/audit/v5/report-approval.js';
import { buildEngagementTraceability, traceabilityMetrics } from '../ui/audit/v5/traceability.js';
import { reportSourceFingerprint } from '../ui/audit/v5/report-source.js';
import { store } from '../ui/audit/v5/continuous-store.js';
import { renderCompletion } from '../ui/audit/v5/continuous-completion.js';

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
function assertNotReady(e) {
  const readiness = reportReadiness(e);
  assert.equal(readiness.ready, false);
  assert.ok(readiness.score < 100);
  assert.ok(readiness.blockers.length > 0, 'explain the missing Council/evidence prerequisite');
  assert.equal(reviewLoopStatus(e).canBuildReport, false);
}

test('actual blocked Council with no asks cannot make a report ready', () => {
  const session = actualSession({ analysis: { balanced: false, imbalance: 1n } });
  assert.equal(session.verdict, 'blocked');
  const result = recordCouncilRound(base(), session, { recordedAt: at });
  assert.equal(result.createdRequests.length, 0);
  assertNotReady(result.engagement);
});
for (const round of [{}, { positions: [] }]) {
  test(`empty Council ${JSON.stringify(round)} cannot make a report ready`, () => assertNotReady(recorded(round)));
}
test('actual Council objection with no evidence asks blocks readiness', () => {
  const session = actualSession({ materiality: null });
  assert.equal(session.verdict, 'objections');
  assert.equal(session.asks.length, 0);
  assertNotReady(recorded(session));
});
for (const [name, mutate] of [
  ['blocked verdict', r => { r.verdict = 'blocked'; }],
  ['objection stance', r => { r.positions[0].stance = 'objection'; }],
  ['blocked stance', r => { r.positions[0].stance = 'blocked'; }],
  ['explicit blockers', r => { r.blockers = ['Synthetic unresolved Council blocker']; }],
  ['unresolved conflict', r => { r.conflicts = [{ id: 'C-1', title: 'Synthetic conflict', resolution: null }]; }]
]) test(`${name} remains a blocker independently of requests`, () => {
  const session = actualSession(); mutate(session); assertNotReady(recorded(session));
});
test('nonblocking actual Council without any evidence is not ready', () => {
  const session = actualSession({ risks: [], workpapers: [], evidence: [] });
  assert.equal(session.blockers.length, 0);
  assertNotReady(recorded(session, base({ evidence: false })));
});
for (const [name, mutate] of [
  ['empty round evidence references', e => { e.councilRounds.at(-1).evidenceIds = []; }],
  ['missing referenced evidence', e => { e.evidence = []; }],
  ['dangling extra evidence reference', e => { e.councilRounds.at(-1).evidenceIds.push('EVD-MISSING'); }],
  ['unreviewed evidence', e => { e.evidence[0].reviewStatus = 'received'; }],
  ['rejected evidence', e => { e.evidence[0].reviewStatus = 'rejected'; }]
]) test(`${name} cannot satisfy report readiness`, () => { const e = recorded(); mutate(e); assertNotReady(e); });
for (const [name, make] of [
  ['blocked round', () => recorded(actualSession({ analysis: { balanced: false } }))],
  ['empty round', () => recorded({})],
  ['missing evidence', () => recorded(actualSession({ risks: [], evidence: [] }), base({ evidence: false }))]
]) test(`completion room also rejects ${name} after all human decisions`, () => {
  const status = completionStatus(complete(make()), ctx);
  assert.equal(status.ready, false);
  assert.ok(status.blockers.some(b => ['COUNCIL_COMPLETED', 'EVIDENCE_REQUESTS_CLOSED'].includes(b.id)));
});
test('latest actual valid round clears earlier block and permits reviewed report issuance', () => {
  const blocked = recorded(actualSession({ analysis: { balanced: false } }));
  const e = complete(recorded(actualSession({ now: '2026-10-04T12:01:00.000Z' }), blocked));
  assert.equal(e.councilRounds.length, 2);
  assert.equal(reportReadiness(e).ready, true);
  assert.equal(reportReadiness(e).score, 100);
  const completion = completionStatus(e, ctx);
  assert.equal(completion.ready, true);
  const report = reportFor(e);
  assert.equal(reportIssueReadiness(report, completion, e).ready, true);
  const issued = issueReport(report, completion, human, e);
  assert.equal(issued.status, 'issued');
  assert.equal(report.status, 'reviewed', 'issue creates a copy');
});
test('later blocked Council invalidates readiness after a valid round', () => {
  const e = recorded(actualSession({ analysis: { balanced: false }, now: '2026-10-04T12:02:00.000Z' }), recorded());
  assertNotReady(e);
});
for (const completion of [{ ready: false, blockers: [] }, {}, { ready: 'true' }, { ready: 1 }, { ready: [] }, { ready: null }]) {
  test(`issuance requires explicit completion true: ${JSON.stringify(completion)}`, () => {
    const e = complete(recorded()), report = reportFor(e);
    const readiness = reportIssueReadiness(report, completion, e);
    assert.equal(readiness.ready, false);
    assert.ok(readiness.blockers.some(b => b.type === 'completion'));
    assert.throws(() => issueReport(report, completion, human, e), /not ready for issue/);
  });
}
test('completion blocker details are preserved', () => {
  const e = complete(recorded()), report = reportFor(e);
  const readiness = reportIssueReadiness(report, { ready: false, blockers: [{ id: 'CHECK-1', detail: 'Synthetic detail' }] }, e);
  assert.ok(readiness.blockers.some(b => b.type === 'completion' && b.id === 'CHECK-1' && b.message === 'Synthetic detail'));
});
test('stale source and missing fingerprint cannot be reviewed or issued', () => {
  const e = complete(recorded()), report = reportFor(e), completion = completionStatus(e, ctx);
  e.documents[0].version = 2;
  assert.equal(reportIssueReadiness(report, completion, e).ready, false);
  assert.throws(() => reviewReportSection(report, 'opinion', { ...human, decision: 'approved' }, e), /stale/);
  assert.throws(() => issueReport(report, completion, human, e), /not ready/);
  delete report.sourceFingerprint;
  assert.equal(reportIssueReadiness(report, completion, e).ready, false);
  assert.throws(() => reviewReportSection(report, 'opinion', { ...human, decision: 'approved' }, e), /fingerprint/);
});

// Minimal DOM adapter only; all domain modules and renderCompletion are real imports.
function render(e, report) {
  const previousRoot = globalThis.__kxRoot, previousEngagement = store.engagement, previousMateriality = store.materiality;
  const nodes = Object.fromEntries(['#completionRoom', '#completionScore', '#completionSummary', '#completionChecks', '#reportReviewChecks', '#issueReportButton', '#reportFreshness'].map(s => [s, { innerHTML: '', textContent: '', className: '', disabled: false }]));
  globalThis.__kxRoot = () => ({ querySelector: s => nodes[s] || null, querySelectorAll: () => [] });
  store.engagement = structuredClone(e);
  store.engagement.reports = [report];
  store.materiality = ctx.materiality;
  try { renderCompletion(); return nodes; }
  finally { store.engagement = previousEngagement; store.materiality = previousMateriality; globalThis.__kxRoot = previousRoot; }
}
test('render does not adopt a current fingerprint for legacy drafts', () => {
  const e = complete(recorded()), report = reportFor(e);
  delete report.sourceFingerprint;
  const before = structuredClone(report), nodes = render(e, report);
  assert.deepEqual(report, before);
  assert.doesNotMatch(nodes['#reportFreshness'].textContent, /FRESH/);
  assert.match(nodes['#reportFreshness'].textContent, /بصمة|مصدر/);
  assert.equal(nodes['#issueReportButton'].disabled, true);
  assert.match(nodes['#reportReviewChecks'].innerHTML, /data-decision="approved" disabled/);
});
test('render preserves and displays an existing fresh fingerprint', () => {
  const e = complete(recorded()), report = reportFor(e), before = structuredClone(report), nodes = render(e, report);
  assert.deepEqual(report, before);
  assert.match(nodes['#reportFreshness'].textContent, /^FRESH/);
  assert.match(nodes['#reportFreshness'].textContent, new RegExp(reportSourceFingerprint(e)));
  assert.equal(nodes['#issueReportButton'].disabled, false);
});
test('render keeps stale fingerprint unchanged and disables review', () => {
  const e = complete(recorded()), report = reportFor(e); e.documents[0].version = 2;
  const before = structuredClone(report), nodes = render(e, report);
  assert.deepEqual(report, before);
  assert.match(nodes['#reportFreshness'].textContent, /^STALE/);
  assert.equal(nodes['#issueReportButton'].disabled, true);
  assert.match(nodes['#reportReviewChecks'].innerHTML, /data-decision="approved" disabled/);
});

// Existing guard controls: bounded Council hardening must not replace these gates.
for (const [name, mutate, check] of [
  ['open request', e => e.requests.push({ id: 'REQ-1', status: 'requested', priority: 'normal' }), 'noOpenEvidenceRequests'],
  ['open critical issue', e => e.issues.push({ id: 'ISS-1', status: 'open', severity: 'critical' }), 'noUnresolvedIssues'],
  ['undecided adjustment', e => e.adjustments.push({ id: 'AJ-1', status: 'proposed' }), 'adjustmentsDecided']
]) test(`preserves ${name} readiness gate`, () => {
  const e = recorded(); mutate(e); const readiness = reportReadiness(e);
  assert.equal(readiness.ready, false); assert.equal(readiness.checks[check], false);
});
test('sufficient evidence remains accepted by existing review status contract', () => {
  const e = recorded(); e.evidence[0].reviewStatus = 'sufficient';
  assert.equal(reportReadiness(e).ready, true);
});
test('issuance still requires a human decision and approved report sections', () => {
  const e = complete(recorded()), report = reportFor(e), completion = completionStatus(e, ctx);
  assert.throws(() => issueReport(report, completion, { ...human, actorType: 'ai' }, e), /actorType=human/);
  delete report.sections.find(s => s.id === 'opinion').review;
  assert.equal(reportIssueReadiness(report, completion, e).ready, false);
});
test('completion Council detail does not interpolate imported Council markup', () => {
  const session = actualSession({ analysis: { balanced: false } });
  session.verdictText = '<img src=x onerror=alert(1)>';
  session.conflicts = [{ id: 'C-1', title: '<script>imported</script>', resolution: null }];
  const detail = completionStatus(recorded(session), ctx).requirements.find(r => r.id === 'COUNCIL_COMPLETED').detail;
  assert.doesNotMatch(detail, /<img|<script/);
});

for(const [label,positions] of [['empty object',[{}]],['null position',[null]],['missing seat',[{stance:'clear'}]],['blank seat',[{seatId:' ',stance:'clear'}]],['unknown stance',[{seatId:'data',stance:'approved'}]],['string positions','clear'],['object positions',{}]]){
 test(`incomplete Council position payload ${label} fails closed without throwing`,()=>{const e=recorded();e.councilRounds.at(-1).positions=positions;assertNotReady(e);assert.equal(completionStatus(complete(e),ctx).ready,false);});
}

for(const [label,positions] of [['sparse',Array(1)],['array masquerading as position',[Object.assign([],{seatId:'data',stance:'clear'})]]]){
 test(`incomplete Council ${label} cannot count as a meaningful position`,()=>{const e=recorded();e.councilRounds.at(-1).positions=positions;assertNotReady(e);});
}
