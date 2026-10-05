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

const accessModule=import('data:text/javascript;base64,'+Buffer.from(worker+'\nexport {workspaceAccessContext,validateWorkspaceInput};\n').toString('base64'));
function accessDb({tenant='tenant-a',mode='explicit',tenantRole='owner',workspaceRole=null}={}){
  const queries=[];
  return {queries,prepare(sql){return {bind(...params){queries.push({sql,params});return {async first(){
    if(sql.includes('FROM workspaces'))return {id:'workspace-a',tenant_id:tenant};
    if(sql.includes('FROM tenant_members'))return tenantRole?{role:tenantRole}:null;
    if(sql.includes('FROM workspace_security'))return {access_mode:mode,sensitivity:'sensitive'};
    if(sql.includes('FROM workspace_access'))return workspaceRole?{role:workspaceRole}:null;
    throw new Error('Unexpected query: '+sql);
  }}}}}};
}
test('explicit workspace access rejects tenant membership without an explicit grant',async()=>{
  const {workspaceAccessContext}=await accessModule,db=accessDb();
  assert.equal(await workspaceAccessContext(db,'workspace-a',{tenantId:'tenant-a',subject:'user-a'}),null);
});
test('cross-tenant workspace grant returns the workspace tenant and its explicit role',async()=>{
  const {workspaceAccessContext}=await accessModule,db=accessDb({workspaceRole:'reviewer'});
  const result=await workspaceAccessContext(db,'workspace-a',{tenantId:'other-tenant',subject:'user-a'});
  assert.equal(result.tenantId,'tenant-a');assert.equal(result.role,'reviewer');
  const grant=db.queries.find(q=>q.sql.includes('FROM workspace_access'));
  assert.deepEqual(grant.params,['workspace-a','tenant-a','user-a']);
});
test('membership in another tenant cannot open an unshared workspace',async()=>{
  const {workspaceAccessContext}=await accessModule,db=accessDb({mode:'tenant'});
  assert.equal(await workspaceAccessContext(db,'workspace-a',{tenantId:'other-tenant',subject:'user-a'}),null);
});
test('protected company names remain sensitive after internal whitespace normalization',async()=>{
  const {validateWorkspaceInput}=await accessModule;
  for(const name of ['تصيف','تص يف','ت ص ي ف','تص\tيف'])assert.equal(validateWorkspaceInput({name}).sensitive,true,name);
});
test('ordinary company classification and explicit sensitivity remain unchanged',async()=>{
  const {validateWorkspaceInput}=await accessModule;
  assert.equal(validateWorkspaceInput({name:'Synthetic ordinary company'}).sensitive,false);
  assert.equal(validateWorkspaceInput({name:'Synthetic ordinary company',sensitive:true}).sensitive,true);
});
