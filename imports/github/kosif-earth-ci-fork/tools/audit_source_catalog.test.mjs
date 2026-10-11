import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {harness,plain,root} from './apple-source-harness.mjs';
const REVIEWED=['pg-2026','homedepot-2025','mcdonalds-2022','mercedes-2025','volkswagen-2025'];
test('Audit model catalog distinguishes five replayed sources, partial Apple, pending and unavailable records',()=>{
 const{E}=harness(),catalog=E.reports.corpusCompanies.auditModelCatalog?.();assert.ok(catalog,'explicit Audit model support catalog required');
 assert.equal(catalog.length,50);assert.equal(new Set(catalog.map(r=>r.id )).size,50);
 assert.deepEqual(plain(catalog.filter(c=>c.modelStatus==='source-replayed').map(c=>c.id).sort()),[...REVIEWED].sort());
 const apple=catalog.find(c=>c.id==='apple-2024');assert.equal(apple.modelStatus,'partially-supported');assert.equal(apple.openable,true);
 const pending=catalog.filter(c=>c.modelStatus==='pending-review');assert.equal(pending.length,43);assert.ok(pending.every(c=>c.openable===false));
 const unavailable=catalog.find(c=>c.id==='loreal-2024');assert.equal(unavailable.modelStatus,'unavailable');assert.equal(unavailable.openable,false);
 assert.ok(catalog.every(c=>c.modelStatusAr&&c.supportReason));assert.ok(catalog.every(c=>c.id!=='mcdonalds-2025'));
});
test('existing Audit picker displays support states and never presents all reports as completed audits',()=>{
 const{context:W}=harness(),list=W.__test.bundleList({clients:[]}),html=W.__test.bundleRows(list),selector=W.__test.corpusPicker();
 for(const id of REVIEWED){assert.match(html,new RegExp('data-model-id="'+id+'"'));assert.match(selector,new RegExp('value="'+id+'"'));}
 for(const status of ['source-replayed','partially-supported','pending-review','unavailable'])assert.match(html,new RegExp('data-model-status="'+status+'"'));
 const pending=html.match(/<tr[^>]+data-model-status="pending-review"[\s\S]*?<\/tr>/g)||[];assert.equal(pending.length,43);
 /* R16 (P5): a pending company with a corpus model opens as an audit file, labelled pending and simulation-only; Panasonic (no statements in the bundle) does not */
 for(const r of pending){const model=!r.includes('data-model-id="panasonic-2024"');assert.equal(r.includes('data-bundle-add'),model);assert.equal(r.includes('data-bundle-show'),model);assert.match(r,/بانتظار مراجعة واعتماد نموذج التطبيق/);assert.match(r,model?/محاكاة على أرقام منشورة، لا تأكيد مهني/:/لا يُفتح كملف مراجعة/);assert.doesNotMatch(r,/تم إنجاز المراجعة|مراجعة مكتملة للشركة/);}
 assert.doesNotMatch(W.__test.filesBar(),/43 شركة|يراجعها كاملة|نموذج عرض القدرات/);assert.match(W.__test.filesBar(),/نماذج التقارير المنشورة/);
 const caps=JSON.parse(fs.readFileSync(root+'/ui/core/capabilities.json'));const all=JSON.stringify(caps);assert.match(all,/"id":"tbreview"/);assert.match(all,/"group":"audit"/);
});
test('each named completed model reuses the existing source-review route without ledger or assurance conversion',async()=>{
 const h=harness(),W=h.context;for(const id of REVIEWED){assert.ok(await W.SKosifTBReview.openClient(id));const c=W.__test.compute(),x=W.__test.docX(c);assert.equal(c.sourceOnly,true);assert.equal(c.sourceReplay,true);assert.equal(c.sourceVerified,true);assert.equal(c.derived.opinion,'not-assessed');assert.equal(x.ctx.auditFirm,'');assert.deepEqual(plain(W.SKosifTBReview.rows().rows),[]);assert.equal(c.fsAfterAdj.reconstructionStatus.status,'unavailable');}
});
