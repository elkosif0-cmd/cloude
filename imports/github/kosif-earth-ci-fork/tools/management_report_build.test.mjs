import {fileURLToPath} from "node:url";
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import{spawnSync}from'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
function injection(css){const script=`import ast,json,sys\np='build.py'\nt=ast.parse(open(p).read())\nf=next((n for n in t.body if isinstance(n,ast.FunctionDef) and n.name=='management_css_script'),None)\nassert f is not None,'management_css_script must exist'\nns={'json':json};exec(compile(ast.Module(body=[f],type_ignores=[]),p,'exec'),ns)\nprint(ns['management_css_script'](json.load(sys.stdin)),end='')`;const r=spawnSync(process.platform==='win32'?'python':'python3',['-c',script],{cwd:root,input:JSON.stringify(css),encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout}
test('build injects only exact reviewed CSS through safe JSON serialization',()=>{const css=fs.readFileSync(new URL('../ui/features/management-report.css',import.meta.url),'utf8'),script=injection(css),ctx={window:{}};vm.runInNewContext(script,ctx);assert.equal(ctx.window.__SK_MANAGEMENT_REPORT_CSS__,css)});
test('CSS injection safely handles quote closing-script and Unicode separators',()=>{const css='/* "quote" </script><script>CANARY</script> \\ \u2028 \u2029 */';const script=injection(css);assert.doesNotMatch(script,/<\/script/i);const ctx={window:{}};vm.runInNewContext(script,ctx);assert.equal(ctx.window.__SK_MANAGEMENT_REPORT_CSS__,css)});
test('explicit build ordering registers model source output UI and scoped CSS once',()=>{const s=fs.readFileSync(new URL('../build.py',import.meta.url),'utf8');for(const p of ['core/management-report-model.js','features/management-report-source.js','features/management-report-output.js','features/management-report.js'])assert.equal(s.split('"'+p+'"').length-1,1,p);assert.ok(s.indexOf('"core/management-report-model.js"')<s.indexOf('"features/management-report-source.js"'));assert.ok(s.indexOf('"features/management-report-output.js"')<s.indexOf('"features/management-report.js"'));assert.ok(s.indexOf('"features/management-report.css"')<s.indexOf('"ds/sqc.css"'))});

import {webcrypto} from 'node:crypto';
import {managementBrowserSeed,scopeHarness,keys} from './management_report_fixtures.mjs';
test('exact E2E seed passes actual scope capture model and every serializer without source writes',async()=>{
 const seed=managementBrowserSeed(),before=JSON.stringify(seed),h=scopeHarness(seed),ctx=h.context;
 ctx.window.crypto=webcrypto;
 ctx.window.__SK_MANAGEMENT_REPORT_CSS__=fs.readFileSync(new URL('../ui/features/management-report.css',import.meta.url),'utf8');
 for(const path of ['core/management-report-model.js','features/management-report-source.js','features/management-report-output.js'])vm.runInContext(fs.readFileSync(new URL('../ui/'+path,import.meta.url),'utf8'),ctx);
 const {SKosifManagementSource:source,SKosifManagementModel:model,SKosifManagementOutput:output}=ctx.window;
 assert.equal(h.api.scopeSnapshot().status,'stable');
 const capture=await source.capture();assert.equal(capture.ok,true,JSON.stringify(capture));
 const result=model.build(capture.input);assert.equal(result.ok,true,JSON.stringify(result.issues));
 assert.equal(result.model.rows.length,100);assert.equal(result.model.totals.closingDebitMinor,'123595810588');assert.equal(result.model.totals.closingCreditMinor,'123595810588');
 const snapshot=await output.prepare({...capture,model:result.model,attestation:{kind:'user-attested',inputHash:capture.inputHash,contextHash:capture.contextHash,confirmedAt:'2026-10-04T13:00:00.000Z'}});
 const html=await output.html(snapshot),csv=await output.csv(snapshot),json=JSON.parse(await output.json(snapshot));
 assert.equal(json.model.rows.length,100);assert.equal(json.snapshotHash,snapshot.snapshotHash);
 assert.equal((html.match(/data-role="total"/g)||[]).length,1);assert.equal((csv.match(/^"total",/gm)||[]).length,1);
 for(const hash of [snapshot.inputHash,snapshot.contextHash,snapshot.evidenceHash,snapshot.snapshotHash]){assert.ok(html.includes(hash));assert.ok(csv.includes(hash))}
 assert.equal((await source.checkFresh(capture)).fresh,true);
 assert.equal(JSON.stringify(seed),before);assert.deepEqual(h.writes,[]);assert.deepEqual(h.opens,[]);
 assert.deepEqual(h.get(keys.ledger),seed[keys.ledger]);
 const e2e=fs.readFileSync(new URL('./management_report_e2e.mjs',import.meta.url),'utf8');assert.match(e2e,/const seed=managementBrowserSeed\(\);/);
});
test('actual A4 account enumeration executes with exact E2E seed bindings',()=>{
 const source=fs.readFileSync(new URL('./management_report_e2e.mjs',import.meta.url),'utf8');
 const start=source.indexOf('for(const a of '),end=source.indexOf(";assert.equal((text.stdout.match(/1,235",start);
 assert.ok(start>=0&&end>start,'locate actual account-count assertion');
 const actualLoop=source.slice(start,end)+';',seed=managementBrowserSeed();
 const pdfText=seed[keys.ledger].accounts.map(a=>a.code).join('\n');
 vm.runInNewContext(actualLoop,{seed,keys,assert,text:{stdout:pdfText}});
 assert.throws(()=>vm.runInNewContext(actualLoop,{seed,keys,assert,text:{stdout:pdfText.replace(seed[keys.ledger].accounts[0].code,'MISSING')}}),/exactly once/);
});

function actualFocusHelper(){
 const source=fs.readFileSync(new URL('./management_report_e2e.mjs',import.meta.url),'utf8');
 const helper=source.match(/async function traceDialogFocus\(page,width,reverse=false\)\{[\s\S]*?\n\}/)?.[0];
 assert.ok(helper,'locate actual bidirectional focus diagnostic');return helper;
}
test('actual focus helper performs strict forward and backward twelve-step cycles',async()=>{
 const writes=[],keys=[],ctx=vm.createContext({assert,fs:{writeFileSync:(...args)=>writes.push(args)},out:'synthetic-evidence'});
 vm.runInContext(actualFocusHelper(),ctx);
 const page={keyboard:{press:async key=>keys.push(key)},evaluate:async()=>({inside:true,activePath:'dialog > button',dialogOpen:true,modal:true}),screenshot:async()=>assert.fail('successful focus cycle needs no failure screenshot')};
 await ctx.traceDialogFocus(page,390);await ctx.traceDialogFocus(page,390,true);
 assert.deepEqual(keys,[...Array(12).fill('Tab'),...Array(12).fill('Shift+Tab')]);
 assert.equal(writes.length,24);assert.ok(writes[11][0].endsWith('focus-390-forward.json'));assert.ok(writes[23][0].endsWith('focus-390-backward.json'));
 assert.equal(JSON.parse(writes[23][1]).trace.length,12);
});
test('actual backward focus helper saves active-element trace DOM and screenshot before rejecting escape',async()=>{
 const writes=[],screenshots=[],keys=[],ctx=vm.createContext({assert,fs:{writeFileSync:(...args)=>writes.push(args)},out:'synthetic-evidence'});
 vm.runInContext(actualFocusHelper(),ctx);
 const page={keyboard:{press:async key=>keys.push(key)},evaluate:async()=>({inside:false,activePath:'html > body',activeTag:'BODY',documentHasFocus:false,dialogOpen:true,modal:true,dialogHTML:'<dialog open>synthetic</dialog>'}),screenshot:async opts=>screenshots.push(opts)};
 await assert.rejects(()=>ctx.traceDialogFocus(page,320,true),/focus left management dialog.*backward/);
 assert.deepEqual(keys,['Shift+Tab']);assert.ok(writes.some(([path,data])=>path.endsWith('focus-320-backward.json')&&data.includes('html > body')));
 assert.ok(writes.some(([path,data])=>path.endsWith('focus-320-backward-dialog.html')&&data.includes('<dialog open>')));
 assert.equal(screenshots.length,1);assert.match(screenshots[0].path,/focus-320-backward-failure\.png$/);
});
