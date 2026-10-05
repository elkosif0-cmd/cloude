import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=path=>{const url=new URL('../'+path,import.meta.url);assert.ok(fs.existsSync(url),'Required CI artifact: '+path);return fs.readFileSync(url,'utf8');};
test('Apple source CI checks out exact head with read-only authority',()=>{
  const y=read('.github/workflows/sqc-apple-source.yml');
  assert.match(y,/contents: read/);assert.match(y,/ref: \$\{\{ github\.event\.pull_request\.head\.sha \|\| github\.sha \}\}/);
  assert.match(y,/persist-credentials: false/);assert.match(y,/git rev-parse HEAD/);
  assert.doesNotMatch(y,/pull_request_target|secrets\.|contents: write|id-token: write/);
});
test('CI explicitly invokes source, bridge and contract tests plus typed/generated checks',()=>{
  const y=read('.github/workflows/sqc-apple-source.yml');
  for(const token of ['npm ci --ignore-scripts','npm run check --prefix app','node tools/build_engines.mjs --check','--experimental-vm-modules --test'])assert.ok(y.includes(token),token);
  const invocation=y.split('\n').find(line=>line.includes('node --experimental-vm-modules --test'));
  for(const file of ['pg_source_replay','home_depot_source_reporting','mcdonalds_source_reporting','mcdonalds_adapter','mercedes_source_replay','source_replay_contract','apple_source_reporting','apple_source_bridge','apple_source_ci_contract','workspace_validation','workspace_validation_contract','audit_source_catalog','source_report_reimport','pending_source_boundary','source_preview_excel','source_csv_fidelity'])assert.ok(invocation?.includes('tools/'+file+'.test.mjs'),file+' must execute in the combined CI invocation');
  for(const pattern of ["'tools/*source*'","'tools/fixtures/**'","'tools/workspace_validation*'"])assert.equal(y.split(pattern).length-1,2,pattern+' must trigger PR and main-push checks');
});
test('actual-browser test is CI-only, source-oracle-bound and scoped to a controlled preview',()=>{
  const s=read('tools/apple_source_browser_e2e.mjs');
  assert.match(s,/GITHUB_ACTIONS/);assert.match(s,/SQC_TESTED_SHA/);assert.match(s,/127\.0\.0\.1:8765/);
  assert.match(s,/apple-fy2024-source\.json/);assert.match(s,/f35bbc22c3438262c35b63d226d62b88c3e252a9da054d9b7a4da4093e46e7f5/);
  assert.ok(s.indexOf('GITHUB_ACTIONS')<s.indexOf('chromium.launch'));
  for(const token of ['data-bundle-add','data-tab="fs"','rd-source','SKosifTBReview.load','sourceModel','data-studio-host'])assert.ok(s.includes(token),token);
});
test('CI runs the browser only after pure checks and builds a data-free preview',()=>{
  const y=read('.github/workflows/sqc-apple-source.yml');
  assert.ok(y.indexOf('tools/apple_source_ci_contract.test.mjs')<y.indexOf('node tools/apple_source_browser_e2e.mjs'));
  assert.match(y,/SQC_BUILD_MODE: preview/);assert.match(y,/not Path\('dist\/secure'\)\.exists/);
  assert.match(y,/--bind 127\.0\.0\.1/);assert.match(y,/trap 'kill/);
  assert.match(y,/playwright@\d+\.\d+\.\d+/);assert.doesNotMatch(y,/playwright@1\s*\n/);
  assert.match(y,/--test-reporter=tap/);assert.match(y,/counts\['tests'\] >= 171/);
  const s=read('tools/apple_source_browser_e2e.mjs');assert.match(s,/EXPECTED_CHECKS\s*=\s*4/);assert.match(s,/results\.length,EXPECTED_CHECKS/);
});
