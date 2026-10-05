import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const worker=fs.readFileSync(new URL('../capabilities-v2/worker.js',import.meta.url),'utf8');
const schema=fs.readFileSync(new URL('../capabilities-v2/schema.sql',import.meta.url),'utf8');
const client=fs.readFileSync(new URL('../ui/features/capabilities-v2.js',import.meta.url),'utf8');

test('sensitive company access is explicit and shareable',()=>{
  for(const marker of ['workspace_security','workspace_access','workspace:share','workspaceAccessRole','shareWorkspace','sensitivity','access_mode']) assert.ok(worker.includes(marker),marker);
  assert.match(worker,/name\.replace\(\/\\s\+\/g,""\) === "تصيف"/);
  assert.match(worker,/access_mode==="tenant"/);
  assert.match(worker,/return access\?\.role\|\|null/);
});
test('D1 schema contains per-workspace security and membership keys',()=>{
  assert.match(schema,/CREATE TABLE IF NOT EXISTS workspace_security/);
  assert.match(schema,/CHECK \(access_mode IN \('tenant','explicit'\)\)/);
  assert.match(schema,/CHECK \(sensitivity IN \('standard','sensitive'\)\)/);
  assert.match(schema,/CREATE TABLE IF NOT EXISTS workspace_access/);
  assert.match(schema,/PRIMARY KEY \(workspace_id, subject\)/);
});
test('only owner and partner roles receive the workspace share permission',()=>{
  const owner=worker.match(/owner: Object\.freeze\(\[([^\]]+)\]\)/)?.[1]||'';
  const partner=worker.match(/partner: Object\.freeze\(\[([^\]]+)\]\)/)?.[1]||'';
  const manager=worker.match(/manager: Object\.freeze\(\[([^\]]+)\]\)/)?.[1]||'';
  assert.match(owner,/workspace:share/);assert.match(partner,/workspace:share/);assert.doesNotMatch(manager,/workspace:share/);
});

test('client sharing UI is gated by the role inside the current workspace',()=>{
  assert.match(client,/workspaceRole=\(\)=>state\.workspace\?\.workspace_role/);
  assert.match(client,/\["owner","partner"\]\.includes\(workspaceRole\(\)\)/);
  assert.match(client,/صلاحيتك داخل هذه الشركة/);
  assert.match(client,/state\.workspace\.sensitivity==="sensitive"/);
});
