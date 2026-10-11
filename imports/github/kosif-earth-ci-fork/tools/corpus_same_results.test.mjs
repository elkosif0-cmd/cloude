// FOUNDATION P5 — one company, one set of figures. Every company of the research bundle opened as an audit file (the audit
// door → SKosifTBReview.openClient) reaches what the corpus replay (audit/corpus-replay-engine.ts, the corpus lab and the
// scorecard) computes for it: the same trial balance and overrides, materiality, risks, requests and statement keys.
// The file adds the opening requests of the global reports (PBC-W-*, PBC-R2-*) on top; those are compared apart from the review's own.
import test from 'node:test';
import assert from 'node:assert/strict';
import { harness } from './apple-source-harness.mjs';

const KEYS = ['revenue', 'pbz', 'assets', 'equity'];
test('the audit file of every bundle company reaches the corpus replay results', async () => {
  const { context: W, E } = harness();
  const CC = E.reports.corpusCompanies, RV = E.audit.tbReview, TI = E.reports.tbImport, ids = CC.corpusCompanies().map((c) => c.id);
  assert.equal(ids.length, 47);
  const off = [];
  let replayed = 0;
  for (const id of ids) {
    await W.SKosifTBReview.openClient(id);
    const c = W.__test.compute(), t = CC.companyTrialBalance(id);
    /* a company with a reviewed published-statement replay (#143: P&G, Home Depot, Mercedes, Volkswagen) opens on that
       replay — the audited statements themselves, checked against the source — and runs no operational review on it;
       its corpus replay still runs, on the corpus model, below */
    if (t.ctx.sourceModel && 'replay' in t.ctx.sourceModel) {
      if (!(c.d.tbText === t.csv && c.sourceReplay && c.sourceVerified)) off.push(`${id} does not open on its verified source replay`);
      if (!E.audit.corpusReplay.replayCompany(id, { prior: true })?.materiality?.ours) off.push(`${id} has no corpus replay`);
      replayed++;
      continue;
    }
    const ref = RV.reviewTrialBalance(TI.parseTrialBalance(t.csv), { framework: 'IFRS', currency: t.ctx.curSym, overrides: t.overrides, tax: t.ctx.taxKind, unclassified: t.ctx.unclassified });
    const got = { tb: c.d.tbText === t.csv, cur: c.d.ctx.curSym, mat: c.base.materiality.overall, req: c.base.requests.filter((q) => !/^PBC-(W|R2)-/.test(q.id)).length, fin: c.base.findings.length, risks: c.base.risks.length, k: KEYS.map((k) => c.base.fs.keys[k].current) };
    const want = { tb: true, cur: t.ctx.curSym, mat: ref.materiality.overall, req: ref.requests.length, fin: ref.findings.length, risks: ref.risks.length, k: KEYS.map((k) => ref.fs.keys[k].current) };
    if (JSON.stringify(got) !== JSON.stringify(want)) off.push(`${id} ${JSON.stringify(got)} ≠ ${JSON.stringify(want)}`);
    const rp = E.audit.corpusReplay.replayCompany(id, { prior: true });
    if (rp.materiality.ours !== c.base.materiality.overall / 100) off.push(`${id} replay materiality ${rp.materiality.ours} ≠ file ${c.base.materiality.overall / 100}`);
  }
  assert.deepEqual(off, []);
  assert.equal(replayed, 4);
});
