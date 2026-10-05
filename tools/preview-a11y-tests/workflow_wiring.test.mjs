import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=process.env.SQC_OUTPUT_ROOT||path.resolve(import.meta.dirname,'../preview-a11y-repair');
const file='.github/workflows/sqc-preview-accessibility.yml';
const workflow=fs.readFileSync(path.join(root,file),'utf8');
const packagePath='tools/preview-a11y-tests/';
const suites=['output_focus_lifecycle.test.mjs','mutation_controls.test.mjs','overlay_integration.test.mjs','workflow_wiring.test.mjs'];
const native=packagePath+'preview_keyboard_ci.mjs';
function globMatches(glob,value){let pattern='';for(let i=0;i<glob.length;i++){if(glob[i]==='*'){if(glob[i+1]==='*'){pattern+='.*';i++;}else pattern+='[^/]*';}else pattern+=glob[i].replace(/[.+?^${}()|[\]\\]/g,'\\$&');}return new RegExp('^'+pattern+'$').test(value);}
function check(w){
 const triggers=[...w.split('workflow_dispatch:')[0].matchAll(/^\s+- ['"]([^'"]+)['"]\s*$/gm)].map(x=>x[1]);
 for(const dep of ['build.py','ui/core/sk.js','ui/core/output.js','ui/core/a11y.js','ui/layouts/topbar.js','ui/components/palette.js','ui/components/keys.js','ui/features/assistant.js','ui/ds/shell.css','ui/features/assistant.css',file,...suites.map(f=>packagePath+f),native,packagePath+'frozen/palette-6677.js'])assert.ok(triggers.some(g=>globMatches(g,dep)),'Dependency trigger missing: '+dep);
 assert.match(w,/ref:\s*\$\{\{ github\.event\.pull_request\.head\.sha \|\| github\.sha \}\}/);
 assert.match(w,/test "\$\(git rev-parse HEAD\)" = "\$SQC_TESTED_SHA"/);
 assert.match(w,/SQC_OUTPUT_ROOT:\s*\$\{\{ github\.workspace \}\}/);
 const commands=[...w.matchAll(/^\s+node --test (.+)$/gm)].flatMap(x=>x[1].split(/\s+/));
 for(const suite of suites)assert.ok(commands.includes(packagePath+suite),'Pure suite invocation missing: '+suite);
 const lines=w.split('\n');const invoke=lines.findIndex(line=>new RegExp('^\\s*NODE_PATH=\\S+\\s+node '+native.replaceAll('.','\\.')+' "\\$GITHUB_WORKSPACE"\\s*$').test(line));
 assert.ok(invoke>=0,'Real browser invocation missing; node --check is not browser execution');
 const install=lines.findIndex(line=>line.includes('playwright install --with-deps chromium'));
 assert.ok(install>=0&&install<invoke,'Browser install must precede actual invocation');
 assert.match(w,/playwright@1\.51\.1/);assert.match(w,/path:\s*artifacts\/preview-keyboard\//);
 return true;
}
test('workflow invokes exact-head independent pure/native suites and all declared dependencies trigger it',()=>{assert.equal(check(workflow),true);for(const f of suites.concat('output_focus_harness.mjs','overlay_integration_harness.mjs','preview_keyboard_ci.mjs','frozen/output-89b6f181.js','frozen/palette-6677.js','frozen/keys-before-overlay-repair.js','frozen/assistant-before-overlay-repair.js'))assert.ok(fs.existsSync(path.join(root,packagePath,f)),'Packaged input missing: '+f);});
test('negative control: replacing native execution by syntax-only cannot satisfy workflow contract',()=>{const altered=workflow.replace('node '+native+' "$GITHUB_WORKSPACE"','node --check '+native+' "$GITHUB_WORKSPACE"');assert.notEqual(altered,workflow);assert.throws(()=>check(altered),/Real browser invocation missing/);});
test('negative control: omitted overlay suite or module trigger is detected',()=>{assert.throws(()=>check(workflow.replace(' '+packagePath+'overlay_integration.test.mjs','')),/Pure suite invocation missing/);assert.throws(()=>check(workflow.replace(/^\s*- 'ui\/components\/palette\.js'\s*$/m,'')),/Dependency trigger missing/);});
