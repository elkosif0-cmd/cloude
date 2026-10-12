import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('./worker.js',import.meta.url),'utf8');
const mod=await import('data:text/javascript;base64,'+
  Buffer.from(source+'\nexport {validateClaudeReviewInput,claudeWorkspaceReview};').toString('base64'));
const {validateClaudeReviewInput,claudeWorkspaceReview}=mod;
const ID='wsp_'+'1'.repeat(26);

function body(data={}) {
  return new Request('https://example.invalid/api/capabilities-v2/workspaces/'+ID+'/ai/review',{
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({task:'audit',question:'هل الأصول تساوي الخصوم وحقوق الملكية؟',
      metrics:{assets:1100,liabilities:400,equity:700},consent:true,...data})
  });
}
function fixtures(options={}) {
  let calls=0,rate=0;
  const env={
    ANTHROPIC_API_KEY:'a-test-only-secret-not-real',
    ANTHROPIC_MODEL:'claude-opus-5-5',
    AI_LIMITER:{async limit(){rate++;return {success:options.ratePass!==false}}},
    DB:{batch(){},prepare(sql){return {bind(){return {async first(){
      if(sql.includes('FROM workspaces'))return {
        id:ID,tenant_id:'ten-a',archived_at:options.archived?new Date().toISOString():null};
      if(sql.includes('FROM workspace_security'))return {
        sensitivity:options.sensitive?'sensitive':'standard',access_mode:'tenant'};
      throw Error('unexpected mock SQL');
    }}}}}}
  };
  const fetchImpl=async(_url,request)=>{
    calls++;
    assert.equal(request.headers['x-api-key'],env.ANTHROPIC_API_KEY);
    assert.equal(request.redirect,'error');
    const p=JSON.parse(request.body);
    assert.equal(p.model,'claude-opus-5-5');
    assert.equal(p.messages[0].content.includes('ten-a'),false);
    assert.equal(p.messages[0].content.includes(ID),false);
    assert.equal(p.messages[0].content.includes('secret'),false);
    return new Response(JSON.stringify({content:[{type:'text',text:'المعادلة متوازنة حسابياً، وتحتاج أدلة تدقيق.'}],
      usage:{input_tokens:120,output_tokens:40}}),{status:200});
  };
  return {env,fetchImpl,calls:()=>calls,rate:()=>rate,auth:{
    subject:'owner@example.test',tenantId:'ten-a',workspaceTenantId:'ten-a',workspaceRole:options.role||'owner'
  }};
}

test('rejects raw customer data, unexpected objects and no-consent prompts',()=>{
  assert.equal(validateClaudeReviewInput({task:'audit',question:'راجع هذه المبالغ',
    metrics:{assets:10},consent:false}).error,'external_ai_consent_required');
  assert.equal(validateClaudeReviewInput({task:'audit',question:'راجع هذه المبالغ',
    metrics:{customerPhone:1122334455},consent:true}).error,'invalid_or_sensitive_metric');
  assert.equal(validateClaudeReviewInput({task:'audit',question:'راسل me@person.com بالتقرير',
    metrics:{},consent:true}).error,'invalid_or_sensitive_question');
  assert.equal(validateClaudeReviewInput({task:'audit',question:'راجع هذه المبالغ',
    metrics:{assets:Infinity},consent:true}).error,'invalid_or_sensitive_metric');
  assert.equal(validateClaudeReviewInput({task:'audit',question:'راجع هذه المبالغ',
    metrics:{},consent:true,rawLedger:[]}).error,'unexpected_or_sensitive_field');
});

test('signed Cloudflare Access is mandatory; spoofed identity header does not enable AI',async()=>{
  const req=new Request('https://example.invalid/api/capabilities-v2/workspaces/'+ID+'/ai/review',{
    method:'POST',headers:{'oai-authenticated-user-email':'attacker@example.test'},
    body:'{}'
  });
  const res=await mod.default.fetch(req,{});
  assert.equal(res.status,401);
  assert.equal((await res.json()).error,'authentication_required');
});

test('AI calls deny viewer roles before reaching provider',async()=>{
  const f=fixtures({role:'viewer'});
  const res=await claudeWorkspaceReview(body(),f.env,f.auth,ID,{fetchImpl:f.fetchImpl});
  assert.equal(res.status,403);assert.equal(f.calls(),0);
});

test('never invokes Claude without server-side secret or rate-limiter binding',async()=>{
  const f=fixtures();
  delete f.env.AI_LIMITER;
  let res=await claudeWorkspaceReview(body(),f.env,f.auth,ID,{fetchImpl:f.fetchImpl});
  assert.equal(res.status,503);
  f.env.AI_LIMITER={async limit(){return {success:true}}};
  delete f.env.ANTHROPIC_API_KEY;
  res=await claudeWorkspaceReview(body(),f.env,f.auth,ID,{fetchImpl:f.fetchImpl});
  assert.equal(res.status,503);assert.equal(f.calls(),0);
});

test('sensitive workspaces never transmit even aggregate data to external AI',async()=>{
  const f=fixtures({sensitive:true});
  const res=await claudeWorkspaceReview(body(),f.env,f.auth,ID,{fetchImpl:f.fetchImpl});
  assert.equal(res.status,403);assert.equal(f.calls(),0);assert.equal(f.rate(),0);
});

test('rate limiting prevents provider requests and does not expose credentials',async()=>{
  const f=fixtures({ratePass:false});
  const res=await claudeWorkspaceReview(body(),f.env,f.auth,ID,{fetchImpl:f.fetchImpl});
  assert.equal(res.status,429);assert.equal(f.calls(),0);
  assert.doesNotMatch(await res.text(),/test-only-secret/);
});

test('authorized company gets read-only Claude answer and token accounting',async()=>{
  const f=fixtures();
  const res=await claudeWorkspaceReview(body(),f.env,f.auth,ID,{fetchImpl:f.fetchImpl});
  assert.equal(res.status,200);
  const obj=await res.json();
  assert.equal(obj.provider,'anthropic');
  assert.equal(obj.model,'claude-opus-5-5');
  assert.equal(obj.verified,false);
  assert.equal(obj.autoPosting,false);
  assert.deepEqual(obj.usage,{input_tokens:120,output_tokens:40});
  assert.equal(f.calls(),1);
  assert.equal(f.rate(),1);
  assert.equal(res.headers.get('cache-control'),'no-store, max-age=0');
});
