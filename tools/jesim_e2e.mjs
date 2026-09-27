import { createRequire } from 'module';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const URL_=process.argv[2]||'http://localhost:8765/app-safe.html';
const watchdog=setTimeout(()=>{console.error('[jesim-e2e] HARD TIMEOUT');process.exit(2)},300000);
const assert=(v,m)=>{if(!v)throw new Error(m)};
const specs=[
  ['laptop',{viewport:{width:1440,height:900}}],
  ['phone',{viewport:{width:390,height:844},isMobile:true}]
];
const b=await chromium.launch();
try{
  for(const [label,opts] of specs){
    console.log('[jesim-e2e]',label,'open');
    const ctx=await b.newContext(opts);await ctx.addInitScript(()=>{try{sessionStorage.setItem('sqc_space_chosen','1')}catch{}});
    const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(URL_,{waitUntil:'load',timeout:30000});await p.waitForFunction(()=>window.SKosifEntrySim&&window.SKosifSpace&&window.SKosifLedger,{timeout:30000});
    const A=await p.evaluate(()=>SKosifSpace.current()),B={id:'e2e-jesim-'+label,name:'E2E '+label},markA='A-'+label,markB='B-'+label;
    assert(A&&A.id,'missing initial helper company');
    console.log('[jesim-e2e]',label,'seed A',A.id);
    await p.evaluate(({mark})=>{localStorage.removeItem(SKosifEntrySim.memoryKey());localStorage.removeItem('sqc_jesim_v1');
      const m=SKEngines.finance.entryLearner.emptyMemory();m.companyId=SKosifEntrySim.companyId();m.accountMap={'LEGACY-X':'1100'};m.log=[{at:new Date().toISOString(),what:mark}];
      localStorage.setItem(SKosifEntrySim.memoryKey(),JSON.stringify(m))},{mark:markA});
    const switchTo=async(target,fresh)=>{
      console.log('[jesim-e2e]',label,'switch',target.id,'fresh='+fresh);
      const nav=p.waitForNavigation({waitUntil:'load',timeout:30000});
      const ok=await p.evaluate(({target,fresh})=>SKosifSpace.switchTo(target.id,target.name,{fresh}),{target,fresh});assert(ok,'switch rejected: '+target.id);
      await nav;await p.waitForFunction(()=>window.SKosifEntrySim&&window.SKosifSpace,{timeout:30000});await p.waitForTimeout(700);
    };
    await switchTo(B,true);
    const cleanB=await p.evaluate(({id,markA})=>{const m=SKosifEntrySim.memory();return SKosifEntrySim.companyId()===id&&m.companyId===id&&!m.log.some(x=>x.what===markA)&&SKosifEntrySim.memoryKey().includes(id.replace(/[^A-Za-z0-9_.-]/g,'_'))},{id:B.id,markA});
    assert(cleanB,'Company B can see Company A simulator memory');
    await p.evaluate(({mark})=>{const m=SKosifEntrySim.memory();m.log=[{at:new Date().toISOString(),what:mark}];localStorage.setItem(SKosifEntrySim.memoryKey(),JSON.stringify(m))},{mark:markB});
    await switchTo(A,false);
    const backA=await p.evaluate(({id,a,b})=>{const m=SKosifEntrySim.memory();return SKosifEntrySim.companyId()===id&&m.companyId===id&&m.log.some(x=>x.what===a)&&!m.log.some(x=>x.what===b)&&m.accountMap&&m.accountMap['LEGACY-X']==='1100'},{id:A.id,a:markA,b:markB});
    assert(backA,'Company A memory was not restored exactly');
    await switchTo(B,false);
    const backB=await p.evaluate(({id,a,b})=>{const m=SKosifEntrySim.memory();return SKosifEntrySim.companyId()===id&&m.companyId===id&&m.log.some(x=>x.what===b)&&!m.log.some(x=>x.what===a)},{id:B.id,a:markA,b:markB});
    assert(backB,'Company B memory was not restored exactly');
    assert(!errs.length,'page errors: '+errs.join(' | '));console.log('[jesim-e2e]',label,'PASS');
    await ctx.close();
  }
  console.log('[jesim-e2e] 2/2 device isolation runs PASS');
}finally{clearTimeout(watchdog);await b.close()}
