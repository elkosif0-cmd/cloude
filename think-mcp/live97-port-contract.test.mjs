import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src=fs.readFileSync(new URL('./worker.js',import.meta.url),'utf8');

test('PR97 selective port keeps A1990 Capability Atlas v3 active',()=>{
  assert.match(src,/const A1990_CAPABILITY_ATLAS_VERSION="attachment-capability-atlas-v3"/);
  for(const fn of ['a1990CapabilityAtlas','a1990SelectCapabilityPacks','a1990CapabilityPrompt'])
    assert.match(src,new RegExp('function '+fn+'\\('));
  for(const pack of [
    'reasoning_core','decision_stress','audit_ifrs_finance','code_release_engineering',
    'prompt_engineering','visual_prompt_motion','image_operations','context_engineering',
    'tool_interface_design','parallel_execution','verification_completion'
  ]) assert.match(src,new RegExp('\\b'+pack+'\\b'));
  assert.match(src,/capabilityAtlas:\{version:A1990_CAPABILITY_ATLAS_VERSION,packs:capabilityPacks,prompt:a1990CapabilityPrompt\(capabilityPacks\)\}/);
  assert.match(src,/const capabilityRule=a1990CapabilityPrompt\(Array\.isArray\(meta\.capability_packs\).*a1990SelectCapabilityPacks\(meta\.subject,meta\.executor\)\)/);
  assert.match(src,/const capability_packs=a1990SelectCapabilityPacks\(subject,executor\),capability_atlas_version=A1990_CAPABILITY_ATLAS_VERSION/);
  assert.match(src,/name:"kosif_capability_route"/);
  assert.match(src,/mode:"a1990_capability_route"/);
  assert.doesNotMatch(src.slice(src.indexOf('const A1990_CAPABILITY_ATLAS_VERSION='),src.indexOf('function preflightTool(args){')),/__name\d*\(/);
});

test('PR97 OAuth offline_access contract is restored without weakening auth',()=>{
  assert.match(src,/scope="openid profile email offline_access"/);
  assert.match(src,/scopes:\["openid","profile","email","offline_access"\]/);
  assert.match(src,/scopes_supported:\["openid","profile","email","offline_access"\]/);
  assert.match(src,/const VERSION = "0\.18\.6"/);
  assert.match(src,/const VERSIONED_MCP_PATH = "\/mcp\/v0\.18\.6"/);
  assert.match(src,/const COMPAT_VERSIONED_MCP_PATH = "\/mcp\/v0\.18\.5"/);
});

test('Council-500 completion is reconciled across secure executor, KV receipts and audit validation',()=>{
  assert.match(src,/async function c500CompletionReconcile\(env,meta,secureExecutor\)/);
  assert.match(src,/prefix="c500:exp:"\+String\(meta\?\.request_id\|\|""\)\+":"/);
  assert.match(src,/reconciled_count:reconciled/);
  assert.match(src,/const completion_reconciliation=await c500CompletionReconcile\(env,meta,secure_executor\)/);
  assert.match(src,/experts_completed:completed/);
  assert.match(src,/completion_reconciliation,/);
});
