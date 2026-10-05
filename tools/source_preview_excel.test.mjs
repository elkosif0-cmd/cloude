import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import crypto from 'node:crypto';import {harness,root}from'./apple-source-harness.mjs';
const marker='[data-source-kind="published-statements"], .rd-source';
function outputHarness(html,code=fs.readFileSync(root+'/ui/core/output.js','utf8')){
 const hasSource=/data-source-kind="published-statements"|class="[^"]*\brd-source\b/.test(html),calls={tables:0,book:0,downloads:[],toasts:[]};
 const table={rows:[{cells:[{textContent:'Account'},{textContent:'Amount'}]},{cells:[{textContent:'Cash'},{textContent:'1'}]}],previousElementSibling:null,parentElement:null};
 const doc={title:'Source report',querySelector:s=>s===marker&&hasSource?{}:null,querySelectorAll:s=>{assert.equal(s,'table');calls.tables++;return[table];}};
 const W={console,Date,Intl,Blob,setTimeout,clearTimeout,navigator:{},document:{addEventListener(){},documentElement:{classList:{add(){},remove(){}}}},addEventListener(){},open(){return null;},SK:{esc:String,toast:(text,type)=>calls.toasts.push({text,type}),download:(name,blob)=>calls.downloads.push({name,blob}),audit:{log(){}},print:{options:()=>({preview:true})}},SKXlsx:{book:()=>{calls.book++;return new Blob(['ordinary-workbook']);}}};W.window=W;vm.createContext(W);
 vm.runInContext(code.replace(/\}\)\(\);\s*$/,'window.__sourceExcelTest={act,setSession:s=>{cur=s;}};\n})();'),W);W.__sourceExcelTest.setSession({active:true,w:{document:doc,closed:false},wrap:null});return{W,calls,doc};
}
for(const id of ['pg-2026','homedepot-2025','mcdonalds-2022','mercedes-2025','apple-2024'])test(id+': real preview Excel action is unsupported before source-table extraction or download',async()=>{
 const h=harness(),W=h.context;await W.SKosifTBReview.openClient(id);const html=W.SKosifReportDocs.annual(W.__test.docX(W.__test.compute())),o=outputHarness(html);await o.W.__sourceExcelTest.act('excel');assert.equal(o.calls.tables,0);assert.equal(o.calls.book,0);assert.equal(o.calls.downloads.length,0);assert.match(o.calls.toasts.at(-1).text,/Excel.*غير متاح.*المصدر/);assert.equal(o.W.SK.output.tables(o.doc).length,0);
});
test('ordinary preview Excel export keeps its existing extraction and download',async()=>{const o=outputHarness('<table><tr><th>Account</th><th>Amount</th></tr><tr><td>Cash</td><td>1</td></tr></table>');await o.W.__sourceExcelTest.act('excel');assert.equal(o.calls.tables,1);assert.equal(o.calls.book,1);assert.equal(o.calls.downloads.length,1);assert.match(o.calls.downloads[0].name,/\.xlsx$/);});
for(const id of ['pg-2026','homedepot-2025','mcdonalds-2022','mercedes-2025'])test(id+': already-generated source Excel table TSV is explicitly refused on fresh re-import',async()=>{
 const h=harness(),tsv=fs.readFileSync(root+'/tools/fixtures/source-preview-excel/'+id+'.tsv','utf8'),tb=h.E.reports.tbImport.parseTrialBalance(tsv);assert.equal(tb.ok,false);assert.equal(tb.sourceKind,'published-statements');assert.equal(tb.sourceReportFormat,'SQC_PUBLISHED_SOURCE_TABLE_LEGACY');assert.ok(tb.errors.some(e=>e.code==='SOURCE_REPORT_REIMPORT_UNSUPPORTED'));assert.equal(await h.context.SKosifTBReview.load(tsv,'legacy-source.xlsx'),false);assert.equal(h.context.__test.compute(),null);
});
test('the minimal source Excel guard composes with exact PR137 output without replacing focus code',async()=>{
 const code=fs.readFileSync(root+'/tools/fixtures/source-preview-excel/pr137-output.js','utf8');assert.equal(crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+Buffer.byteLength(code)+'\0'),Buffer.from(code)])).digest('hex'),'59a1e35c8d3d07c69823a0f80048ac0231c05663');
 const current=fs.readFileSync(root+'/ui/core/output.js','utf8'),helper=current.match(/function sourceReportDocument\(d\)\{[^\n]+\}/)?.[0];assert.ok(helper);
 const guarded=code.replace('function tablesOf(d){',helper+'\nfunction tablesOf(d){\n  if(sourceReportDocument(d))return [];').replace('if(a==="excel"){const t=tablesOf(d);','if(a==="excel"){if(sourceReportDocument(d)){SK.toast("تصدير Excel غير متاح لتقارير المصدر لأنه يفقد بيانات المصدر. استخدم CSV الموثق من نموذج المصدر.","warn");return}const t=tablesOf(d);');
 assert.equal(guarded.includes('function sourceReportDocument'),true);for(const source of [true,false]){const o=outputHarness(source?'<article data-source-kind="published-statements"></article>':'ordinary document',guarded);await o.W.__sourceExcelTest.act('excel');assert.equal(o.calls.downloads.length,source?0:1);assert.equal(o.calls.book,source?0:1);}
});

test('blocked source Excel reports in the preview live region without extracting tables or downloading',async()=>{
 const code=fs.readFileSync(root+'/ui/core/output.js','utf8'),o=outputHarness('<article data-source-kind="published-statements"></article>'),notice={textContent:''};
 o.W.__sourceExcelTest.setSession({w:{document:o.doc},wrap:{querySelector:s=>s==='.skout-notice'?notice:null}});
 await o.W.__sourceExcelTest.act('excel');
 assert.match(notice.textContent,/Excel.*غير متاح.*CSV/);
 assert.equal(o.calls.tables,0);assert.equal(o.calls.book,0);assert.equal(o.calls.downloads.length,0);
 assert.equal(o.calls.toasts.length,0,'modal refusal must not depend on a background toast');
 assert.match(code,/<p class="skout-notice" role="status" aria-live="polite" aria-atomic="true"><\/p>/);
});
