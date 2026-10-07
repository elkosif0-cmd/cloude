import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const worker=fs.readFileSync(new URL('../capabilities-v2/worker.js',import.meta.url),'utf8');
const schema=fs.readFileSync(new URL('../capabilities-v2/schema.sql',import.meta.url),'utf8');
const client=fs.readFileSync(new URL('../ui/features/capabilities-v2.js',import.meta.url),'utf8');

test('sensitive company access is explicit and shareable',()=>{
  for(const marker of ['workspace_security','workspace_access','workspace:share','workspaceAccessContext','shareWorkspace','sensitivity','access_mode']) assert.ok(worker.includes(marker),marker);
  assert.match(worker,/name\.replace\(\/\\s\+\/g,""\) === "تصيف"/);
  assert.match(worker,/access_mode==="tenant"/);
  assert.match(worker,/return access\?\{workspace,tenantId:workspace\.tenant_id,role:access\.role,security\}:null/);
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


test('document vault is workspace-ACL protected and fails closed without R2',()=>{
  for(const marker of ['document:list','document:read','document:write','document:delete','requireDocumentBucket','document_vault_unavailable','workspace_documents','DOCUMENT_MAX_BYTES','sha256Bytes']) assert.ok(worker.includes(marker),marker);
  assert.match(worker,/if\(workspace\.archived_at\)return jsonResponse\(\{error:"workspace_archived"\},409\)/);
  assert.match(worker,/rec|R2|DOCUMENTS/i);
  const owner=worker.match(/owner: Object\.freeze\(\[([^\]]+)\]\)/)?.[1]||'';
  const viewer=worker.match(/viewer: Object\.freeze\(\[([^\]]+)\]\)/)?.[1]||'';
  assert.match(owner,/document:delete/);
  assert.match(viewer,/document:read/);
  assert.doesNotMatch(viewer,/document:write|document:delete/);
});
test('document metadata lives in D1 while bytes are addressed by R2 object key',()=>{
  assert.match(schema,/CREATE TABLE IF NOT EXISTS workspace_documents/);
  assert.match(schema,/object_key TEXT NOT NULL UNIQUE/);
  assert.match(schema,/sha256 TEXT NOT NULL CHECK \(length\(sha256\)=64\)/);
  assert.match(schema,/deleted_at TEXT/);
});

test('client mirrors document permissions and exposes guarded vault methods',()=>{
  assert.match(client,/document:list/);assert.match(client,/document:read/);assert.match(client,/document:write/);assert.match(client,/document:delete/);
  assert.match(client,/uploadDocument:uploadRemoteDocument/);
  assert.match(client,/raw:true/);
  assert.match(client,/timeoutMs:45000/);
});
