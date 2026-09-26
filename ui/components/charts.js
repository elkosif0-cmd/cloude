/* S.kosif component — KOSIF Luxe charts (window.SKCharts). Every chart returns an HTML string
   drawn from the numbers it is given (no sample data), themed by tokens:
     bars({labels, series:[{name,color,values}], line?:{name,color,values}, stacked?, height, width, fmt})
     line({labels, series:[{name,color,values}], area?, height, width, fmt})       — crosshair tooltip
     hbars({rows:[{label,value}], fmt, color})                                       — ranked horizontal bars
     waterfall({steps:[{label,value,total?}], width, height, fmt})                   — a bridge (P&L, cash)
     ring(pct, {cls, size})   donut(segments, {center, sub})   heatmap(grid3x3, {sel})   progress(rows)   spark(values)
   Series colours follow the validated categorical palette (--sk-c1…--sk-c8, fixed order, light and dark
   steps checked for colour-blind separation) unless a series names its own. Charts with two or more series
   carry a legend whose items hide/show a series; every chart can switch to its table and export PNG/SVG.
   Time runs left → right as in the approved KOSIF charts; pass width (the container's px width). */
(()=>{
"use strict";
const {esc}=SK;
const nfc=new Intl.NumberFormat("en",{notation:"compact",maximumFractionDigits:1});
const nf0=new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:0});
const compact=v=>{const n=Number(v)||0;return Math.abs(n)<1000?nf0.format(n):nfc.format(n)};
const money=v=>nf0.format(Math.round(Number(v)||0))+" ر.س";
function nice(v){if(v<=0)return 0;const e=Math.pow(10,Math.floor(Math.log10(v))),f=v/e;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*e}
const SLOT=i=>"var(--sk-c"+(i%8+1)+")";
const REG=new Map();let seq=0;
const reg=(kind,o)=>{const id="skch"+(++seq);REG.set(id,{kind,o});if(REG.size>80)REG.delete(REG.keys().next().value);return id};
const I={tbl:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/></svg>',
  img:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>'};
/* a bar with a 4px rounded data end and a square baseline (up: rounded top; down: rounded bottom) */
function barPath(x,y0,w,h,up){
  const r=Math.min(4,w/2,h);if(h<=0)return "";
  return up?"M"+x+" "+(y0+h)+"V"+(y0+r)+"Q"+x+" "+y0+" "+(x+r)+" "+y0+"H"+(x+w-r)+"Q"+(x+w)+" "+y0+" "+(x+w)+" "+(y0+r)+"V"+(y0+h)+"Z"
    :"M"+x+" "+y0+"V"+(y0+h-r)+"Q"+x+" "+(y0+h)+" "+(x+r)+" "+(y0+h)+"H"+(x+w-r)+"Q"+(x+w)+" "+(y0+h)+" "+(x+w)+" "+(y0+h-r)+"V"+y0+"Z";
}
const f1=v=>Number(v).toFixed(1);
/* legend (buttons that hide/show a series) + tools (table · image) */
function head(id,items,o,stat){
  const leg=stat?'<div class="skch-legend static">'+items.map(s=>'<span><i style="background:'+esc(s.color)+'"></i>'+esc(s.name)+'</span>').join("")+'</div>'
    :items.length>1?'<div class="skch-legend" role="group" aria-label="السلاسل">'+items.map((s,i)=>'<button type="button" data-skch-s="'+i+'" aria-pressed="'+!(o._hidden||[]).includes(i)+'"><i class="'+(s.ln?"ln":"")+'" style="background:'+esc(s.color)+'"></i>'+esc(s.name)+'</button>').join("")+'</div>':'<span></span>';
  const tools=o.tools===false?'':'<div class="skch-tools"><button type="button" data-skch-t="table" title="عرض البيانات كجدول">'+I.tbl+'<span>جدول</span></button><button type="button" data-skch-t="png" title="تنزيل صورة PNG">'+I.img+'<span>PNG</span></button><button type="button" data-skch-t="svg" title="تنزيل SVG">SVG</button></div>';
  return '<div class="skch-head">'+leg+tools+'</div>';
}
function table(cols,rows){
  return '<table class="skch-table" data-sk-plain hidden><thead><tr>'+cols.map(c=>'<th>'+esc(c)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map((c,i)=>'<td'+(i?' class="n"':'')+'>'+esc(c)+'</td>').join("")+'</tr>').join("")+'</tbody></table>';
}
const wrap=(id,kind,inner)=>'<figure class="skch-fig" data-skchw="'+id+'" data-kind="'+kind+'">'+inner+'</figure>';
const empty=o=>'<div class="skch-empty">'+esc(o.empty||"لا توجد بيانات مسجلة لهذه الفترة بعد.")+'</div>';
function axes(W,H,pl,pr,pt,ih,lo,span,y){
  let g='<g class="grid">',ax='<g class="axis">';
  for(let t=0;t<=4;t++){const v=lo+span*t/4,yy=f1(y(v));g+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+yy+'" y2="'+yy+'"/>';ax+='<text x="'+(pl-8)+'" y="'+(+yy+4)+'" text-anchor="end">'+esc(compact(v))+'</text>'}
  return g+'</g>'+ax+'</g>';
}
function scale(all){const mx=Math.max(0,...all),mn=Math.min(0,...all);const hi=nice(mx),lo=mn<0?-nice(-mn):0;return{hi,lo,span:(hi-lo)||1}}

/* ---------- column bars (grouped or stacked) with an optional line on the same axis ---------- */
function bars(o){
  const labels=o.labels||[],hid=o._hidden||[];
  const series=(o.series||[]).filter(s=>s&&s.values).map((s,i)=>({...s,color:s.color||SLOT(i),_i:i}));
  const line=o.line&&o.line.values?{...o.line,color:o.line.color||SLOT(series.length)}:null;
  const shown=series.filter(s=>!hid.includes(s._i)),lineOn=line&&!hid.includes(series.length);
  const raw=[...series.flatMap(s=>s.values),...(line?line.values:[])].map(Number).filter(Number.isFinite);
  if(!labels.length||!raw.some(v=>v!==0))return empty(o);
  const W=Math.max(300,Math.round(o.width||720)),H=o.height||260,pl=46,pr=8,pt=12,pb=30,iw=W-pl-pr,ih=H-pt-pb;
  const stackTotals=labels.map((_,i)=>shown.reduce((a,s)=>a+Math.max(0,Number(s.values[i])||0),0));
  const all=o.stacked?[...stackTotals,...(lineOn?line.values:[]).map(Number)]:[...shown.flatMap(s=>s.values),...(lineOn?line.values:[])].map(Number).filter(Number.isFinite);
  const {lo,span}=scale(all.length?all:[0]);
  const y=v=>pt+ih-(v-lo)/span*ih,n=labels.length,band=iw/n,k=o.stacked?1:(shown.length||1);
  const bw=Math.max(3,Math.min(24,band*.62/k)),gap=2,cx=i=>pl+(i+.5)*band;
  const id=reg("bars",o);
  let cols='',xl='<g class="xl">';
  const step=Math.ceil(n/(o.maxLabels||Math.max(3,Math.floor(iw/46))));
  labels.forEach((lab,i)=>{
    const c=cx(i),w=bw*k+gap*(k-1);let s='<g class="col" data-i="'+i+'" tabindex="0"><rect class="hit" x="'+f1(c-band/2)+'" y="'+pt+'" width="'+f1(band)+'" height="'+ih+'" rx="6"/>';
    if(o.stacked){let base=0;const segs=shown.map(se=>[se,Math.max(0,Number(se.values[i])||0)]).filter(([,v])=>v>0);
      segs.forEach(([se,v],j)=>{const top=j===segs.length-1,y1=y(base+v),y0=y(base),h=y0-y1-(j?gap:0);
        if(h>0)s+=top?'<path class="bar" d="'+barPath(+f1(c-bw/2),+f1(y1),+f1(bw),+f1(h),true)+'" fill="'+esc(se.color)+'"/>':'<rect class="bar" x="'+f1(c-bw/2)+'" y="'+f1(y1)+'" width="'+f1(bw)+'" height="'+f1(h)+'" fill="'+esc(se.color)+'"/>';base+=v});
    }else shown.forEach((se,j)=>{const v=Number(se.values[i])||0,x=c-w/2+j*(bw+gap),up=v>=0,hgt=Math.abs(y(v)-y(0));
      if(hgt>0)s+='<path class="bar" d="'+barPath(+f1(x),+f1(up?y(v):y(0)),+f1(bw),+f1(Math.max(1,hgt)),up)+'" fill="'+esc(se.color)+'"/>'});
    cols+=s+'</g>';
    if(i%step===0)xl+='<text x="'+f1(c)+'" y="'+(H-8)+'" text-anchor="middle">'+esc(lab)+'</text>';
  });
  xl+='</g>';
  let ln='';
  if(lineOn){const pts=labels.map((_,i)=>[cx(i),y(Number(line.values[i])||0)]);
    ln='<path class="line" stroke="'+esc(line.color)+'" d="M'+pts.map(p=>f1(p[0])+" "+f1(p[1])).join(" L")+'"/>'+pts.map(p=>'<circle class="pt" cx="'+f1(p[0])+'" cy="'+f1(p[1])+'" r="4" fill="'+esc(line.color)+'"/>').join("")}
  const items=[...series.map(s=>({name:s.name,color:s.color})),...(line?[{name:line.name,color:line.color,ln:true}]:[])];
  const f=o.fmt||money,tl=o.tipLabels||labels;
  return wrap(id,"bars",head(id,items,o)+'<div class="skch" data-skch="'+id+'"><svg viewBox="0 0 '+W+' '+H+'" direction="ltr" style="direction:ltr" role="img" aria-label="'+esc(o.title||"مخطط أعمدة")+'">'+axes(W,H,pl,pr,pt,ih,lo,span,y)+cols+ln+xl+'</svg></div>'+
    table(["",...items.map(s=>s.name)],labels.map((_,i)=>[tl[i],...series.map(s=>f(s.values[i])),...(line?[f(line.values[i])]:[])])));
}

/* ---------- lines (optionally areas) with a crosshair that snaps to the nearest label ---------- */
function line(o){
  const labels=o.labels||[],hid=o._hidden||[];
  const series=(o.series||[]).filter(s=>s&&s.values).map((s,i)=>({...s,color:s.color||SLOT(i),_i:i})),shown=series.filter(s=>!hid.includes(s._i));
  const raw=series.flatMap(s=>s.values).map(Number).filter(Number.isFinite);
  if(labels.length<2||!raw.some(v=>v!==0))return empty(o);
  const W=Math.max(300,Math.round(o.width||720)),H=o.height||240,pl=46,pr=o.endLabels===false?10:70,pt=14,pb=30,iw=W-pl-pr,ih=H-pt-pb;
  const {lo,span}=scale((shown.length?shown:series).flatMap(s=>s.values).map(Number).filter(Number.isFinite));
  const y=v=>pt+ih-(v-lo)/span*ih,n=labels.length,x=i=>pl+i*(iw/(n-1));
  const id=reg("line",o);
  let body='';
  shown.forEach(s=>{const pts=labels.map((_,i)=>[x(i),y(Number(s.values[i])||0)]),d="M"+pts.map(p=>f1(p[0])+" "+f1(p[1])).join(" L");
    if(o.area)body+='<path class="area" d="'+d+" L"+f1(pts[n-1][0])+" "+f1(y(Math.max(lo,0)))+" L"+f1(pts[0][0])+" "+f1(y(Math.max(lo,0)))+' Z" fill="'+esc(s.color)+'"/>';
    body+='<path class="line" stroke="'+esc(s.color)+'" d="'+d+'"/><circle class="pt" cx="'+f1(pts[n-1][0])+'" cy="'+f1(pts[n-1][1])+'" r="4" fill="'+esc(s.color)+'"/>';
    if(o.endLabels!==false&&shown.length<=4)body+='<text class="endl" x="'+f1(pts[n-1][0]+8)+'" y="'+f1(pts[n-1][1]+4)+'">'+esc(compact(s.values[n-1]))+'</text>'});
  let xl='<g class="xl">';const step=Math.ceil(n/Math.max(3,Math.floor(iw/56)));
  labels.forEach((l,i)=>{if(i%step===0||i===n-1)xl+='<text x="'+f1(x(i))+'" y="'+(H-8)+'" text-anchor="middle">'+esc(l)+'</text>'});xl+='</g>';
  const hit='<rect class="xhit" x="'+pl+'" y="'+pt+'" width="'+iw+'" height="'+ih+'"/><line class="xhair" x1="0" x2="0" y1="'+pt+'" y2="'+(pt+ih)+'" hidden/>';
  const f=o.fmt||money,tl=o.tipLabels||labels,items=series.map(s=>({name:s.name,color:s.color,ln:true}));
  REG.get(id).geo={pl,iw,n};
  return wrap(id,"line",head(id,items,o)+'<div class="skch" data-skch="'+id+'"><svg viewBox="0 0 '+W+' '+H+'" direction="ltr" style="direction:ltr" role="img" aria-label="'+esc(o.title||"مخطط خطي")+'" tabindex="0">'+axes(W,H,pl,pr,pt,ih,lo,span,y)+body+xl+hit+'</svg></div>'+
    table(["",...series.map(s=>s.name)],labels.map((_,i)=>[tl[i],...series.map(s=>f(s.values[i]))])));
}

/* ---------- ranked horizontal bars (categories, top expenses): value at the tip ---------- */
function hbars(o){
  const rows=(o.rows||[]).filter(r=>Number.isFinite(Number(r.value)));
  if(!rows.length||!rows.some(r=>Number(r.value)))return empty(o);
  const list=o.sort===false?rows:rows.slice().sort((a,b)=>Math.abs(b.value)-Math.abs(a.value));
  const mx=Math.max(...list.map(r=>Math.abs(Number(r.value))))||1,f=o.fmt||money,id=reg("hbars",o);
  return wrap(id,"hbars",head(id,[],o)+'<div class="skhb" role="img" aria-label="'+esc(o.title||"ترتيب")+'">'+list.map(r=>{const v=Number(r.value),p=Math.abs(v)/mx*100;
    return '<div class="skhb-r" tabindex="0" title="'+esc(r.label+": "+f(v))+'"><span class="l">'+esc(r.label)+(r.sub?'<small>'+esc(r.sub)+'</small>':'')+'</span><span class="t"><i style="width:'+Math.max(.8,p).toFixed(1)+'%;background:'+esc(r.color||(v<0?"var(--sk-c8)":o.color||SLOT(0)))+'"></i></span><b>'+esc(f(v))+'</b></div>'}).join("")+'</div>'+
    table(["",o.valueLabel||"القيمة"],list.map(r=>[r.label,f(r.value)])));
}

/* ---------- waterfall (bridge): each step moves the running total; total steps stand on the baseline ---------- */
function waterfall(o){
  const steps=(o.steps||[]).filter(s=>s&&(s.total||Number.isFinite(Number(s.value))));
  if(!steps.length)return empty(o);
  let run=0;const pts=steps.map(s=>{if(s.total){const v=s.value!=null?Number(s.value):run;run=v;return{...s,from:0,to:v,kind:"t"}}const v=Number(s.value)||0,from=run;run+=v;return{...s,from,to:run,kind:v>=0?"u":"d"}});
  const W=Math.max(320,Math.round(o.width||720)),H=o.height||260,pl=52,pr=8,pt=18,pb=44,iw=W-pl-pr,ih=H-pt-pb;
  const {lo,span}=scale(pts.flatMap(p=>[p.from,p.to]));
  const y=v=>pt+ih-(v-lo)/span*ih,n=pts.length,band=iw/n,bw=Math.min(40,band*.62),cx=i=>pl+(i+.5)*band,f=o.fmt||compact;
  const col={u:"var(--sk-c1)",d:"var(--sk-c8)",t:"var(--sk-ink-2)"},id=reg("waterfall",o);
  let marks='',xl='<g class="xl">';
  pts.forEach((p,i)=>{const top=Math.max(p.from,p.to),bot=Math.min(p.from,p.to),y0=y(top),h=Math.max(1,y(bot)-y0),up=p.to>=p.from;
    marks+='<g class="col wf" data-i="'+i+'" tabindex="0"><rect class="hit" x="'+f1(cx(i)-band/2)+'" y="'+pt+'" width="'+f1(band)+'" height="'+ih+'" rx="6"/><path class="bar" d="'+barPath(+f1(cx(i)-bw/2),+f1(y0),+f1(bw),+f1(h),p.kind==="t"?p.to>=0:up)+'" fill="'+col[p.kind]+'"/>'+
      '<text class="vl" x="'+f1(cx(i))+'" y="'+f1(y0-5)+'" text-anchor="middle">'+esc((p.kind==="d"?"−":"")+f(Math.abs(p.kind==="t"?p.to:p.to-p.from)))+'</text></g>';
    if(i<n-1)marks+='<line class="wfc" x1="'+f1(cx(i)+bw/2)+'" x2="'+f1(cx(i+1)-bw/2)+'" y1="'+f1(y(p.to))+'" y2="'+f1(y(p.to))+'"/>';
    xl+='<text x="'+f1(cx(i))+'" y="'+(H-24)+'" text-anchor="middle">'+esc(p.label)+'</text>';
  });
  xl+='</g>';
  const items=[{name:"زيادة",color:col.u},{name:"نقص",color:col.d},{name:"إجمالي",color:col.t}];
  return wrap(id,"waterfall",head(id,items,o,true)+'<div class="skch" data-skch="'+id+'"><svg viewBox="0 0 '+W+' '+H+'" direction="ltr" style="direction:ltr" role="img" aria-label="'+esc(o.title||"جسر")+'">'+axes(W,H,pl,pr,pt,ih,lo,span,y)+'<line class="base" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+f1(y(0))+'" y2="'+f1(y(0))+'"/>'+marks+xl+'</svg></div>'+
    table(["البند","الحركة","الرصيد"],pts.map(p=>[p.label,p.kind==="t"?"—":(p.to-p.from<0?"−":"")+f(Math.abs(p.to-p.from)),f(p.to)])));
}

/* ---------- tooltips: bars/waterfall per column, lines by crosshair (values lead, series follow) ---------- */
function tipBox(box){let t=box.querySelector(".skch-tip");if(!t){t=document.createElement("div");t.className="skch-tip";box.appendChild(t)}return t}
function rowsHTML(list){return list.map(r=>'<div><em>'+esc(r.v)+'</em><span><i style="background:'+esc(r.c)+'"></i>'+esc(r.n)+'</span></div>').join("")}
function place(box,t,px,py){const w=box.getBoundingClientRect().width;t.style.left=Math.max(90,Math.min(w-90,px))+"px";t.style.top=Math.max(8,py)+"px"}
function colTip(col,show){
  const box=col.closest(".skch"),e=box&&REG.get(box.dataset.skch);if(!box)return;
  if(!show||!e){const t=box.querySelector(".skch-tip");if(t)t.remove();return}
  const o=e.o,i=+col.dataset.i,t=tipBox(box),hid=o._hidden||[];
  if(e.kind==="waterfall"){const st=o.steps[i];let run=0,to=0;o.steps.slice(0,i+1).forEach(s=>{if(s.total){run=s.value!=null?Number(s.value):run}else run+=Number(s.value)||0;to=run});
    const f=o.fmt||compact;t.innerHTML='<b>'+esc(st.label)+'</b>'+rowsHTML([...(st.total?[]:[{v:(Number(st.value)<0?"−":"")+f(Math.abs(st.value)),c:Number(st.value)<0?"var(--sk-c8)":"var(--sk-c1)",n:"الحركة"}]),{v:f(to),c:"var(--sk-ink-2)",n:"الرصيد"}])}
  else{const f=o.fmt||money,ser=(o.series||[]).map((s,j)=>({...s,color:s.color||SLOT(j),_i:j})).filter(s=>!hid.includes(s._i));
    const ln=o.line&&!hid.includes((o.series||[]).length)?[{v:f(o.line.values[i]),c:o.line.color||SLOT((o.series||[]).length),n:o.line.name}]:[];
    t.innerHTML='<b>'+esc((o.tipLabels||o.labels)[i])+'</b>'+rowsHTML([...ser.map(s=>({v:f(s.values[i]),c:s.color,n:s.name})),...ln])}
  const br=box.getBoundingClientRect(),cr=col.getBoundingClientRect();place(box,t,cr.left+cr.width/2-br.left,cr.top-br.top+10);
}
function lineTip(svg,ev,show){
  const box=svg.closest(".skch"),e=box&&REG.get(box.dataset.skch);if(!e||e.kind!=="line")return;
  const hair=svg.querySelector(".xhair");
  if(!show){const t=box.querySelector(".skch-tip");if(t)t.remove();if(hair)hair.setAttribute("hidden","");return}
  const o=e.o,{pl,iw,n}=e.geo,vb=svg.viewBox.baseVal,r=svg.getBoundingClientRect(),k=vb.width/r.width;
  let i=typeof ev==="number"?ev:Math.round(((ev.clientX-r.left)*k-pl)/(iw/(n-1)));i=Math.max(0,Math.min(n-1,i));e.cur=i;
  const X=pl+i*(iw/(n-1));hair.removeAttribute("hidden");hair.setAttribute("x1",X);hair.setAttribute("x2",X);
  const f=o.fmt||money,hid=o._hidden||[],t=tipBox(box);
  t.innerHTML='<b>'+esc((o.tipLabels||o.labels)[i])+'</b>'+rowsHTML((o.series||[]).map((s,j)=>({...s,color:s.color||SLOT(j),j})).filter(s=>!hid.includes(s.j)).map(s=>({v:f(s.values[i]),c:s.color,n:s.name})));
  place(box,t,X/k,24);
}
document.addEventListener("mouseover",e=>{const c=e.target.closest&&e.target.closest(".skch .col");if(c)colTip(c,true)});
document.addEventListener("mouseout",e=>{const c=e.target.closest&&e.target.closest(".skch .col");if(c&&!c.contains(e.relatedTarget))colTip(c,false)});
document.addEventListener("focusin",e=>{const c=e.target.closest&&e.target.closest(".skch .col");if(c)colTip(c,true);const s=e.target.closest&&e.target.closest('.skch-fig[data-kind="line"] svg');if(s)lineTip(s,0,true)});
document.addEventListener("focusout",e=>{const c=e.target.closest&&e.target.closest(".skch .col");if(c)colTip(c,false);const s=e.target.closest&&e.target.closest('.skch-fig[data-kind="line"] svg');if(s)lineTip(s,null,false)});
document.addEventListener("pointermove",e=>{const s=e.target.closest&&e.target.closest('.skch-fig[data-kind="line"] svg');if(s)lineTip(s,e,true)});
document.addEventListener("pointerleave",e=>{const s=e.target.closest&&e.target.closest('.skch-fig[data-kind="line"] svg');if(s&&e.target===s)lineTip(s,null,false)},true);
document.addEventListener("keydown",e=>{const s=e.target.closest&&e.target.closest('.skch-fig[data-kind="line"] svg');if(!s||!/Arrow(Left|Right)/.test(e.key))return;
  const en=REG.get(s.closest(".skch").dataset.skch);e.preventDefault();lineTip(s,(en.cur||0)+(e.key==="ArrowRight"?1:-1),true)});

/* ---------- legend toggles, table view, PNG / SVG export ---------- */
const BUILD={bars,line,hbars,waterfall};
function repaint(fig){const e=REG.get(fig.dataset.skchw);if(!e)return;const h=document.createElement("div");h.innerHTML=BUILD[e.kind](e.o);const nf=h.firstElementChild;if(nf){fig.replaceWith(nf)}}
function resolveColor(c,el){if(!/var\(/.test(c))return c;const p=document.createElement("span");p.style.color=c;(el||document.body).appendChild(p);const v=getComputedStyle(p).color;p.remove();return v}
function exportFig(fig,fmt){
  const svg=fig.querySelector(".skch svg"),e=REG.get(fig.dataset.skchw);
  /* ASCII file names: some browsers drop a non-Latin download name */
  const name=(e&&e.o.file||"SQC-chart-"+(e?e.kind:"figure"))+"-"+new Date().toISOString().slice(0,10);
  const vb=svg?svg.viewBox.baseVal:null,cs=getComputedStyle(fig),surface=resolveColor("var(--sk-surface)",fig),ink=resolveColor("var(--sk-ink-2)",fig);
  let W=vb?vb.width:640,H=vb?vb.height:320,inner="";
  if(svg){const clone=svg.cloneNode(true),src=[...svg.querySelectorAll("*")],dst=[...clone.querySelectorAll("*")];
    src.forEach((n,i)=>{const s=getComputedStyle(n),d=dst[i];["fill","stroke","stroke-width","opacity","fill-opacity","font-family","font-size","font-weight"].forEach(p=>{const v=s.getPropertyValue(p);if(v)d.style.setProperty(p,v)});
      ["fill","stroke"].forEach(a=>{const v=n.getAttribute(a);if(v&&/var\(/.test(v))d.setAttribute(a,resolveColor(v,fig))});if(d.classList.contains("hit")||d.classList.contains("xhit"))d.remove()});
    clone.querySelectorAll(".xhair").forEach(x=>x.remove());inner=clone.innerHTML;}
  else{const rows=[...fig.querySelectorAll(".skhb-r")];H=rows.length*30+16;W=640;inner=rows.map((r,i)=>{const bar=r.querySelector("i"),p=parseFloat(bar.style.width)||0,col=resolveColor(bar.style.background,fig);
      return '<text x="630" y="'+(i*30+24)+'" text-anchor="end" font-size="12" fill="'+ink+'" font-family="'+esc(cs.fontFamily)+'">'+esc(r.querySelector(".l").childNodes[0].textContent)+'</text><rect x="120" y="'+(i*30+12)+'" width="'+(p/100*330).toFixed(1)+'" height="14" rx="4" fill="'+col+'"/><text x="112" y="'+(i*30+24)+'" text-anchor="end" font-size="12" fill="'+ink+'" font-weight="700">'+esc(r.querySelector("b").textContent)+'</text>'}).join("")}
  const legend=[...fig.querySelectorAll(".skch-legend button[aria-pressed='true'],.skch-legend.static span")].map(b=>[b.textContent.trim(),resolveColor(b.querySelector("i").style.background,fig)]);
  const lh=legend.length?26:0,title=e&&e.o.title?e.o.title:"",th=title?26:0;
  const leg=legend.map(([t,c],i)=>'<rect x="'+(W-16-i*150)+'" y="'+(th+8)+'" width="10" height="10" rx="2" fill="'+c+'"/><text x="'+(W-22-i*150)+'" y="'+(th+17)+'" text-anchor="end" font-size="12" fill="'+ink+'" font-family="'+esc(cs.fontFamily)+'">'+esc(t)+'</text>').join("");
  const doc='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+(H+lh+th)+'" viewBox="0 0 '+W+' '+(H+lh+th)+'"><rect width="100%" height="100%" fill="'+surface+'"/>'+(title?'<text x="'+(W-12)+'" y="18" text-anchor="end" font-size="14" font-weight="700" fill="'+resolveColor("var(--sk-ink)",fig)+'" font-family="'+esc(cs.fontFamily)+'">'+esc(title)+'</text>':'')+leg+'<g transform="translate(0,'+(lh+th)+')">'+inner+'</g></svg>';
  const blob=new Blob([doc],{type:"image/svg+xml;charset=utf-8"});
  if(fmt==="svg"){SK.download(name+".svg",blob);return}
  const img=new Image(),url=URL.createObjectURL(blob);
  img.onload=()=>{const k=2,c=document.createElement("canvas");c.width=W*k;c.height=(H+lh+th)*k;const x=c.getContext("2d");x.scale(k,k);x.drawImage(img,0,0);URL.revokeObjectURL(url);
    c.toBlob(b=>{if(b)SK.download(name+".png",b);else SK.toast("تعذر إنشاء الصورة","bad")},"image/png")};
  img.onerror=()=>{URL.revokeObjectURL(url);SK.toast("تعذر إنشاء الصورة — نُزّل SVG بدلاً منها","warn");SK.download(name+".svg",blob)};
  img.src=url;
}
document.addEventListener("click",e=>{
  const s=e.target.closest&&e.target.closest(".skch-fig [data-skch-s]");
  if(s){const fig=s.closest(".skch-fig"),en=REG.get(fig.dataset.skchw);if(!en)return;const i=+s.dataset.skchS,h=new Set(en.o._hidden||[]);h.has(i)?h.delete(i):h.add(i);en.o._hidden=[...h];repaint(fig);return}
  const t=e.target.closest&&e.target.closest(".skch-fig [data-skch-t]");if(!t)return;
  const fig=t.closest(".skch-fig"),k=t.dataset.skchT;
  if(k==="table"){const tb=fig.querySelector(".skch-table"),on=tb.hasAttribute("hidden");tb.toggleAttribute("hidden",!on);t.setAttribute("aria-pressed",String(on));return}
  exportFig(fig,k);
});

/* ---------- small forms ---------- */
function ring(p,o={}){
  const v=Number.isFinite(p)?Math.max(0,Math.min(100,p)):0;
  return '<span class="skr '+esc(o.cls||"")+'" style="--p:'+v.toFixed(1)+(o.size?';--sz:'+o.size+'px':'')+'" role="img" aria-label="'+Math.round(v)+'٪"><i>'+Math.round(v)+'%</i></span>';
}
const PAL=[1,2,3,4,5,6,7,8].map(i=>"var(--sk-c"+i+")");
function donut(segs,o={}){
  const list=(segs||[]).filter(s=>s.value>0),tot=list.reduce((a,s)=>a+s.value,0);
  if(!tot)return '<div class="skch-empty">'+esc(o.empty||"لا بيانات بعد")+'</div>';
  let off=0;const arcs=list.map((s,i)=>{const p=s.value/tot*100,c=s.color||PAL[i%PAL.length];const a='<circle cx="21" cy="21" r="15.915" fill="none" stroke="'+esc(c)+'" stroke-width="6" stroke-dasharray="'+Math.max(0,p-.6).toFixed(2)+' '+(100-p+.6).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'"/>';off+=p;s._c=c;return a}).join("");
  return '<div class="skdn"><div class="ctr"><svg viewBox="0 0 42 42" aria-hidden="true"><circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--sk-surface-3)" stroke-width="6"/>'+arcs+'</svg><b>'+esc(o.center!=null?o.center:tot)+'<small>'+esc(o.sub||"")+'</small></b></div>'+
    '<ul>'+list.map(s=>'<li><i style="background:'+esc(s._c)+'"></i>'+esc(s.label)+'<b>'+esc(s.value)+'</b></li>').join("")+'</ul></div>';
}
/* grid[impact 0..2 = low..high][likelihood 0..2 = low..high] → counts */
const LV=["منخفض","متوسط","مرتفع"];
function heatmap(grid,o={}){
  let h='<div class="skhm"><span class="skhm-y">الأثر</span><div class="skhm-grid">';
  for(let im=2;im>=0;im--){
    h+='<span class="lab row">'+LV[im]+'</span>';
    for(let li=0;li<3;li++){const n=(grid[im]&&grid[im][li])||0,score=(im+1)*(li+1),cls=score>=6?"h4":score>=4?"h3":score>=3?"h2":"h1",key=im+"-"+li;
      h+='<button type="button" class="skhm-cell '+cls+(n?'':' zero')+'" data-hm="'+key+'" aria-pressed="'+(o.sel===key)+'" aria-label="الأثر '+LV[im]+' · الاحتمالية '+LV[li]+': '+n+'">'+n+'</button>'}
  }
  h+='<span></span>'+LV.map(l=>'<span class="lab">'+l+'</span>').join("")+'</div><span></span><span class="skhm-x">الاحتمالية</span></div>';
  return h;
}
function progress(rows){
  return '<div class="skpb">'+(rows||[]).map(r=>{const p=r.max>0?Math.max(0,Math.min(100,r.value/r.max*100)):0;
    return '<div class="skpb-r"><span>'+esc(r.label)+'</span><b>'+esc(r.text!=null?r.text:compact(r.value))+'</b><div class="skpb-bar"><i class="'+esc(r.cls||"")+'" style="width:'+p.toFixed(1)+'%"></i></div></div>'}).join("")+'</div>';
}
function spark(vals,o={}){
  const v=(vals||[]).map(Number).filter(Number.isFinite);if(v.length<2)return "";
  const w=o.w||90,h=o.h||28,mx=Math.max(...v),mn=Math.min(...v),sp=(mx-mn)||1;
  const pts=v.map((x,i)=>[(i*(w-6)/(v.length-1)+3),(h-4-(x-mn)/sp*(h-8))]);
  return '<svg class="skspark" viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" aria-hidden="true" style="direction:ltr"><path d="M'+pts.map(p=>p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" L")+'" fill="none" stroke="'+esc(o.color||"var(--sk-ink-3)")+'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="'+pts[pts.length-1][0].toFixed(1)+'" cy="'+pts[pts.length-1][1].toFixed(1)+'" r="3" fill="'+esc(o.accent||"var(--sk-c1)")+'"/></svg>';
}
/* print windows do not load the app's stylesheets: the charts bring their own (light palette, no tools) */
const PRINT_CSS=':root{--sk-c1:#1668e3;--sk-c2:#eb6834;--sk-c3:#1baf7a;--sk-c4:#eda100;--sk-c5:#e87ba4;--sk-c6:#008300;--sk-c7:#4a3aa7;--sk-c8:#e34948;--sk-ink:#0b1c33;--sk-ink-2:#44566f;--sk-ink-3:#8292a8;--sk-surface:#fff;--sk-surface-2:#f7f9fc;--sk-surface-3:#edf2f8;--sk-line:#e4eaf2;--sk-line-2:#d3dce8;--sk-grid:#edf1f7;--sk-axis:#d3dbe7}'+
  '.skch-fig{margin:0;break-inside:avoid}.skch-head{display:flex;justify-content:space-between;margin:0 0 6px}.skch-tools,.skch-tip,.skch .hit,.skch .xhit,.skch .xhair{display:none!important}'+
  '.skch-legend{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:11px;color:#44566f}.skch-legend span,.skch-legend button{display:inline-flex;align-items:center;gap:6px;border:0;background:none;padding:0;font:inherit;color:inherit}.skch-legend i{width:10px;height:10px;border-radius:3px;display:inline-block}.skch-legend i.ln{height:3px;width:16px}'+
  '.skch svg{display:block;width:100%;height:auto;direction:ltr}.skch .grid line{stroke:#edf1f7;stroke-width:1}.skch .axis text,.skch .xl text{fill:#8292a8;font:500 11px sans-serif}.skch .line{fill:none;stroke-width:2}.skch .pt{stroke:#fff;stroke-width:2}.skch .area{opacity:.1}'+
  '.skch .endl,.skch .vl{fill:#44566f;font:700 11px sans-serif}.skch .wfc{stroke:#d3dce8}.skch .base{stroke:#d3dbe7}'+
  '.skhb{display:grid;gap:6px}.skhb-r{display:grid;grid-template-columns:34% 1fr auto;align-items:center;gap:10px;font-size:11.5px}.skhb-r .l small{display:block;color:#8292a8;font-size:10px}.skhb-r .t{height:12px;border-radius:4px;background:#edf2f8;overflow:hidden}.skhb-r .t i{display:block;height:100%;border-radius:4px 0 0 4px}.skhb-r b{direction:ltr}';
/* ---------- a rows × columns heatmap (e.g. items × months): intensity of the brand colour ---------- */
function matrix(o){
  const rows=o.rows||[],cols=o.cols||[],vals=o.values||[],mx=Math.max(0,...vals.flat().map(Number).filter(Number.isFinite));
  if(!rows.length||!cols.length||!mx)return empty(o);
  const f=o.fmt||compact;
  return '<div class="skmx-wrap"><table class="skmx" data-sk-plain><thead><tr><th></th>'+cols.map(c=>'<th>'+esc(c)+'</th>').join("")+'</tr></thead><tbody>'+
    rows.map((r,i)=>'<tr><th>'+esc(r)+'</th>'+cols.map((c,j)=>{const v=Number((vals[i]||[])[j])||0,a=v/mx;return '<td style="--a:'+(v?Math.max(.08,a).toFixed(2):0)+'" class="'+(a>.55?"hi":"")+'" title="'+esc(r+" · "+c+": "+f(v))+'">'+(v?esc(f(v)):"")+'</td>'}).join("")+'</tr>').join("")+'</tbody></table></div>';
}
window.SKCharts=Object.freeze({matrix,bars,line,hbars,waterfall,ring,donut,heatmap,progress,spark,compact,money,palette:PAL.slice(),levels:LV.slice(),export:exportFig,printCSS:PRINT_CSS});
})();
