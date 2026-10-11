import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src=fs.readFileSync(new URL('./worker.js',import.meta.url),'utf8');

test('PR95 security slice keeps optional owner allow-list without hard-coded identities',()=>{
  assert.match(src,/function ownerSubs\(env\)/);
  assert.match(src,/KOSIF_OWNER_SUBS/);
  assert.match(src,/function ownerAllowed\(env,sub\)/);
  assert.match(src,/if\(authContext&&!ownerAllowed\(env,authContext\.sub\)\) authContext=null/);
  assert.match(src,/ownerAllowlistConfigured:ownerSubs\(env\)\.length>0/);
  assert.match(src,/ownerAllowlistCount:ownerSubs\(env\)\.length/);
});

test('Full Pro bridge start paths cannot ride through public kosif_think unauthenticated',()=>{
  assert.match(src,/const FULL_PRO_BRIDGE_PREFIXES=Object\.freeze\(\[/);
  assert.match(src,/function bridgeNeedsAuth\(rawContext\)/);
  assert.match(src,/action==="start"\|\|action==="canary_start"/);
  assert.match(src,/if\(bridgeNeedsAuth\(rawContext\)&&!ctx\.authed\) throw new Error\(FULL_PRO_AUTH_REQUIRED\)/);
  assert.match(src,/await runThink\(env,args,ctx\)/);
});

test('state-changing Full Pro tools are not advertised as read-only',()=>{
  assert.match(src,/const WRITE_TOOL_HINTS=Object\.freeze\(\{/);
  for(const name of ['kosif_full_pro_execute','kosif_full_pro_start','kosif_full_pro_cancel','kosif_full_pro_secure_authorize','kosif_secure_image_execute','kosif_full_pro_bypass','kosif_secure_artifact_qa'])
    assert.ok(src.includes(name+':{'),name);
  assert.match(src,/if\(WRITE_TOOL_HINTS\[name\]\) return \{readOnlyHint:false/);
});
