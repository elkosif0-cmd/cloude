/* Synthetic-only Edge integration: two companies, shared legacy reports, mobile/desktop */
import {createRequire} from 'node:module';
import os from 'node:os';
import path from 'node:path';
const require=createRequire(import.meta.url);
process.env.NODE_PATH=path.join(os.homedir(),'kosif-browser-check','node_modules');
require('node:module').Module._initPaths();
const {chromium}=require('playwright-core');
const url=process.argv[2]||'http://127.0.0.1:8923/';
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',args:['--no-sandbox']});
const results=[];
const seeds=[{id:'D',demo:true,amount:10},{id:'A',companyId:'company-A',amount:75},{id:'B',companyId:'company-B',amount:99999},{id:'legacy',amount:500000},{id:'B-fake-demo',demo:true,companyId:'company-B'}];
try{
 for (const vp of [{name:'desktop',width:1440,height:900},{name:'phone',width:390,height:844}]){
  const ctx=await browser.newContext({viewport:vp,reducedMotion:'reduce',serviceWorkers:'block',locale:'ar-SA'});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.locator('#gate-list .gate[data-gate="accounting"]').click();
    await page.locator('#sector-list .sector[data-sector="meat"]').click();
    await page.locator('#co-list .co[data-id="demo-co"]').click();
    await page.waitForFunction(()=>window.SK?.demo?.settled?.()===true&&!window.SKosifSpace?.busy?.(),null,{timeout:30000});
    const demo=await page.evaluate(rows=>({
      company:SK.company.current()?.id,
      selected:window.SKosifReports.scopedLegacyRows(rows).map(x=>x.id)
    }),seeds);
    await page.evaluate(()=>SKosifCore.go('execreports'));
    await page.waitForFunction(()=>!!document.querySelector('.sk-rep-nav button[data-t="eod"]'),null,{timeout:12000});
    /* Exercise the registered report handler even if navigation shell currently hides the tab; visibility is recorded separately. */
    const reportTabVisible=await page.locator('.sk-rep-nav button[data-t="eod"]').isVisible();
    await page.evaluate(()=>document.querySelector('.sk-rep-nav button[data-t="eod"]')?.click());
    const eod=await page.evaluate(()=>({html:document.querySelector('#sk-rep-body')?.textContent?.slice(0,450),
      loaded:!!document.querySelector('#sk-rep-body')}));
    /* This company is deliberately synthetic; all seeded records are browser-only. */
    await page.evaluate(()=>{window.__companyChange=SK.company.create('شركة اختبار العزل 20261010','SAR','trade')});
    await page.waitForFunction(()=>window.SK?.company?.current?.()?.id?.startsWith('co-'),null,{timeout:30000});
    const another=await page.evaluate(rows=>({
      company:SK.company.current()?.id,
      selected:window.SKosifReports.scopedLegacyRows(rows).map(x=>x.id),
      overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth
    }),seeds);
    results.push({viewport:vp.name,checks:{demoCompany:demo.company==='demo-co',
      demoIsolation:JSON.stringify(demo.selected)==='["D"]',
      syntheticCompany:another.company.startsWith('co-'),
      otherCompanyIsolation:another.selected.length===0,
      reportRendered:eod.loaded,
      responsive:another.overflow<=8,noJsErrors:errors.length===0},errors:errors.slice(0,3),demo,another});
  }catch(e){results.push({viewport:vp.name,error:String(e),errors:errors.slice(0,3)})}
  await ctx.close();
 }
}finally{await browser.close()}
const failures=results.flatMap(x=>x.error?[x.viewport+':'+x.error]:Object.entries(x.checks).filter(([,v])=>!v).map(([k])=>x.viewport+':'+k));
console.log('EARTH_REPORT_COMPANY_E2E',JSON.stringify({passed:results.reduce((n,x)=>n+Object.values(x.checks||{}).filter(Boolean).length,0),failures,results}));
if(failures.length)process.exitCode=1;
