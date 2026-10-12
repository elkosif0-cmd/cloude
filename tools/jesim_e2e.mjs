import { createRequire } from 'module';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const URL_=process.argv[2]||'http://localhost:8765/app-safe.html';
const watchdog=setTimeout(()=>{console.error('[jesim-e2e] HARD TIMEOUT');process.exit(2)},420000);
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
    /* the demo company and its books load after the app: read company A only once they are there */
    await p.waitForFunction(()=>SKosifLedger.accounts().length>3&&SKosifSpace.current().id!=='space-main',{timeout:30000});
    const A=await p.evaluate(()=>SKosifSpace.current()),B={id:'e2e-jesim-'+label,name:'E2E '+label},markA='A-'+label,markB='B-'+label;
    assert(A&&A.id,'missing initial helper company');
    /* governance through the screen: every missing account needs the accountant's explicit decision */
    console.log('[jesim-e2e]',label,'governance: seed patterns with accounts outside the chart');
    await p.waitForFunction(()=>SKosifLedger.accounts().length>3,{timeout:30000});
    const cash=await p.evaluate(()=>{const c=SKosifLedger.accounts().find(a=>a.active!==false&&/نقد|بنك|صندوق/.test(a.name));return c&&String(c.code)});
    const expense=await p.evaluate(()=>{const c=SKosifLedger.accounts().find(a=>a.active!==false&&a.type==='expense');return c&&String(c.code)});
    assert(cash&&expense,'demo chart lacks a cash or an expense account');
    await p.evaluate(({cash})=>{const E=SKEngines.finance.entryLearner,m=E.emptyMemory();m.companyId=SKosifEntrySim.companyId();m.accountMap={};
      E.learn(m,[{ref:'g1',date:'2026-01-02',account:'6395',name:'اشتراكات البرامج',debit:500,memo:'اشتراك برنامج سحابي'},{ref:'g1',account:cash,name:'نقدية',credit:500},
        {ref:'g2',date:'2026-01-03',account:'6397',name:'تصميم خارجي',debit:300,memo:'رسوم تصميم خارجي للهوية'},{ref:'g2',account:cash,name:'نقدية',credit:300}],'e2e');
      localStorage.setItem(SKosifEntrySim.memoryKey(),JSON.stringify(m))},{cash});
    const counts=()=>p.evaluate(()=>({e:SKosifLedger.entries().length,a:SKosifLedger.accounts().length}));
    const diag=()=>p.evaluate(()=>{const r=document.querySelector('.js-res');return JSON.stringify({view:SKosifCore.view(),tab:(document.querySelector('[data-js-tab][aria-selected="true"]')||{}).textContent,text:(document.querySelector('[data-jd="text"]')||{}).value,res:r?r.innerText.replace(/\s+/g,' ').slice(0,200):null,post:document.querySelectorAll('[data-js="post"]').length})});
    const suggestAndPost=async(text,amount)=>{
      await p.evaluate(()=>SKosifCore.go('jesim'));await p.waitForSelector('[data-js-tab="suggest"]',{timeout:15000});
      await p.click('[data-js-tab="suggest"]');await p.waitForSelector('[data-jd="text"]',{timeout:15000});
      await p.fill('[data-jd="text"]',text);await p.fill('[data-jd="amount"]',String(amount));
      // On phones the bottom nav is fixed. Bring the actual button into
      // the unobstructed middle of the screen; do not force-click or bypass UI.
      await p.locator('[data-js="run"]').evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));
      await p.waitForFunction(()=>{const el=document.querySelector('[data-js="run"]'),nav=document.querySelector('#skb');
        if(!el||!nav)return false;
        const r=el.getBoundingClientRect(),n=nav.getBoundingClientRect();
        return r.top>=0&&r.bottom<=innerHeight&&(getComputedStyle(nav).display==='none'||r.bottom<n.top-8);
      },null,{timeout:5000});
      await p.click('[data-js="run"]');
      try{await p.waitForSelector('.js-res [data-js="post"]',{state:'visible',timeout:15000})}
      catch(e){console.log('[jesim-e2e]',label,'no post button after suggesting — state',await diag());throw e}
      await p.click('.js-res [data-js="post"]');
      try{await p.waitForSelector('form.skd',{state:'attached',timeout:15000})}
      catch(e){console.log('[jesim-e2e]',label,'no decision dialog after posting — state',await diag());throw e}
      await p.waitForTimeout(300)};
    const submit=async()=>{await p.click('form.skd button[type="submit"]');await p.waitForTimeout(400)};
    let c0=await counts();
    await suggestAndPost('اشتراك برنامج سحابي للمكتب',500);
    const dlg=await p.evaluate(()=>{const f=document.querySelector('form.skd'),ch=f.elements.choice,ty=f.elements.type,opts=[...ch.options].map(o=>o.value);
      return{choice:ch.value,type:ty?ty.value:null,first:opts[1],last:opts[opts.length-1],typeOpts:ty?[...ty.options].map(o=>o.value):[]}});
    console.log('[jesim-e2e]',label,'dialog',JSON.stringify(dlg));
    assert(dlg.choice===''&&dlg.type==='','resolution or type preselected: '+JSON.stringify(dlg));
    assert(dlg.last==='__new__'&&dlg.first&&dlg.first!=='__new__','existing accounts must come first and «new» last');
    assert(dlg.typeOpts.join()===',asset,liability,equity,revenue,expense,other','type list is not the supported enum');
    await submit();let c1=await counts();
    assert(await p.locator('form.skd').count()===1&&c1.e===c0.e&&c1.a===c0.a,'an unselected resolution was accepted or mutated the books');
    await p.selectOption('form.skd select[name="choice"]','__new__');await submit();c1=await counts();
    assert(await p.locator('form.skd').count()===1&&c1.e===c0.e&&c1.a===c0.a,'«new account» without an explicit type was accepted');
    await p.selectOption('form.skd select[name="type"]','asset');await submit();await p.waitForTimeout(600);c1=await counts();
    const opened=await p.evaluate(()=>{const a=SKosifLedger.accounts().find(x=>String(x.code)==='6395');return a&&{type:a.type,name:a.name}});
    assert(c1.e===c0.e+1&&c1.a===c0.a+1&&opened&&opened.type==='asset','explicit open with the chosen type failed: '+JSON.stringify({c0,c1,opened}));
    console.log('[jesim-e2e]',label,'explicit open OK (6395 as asset — the chosen type, not the code digit)');
    c0=await counts();
    await suggestAndPost('رسوم تصميم خارجي للهوية',300);
    await p.keyboard.press('Escape');await p.waitForTimeout(300);c1=await counts();
    assert(c1.e===c0.e&&c1.a===c0.a,'cancelling the decision mutated the books');
    await p.click('.js-res [data-js="post"]');await p.waitForSelector('form.skd',{state:'attached',timeout:15000});await p.waitForTimeout(300);
    await p.selectOption('form.skd select[name="choice"]',expense);await submit();await p.waitForTimeout(600);c1=await counts();
    const mapped=await p.evaluate(({expense})=>{const e=SKosifLedger.entries().at(-1),a=SKosifLedger.accounts().find(x=>String(x.code)===expense);
      return{uses:e.lines.some(l=>l.accountId===a.id),notOpened:!SKosifLedger.accounts().some(x=>String(x.code)==='6397')}},{expense});
    assert(c1.e===c0.e+1&&c1.a===c0.a&&mapped.uses&&mapped.notOpened,'mapping to an existing account failed: '+JSON.stringify({c0,c1,mapped}));
    console.log('[jesim-e2e]',label,'mapping to existing account OK; governance PASS');
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
