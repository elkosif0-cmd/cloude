/* S.kosif component — premium data tables (window.SKosifTable).
   Upgrades every data table of every screen (core .t tables and feature .sk-table tables) the
   way the KOSIF «ميزان المراجعة» mockup shows, without changing the screens themselves:
     toolbar  : search · «عرض الأعمدة» · تصدير CSV · «n صف»
     headers  : click to sort (numbers, money, percentages, dates, Arabic text)
     footer   : rows per page · «عرض 1–25 من أصل 312» · pages
     cells    : change/variance columns get ▲ green / ▼ red
     totals   : a «الإجمالي» row sums the money/quantity columns of the rows that match the search
     tools    : «مضغوط» density · «بطاقات» on phones · تصدير ▾ (CSV · Excel .xlsx · نسخ للصق في Excel · طباعة
                بالترويسة) · a sticky header when many rows show
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
  dl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
  dense:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>',
  cards:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/></svg>'};
/* columns that are summed in the totals row: money and quantities, never codes, dates, rates, unit prices,
   phone or ID numbers, or day counts (a header can also opt out with data-sk-nosum) */
const NO_SUM=/رقم|رمز|كود|الكود|تاريخ|date|code|#|%|٪|نسبة|هامش|معدل|متوسط|سعر|السعر|price|rate|margin|الحالة|درجة|ترتيب|المرحلة|السنة|الشهر|جوال|هاتف|موبايل|phone|mobile|واتساب|whatsapp|iban|آيبان|هوية|سجل تجاري|منذ|الغياب|days since|الإيقاع|\b(?:id|identifier|vat number)\b/i;
/* long unformatted digits are only an identifier hint when the column has no money/quantity semantics */
const SUM_VALUE=/مبلغ|المقدار|قيمة|القيمة|إيراد|ايراد|إجمالي|اجمالي|تكلفة|التكلفة|مدين|دائن|رصيد|كمية|الكمية|\b(?:amount|revenue|total|cost|quantity|qty|units|balance|debit|credit)\b|^vat$/i;
const ID_LIKE=/^\+?\d{9,}$/;
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
  if(!state.has(key)){const p=prefs()[key]||{};state.set(key,{q:"",page:1,size:p.size??25,sort:null,hidden:Array.isArray(p.hidden)?p.hidden:[],dense:!!p.dense,cards:!!p.cards})}
  return state.get(key);
}
function persist(key,s){const p=prefs();p[key]={size:s.size,hidden:s.hidden,dense:s.dense,cards:s.cards};const keys=Object.keys(p);if(keys.length>80)delete p[keys[0]];save(PREF,p)}

function enhance(table){
  const hs=headers(table),key=keyOf(table,hs),s=st(key),id="t"+(++seq);
  table.dataset.sktb=id;
  const frame=table.closest(".tw,.sk-table-wrap,.table-wrap,.tbl-wrap,.t-wrap,.customer-table")||table;
  const bar=document.createElement("div");bar.className="sktb-bar";bar.dataset.for=id;
  bar.innerHTML='<label class="sktb-q">'+I.q+'<input type="search" placeholder="ابحث في الجدول…" aria-label="بحث في الجدول" value="'+esc(s.q)+'"></label>'+
    '<button type="button" class="sktb-btn" data-t="cols" aria-haspopup="menu">'+I.cols+'عرض الأعمدة</button>'+
    '<button type="button" class="sktb-btn" data-t="dense" aria-pressed="'+s.dense+'" title="صفوف مضغوطة">'+I.dense+'<span>مضغوط</span></button>'+
    '<button type="button" class="sktb-btn sktb-cardbtn" data-t="cards" aria-pressed="'+s.cards+'" title="عرض الصفوف كبطاقات">'+I.cards+'<span>بطاقات</span></button>'+
    '<button type="button" class="sktb-btn" data-t="export" aria-haspopup="menu">'+I.dl+'تصدير</button><span class="sktb-n"></span>';
  const foot=document.createElement("div");foot.className="sktb-foot";foot.dataset.for=id;
  frame.before(bar);frame.after(foot);
  /* sortable headers (not action/checkbox columns) */
  hs.forEach((h,i)=>{if(h.classList.contains("act")||h.querySelector("input,button,select")||!h.textContent.trim())return;h.classList.add("sktb-sort");h.tabIndex=0;h.dataset.col=i;h.setAttribute("role","columnheader")});
  /* change/variance columns: ▲ green / ▼ red */
  const delta=hs.map(h=>/تغي|الفرق|فرق|انحراف|change|variance|Δ/i.test(h.textContent));
  if(delta.some(Boolean))[...table.tBodies[0].rows].forEach(r=>delta.forEach((d,i)=>{if(!d)return;const c=r.cells[i],v=cellValue(c);if(v.n==null||!/[%٪]|\(/.test(c.textContent))return;c.classList.add(v.n>0?"sktb-up":v.n<0?"sktb-down":"sktb-flat")}));
  const input=$("input",bar);
  input.addEventListener("input",()=>{s.q=input.value;s.page=1;apply(table)});
  bar.addEventListener("click",e=>{const b=e.target.closest("[data-t]");if(!b)return;const t=b.dataset.t;
    if(t==="cols")colsMenu(table,b);else if(t==="export")exportMenu(table,b);
    else if(t==="dense"||t==="cards"){s[t]=!s[t];b.setAttribute("aria-pressed",String(s[t]));persist(key,s);apply(table)}});
  /* phones read each row as a card: every cell carries its column name */
  [...table.tBodies[0].rows].forEach(r=>[...r.cells].forEach((c,i)=>{const h=hs[i]&&hs[i].textContent.trim();if(h&&!c.hasAttribute("data-label"))c.setAttribute("data-label",h)}));
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
  table.classList.toggle("sktb-dense",!!s.dense);table.classList.toggle("sktb-cards",!!s.cards);
  totals(table,hit,hid);
  /* many rows on screen: the frame scrolls and the header stays */
  t.frame.classList.toggle("sktb-scroll",show.size>15&&!s.cards&&t.frame!==table);
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
/* the totals row: sums of the summable columns over the matching rows (added once, as a tfoot we own) */
function totals(table,hit,hid){
  const t=table._sktb,hs=headers(table);
  if(t.sum===undefined){
    if(table.tFoot&&!table.tFoot.classList.contains("sktb-sum")){t.sum=null;return}
    const cols=hs.map((h,i)=>{const txt=h.textContent.trim();if(!i||!txt||NO_SUM.test(txt)||h.classList.contains("act")||h.hasAttribute("data-sk-nosum"))return false;
      const valueColumn=SUM_VALUE.test(txt)||h.classList.contains("money")||t.orig.some(r=>r.cells[i]&&r.cells[i].classList.contains("money"));
      const vals=t.orig.map(r=>cellText(r.cells[i])).filter(v=>v!=="");const nums=vals.map(v=>cellValue({textContent:v,querySelector:()=>null})).filter(v=>v.n!=null&&!/^\d{4}-\d{2}-\d{2}/.test(""));
      return vals.length>=2&&nums.length>=vals.length*.8&&!vals.some(v=>/[%٪]|^\d{4}-\d{2}/.test(v)||(!valueColumn&&ID_LIKE.test(v.replace(/\s/g,""))))});
    t.sum=cols.some(Boolean)?cols:null;
    if(t.sum){const f=table.createTFoot();f.classList.add("sktb-sum");f.insertRow().innerHTML=hs.map(()=>'<td></td>').join("")}
  }
  if(!t.sum)return;
  const row=table.tFoot.rows[0],nf=new Intl.NumberFormat("en-US",{maximumFractionDigits:2});
  t.sum.forEach((on,i)=>{const c=row.cells[i];if(!c)return;
    if(i===0){c.textContent="الإجمالي ("+hit.length+")";return}
    if(!on){c.textContent="";return}
    const total=hit.reduce((a,r)=>{const v=cellValue(r.cells[i]);return a+(v.n!=null?v.n:0)},0);
    c.textContent=nf.format(Math.round(total*100)/100);c.className="num";
  });
  [...row.cells].forEach((c,i)=>c.classList.toggle("sktb-hide",hid.has(i)));
}
/* Explicit full-scope screen footers stay separate from filtered account rows.
   Unmarked and generated footers retain their existing export behavior. */
function ownedFooterRows(table,idx){
  const foot=table.tFoot;if(!idx.length||!foot||foot.classList.contains("sktb-sum")||foot.dataset.skSummaryScope!=="all")return[];
  const count=headers(table).length,rows=[...foot.rows].filter(r=>r.cells.length===count);
  const values=rows.map(r=>idx.map(i=>cellText(r.cells[i])));
  /* Keep the scope when the label column is hidden, without overwriting a numeric column. */
  if(values.length&&!idx.includes(0))values.unshift(idx.map((_,i)=>i===0?cellText(rows[0].cells[0]):""));
  return values;
}
/* the rows and columns an export takes: what the search shows, in the current order, visible columns only */
function exportData(table){
  const hs=headers(table),{orig,s}=table._sktb,hid=new Set(s.hidden),body=table.tBodies[0];
  const idx=hs.map((h,i)=>i).filter(i=>!hid.has(hs[i].textContent.trim())&&hs[i].textContent.trim()&&!hs[i].classList.contains("act"));
  const q=norm(s.q),rows=[...body.rows].filter(r=>orig.includes(r)&&(!q||norm(r.textContent).includes(q)));
  const name=((core()&&SK.caps.get(core().view())||{}).label||"جدول");
  return{heads:idx.map(i=>hs[i].textContent.trim()),rows:rows.map(r=>idx.map(i=>cellText(r.cells[i]))),footerRows:ownedFooterRows(table,idx),name,idx};
}
const fileName=ext=>"SQC-"+((core()&&core().view())||"table")+"-"+new Date().toISOString().slice(0,10)+"."+ext;
function exportXlsx(table){
  const x=exportData(table);if(!window.SKXlsx||!SKXlsx.write)return exportCsv(table);
  SK.download(fileName("xlsx"),SKXlsx.write(x.name,x.heads,x.rows.concat(x.footerRows),{rtl:true}));SK.toast("صُدّر "+x.rows.length+" صفاً إلى Excel","ok");
}
async function copyTsv(table){
  const x=exportData(table),tsv=[x.heads,...x.rows,...x.footerRows].map(r=>r.map(v=>String(v).replace(/[\t\n]+/g," ")).join("\t")).join("\n");
  try{await navigator.clipboard.writeText(tsv);SK.toast("نُسخ "+x.rows.length+" صفاً — الصقها في Excel","ok")}catch{SK.toast("المتصفح منع النسخ — استخدم التصدير","warn")}
}
function printTable(table){
  const x=exportData(table),w=window.open("","_blank");if(!w)return SK.toast("اسمح بالنوافذ المنبثقة للطباعة","warn");
  const sum=table._sktb.sum,foot=x.footerRows.length?'<tfoot>'+x.footerRows.map(r=>'<tr>'+r.map(v=>'<td><b>'+esc(v)+'</b></td>').join("")+'</tr>').join("")+'</tfoot>':sum?'<tfoot><tr>'+x.idx.map((i,j)=>'<td><b>'+esc(j===0?"الإجمالي":sum[i]?table.tFoot.rows[0].cells[i].textContent:"")+'</b></td>').join("")+'</tr></tfoot>':"";
  w.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>'+esc(x.name)+'</title></head><body><table><thead><tr>'+x.heads.map(h=>'<th>'+esc(h)+'</th>').join("")+'</tr></thead><tbody>'+
    x.rows.map(r=>'<tr>'+r.map(v=>'<td>'+esc(v)+'</td>').join("")+'</tr>').join("")+'</tbody>'+foot+'</table><p class="muted">'+x.rows.length+' صفاً'+(table._sktb.s.q?' — مطابقة للبحث «'+esc(table._sktb.s.q)+'»':'')+'</p></body></html>');
  w.document.close();SK.brandPrint(w,x.name);setTimeout(()=>{try{w.focus();w.print()}catch{}},400);
}
function exportMenu(table,btn){
  if(menu){menu.remove();menu=null;return}
  menu=document.createElement("div");menu.className="sk-menu sktb-exp";menu.setAttribute("role","menu");
  menu.innerHTML='<div class="sk-menu-h">تصدير الصفوف الظاهرة</div>'+[["xlsx","Excel (.xlsx)"],["csv","CSV"],["copy","نسخ — للصق في Excel"],["print","طباعة بالترويسة"]].map(([k,l])=>'<button type="button" role="menuitem" data-x="'+k+'">'+l+'</button>').join("");
  document.body.appendChild(menu);
  const r=btn.getBoundingClientRect(),w=menu.offsetWidth;menu.style.top=(r.bottom+6)+"px";menu.style.left=Math.max(8,Math.min(r.right-w,innerWidth-w-8))+"px";
  menu.addEventListener("click",e=>{const b=e.target.closest("[data-x]");if(!b)return;const k=b.dataset.x;menu.remove();menu=null;
    if(k==="xlsx")exportXlsx(table);else if(k==="csv")exportCsv(table);else if(k==="copy")copyTsv(table);else printTable(table)});
  setTimeout(()=>document.addEventListener("click",function off(e){if(menu&&!menu.contains(e.target)){menu.remove();menu=null;document.removeEventListener("click",off,true)}},true),0);
}
function exportCsv(table){
  const hs=headers(table),{orig,s}=table._sktb,hid=new Set(s.hidden);
  const idx=hs.map((h,i)=>i).filter(i=>!hid.has(hs[i].textContent.trim())&&hs[i].textContent.trim()&&!hs[i].classList.contains("act"));
  const q=norm(s.q),rows=orig.filter(r=>!q||norm(r.textContent).includes(q));
  const name=((core()&&SK.caps.get(core().view())||{}).label||"جدول")+"-"+new Date().toISOString().slice(0,10);
  SK.csv.download("SQC-"+name,idx.map(i=>hs[i].textContent.trim()),rows.map(r=>idx.map(i=>cellText(r.cells[i]))).concat(ownedFooterRows(table,idx)));
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
window.SKosifTable=Object.freeze({scan,enhance:t=>{if(eligible(t))enhance(t)},exportXlsx,printTable,copyTsv});
})();
