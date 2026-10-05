/* S.kosif components — the studio (SK.studio): the one shell behind every «استوديو».
   An entity in the middle (a product, a customer, …), what feeds it on one side and what it yields on the other; every
   box carries a number from the engine that owns it; a click on a box opens its details in the inspector; under the
   map, fixed tabs. The studio draws the map, drags the boxes, keeps their positions and the open tab, and routes every
   click to the feature. The feature owns the numbers, the nodes, the inspector, the side column and the tab bodies, and
   never writes a source record except through that record's own screen.

   SK.studio.mount(root, spec) → {paint, focus(id), focused(), narrow, spec}
   spec:
     subject()            called first in every paint: {label, sub?, pills?: html, empty?: html}; empty → that html alone
     subjects()           [{id, name, note?}] for the picker (select#pf-subject); selected(); onSelect(id)
     subjectLabel?, eyebrow, title, lead, headExtra?(): html (e.g. a search box inside the picker)
     nodes()              [{id, type, role: input|cost|center|output|note, tag?, label, value?, sub?, alt?, altLabel?,
                           share?, band?, draft?, legacy?, del?, cls?, edgeClass?}]
     edgeOf?(node, nodes) [from, to] or null; default: input → cost (or center), cost → center, note → center, center → output
     inspector?(id, nodes) html of the focused node (head + body); side?(): html of the rest of the side column
     tabs?(): [[id, label]], tab?: {get(), set(id)}, tabBody?(id): html
     positions?: {get(narrow) → {id:{x,y}}, set(narrow, all), reset(narrow)}
     onAction?(act, el, e) → true when handled (data-pf actions the studio does not know)
     onChange?(e), onInput?(e), onDelete?(id)
   Built-in data-pf actions: focus, focus-close, tab, relayout, delete, go. */
(()=>{
"use strict";
const {$,$$,esc}=SK;
const core=()=>window.SKosifCore;
const spread=(j,k,a,b,gap)=>{if(k<=1)return(a+b)/2;const step=Math.min(gap,(b-a)/(k-1));return(a+b)/2+(j-(k-1)/2)*step};
const byRole=(nodes,r)=>nodes.filter(n=>n.role===r);
/* the automatic layout: inputs on one side, the middle column, the entity, the outputs; notes along the bottom;
   on a narrow canvas the columns become rows */
function layout(nodes,W,narrow){
  const P={},ins=byRole(nodes,"input"),mids=byRole(nodes,"cost"),centers=byRole(nodes,"center"),outs=byRole(nodes,"output"),notes=byRole(nodes,"note");
  if(!narrow){
    const K=mids.length?3:2,H=Math.max(610,ins.length*128+80,outs.length*130+80),xm=Math.min(14,86/W*100),col=k=>100-xm-(100-2*xm)*k/K,gy=128/H*100,midY=notes.length?42:50;
    const column=(list,k,lo,hi)=>list.forEach((n,i)=>P[n.id]=[col(k),list.length>1?spread(i,list.length,lo,hi,Math.max(gy,22)):midY]);
    ins.forEach((n,i)=>P[n.id]=[col(0),spread(i,ins.length,9,91,gy)]);
    if(mids.length)column(mids,1,14,86);
    const kc=mids.length?2:1;column(centers,kc,14,86);
    outs.forEach((n,i)=>P[n.id]=[col(K),spread(i,outs.length,14,86,Math.max(gy,22))]);
    notes.forEach((n,i)=>P[n.id]=[spread(i%3,Math.min(3,notes.length-Math.floor(i/3)*3),col(kc)-20,col(kc-1)+2,24),84-Math.floor(i/3)*gy]);
    return{P,H};
  }
  const two=(list,start,R)=>list.forEach((n,i)=>{const last=i===list.length-1&&i%2===0;P[n.id]=[last?50:(i%2?27:73),(start+Math.floor(i/2)+.5)/R*100]});
  const ri=Math.ceil(ins.length/2),ro=Math.ceil(outs.length/2),rn=Math.ceil(notes.length/2),R=ri+mids.length+centers.length+ro+rn;
  two(ins,0,R);let r=ri;[...mids,...centers].forEach(n=>{P[n.id]=[50,(r+.5)/R*100];r++});two(outs,r,R);two(notes,r+ro,R);
  return{P,H:R*118+24};
}
function defaultEdge(n,nodes){
  const center=nodes.find(x=>x.role==="center"),mid=nodes.find(x=>x.role==="cost");if(!center)return null;
  if(n.role==="input")return[n.id,(mid||center).id];if(n.role==="cost")return[n.id,center.id];if(n.role==="note")return[n.id,center.id];if(n.role==="output")return[center.id,n.id];return null;
}
function edgesHtml(nodes,pos,spec){
  return '<svg class="pf-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+nodes.map(n=>{
    const e=spec.edgeOf?spec.edgeOf(n,nodes):defaultEdge(n,nodes);if(!e)return"";const A=pos[e[0]],B=pos[e[1]];if(!A||!B)return"";
    const w=n.role==="input"?(1.2+Math.min(1,n.share||0)*8).toFixed(1):"1.6",c=n.edgeClass||(n.role==="input"?(n.draft?"pf-e-draft":"pf-e-in"):n.role==="note"?"pf-e-note":"pf-e-out");
    return '<line class="'+c+'" data-a="'+esc(e[0])+'" data-b="'+esc(e[1])+'" x1="'+A[0]+'" y1="'+A[1]+'" x2="'+B[0]+'" y2="'+B[1]+'" style="stroke-width:'+w+'px"/>'}).join("")+'</svg>';
}
function nodeHtml(n,p,focus){
  const cls=["pf-node","pf-"+n.type,"pf-r-"+n.role,n.draft?"pf-draft":"",n.legacy?"pf-legacy":"",n.alt?"pf-changed":"",focus===n.id?"pf-focus":"",n.band?"pf-band-"+n.band:"",n.cls||""].filter(Boolean).join(" ");
  return '<div class="'+cls+'" data-node="'+esc(n.id)+'" data-x="'+p[0]+'" data-y="'+p[1]+'" style="left:'+p[0]+'%;top:'+p[1]+'%" tabindex="0" role="button" aria-label="'+esc(n.label+" — "+(n.value||""))+'">'+
    (n.del?'<button type="button" class="pf-del" data-pf="delete" data-id="'+esc(n.id)+'" aria-label="حذف">×</button>':'')+
    '<span class="pf-ntag">'+esc(n.tag||"")+'</span><b>'+esc(n.label)+'</b>'+(n.value?'<small>'+esc(n.value)+'</small>':'')+(n.sub?'<small class="pf-sub">'+esc(n.sub)+'</small>':'')+
    (n.alt?'<small class="pf-alt">'+esc(n.altLabel||"ماذا لو")+': '+esc(n.alt)+'</small>':'')+(n.share!=null&&n.role==="input"?'<i class="pf-share" style="--w:'+Math.max(2,Math.round(n.share*100))+'%"></i>':'')+'</div>';
}
/* a small group in the side column (open on laptops, folded on phones) */
function group(title,desc,body,open=true){return '<details class="pf-group"'+(open&&innerWidth>900?' open':'')+'><summary><span><b>'+esc(title)+'</b><small>'+esc(desc)+'</small></span><span class="pf-chev">⌄</span></summary><div class="pf-groupb">'+body+'</div></details>'}
/* key → value rows of the inspector: [[label, html, cls?]] */
function kv(rows){return '<dl class="pf-kv">'+rows.filter(Boolean).map(([a,b,c])=>'<div'+(c?' class="'+c+'"':'')+'><dt>'+esc(a)+'</dt><dd>'+b+'</dd></div>').join("")+'</dl>'}
function formula(list){return list&&list.length?'<ol class="pf-formula">'+list.map(s=>'<li>'+esc(s)+'</li>').join("")+'</ol>':""}
function inspHead(tag,label){return '<div class="pf-insph"><span class="pf-ntag">'+esc(tag||"")+'</span><b>'+esc(label||"")+'</b><button type="button" class="pf-x" data-pf="focus-close" aria-label="إغلاق">×</button></div>'}
const link=(id,l,ic)=>'<button type="button" class="pf-link" data-pf="go" data-go="'+esc(id)+'">'+SK.icon(ic||id)+'<span>'+esc(l)+'</span></button>';
function checks(list){
  if(!list||!list.length)return '<p class="pf-empty">لا توجد ملاحظات.</p>';
  const ic={bad:"alert",warn:"alert",info:"action",ok:"check"};
  return '<ul class="pf-checks">'+list.map(c=>'<li class="pf-chk pf-'+esc(c.level||"info")+'">'+SK.icon(ic[c.level]||"action")+'<span>'+esc(c.text)+'</span></li>').join("")+'</ul>';
}

function controller(root){
  const c={spec:null,focus:"",drag:null,lastNarrow:null,lastWide:null};
  c.narrow=()=>{const rw=root.clientWidth||innerWidth;return(innerWidth>900?rw-326:rw)<600};
  c.focused=()=>c.focus;
  c.setFocus=id=>{c.focus=id||"";c.paint()};
  c.paint=()=>{
    const spec=c.spec;if(!spec)return;
    const S=spec.subject()||{};
    if(S.empty){root.innerHTML=S.empty;return}
    const subs=(spec.subjects&&spec.subjects())||[],sel=spec.selected?spec.selected():"";
    const nodes=(spec.nodes&&spec.nodes())||[];if(c.focus&&!nodes.some(n=>n.id===c.focus))c.focus="";
    const nr=c.narrow(),wide=innerWidth>900;c.lastNarrow=nr;c.lastWide=wide;
    const W=Math.max(320,wide?(root.clientWidth||innerWidth)-326:(root.clientWidth||innerWidth)),L=layout(nodes,W,nr);
    const saved=(spec.positions&&spec.positions.get(nr))||{},pos={};
    nodes.forEach(n=>{const p=saved[n.id];pos[n.id]=p&&Number.isFinite(+p.x)&&Number.isFinite(+p.y)?[+p.x,+p.y]:(L.P[n.id]||[50,50])});
    const tabs=(spec.tabs&&spec.tabs())||[],tab=spec.tab?spec.tab.get():(tabs[0]||[""])[0];
    const head='<section class="pf-head card"><div><span class="pf-eyebrow">'+esc(spec.eyebrow||"STUDIO")+'</span><h2>'+esc(spec.title||"")+'</h2><p>'+esc(spec.lead||"")+'</p></div>'+
      (subs.length?'<div class="pf-select"><label for="pf-subject">'+esc(spec.subjectLabel||"الكيان")+'</label>'+(spec.headExtra?spec.headExtra():'')+'<select id="pf-subject">'+subs.map(s=>'<option value="'+esc(s.id)+'"'+(s.id===sel?' selected':'')+'>'+esc(s.name)+(s.note?" · "+esc(s.note):"")+'</option>').join("")+'</select></div>':'')+'</section>';
    const insp=spec.inspector&&c.focus?spec.inspector(c.focus,nodes):"",inspHtml=insp?'<section class="pf-insp'+(wide?'':' card')+'" aria-live="polite">'+insp+'</section>':"";
    const board='<section class="pf-board card"><div class="pf-boardtop"><div><b>'+esc(S.label||"")+'</b><small>'+esc(S.sub||"اسحب المربعات لترتيبها، واضغط أي مربع لتفاصيله")+'</small></div><div class="pf-mini">'+(S.pills||"")+'<button type="button" class="pf-relayout" data-pf="relayout" title="إعادة ترتيب المربعات">ترتيب تلقائي</button></div></div>'+
      '<div class="pf-canvas" id="pf-canvas" style="min-height:'+L.H+'px">'+edgesHtml(nodes,pos,spec)+nodes.map(n=>nodeHtml(n,pos[n.id],c.focus)).join("")+'</div></section>';
    const analysis=tabs.length?'<section class="pf-analysis card" id="pf-analysis"><div class="pf-tabs" role="tablist">'+tabs.map(([id,l])=>'<button type="button" role="tab" aria-selected="'+(id===tab)+'" class="pf-tab'+(id===tab?" on":"")+'" data-pf="tab" data-tab="'+esc(id)+'">'+esc(l)+'</button>').join("")+'</div><div class="pf-tabb">'+((spec.tabBody&&spec.tabBody(tab))||"")+'</div></section>':"";
    const side=(spec.side&&spec.side())||"";
    root.innerHTML='<div class="pf-shell">'+head+'<div class="pf-work'+(side||wide&&inspHtml?'':' pf-nos')+'"><div class="pf-main">'+board+(wide?'':inspHtml)+analysis+'</div>'+(side||(wide&&inspHtml)?'<aside class="pf-side card">'+(wide?inspHtml:'')+side+'</aside>':'')+'</div></div>';
    bindDrag();
  };
  function bindDrag(){
    const canvas=$("#pf-canvas",root);if(!canvas)return;
    $$(".pf-node",canvas).forEach(n=>n.addEventListener("pointerdown",e=>{
      if(e.target.closest(".pf-del")||e.button>0)return;e.preventDefault();n.setPointerCapture&&n.setPointerCapture(e.pointerId);c.drag={node:n,id:n.dataset.node,pid:e.pointerId,sx:e.clientX,sy:e.clientY,moved:false};
    }));
    canvas.addEventListener("pointermove",e=>{const d=c.drag;if(!d||e.pointerId!==d.pid)return;
      if(!d.moved&&Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<5)return;d.moved=true;d.node.classList.add("dragging");
      const r=canvas.getBoundingClientRect(),x=Math.max(6,Math.min(94,(e.clientX-r.left)/r.width*100)),y=Math.max(5,Math.min(95,(e.clientY-r.top)/r.height*100));
      d.node.style.left=x+"%";d.node.style.top=y+"%";d.node.dataset.x=x.toFixed(2);d.node.dataset.y=y.toFixed(2);
      const id=CSS.escape(d.id);$$('.pf-lines line[data-a="'+id+'"]',canvas).forEach(l=>{l.setAttribute("x1",x);l.setAttribute("y1",y)});$$('.pf-lines line[data-b="'+id+'"]',canvas).forEach(l=>{l.setAttribute("x2",x);l.setAttribute("y2",y)})});
    const end=e=>{const g=c.drag;if(!g||e.pointerId!==g.pid)return;c.drag=null;g.node.classList.remove("dragging");
      if(!g.moved)return;c.dragged=true;setTimeout(()=>{c.dragged=false},0);
      const all={};$$(".pf-node",canvas).forEach(n=>all[n.dataset.node]={x:+n.dataset.x,y:+n.dataset.y});
      if(c.spec.positions)c.spec.positions.set(c.narrow(),all)};
    canvas.addEventListener("pointerup",end);canvas.addEventListener("pointercancel",end);
    /* a click (mouse, touch, assistive or programmatic) toggles the box; a drag is not a click */
    canvas.addEventListener("click",e=>{const n=e.target.closest(".pf-node");if(!n||c.dragged||e.target.closest("[data-pf]"))return;const id=n.dataset.node;c.focus=c.focus===id?"":id;c.paint();if(c.focus&&innerWidth<=900)$(".pf-insp",root)?.scrollIntoView({block:"nearest",behavior:"smooth"})});
  }
  return c;
}
/* one set of listeners per host; they always speak to the studio mounted on it now */
function bind(root){
  const ctl=()=>root.__skStudio,spec=()=>(ctl()||{}).spec||{};
  root.addEventListener("change",e=>{const t=e.target,c=ctl();if(!c)return;if(t.id==="pf-subject"){c.focus="";spec().onSelect&&spec().onSelect(t.value);return}spec().onChange&&spec().onChange(e)});
  root.addEventListener("input",e=>{const s=spec();s.onInput&&s.onInput(e)});
  root.addEventListener("click",e=>{const b=e.target.closest("[data-pf]"),c=ctl();if(!b||!c||!root.contains(b))return;const a=b.dataset.pf,s=c.spec;
    if(a==="tab"){s.tab&&s.tab.set(b.dataset.tab);c.paint();$("#pf-analysis",root)?.scrollIntoView({block:"nearest",behavior:"smooth"})}
    else if(a==="focus-close"){c.focus="";c.paint()}
    else if(a==="focus"){c.focus=b.dataset.id;c.paint();if(innerWidth<=900)$(".pf-insp",root)?.scrollIntoView({block:"nearest",behavior:"smooth"})}
    else if(a==="relayout"){s.positions&&s.positions.reset(c.narrow());c.paint()}
    else if(a==="delete"){e.stopPropagation();if(c.focus===b.dataset.id)c.focus="";s.onDelete&&s.onDelete(b.dataset.id);c.paint()}
    else if(a==="go"){core()&&core().go(b.dataset.go)}
    else s.onAction&&s.onAction(a,b,e)});
  root.addEventListener("keydown",e=>{const n=e.target.closest&&e.target.closest(".pf-node"),c=ctl();if(c&&n&&(e.key==="Enter"||e.key===" ")&&e.target===n){e.preventDefault();c.focus=n.dataset.node;c.paint();$(".pf-insp",root)?.scrollIntoView({block:"nearest"})}});
  let t=0;addEventListener("resize",()=>{clearTimeout(t);t=setTimeout(()=>{const c=ctl();if(c&&root.isConnected&&$("#pf-canvas",root)&&(c.narrow()!==c.lastNarrow||(innerWidth>900)!==c.lastWide))c.paint()},180)});
}
function mount(root,spec){
  let c=root.__skStudio;
  if(!c){c=controller(root);root.__skStudio=c;bind(root)}
  if(c.spec!==spec){c.spec=spec;c.focus="";c.drag=null}
  return{paint:c.paint,focus:c.setFocus,focused:c.focused,narrow:c.narrow,spec};
}
SK.studio=Object.freeze({mount,layout,group,kv,formula,inspHead,link,checks,version:"1.0.0"});
})();
