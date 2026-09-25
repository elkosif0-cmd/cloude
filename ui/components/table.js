/* S.kosif component — premium data tables (window.SKosifTable).
   Upgrades every data table of every screen (core .t tables and feature .sk-table tables) the
   way the KOSIF «ميزان المراجعة» mockup shows, without changing the screens themselves:
     toolbar  : search · «عرض الأعمدة» · تصدير CSV · «n صف»
     headers  : click to sort (numbers, money, percentages, dates, Arabic text)
     footer   : rows per page · «عرض 1–25 من أصل 312» · pages
     cells    : change/variance columns get ▲ green / ▼ red
   Only plain grids are touched (≥ 8 rows, one cell per header, no row spans); a table opts out
   with data-sk-plain. Screens re-render often, so the state (query, sort, page, hidden columns)
   is kept per screen+headers and re-applied to the new table; page size and hidden columns
   persist on this device (skosif_tables_v1). Nothing is rewritten: rows are only shown, hidden
   or reordered in place, so every button and input in them keeps working. */
(()=>{
"use strict";
const {$,$$,esc,load,save}=SK;
const core=()=>window.SKosifCore;
const MIN=8,PREF="skosif_tables_v1",SIZES=[10,25,50,100,0];
const state=new Map();let seq=0;
const I={q:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>',
  cols:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/></svg>',
  dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>'};
const norm=s=>String(s||"").toLowerCase().replace(/[ً-ٰٟ]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/\s+/g," ").trim();
function cellText(td){if(!td)return "";const f=td.querySelector("input:not([type=checkbox]):not([type=hidden]),select,textarea");return f?String(f.value||""):td.textContent.trim()}
function cellValue(td){
  const s=cellText(td),t=s.replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[٬,\s]|ر\.س|SAR|ريال/g,"").replace("٫",".").replace("−","-");
  const neg=/^\(.*\)$/.test(t),m=t.replace(/[()%٪▲▼+]/g,"").match(/^-?\d+(\.\d+)?/);
  if(m&&m[0].length>=Math.max(1,t.replace(/[()%٪▲▼+-]/g,"").length-2))return{n:(neg?-1:1)*parseFloat(m[0])};
  if(/^\d{4}-\d{2}-\d{2}/.test(s))return{n:Date.parse(s.slice(0,10))};
  return{s:norm(s)};
}
const cmp=(a,b)=>a.n!=null&&b.n!=null?a.n-b.n:a.n!=null?-1:b.n!=null?1:(a.s||"").localeCompare(b.s||"","ar");
function headers(table){const r=table.tHead&&table.tHead.rows[table.tHead.rows.length-1];return r?[...r.cells]:[]}
function eligible(table){
  if(table.dataset.sktb||table.hasAttribute("data-sk-plain")||table.closest("#pr-modal,#pr-print,.skk,.sk-menu,[data-sk-plain]"))return false;
  const hs=headers(table),body=table.tBodies[0];if(!hs.length||!body||body.rows.length<MIN)return false;
  if(hs.some(h=>h.colSpan>1||h.rowSpan>1))return false;
  return [...body.rows].every(r=>r.cells.length===hs.length&&![...r.cells].some(c=>c.colSpan>1||c.rowSpan>1));
}
function keyOf(table,hs){return (core()?core().view():"")+"|"+hs.map(h=>h.textContent.trim()).join("¦")}
function prefs(){const p=load(PREF,{});return p&&typeof p==="object"?p:{}}
function st(key){
  if(!state.has(key)){const p=prefs()[key]||{};state.set(key,{q:"",page:1,size:p.size??25,sort:null,hidden:Array.isArray(p.hidden)?p.hidden:[]})}
  return state.get(key);
}
function persist(key,s){const p=prefs();p[key]={size:s.size,hidden:s.hidden};const keys=Object.keys(p);if(keys.length>80)delete p[keys[0]];save(PREF,p)}

function enhance(table){
  const hs=headers(table),key=keyOf(table,hs),s=st(key),id="t"+(++seq);
  table.dataset.sktb=id;
  const frame=table.closest(".tw,.sk-table-wrap,.table-wrap,.tbl-wrap,.t-wrap,.customer-table")||table;
  const bar=document.createElement("div");bar.className="sktb-bar";bar.dataset.for=id;
  bar.innerHTML='<label class="sktb-q">'+I.q+'<input type="search" placeholder="ابحث في الجدول…" aria-label="بحث في الجدول" value="'+esc(s.q)+'"></label>'+
    '<button type="button" class="sktb-btn" data-t="cols" aria-haspopup="menu">'+I.cols+'عرض الأعمدة</button>'+
    '<button type="button" class="sktb-btn" data-t="csv">'+I.dl+'تصدير</button><span class="sktb-n"></span>';
  const foot=document.createElement("div");foot.className="sktb-foot";foot.dataset.for=id;
  frame.before(bar);frame.after(foot);
  /* sortable headers (not action/checkbox columns) */
  hs.forEach((h,i)=>{if(h.classList.contains("act")||h.querySelector("input,button,select")||!h.textContent.trim())return;h.classList.add("sktb-sort");h.tabIndex=0;h.dataset.col=i;h.setAttribute("role","columnheader")});
  /* change/variance columns: ▲ green / ▼ red */
  const delta=hs.map(h=>/تغي|الفرق|فرق|انحراف|change|variance|Δ/i.test(h.textContent));
  if(delta.some(Boolean))[...table.tBodies[0].rows].forEach(r=>delta.forEach((d,i)=>{if(!d)return;const c=r.cells[i],v=cellValue(c);if(v.n==null||!/[%٪]|\(/.test(c.textContent))return;c.classList.add(v.n>0?"sktb-up":v.n<0?"sktb-down":"sktb-flat")}));
  const input=$("input",bar);
  input.addEventListener("input",()=>{s.q=input.value;s.page=1;apply(table)});
  bar.addEventListener("click",e=>{const b=e.target.closest("[data-t]");if(!b)return;if(b.dataset.t==="csv")exportCsv(table);else colsMenu(table,b)});
  table.tHead.addEventListener("click",e=>{const h=e.target.closest("th.sktb-sort");if(h)sortBy(table,+h.dataset.col)});
  table.tHead.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("th.sktb-sort")){e.preventDefault();sortBy(table,+e.target.dataset.col)}});
  foot.addEventListener("click",e=>{const b=e.target.closest("[data-pg]");if(!b||b.disabled)return;s.page=+b.dataset.pg;apply(table);frame.scrollIntoView({block:"nearest"})});
  foot.addEventListener("change",e=>{if(e.target.matches("select")){s.size=+e.target.value;s.page=1;persist(key,s);apply(table)}});
  table._sktb={key,s,bar,foot,frame,orig:[...table.tBodies[0].rows]};
  apply(table);
}
function sortBy(table,i){
  const {s}=table._sktb;
  s.sort=s.sort&&s.sort.i===i?(s.sort.dir==="asc"?{i,dir:"desc"}:null):{i,dir:"asc"};
  apply(table);
}
function apply(table){
  const t=table._sktb;if(!t)return;const {s,bar,foot,orig}=t,body=table.tBodies[0],hs=headers(table);
  /* order */
  let rows=orig.slice();
  if(s.sort){const i=s.sort.i,dir=s.sort.dir==="asc"?1:-1;rows=rows.map(r=>[r,cellValue(r.cells[i])]).sort((a,b)=>cmp(a[1],b[1])*dir).map(x=>x[0])}
  rows.forEach(r=>body.appendChild(r));
  hs.forEach((h,i)=>{if(h.classList.contains("sktb-sort"))h.setAttribute("aria-sort",s.sort&&s.sort.i===i?(s.sort.dir==="asc"?"ascending":"descending"):"none")});
  /* filter + page */
  const q=norm(s.q),hit=q?rows.filter(r=>norm(r.textContent+" "+[...r.querySelectorAll("input,select")].map(x=>x.value).join(" ")).includes(q)):rows;
  const size=s.size||hit.length||1,pages=Math.max(1,Math.ceil(hit.length/size));if(s.page>pages)s.page=pages;
  const from=(s.page-1)*size,to=Math.min(hit.length,from+size),show=new Set(hit.slice(from,to));
  rows.forEach(r=>r.classList.toggle("sktb-off",!show.has(r)));
  /* hidden columns */
  const hid=new Set(s.hidden.map(h=>hs.findIndex(x=>x.textContent.trim()===h)).filter(i=>i>=0));
  [table.tHead.rows[table.tHead.rows.length-1],...orig,...(table.tFoot?[...table.tFoot.rows]:[])].forEach(r=>{if(r.cells.length===hs.length)[...r.cells].forEach((c,i)=>c.classList.toggle("sktb-hide",hid.has(i)))});
  /* labels */
  $(".sktb-n",bar).textContent=(q?hit.length+" من ":"")+orig.length+" صف";
  let pg='';
  if(pages>1){
    const btn=(p,l,dis,cur)=>'<button type="button" data-pg="'+p+'"'+(dis?' disabled':'')+(cur?' aria-current="page"':'')+' aria-label="صفحة '+p+'">'+l+'</button>';
    const chev=d=>'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(d?"m9 6 6 6-6 6":"m15 6-6 6 6 6")+'"/></svg>';
    const rtl=document.documentElement.dir!=="ltr";
    pg+=btn(s.page-1,chev(rtl),s.page<=1);
    const win=[...new Set([1,s.page-1,s.page,s.page+1,pages].filter(p=>p>=1&&p<=pages))].sort((a,b)=>a-b);
    win.forEach((p,j)=>{if(j&&p-win[j-1]>1)pg+='<span>…</span>';pg+=btn(p,p,false,p===s.page)});
    pg+=btn(s.page+1,chev(!rtl),s.page>=pages);
  }
  foot.innerHTML='<label>عدد الصفوف في الصفحة <select aria-label="عدد الصفوف">'+SIZES.map(n=>'<option value="'+n+'"'+(n===s.size?' selected':'')+'>'+(n||"الكل")+'</option>').join("")+'</select></label>'+
    '<span>'+(hit.length?'عرض '+(from+1)+'–'+to+' من أصل '+hit.length:'لا نتائج مطابقة')+'</span><span class="sktb-pg">'+pg+'</span>';
}
function exportCsv(table){
  const hs=headers(table),{orig,s}=table._sktb,hid=new Set(s.hidden);
  const idx=hs.map((h,i)=>i).filter(i=>!hid.has(hs[i].textContent.trim())&&hs[i].textContent.trim()&&!hs[i].classList.contains("act"));
  const q=norm(s.q),rows=orig.filter(r=>!q||norm(r.textContent).includes(q));
  const name=((core()&&SK.caps.get(core().view())||{}).label||"جدول")+"-"+new Date().toISOString().slice(0,10);
  SK.csv.download("S.kosif-"+name,idx.map(i=>hs[i].textContent.trim()),rows.map(r=>idx.map(i=>cellText(r.cells[i]))));
  SK.toast("صُدّر "+rows.length+" صفاً","ok");
}
let menu=null;
function colsMenu(table,btn){
  if(menu){menu.remove();menu=null;return}
  const hs=headers(table),{s,key}=table._sktb;
  menu=document.createElement("div");menu.className="sk-menu sktb-cols";menu.setAttribute("role","menu");
  menu.innerHTML='<div class="sk-menu-h">الأعمدة الظاهرة</div>'+hs.map(h=>h.textContent.trim()).filter(Boolean).map(t=>'<label><input type="checkbox" value="'+esc(t)+'"'+(s.hidden.includes(t)?'':' checked')+'> '+esc(t)+'</label>').join("");
  document.body.appendChild(menu);
  const r=btn.getBoundingClientRect(),w=menu.offsetWidth;menu.style.top=(r.bottom+6)+"px";menu.style.left=Math.max(8,Math.min(r.right-w,innerWidth-w-8))+"px";
  menu.addEventListener("change",e=>{const v=e.target.value;s.hidden=e.target.checked?s.hidden.filter(x=>x!==v):[...s.hidden,v];persist(key,s);apply(table)});
  setTimeout(()=>document.addEventListener("click",function off(e){if(menu&&!menu.contains(e.target)){menu.remove();menu=null;document.removeEventListener("click",off,true)}},true),0);
}
/* scan the screen: enhance new tables, drop toolbars whose table is gone */
function scan(){
  const view=$("#view");if(!view)return;
  $$(".sktb-bar,.sktb-foot",view).forEach(el=>{const t=view.querySelector('table[data-sktb="'+el.dataset.for+'"]');if(!t)el.remove()});
  $$("table.t,table.sk-table,.tw table,.sk-table-wrap table",view).forEach(t=>{try{if(eligible(t))enhance(t)}catch(e){SK.errors.report(e,"table",{silent:true})}});
}
let timer=0;const later=()=>{clearTimeout(timer);timer=setTimeout(scan,90)};
function boot(){
  const view=$("#view");if(!view)return;
  new MutationObserver(muts=>{if(muts.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.tagName==="TABLE"||n.querySelector&&n.querySelector("table")))))later()}).observe(view,{childList:true,subtree:true});
  addEventListener("sk:render",later);later();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
window.SKosifTable=Object.freeze({scan,enhance:t=>{if(eligible(t))enhance(t)}});
})();
