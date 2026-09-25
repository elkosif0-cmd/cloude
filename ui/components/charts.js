/* S.kosif component — KOSIF Luxe charts (window.SKCharts). Every chart returns an HTML string
   drawn from the numbers it is given (no sample data), in right-to-left order, themed by tokens:
     bars({labels, series:[{name,color,values}], line?:{name,color,values}, height, width, fmt})
     ring(pct, {cls, size})            donut(segments, {center, sub})
     heatmap(grid3x3, {sel})           progress(rows)            spark(values)
   Bars show a tooltip on hover (mouse) or tap (touch) with every series of that column. Time runs
   left → right as in the approved KOSIF charts; pass width (the container's px width) so labels
   stay at their real size. */
(()=>{
"use strict";
const {esc}=SK;
const nfc=new Intl.NumberFormat("en",{notation:"compact",maximumFractionDigits:1});
const nf0=new Intl.NumberFormat("ar-SA-u-nu-latn",{maximumFractionDigits:0});
const compact=v=>{const n=Number(v)||0;return Math.abs(n)<1000?nf0.format(n):nfc.format(n)};
const money=v=>nf0.format(Math.round(Number(v)||0))+" ر.س";
function nice(v){if(v<=0)return 0;const e=Math.pow(10,Math.floor(Math.log10(v))),f=v/e;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*e}
const REG=new Map();let seq=0;

function bars(o){
  const labels=o.labels||[],series=(o.series||[]).filter(s=>s&&s.values),line=o.line&&o.line.values?o.line:null;
  const all=[...series.flatMap(s=>s.values),...(line?line.values:[])].map(Number).filter(Number.isFinite);
  if(!labels.length||!all.some(v=>v!==0))return '<div class="skch-empty">'+esc(o.empty||"لا توجد بيانات مسجلة لهذه الفترة بعد.")+'</div>';
  const W=Math.max(300,Math.round(o.width||720)),H=o.height||260,pl=46,pr=8,pt=12,pb=30,iw=W-pl-pr,ih=H-pt-pb;
  const hi=nice(Math.max(0,...all)),lo=Math.min(0,...all)<0?-nice(-Math.min(...all)):0,span=(hi-lo)||1;
  const y=v=>pt+ih-(v-lo)/span*ih,n=labels.length,band=iw/n,k=series.length||1,bw=Math.max(3,Math.min(16,band*.62/k)),gap=Math.min(4,bw*.3);
  const cx=i=>pl+(i+.5)*band; /* oldest on the left, as the mockups */
  const id="skch"+(++seq);REG.set(id,o);if(REG.size>60)REG.delete(REG.keys().next().value);
  let g='<g class="grid">',ax='<g class="axis">';
  for(let t=0;t<=4;t++){const v=lo+span*t/4,yy=y(v).toFixed(1);g+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+yy+'" y2="'+yy+'"/>';ax+='<text x="'+(pl-8)+'" y="'+(+yy+4)+'" text-anchor="end">'+esc(compact(v))+'</text>'}
  g+='</g>';ax+='</g>';
  let cols='',xl='<g class="xl">';
  const step=Math.ceil(n/(o.maxLabels||Math.max(3,Math.floor(iw/46))));
  labels.forEach((lab,i)=>{
    const c=cx(i),w=bw*k+gap*(k-1);/* series left → right inside the group */let s='<g class="col" data-i="'+i+'" tabindex="0"><rect class="hit" x="'+(c-band/2).toFixed(1)+'" y="'+pt+'" width="'+band.toFixed(1)+'" height="'+ih+'" rx="6"/>';
    series.forEach((se,j)=>{const v=Number(se.values[i])||0,x=c-w/2+j*(bw+gap),y0=y(Math.max(0,v)),hgt=Math.abs(y(v)-y(0));
      if(hgt>0)s+='<rect class="bar" x="'+x.toFixed(1)+'" y="'+y0.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(1,hgt).toFixed(1)+'" rx="'+Math.min(4,bw/2).toFixed(1)+'" fill="'+esc(se.color)+'"/>'});
    cols+=s+'</g>';
    if(i%step===0)xl+='<text x="'+c.toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle">'+esc(lab)+'</text>';
  });
  xl+='</g>';
  let ln='';
  if(line){const pts=labels.map((_,i)=>[cx(i),y(Number(line.values[i])||0)]);
    ln='<path class="line" stroke="'+esc(line.color)+'" d="M'+pts.map(p=>p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" L")+'"/>'+pts.map(p=>'<circle class="pt" cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="3.4" fill="'+esc(line.color)+'"/>').join("")}
  const legend='<div class="skch-legend">'+series.map(s=>'<span><i style="background:'+esc(s.color)+'"></i>'+esc(s.name)+'</span>').join("")+(line?'<span><i class="ln" style="background:'+esc(line.color)+'"></i>'+esc(line.name)+'</span>':'')+'</div>';
  return legend+'<div class="skch" data-skch="'+id+'"><svg viewBox="0 0 '+W+' '+H+'" direction="ltr" style="direction:ltr" role="img" aria-label="'+esc(o.title||"مخطط")+'">'+g+ax+cols+ln+xl+'</svg></div>';
}
/* tooltip: one delegated handler for every bar chart on the page */
function tip(col,show){
  const box=col.closest(".skch"),o=box&&REG.get(box.dataset.skch);let t=box&&box.querySelector(".skch-tip");
  if(!show||!o){if(t)t.remove();return}
  const i=+col.dataset.i,f=o.fmt||money;
  if(!t){t=document.createElement("div");t.className="skch-tip";box.appendChild(t)}
  t.innerHTML='<b>'+esc((o.tipLabels||o.labels)[i])+'</b>'+(o.series||[]).map(s=>'<div><span><i style="background:'+esc(s.color)+'"></i>'+esc(s.name)+'</span><em>'+esc(f(s.values[i]))+'</em></div>').join("")+
    (o.line?'<div><span><i style="background:'+esc(o.line.color)+'"></i>'+esc(o.line.name)+'</span><em>'+esc(f(o.line.values[i]))+'</em></div>':'');
  const br=box.getBoundingClientRect(),cr=col.getBoundingClientRect();
  let x=cr.left+cr.width/2-br.left;x=Math.max(90,Math.min(br.width-90,x));
  t.style.left=x+"px";t.style.top=Math.max(8,cr.top-br.top+10)+"px";
}
document.addEventListener("mouseover",e=>{const c=e.target.closest&&e.target.closest(".skch .col");if(c)tip(c,true)});
document.addEventListener("mouseout",e=>{const c=e.target.closest&&e.target.closest(".skch .col");if(c&&!c.contains(e.relatedTarget))tip(c,false)});
document.addEventListener("focusin",e=>{const c=e.target.closest&&e.target.closest(".skch .col");if(c)tip(c,true)});
document.addEventListener("focusout",e=>{const c=e.target.closest&&e.target.closest(".skch .col");if(c)tip(c,false)});

function ring(p,o={}){
  const v=Number.isFinite(p)?Math.max(0,Math.min(100,p)):0;
  return '<span class="skr '+esc(o.cls||"")+'" style="--p:'+v.toFixed(1)+(o.size?';--sz:'+o.size+'px':'')+'" role="img" aria-label="'+Math.round(v)+'٪"><i>'+Math.round(v)+'%</i></span>';
}
const PAL=["#1668e3","#ef4444","#f5a524","#22b35e","#8b7cf6","#22b8e6","#94a3b8"];
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
  const d=v.map((x,i)=>(w-i*(w/(v.length-1))).toFixed(1)+" "+(h-2-(x-mn)/sp*(h-4)).toFixed(1)).join(" L");
  return '<svg class="skspark" viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" aria-hidden="true"><path d="M'+d+'" fill="none" stroke="'+esc(o.color||"var(--sk-brand)")+'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}
window.SKCharts=Object.freeze({bars,ring,donut,heatmap,progress,spark,compact,money,palette:PAL.slice(),levels:LV.slice()});
})();
