import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {workspaceHarness} from './workspace_validation_fixture.mjs';

const source=fs.readFileSync(new URL('../ui/features/workspace.js',import.meta.url),'utf8');
for(const [name,service,from,to,action,fill,blocked] of [
  ['service company creation',true,'if(a==="add-co"&&SK.company){if(!validateFields(root,"#co-fields"))','if(a==="add-co"&&SK.company){if(!SK.ui.validate(root))','add-co',{'co-name':'Synthetic Mutation'},'pe-label'],
  ['fallback company creation',false,'if(a==="add-co"){if(!validateFields(root,"#co-fields"))','if(a==="add-co"){if(!SK.ui.validate(root))','add-co',{'co-name':'Synthetic Mutation'},'pe-label'],
  ['period creation',true,'else if(a==="add-pe"){if(!validateFields(root,"#pe-fields"))','else if(a==="add-pe"){if(!SK.ui.validate(root))','add-pe',{'pe-label':'Synthetic Mutation','pe-from':'2026-01-01','pe-to':'2026-12-31'},'co-name'],
]) {
  test(`NEGATIVE CONTROL: restoring root validation reintroduces ${name} blocker`,async()=>{
    assert.equal(source.split(from).length-1,1,'mutation must target exactly one actual handler');
    const h=await workspaceHarness({service,source:source.replace(from,to)}),before=h.get();h.fill(fill);h.click(action);
    assert.deepEqual(h.get(),before,'unsafe mutation must witness the original creation failure');
    assert.equal(h.document.activeElement?.id,blocked);assert.equal(h.field(blocked).getAttribute('aria-invalid'),'true');
  });
}
test('CI-only browser harness refuses local execution before any browser import or launch',()=>{
  const env={...process.env};delete env.GITHUB_ACTIONS;
  const result=spawnSync(process.execPath,['tools/workspace_validation_e2e.mjs'],{cwd:new URL('..',import.meta.url),env,encoding:'utf8'});
  assert.notEqual(result.status,0);assert.match(result.stderr,/Workspace browser acceptance is CI-only/);
  assert.doesNotMatch(result.stderr,/Cannot find module 'playwright'/);
});
test('browser acceptance has no state-seeding or creation API bypass',()=>{
  const browser=fs.readFileSync(new URL('./workspace_validation_e2e.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(browser,/(?:localStorage|sessionStorage)\.(?:setItem|removeItem|clear)\s*\(/);
  assert.doesNotMatch(browser,/\b(?:SK\.company\.(?:create|setPeriod|open)|SKosifCore\.go|SKosifSpace\.switchTo)\s*\(/);
  assert.match(browser,/\[data-w="add-co"\]/);assert.match(browser,/\[data-w="add-pe"\]/);
});
