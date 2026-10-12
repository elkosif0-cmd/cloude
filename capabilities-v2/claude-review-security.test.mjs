import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('./worker.js',import.meta.url),'utf8');
const dataUrl='data:text/javascript;base64,'+Buffer.from(
  source+'\nexport {claudeWorkspaceReview};').toString('base64');
const {claudeWorkspaceReview,validateClaudeReviewInput,authorizeRole}=await import(dataUrl);
const valid={consentToSend:true,task:'accounting',text:'Debit cash 115 SAR, credit revenue 100 SAR, output VAT 15 SAR'};
const auth={tenantId:'tenant-a',subject:'auditor@example.test',role:'manager',workspaceRole:'manager'};
const workspaceId='wsp_'+'a'.repeat(26);
const send=(body,origin='https://earth.kosif.pp.ua')=>new Request(
  'https://earth.kosif.pp.ua/api/capabilities-v2/workspaces/'+workspaceId+'/ai/review',
  {method:'POST',headers:{'content-type':'application/json','origin':origin},
    body:JSON.stringify(body)});
const config=()=>({
  AI_REVIEW_ENABLED:'true',
  ANTHROPIC_API_KEY:'synthetic-test-not-a-secret',
  ANTHROPIC_MODEL:'claude-opus-5-5',
  ALLOWED_ORIGINS:'https://earth.kosif.pp.ua',
  AI_REQUEST_LIMITER:{async limit(){return {success:true}}}
});

test('Claude source-review capability is role gated; viewer cannot request paid inference',()=>{
  for(const role of ['owner','partner','manager','senior'])
    assert.equal(authorizeRole(role,'ai:review'),true,role);
  for(const role of ['viewer','unknown','',null,'reviewer'])
    assert.equal(authorizeRole(role,'ai:review'),false,role);
  assert.match(source,/workspaceAccessContext\(db,match\[1\],auth\)/);
  assert.match(source,/if\(!authorizeRole\(access\.role,permission\)\)/);
});
test('explicit consent, purpose and input size are mandatory',()=>{
  assert.equal(validateClaudeReviewInput({...valid,consentToSend:false}).error,
    'ai_explicit_consent_required');
  assert.equal(validateClaudeReviewInput({...valid,task:'post-journal'}).error,
    'ai_task_not_supported');
  assert.equal(validateClaudeReviewInput({...valid,text:'x'.repeat(16001)}).error,
    'ai_review_text_too_large');
  assert.equal(validateClaudeReviewInput({...valid,companyId:'other-tenant'}).error,
    'ai_unknown_payload_field');
  assert.equal(validateClaudeReviewInput({...valid,text:'sk-ant-'+'x'.repeat(40)}).error,
    'ai_possible_secret');
});
test('server secret and disabled flag are fail-closed',async()=>{
  let attempts=0;const original=globalThis.fetch;
  globalThis.fetch=async()=>{attempts++;throw Error('upstream must not be called')};
  try {
    assert.equal((await claudeWorkspaceReview(send(valid),{...config(),ANTHROPIC_API_KEY:''},auth,workspaceId)).status,503);
    assert.equal((await claudeWorkspaceReview(send(valid),{...config(),AI_REVIEW_ENABLED:'false'},auth,workspaceId)).status,503);
    assert.equal((await claudeWorkspaceReview(send(valid),{...config(),AI_REQUEST_LIMITER:undefined},auth,workspaceId)).status,503);
    assert.equal(attempts,0);
  }finally{globalThis.fetch=original}
});
test('unapproved external browser origin is denied',async()=>{
  const response=await claudeWorkspaceReview(send(valid,'https://attacker.example'),
    config(),auth,workspaceId);
  assert.equal(response.status,403);
  assert.equal((await response.json()).error,'origin_not_allowed');
});
test('hard per-tenant and user rate limiter is required before provider call',async()=>{
  let key,called=0;const original=globalThis.fetch;
  globalThis.fetch=async()=>{called++;throw Error('should never call provider')};
  try{
    const env=config();
    env.AI_REQUEST_LIMITER={async limit({key:k}){key=k;return {success:false}}};
    const response=await claudeWorkspaceReview(send(valid),env,auth,workspaceId);
    assert.equal(response.status,429);
    assert.equal(key,'tenant-a:auditor@example.test');
    assert.equal(called,0);
  }finally{globalThis.fetch=original}
});
test('provider receives only validated review text from the authenticated workspace',async()=>{
  const original=globalThis.fetch;
  let request;
  globalThis.fetch=async(url,opts)=>{
    request={url,headers:opts.headers,body:JSON.parse(opts.body)};
    return {ok:true,async json(){return {content:[{type:'text',text:'This is a draft with no booking changes.'}],
      usage:{input_tokens:50,output_tokens:20}}}};
  };
  try{
    const response=await claudeWorkspaceReview(send(valid),config(),auth,workspaceId);
    assert.equal(response.status,200);
    const obj=await response.json();
    assert.equal(obj.review_only,true);
    assert.equal(obj.human_approval_required,true);
    assert.equal(obj.workspace_id,workspaceId);
    assert.equal(obj.model,'claude-opus-5-5');
    assert.equal(obj.answer,'This is a draft with no booking changes.');
    assert.deepEqual(obj.usage,{input_tokens:50,output_tokens:20});
    assert.equal(request.url,'https://api.anthropic.com/v1/messages');
    assert.equal(request.headers['x-api-key'],'synthetic-test-not-a-secret');
    assert.equal(request.body.messages[0].content[0].text,
      'Section: accounting\n\n'+valid.text);
    assert.equal(JSON.stringify(obj).includes('synthetic-test-not-a-secret'),false);
    assert.equal(JSON.stringify(request.body).includes('other-tenant'),false);
  }finally{globalThis.fetch=original}
});
test('malformed or unavailable AI outputs never turn into financial approvals',async()=>{
  const original=globalThis.fetch;
  try{
    globalThis.fetch=async()=>({ok:true,json:async()=>({content:[],usage:{}})});
    const response=await claudeWorkspaceReview(send(valid),config(),auth,workspaceId);
    assert.equal(response.status,502);
    assert.equal((await response.json()).error,'ai_empty_response');
    globalThis.fetch=async()=>{throw Error('simulate offline provider')};
    const offline=await claudeWorkspaceReview(send(valid),config(),auth,workspaceId);
    assert.equal(offline.status,502);
  }finally{globalThis.fetch=original}
});
test('oversized body without declared Content-Length is rejected before provider call',async()=>{
  const original=globalThis.fetch;let called=false;
  globalThis.fetch=async()=>{called=true;throw Error('never call')};
  try {
    const response=await claudeWorkspaceReview(
      send({...valid,text:'x'.repeat(30000)}),config(),auth,workspaceId);
    assert.equal(response.status,413);
    assert.equal(called,false);
  }finally{globalThis.fetch=original}
});
test('workspace route binds authorization to verified workspace, not caller-supplied company id',()=>{
  assert.ok(source.includes('ai:review'), 'AI workspace permission route not found');
  assert.match(source,/\"ai:review\", \"ai-review\"/);
  assert.match(source,/if\(action===\"ai-review\"\)return addCors/);
  assert.doesNotMatch(source,/return jsonResponse\(\{approved:true/);
});
