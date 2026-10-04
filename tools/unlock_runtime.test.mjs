import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../unlock.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const tick = () => new Promise(resolve => setImmediate(resolve));

function harness() {
  const nodes = Object.fromEntries(['p','eye','f','go','msg','progress'].map(id => [id, {
    value: '', type: id === 'p' ? 'password' : '', disabled: false, textContent: '', attrs: {},
    setAttribute(k,v) { this.attrs[k] = v; },
    addEventListener(k,v) { this[k] = v; },
    select() { this.selected = true; }
  }]));
  const calls = []; let importedPassword, releaseMeta, releaseBits, opens = 0;
  const metaReady = new Promise(resolve => releaseMeta = resolve);
  const bitsReady = new Promise(resolve => releaseBits = resolve);
  const meta = {parts:['cipher.part'],salt_b64:'AA==',nonce_b64:'AAAAAAAAAAAAAAAA',tag_b64:'AA==',iterations:1000};
  const context = vm.createContext({TextEncoder,TextDecoder,Uint8Array,Uint32Array,Promise,atob,
    console:{error(){}}, document:{getElementById:id=>nodes[id],open(){ opens++; }},
    crypto:{subtle:{
      async importKey(kind,key,alg) { if(alg==='PBKDF2') importedPassword=new TextDecoder().decode(key); return {}; },
      deriveBits(){ calls.push('derive'); return bitsReady; },
      async verify(){ calls.push('verify'); return false; }
    }},
    async fetch(url){
      calls.push(url);
      if(url==='./secure/crypto.json'){ await metaReady; return {ok:true,json:async()=>meta}; }
      if(url==='./cipher.part') return {ok:true,text:async()=> 'AA=='};
      throw new Error('Unexpected resource '+url);
    }
  });
  vm.runInContext(script,context);
  return {nodes,calls,releaseMeta,releaseBits,get importedPassword(){return importedPassword;},get opens(){return opens;}};
}

test('password visibility has an accurate accessible action and state',()=>{
  const h=harness(); h.nodes.eye.onclick();
  assert.equal(h.nodes.p.type,'text');
  assert.equal(h.nodes.eye.attrs['aria-label'],'إخفاء كلمة المرور');
  assert.equal(h.nodes.eye.attrs['aria-pressed'],'true');
  h.nodes.eye.onclick();
  assert.equal(h.nodes.p.type,'password');
  assert.equal(h.nodes.eye.attrs['aria-label'],'إظهار كلمة المرور');
  assert.equal(h.nodes.eye.attrs['aria-pressed'],'false');
});

test('cipher download overlaps derivation; captured password is used and failed HMAC never opens app',async()=>{
  const h=harness(); h.nodes.p.value='submitted-password';
  const pending=h.nodes.f.submit({preventDefault(){}});
  assert.equal(h.nodes.go.disabled,true);
  assert.equal(h.nodes.f.attrs['aria-busy'],'true');
  h.nodes.p.value='changed-while-loading';
  h.releaseMeta(); await tick();
  assert.equal(h.importedPassword,'submitted-password');
  assert.ok(h.calls.includes('./cipher.part'),'download must start while deriveBits is unresolved');
  h.releaseBits(new ArrayBuffer(64)); await pending;
  assert.ok(h.calls.includes('verify'));
  assert.equal(h.opens,0);
  assert.ok(!h.calls.includes('./app-safe.html'));
  assert.equal(h.nodes.go.disabled,false);
  assert.equal(h.nodes.f.attrs['aria-busy'],'false');
  assert.equal(h.nodes.p.selected,true);
});

test('entry exposes explicit label, announcements, and unchanged crypto contract',()=>{
  assert.match(html,/<label[^>]+for="p"[^>]*>كلمة المرور الآمنة<\/label>/);
  assert.match(html,/<div[^>]+id="msg"[^>]+role="alert"/);
  assert.match(html,/<div[^>]+id="progress"[^>]+role="status"/);
  assert.match(html,/aria-controls="p"/);
  assert.match(script,/iterations:meta\.iterations/);
  assert.match(script,/verify\("HMAC"/);
});
