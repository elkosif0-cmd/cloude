import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');

const URL_=(process.argv[2]||'http://localhost:8765/app-safe.html').replace(/[?#].*$/,'');
const browser=await chromium.launch(process.env.SQC_INSECURE?{args:['--ignore-certificate-errors']}: {});
const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const p=await ctx.newPage();
const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(URL_+'#helperdesk',{waitUntil:'load'});
await p.waitForFunction(()=>window.SKosifSpace&&typeof SKosifSpace.createUser==='function'&&typeof SKosifSpace.switchUser==='function',{timeout:30000});

const result=await p.evaluate(async()=>{
  const api=SKosifSpace, main=api.user();
  localStorage.setItem('sqc_jesim_v1',JSON.stringify({mark:'MAIN'}));
  const u=await api.createUser('E2E Accountant','1234');
  const wrong=await api.switchUser(u.id,'0000',{reload:false});
  const wrongStayed=api.user().id===main.id&&JSON.parse(localStorage.getItem('sqc_jesim_v1')||'{}').mark==='MAIN';
  const opened=await api.switchUser(u.id,'1234',{reload:false});
  const fresh=api.user().id===u.id&&!localStorage.getItem('sqc_jesim_v1');
  localStorage.setItem('sqc_jesim_v1',JSON.stringify({mark:'SECOND'}));
  const back=await api.switchUser(main.id,'',{reload:false});
  const mainRestored=api.user().id===main.id&&JSON.parse(localStorage.getItem('sqc_jesim_v1')||'{}').mark==='MAIN';
  const again=await api.switchUser(u.id,'1234',{reload:false});
  const secondRestored=api.user().id===u.id&&JSON.parse(localStorage.getItem('sqc_jesim_v1')||'{}').mark==='SECOND';
  const raw=localStorage.getItem('sqc_helper_users_v1')||'';
  const reg=JSON.parse(raw||'{}'), saved=reg.users&&reg.users[u.id];
  return {
    wrong,wrongStayed,opened,fresh,back,mainRestored,again,secondRestored,
    passwordNotStored:!raw.includes('1234')&&!!saved?.pinHash&&!!saved?.pinSalt,
    current:api.user().name,
    users:api.users().length
  };
});
const checks={
  'wrong PIN is rejected without changing data': result.wrong===false&&result.wrongStayed,
  'correct PIN opens a fresh isolated workspace': result.opened&&result.fresh,
  'main accountant data is restored': result.back&&result.mainRestored,
  'second accountant data is restored': result.again&&result.secondRestored,
  'PIN is hashed/salted and plaintext is absent': result.passwordNotStored,
  'multiple accountant workspaces exist': result.users>=2
};
let fail=0;for(const [name,ok] of Object.entries(checks)){console.log((ok?'✓':'✗'),name);if(!ok)fail++}
if(errors.length){console.error('page errors',errors.slice(0,5));fail++}
await browser.close();
if(fail){console.error('helper user spaces E2E failed',JSON.stringify(result));process.exit(1)}
console.log('helper user spaces E2E: OK',JSON.stringify(result));
