import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {harness,plain,root} from './apple-source-harness.mjs';
const mainSk=fs.readFileSync(root+'/ui/core/sk.js','utf8');
const serialization=mainSk.split('\n').filter(line=>/^function (safeCell|csv)\(/.test(line)).join('\n');
assert.match(serialization,/function csv/);const serialize=vm.runInNewContext(serialization+';csv');
for(const id of ['pg-2026','homedepot-2025','mcdonalds-2022','mercedes-2025','apple-2024']){
 test(id+': actual CSV export rejects fresh operational re-import explicitly',async()=>{
  const source=harness(),W=source.context;await W.SKosifTBReview.openClient(id);const exported=W.__test.sourceCsv(W.__test.compute());assert.ok(exported);assert.ok(exported.headers.includes('source_format'));assert.ok(exported.headers.includes('source_model_id'));
  const file=serialize(exported.headers,exported.rows);assert.match(file,/SQC_PUBLISHED_REPORT_V1/);assert.match(file,new RegExp(id));
  const fresh=harness(),before=plain(fresh.state),tb=fresh.E.reports.tbImport.parseTrialBalance(file);assert.equal(tb.ok,false);assert.equal(tb.sourceKind,'published-statements');assert.equal(tb.sourceReportFormat,'SQC_PUBLISHED_REPORT_V1');assert.ok(tb.errors.some(e=>e.code==='SOURCE_REPORT_REIMPORT_UNSUPPORTED'));
  const result=fresh.E.reports.statements.buildStatements(tb,{});assert.equal(result.reconstructionStatus.status,'unavailable');assert.equal(result.cf,null);assert.deepEqual(plain(result.keys),{});assert.equal(result.replay.status,'unavailable');
  assert.equal(await fresh.context.SKosifTBReview.load(file,exported.filename),false);assert.deepEqual(plain(fresh.state),before);assert.equal(fresh.context.__test.compute(),null);assert.match(fresh.toasts.at(-1).message,/قوائم منشورة|source.report/i);
 });
 test(id+': source HTML retains machine identity and cannot be reimported as ledger text',async()=>{
  const h=harness(),W=h.context;await W.SKosifTBReview.openClient(id);const html=W.SKosifReportDocs.annual(W.__test.docX(W.__test.compute()));assert.match(html,/data-source-kind="published-statements"/);assert.match(html,new RegExp('data-source-model-id="'+id+'"'));assert.match(html,/8e28ceaac879a106/);
  const fresh=harness(),tb=fresh.E.reports.tbImport.parseTrialBalance(html);assert.equal(tb.ok,false);assert.ok(tb.errors.some(e=>e.code==='SOURCE_REPORT_REIMPORT_UNSUPPORTED'));assert.equal(await fresh.context.SKosifTBReview.load(html,'source.html'),false);assert.equal(fresh.context.__test.compute(),null);
 });
}
test('ordinary trial-balance import retains its existing parser and UI behavior',async()=>{
 const h=harness(),text=h.E.reports.tbImport.SAMPLE_TB_CSV;assert.equal(h.E.reports.tbImport.parseTrialBalance(text).ok,true);assert.equal(await h.context.SKosifTBReview.load(text,'normal',{company:'Operational data',country:'SA'}),true);assert.equal(h.context.__test.compute().sourceOnly,false);
});
