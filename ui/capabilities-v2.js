/* S.kosif — Capabilities v2 client.
   Ports the governance/runtime ideas from kosif-stable-capabilities-v2 into a native advanced screen.
   Works locally now and switches to the dedicated D1 Worker when its API URL is configured. */
(()=>{
"use strict";
const SK=window.SK, Core=window.SKosifCore;
if(!SK||!Core)return;
const {$,$$,esc,num,load,save,toast}=SK;

const CFG_KEY="skosif_cap_v2_config";
const LOCAL_KEY="skosif_cap_v2_local_workspace";
const ROLE_KEY="skosif_cap_v2_preview_role";
const MAX_BYTES=131072;
const PERMISSIONS={
  owner:["providers:read","session:read","workspace:create","workspace:list","workspace:read","workspace:write","workspace:archive","integrity:read"],
  partner:["providers:read","session:read","workspace:create","workspace:list","workspace:read","workspace:write","workspace:archive","integrity:read"],
  manager:["providers:read","session:read","workspace:create","workspace:list","workspace:read","workspace:write","integrity:read"],
  senior:["providers:read","session:read","workspace:list","workspace:read","workspace:write","integrity:read"],
  viewer:["providers:read","session:read","workspace:list","workspace:read","integrity:read"]
};
const ROLE_AR={owner:"مالك",partner:"شريك",manager:"مدير",senior:"مسؤول أول",viewer:"مشاهدة فقط"};
const ALLOWED=["version","company","period","ui","theme","layout","preferences","inventorySummary","financeSummary","reporting","approvals","notes","alerts","jev","sourceRefs"];
const FORBIDDEN=new Set(["customers","customerPhones","phones","emails","orders","rawTransactions","bankDetails","attachments","fileBytes","evidenceBytes","apiKey","apiKeys","secret","secrets","password","token","tokens","accessToken","refreshToken","cardNumbers","iban","ibans"]);

const enc=new TextEncoder();
const nf=new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:2});
const money=v=>nf.format(Number(v)||0)+" ر.س";
const now=()=>new Date().toISOString();
const cfg=()=>load(CFG_KEY,{apiBase:"",workspaceId:""});
const rolePreview=()=>load(ROLE_KEY,"owner");
const authorizeRole=(role,permission)=>Boolean(PERMISSIONS[role]?.includes(permission));

function canonicalize(value){
  if(Array.isArray(value))return value.map(canonicalize);
  if(value&&typeof value==="object"){
    const out={};Object.keys(value).sort().forEach(k=>{if(value[k]!==undefined)out[k]=canonicalize(value[k])});return out;
  }
  return typeof value==="string"?value.normalize("NFC"):value;
}
const canonicalJSON=v=>JSON.stringify(canonicalize(v));
async function sha256(value){
  const d=await crypto.subtle.digest("SHA-256",enc.encode(String(value)));
  return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
function findForbidden(value,path=[]){
  if(!value||typeof value!=="object")return null;
  if(Array.isArray(value)){for(let i=0;i<value.length;i++){const f=findForbidden(value[i],[...path,String(i)]);if(f)return f}return null}
  for(const [k,v] of Object.entries(value)){if(FORBIDDEN.has(k))return [...path,k].join(".");const f=findForbidden(v,[...path,k]);if(f)return f}
  return null;
}
function normalizeWorkspaceState(value){
  if(!value||typeof value!=="object"||Array.isArray(value))return {error:"invalid_workspace_state"};
  const forbidden=findForbidden(value);if(forbidden)return {error:"forbidden_workspace_key",key:forbidden};
  const retained={};ALLOWED.forEach(k=>{if(value[k]!==undefined)retained[k]=value[k]});
  const stateJson=canonicalJSON(retained),byteLength=enc.encode(stateJson).byteLength;
  if(byteLength>MAX_BYTES)return {error:"workspace_too_large",byteLength};
  return {state:JSON.parse(stateJson),stateJson,byteLength};
}
function localData(){
  const x=load(LOCAL_KEY,{revisions:[],audit:[]});
  if(!Array.isArray(x.revisions))x.revisions=[];
  if(!Array.isArray(x.audit))x.audit=[];
  return x;
}
function safeSummary(){
  const inv=load("skosif_erp_inventory_v1",{stock:{},reorder:{},moves:[],counts:[]});
  const fin=load("skosif_erp_finance_v1",{flows:[]});
  const statements=load("skosif_income_statements_v1",[]);
  const stock=inv&&typeof inv.stock==="object"?inv.stock:{}, reorder=inv&&typeof inv.reorder==="object"?inv.reorder:{};
  const ids=Object.keys(stock), low=ids.filter(id=>num(reorder[id])>0&&num(stock[id])<=num(reorder[id])).length;
  const month=new Date().toISOString().slice(0,7);
  const flows=Array.isArray(fin.flows)?fin.flows.filter(x=>String(x.date||"").startsWith(month)):[];
  const receipts=flows.filter(x=>x.type==="receipt").reduce((a,x)=>a+num(x.amount),0);
  const payments=flows.filter(x=>x.type==="payment").reduce((a,x)=>a+num(x.amount),0);
  const latest=Array.isArray(statements)&&statements.length?statements[0]:null;
  const theme=SK.theme?.current?.()||"";
  return {
    version:2,
    company:{name:(document.querySelector("#biz-name")?.textContent||"S.kosif").trim().slice(0,120)},
    period:{month},
    ui:{density:localStorage.getItem("aghnam-v21-density")||"cozy"},
    theme:{id:theme},
    layout:{device:matchMedia("(max-width:760px)").matches?"mobile":"desktop"},
    preferences:{locale:"ar-SA",currency:"SAR"},
    inventorySummary:{tracked:ids.length,reorderAlerts:low,movementCount:Array.isArray(inv.moves)?inv.moves.length:0,countSessions:Array.isArray(inv.counts)?inv.counts.length:0},
    financeSummary:{month,receipts,payments,net:receipts-payments,flowCount:flows.length},
    reporting:{savedIncomeStatements:Array.isArray(statements)?statements.length:0,lastMonth:latest?.month||null,lastNetProfit:latest?num(latest.net):null},
    approvals:{source:"human"},
    notes:[],
    alerts:[],
    jev:{enabled:Boolean(sessionStorage.getItem("aghnamJevSession")),policy:"summary-only"},
    sourceRefs:{inventory:"aggregate-only",finance:"aggregate-only",customers:"excluded",orders:"excluded"}
  };
}
async function saveLocalSnapshot(state){
  const n=normalizeWorkspaceState(state);if(n.error)return n;
  const d=localData(),revision=(d.revisions[0]?.revision||0)+1,stateHash=await sha256(n.stateJson),at=now(),prev=d.audit[0]?.entry_hash||"0".repeat(64);
  const payload={revision,state_hash:stateHash},entryHash=await sha256(prev+canonicalJSON({action:"workspace.saved",payload,at}));
  d.revisions.unshift({revision,state:n.state,state_hash:stateHash,saved_at:at});
  d.revisions=d.revisions.slice(0,50);
  d.audit.unshift({seq:(d.audit[0]?.seq||0)+1,action:"workspace.saved",payload,at,prev_hash:prev,entry_hash:entryHash});
  d.audit=d.audit.slice(0,300);
  save(LOCAL_KEY,d);
  return {workspace:d.revisions[0],byteLength:n.byteLength};
}
async function verifyLocal(){
  const d=localData(),rows=[...d.audit].reverse();let prev="0".repeat(64);
  for(const row of rows){
    const expected=await sha256(prev+canonicalJSON({action:row.action,payload:row.payload,at:row.at}));
    if(row.prev_hash!==prev||row.entry_hash!==expected)return {valid:false,broken_seq:row.seq,entries:rows.length};
    prev=row.entry_hash;
  }
  return {valid:true,entries:rows.length,head_hash:prev};
}
function apiUrl(path){
  const base=String(cfg().apiBase||"").trim().replace(/\/+$/,"");
  return base?base+path:path;
}
async function api(path,options={}){
  const c=cfg();if(!c.apiBase)throw new Error("backend_not_configured");
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try{
    const r=await fetch(apiUrl(path),{credentials:"include",cache:"no-store",...options,headers:{"content-type":"application/json",...(options.headers||{})},signal:controller.signal});
    const d=await r.json().catch(()=>({}));
    if(!r.ok){const e=new Error(d.error||("HTTP "+r.status));e.status=r.status;e.data=d;throw e}
    return d;
  } finally {clearTimeout(timer)}
}
async function remoteSession(){return api("/api/capabilities-v2/session")}
async function remoteProviders(){return api("/api/capabilities-v2/providers")}
async function listRemote(){return api("/api/capabilities-v2/workspaces")}
async function ensureRemoteWorkspace(){
  let c=cfg(),id=c.workspaceId;
  if(id)return id;
  const list=await listRemote(),first=(list.workspaces||[]).find(x=>!x.archived_at);
  if(first){c.workspaceId=first.id;save(CFG_KEY,c);return first.id}
  const name=(document.querySelector("#biz-name")?.textContent||"S.kosif").trim();
  const d=await api("/api/capabilities-v2/workspaces",{method:"POST",body:JSON.stringify({name,business_year:new Date().getFullYear(),currency:"SAR",schema_version:"skosif-v2",effective_at:now()})});
  c.workspaceId=d.workspace.id;save(CFG_KEY,c);return c.workspaceId;
}
async function pushRemote(){
  const id=await ensureRemoteWorkspace(),current=await api("/api/capabilities-v2/workspaces/"+encodeURIComponent(id)+"/state"),base=current.workspace?.revision||0;
  return api("/api/capabilities-v2/workspaces/"+encodeURIComponent(id)+"/state",{method:"PUT",body:JSON.stringify({base_revision:base,state:safeSummary()})});
}

let root=null,state={tab:"overview",busy:false,session:null,providers:null,remoteError:""};
function badge(ok,label){return '<span class="skv2-badge '+(ok?"ok":"muted")+'">'+esc(label)+'</span>'}
function overviewHTML(){
  const d=localData(),last=d.revisions[0],c=cfg(),s=safeSummary();
  return '<div class="skv2-kpis">'+
    '<div><span>وضع التشغيل</span><b>'+(c.apiBase?"سحابي + محلي":"محلي آمن")+'</b></div>'+
    '<div><span>آخر Revision</span><b>'+(last?.revision||0)+'</b></div>'+
    '<div><span>سجل النزاهة</span><b>'+d.audit.length+'</b></div>'+
    '<div><span>حجم Snapshot</span><b>'+nf.format(enc.encode(canonicalJSON(s)).byteLength/1024)+' KB</b></div></div>'+
    '<div class="skv2-grid">'+
      '<section class="skv2-panel"><h4>القدرات المنقولة</h4><div class="skv2-cap-list">'+[
        ["Cloudflare Access","تحقق JWT / RS256 / JWK"],
        ["RBAC","owner · partner · manager · senior · viewer"],
        ["Workspace revisions","حفظ بإصدارات وتعارض 409"],
        ["Integrity chain","SHA-256 وسجل append-only"],
        ["Provider registry","KOSIF + Jev + Gemini + OpenAI + Claude"],
        ["Tenant isolation","عزل كل مساحة ومستخدم"],
        ["Archive guard","الأرشيف يجعل المساحة للقراءة فقط"],
        ["Safe state","حظر الأسرار والبيانات الخام الحساسة"]
      ].map(x=>'<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>').join("")+'</div></section>'+
      '<section class="skv2-panel"><h4>Snapshot آمن من S.kosif</h4><div class="skv2-summary"><div><span>أصناف متابعة</span><b>'+s.inventorySummary.tracked+'</b></div><div><span>تنبيهات إعادة الطلب</span><b>'+s.inventorySummary.reorderAlerts+'</b></div><div><span>صافي التدفق '+esc(s.period.month)+'</span><b>'+money(s.financeSummary.net)+'</b></div><div><span>قوائم دخل محفوظة</span><b>'+s.reporting.savedIncomeStatements+'</b></div></div><p class="skv2-note">لا تُحفظ أسماء العملاء أو الجوالات أو الطلبات الخام أو الأسرار داخل Workspace snapshot.</p></section>'+
    '</div>'+
    '<div class="skv2-actions"><button class="btn primary" id="skv2-save-local">حفظ Snapshot محلي</button><button class="btn" id="skv2-push" '+(!c.apiBase?'disabled':'')+'>مزامنة إلى D1</button><button class="btn" id="skv2-verify">فحص النزاهة</button></div>'+
    (last?'<div class="skv2-last"><span>آخر حفظ محلي</span><b>Revision '+last.revision+'</b><code>'+esc(last.state_hash.slice(0,24))+'…</code><small>'+new Date(last.saved_at).toLocaleString("ar-SA-u-nu-latn")+'</small></div>':'');
}
function rolesHTML(){
  const r=state.session?.session?.role||rolePreview(),perms=state.session?.session?.capabilities||PERMISSIONS[r]||[];
  const names=["providers:read","session:read","workspace:create","workspace:list","workspace:read","workspace:write","workspace:archive","integrity:read"];
  return '<div class="skv2-role-head"><div><b>الدور الفعلي</b><span>'+(state.session?badge(true,ROLE_AR[r]||r):badge(false,"معاينة محلية: "+(ROLE_AR[r]||r)) )+'</span></div>'+
    (!state.session?'<label class="sk-field"><span>دور المعاينة</span><select id="skv2-role">'+Object.keys(PERMISSIONS).map(x=>'<option value="'+x+'"'+(r===x?" selected":"")+'>'+ROLE_AR[x]+'</option>').join("")+'</select></label>':'')+'</div>'+
    '<div class="skv2-matrix"><table><thead><tr><th>الصلاحية</th>'+Object.keys(PERMISSIONS).map(x=>'<th>'+ROLE_AR[x]+'</th>').join("")+'</tr></thead><tbody>'+names.map(p=>'<tr><td><code>'+p+'</code></td>'+Object.keys(PERMISSIONS).map(x=>'<td class="'+(authorizeRole(x,p)?"yes":"no")+'">'+(authorizeRole(x,p)?"✓":"—")+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>'+
    '<div class="skv2-current"><b>الصلاحيات الحالية:</b> '+perms.map(p=>'<code>'+esc(p)+'</code>').join(" ")+'</div>';
}
function providersHTML(){
  const remote=state.providers?.providers||[];
  const local=[
    {id:"kosif-local",name:"KOSIF المحلي",status:"ready",dataPolicy:"local-only"},
    {id:"jev",name:"Jev",status:sessionStorage.getItem("aghnamJevSession")?"ready":"session-required",dataPolicy:"summary-only"}
  ];
  const rows=(remote.length?remote:local);
  return '<div class="skv2-providers">'+rows.map(p=>'<div><span class="skv2-provider-dot '+(p.status==="ready"||p.status==="configured"?"ok":"")+'"></span><div><b>'+esc(p.name||p.id)+'</b><small>'+esc(p.id)+' · '+esc(p.dataPolicy||"summary-only")+'</small></div>'+badge(p.status==="ready"||p.status==="configured",p.status||"unknown")+'</div>').join("")+'</div>'+
    '<p class="skv2-note">مفاتيح OpenAI/Gemini/Claude لا تُخزن ولا تُدخل في المتصفح. سجل المزودات يعرض حالة الإعداد فقط.</p>';
}
function integrityHTML(){
  const d=localData();
  return '<div class="skv2-actions"><button class="btn primary" id="skv2-integrity-run">فحص السلسلة المحلية</button><button class="btn" id="skv2-audit-csv" '+(!d.audit.length?'disabled':'')+'>تصدير السجل CSV</button></div>'+
    '<div id="skv2-integrity-result"></div>'+
    (d.audit.length?'<div class="skv2-log">'+d.audit.slice(0,40).map(x=>'<div><b>#'+x.seq+' · '+esc(x.action)+'</b><span>'+new Date(x.at).toLocaleString("ar-SA-u-nu-latn")+'</span><code>'+esc(x.entry_hash.slice(0,30))+'…</code></div>').join("")+'</div>':'<div class="sk-empty">لا توجد أحداث بعد.</div>');
}
function connectHTML(){
  const c=cfg();
  return '<div class="skv2-grid"><section class="skv2-panel"><h4>ربط Capabilities v2 Worker</h4>'+
    '<label class="sk-field"><span>عنوان API</span><input id="skv2-api-base" type="url" placeholder="https://s-kosif-capabilities-v2....workers.dev" value="'+esc(c.apiBase||"")+'"></label>'+
    '<div class="skv2-actions"><button class="btn primary" id="skv2-api-save">حفظ واختبار</button><button class="btn" id="skv2-api-clear">استخدام محلي فقط</button></div>'+
    '<p class="skv2-note">الاتصال السحابي يحتاج Worker مربوطًا بـ D1 وبـ Cloudflare Access. التطبيق لا يخفّض الحماية لتمكين المزامنة.</p></section>'+
    '<section class="skv2-panel"><h4>حالة الاتصال</h4><div id="skv2-conn-status">'+(state.session?'<div class="skv2-okbox"><b>متصل</b><span>'+esc(state.session.session?.subject||"")+' · '+esc(ROLE_AR[state.session.session?.role]||state.session.session?.role||"")+'</span></div>':state.remoteError?'<div class="skv2-badbox"><b>غير متصل</b><span>'+esc(state.remoteError)+'</span></div>':'<div class="sk-empty">لم يتم اختبار الاتصال بعد.</div>')+'</div></section></div>';
}
function bodyHTML(){
  if(state.tab==="roles")return rolesHTML();
  if(state.tab==="providers")return providersHTML();
  if(state.tab==="integrity")return integrityHTML();
  if(state.tab==="connect")return connectHTML();
  return overviewHTML();
}
function paint(){
  if(!root||!root.isConnected)return;
  root.innerHTML='<section class="card skv2-card"><div class="card-h"><div><h3>مركز القدرات v2</h3><p>الصلاحيات، المزامنة، النزاهة، وإدارة Workspace — منقولة إلى بنية S.kosif بدون أزرار عائمة.</p></div>'+badge(Boolean(cfg().apiBase),cfg().apiBase?"D1 جاهز للاتصال":"Local fallback")+'</div>'+
    '<div class="card-b"><nav class="skv2-tabs">'+[
      ["overview","نظرة عامة"],["roles","الأدوار والصلاحيات"],["providers","مزودات الذكاء"],["integrity","النزاهة"],["connect","الربط السحابي"]
    ].map(([k,l])=>'<button type="button" data-skv2-tab="'+k+'" class="'+(state.tab===k?"active":"")+'">'+l+'</button>').join("")+'</nav><div class="skv2-body">'+bodyHTML()+'</div></div></section>';
  bind();
}
async function testRemote(){
  state.remoteError="";state.session=null;state.providers=null;paint();
  try{
    const [s,p]=await Promise.all([remoteSession(),remoteProviders()]);
    state.session=s;state.providers=p;toast("تم الاتصال بـ Capabilities v2","ok");
  }catch(e){state.remoteError=e.message==="backend_not_configured"?"لم يتم ضبط عنوان Worker":e.message;toast("تعذر الاتصال: "+state.remoteError,"err")}
  paint();
}
function bind(){
  $$("[data-skv2-tab]",root).forEach(b=>b.onclick=()=>{state.tab=b.dataset.skv2Tab;paint()});
  const sl=$("#skv2-save-local",root);if(sl)sl.onclick=async()=>{const r=await saveLocalSnapshot(safeSummary());if(r.error)return toast(r.error,"err");toast("تم حفظ Revision "+r.workspace.revision,"ok");paint()};
  const pv=$("#skv2-push",root);if(pv)pv.onclick=async()=>{pv.disabled=true;try{const r=await pushRemote();toast("تمت المزامنة إلى D1 — Revision "+r.workspace.revision,"ok");await testRemote()}catch(e){toast(e.status===409?"تعارض Revision — أعد المحاولة بعد تحديث الحالة":"فشل المزامنة: "+e.message,"err");pv.disabled=false}};
  const vf=$("#skv2-verify",root);if(vf)vf.onclick=async()=>{const r=await verifyLocal();toast(r.valid?"سلسلة النزاهة سليمة ("+r.entries+")":"اكتُشف كسر عند #"+r.broken_seq,r.valid?"ok":"err")};
  const rr=$("#skv2-role",root);if(rr)rr.onchange=()=>{save(ROLE_KEY,rr.value);toast("تم تغيير دور المعاينة","info");paint()};
  const ir=$("#skv2-integrity-run",root);if(ir)ir.onclick=async()=>{const r=await verifyLocal(),box=$("#skv2-integrity-result",root);box.innerHTML='<div class="'+(r.valid?"skv2-okbox":"skv2-badbox")+'"><b>'+(r.valid?"السلسلة سليمة":"السلسلة غير سليمة")+'</b><span>'+(r.valid?("عدد الأحداث "+r.entries+" · head "+esc((r.head_hash||"").slice(0,24))+"…"):("الكسر عند #"+r.broken_seq))+'</span></div>'};
  const ac=$("#skv2-audit-csv",root);if(ac)ac.onclick=()=>SK.csv.download("S.kosif-capabilities-v2-audit",["seq","action","at","prev_hash","entry_hash"],localData().audit.map(x=>[x.seq,x.action,x.at,x.prev_hash,x.entry_hash]));
  const as=$("#skv2-api-save",root);if(as)as.onclick=()=>{let v=$("#skv2-api-base",root).value.trim().replace(/\/+$/,"");if(v&&!/^https:\/\//i.test(v))return toast("عنوان Worker يجب أن يبدأ بـ https://","err");const c=cfg();c.apiBase=v;c.workspaceId="";save(CFG_KEY,c);testRemote()};
  const clr=$("#skv2-api-clear",root);if(clr)clr.onclick=()=>{save(CFG_KEY,{apiBase:"",workspaceId:""});state.session=null;state.providers=null;state.remoteError="";toast("تم التحويل إلى الوضع المحلي","info");paint()};
}
function settingsHook(node){
  if(node.querySelector("#skv2-settings-shortcut"))return;
  node.insertAdjacentHTML("beforeend",'<section class="card" id="skv2-settings-shortcut"><div class="card-h"><div><h3>Capabilities v2</h3><p>إدارة الصلاحيات والمزامنة المركزية وسجل النزاهة.</p></div><button type="button" class="btn sm" id="skv2-settings-open">فتح مركز القدرات</button></div></section>');
  $("#skv2-settings-open",node).onclick=()=>Core.go("capabilitiesv2");
}
SK.view("capabilitiesv2",{title:"مركز القدرات v2",sub:"RBAC، Workspace revisions، D1، Cloudflare Access، النزاهة ومزودات الذكاء",emoji:"🛡️",adv:true,render(node){root=node;paint();if(cfg().apiBase)testRemote()}});
Core.onView("settings",settingsHook);
window.SKosifCapabilitiesV2=Object.freeze({
  permissions:PERMISSIONS,
  authorizeRole,
  normalizeWorkspaceState,
  safeSummary,
  saveLocalSnapshot,
  verifyLocal,
  config:()=>({...cfg()})
});
})();