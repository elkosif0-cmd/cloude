/* S.kosif V38 — Adaptive Motion Layer
   Inspired by the uploaded interactive cosmic canvas, adapted for a business PWA:
   low-density particles, adaptive FPS, pointer shockwaves, reveal transitions,
   reduced-motion support, visibility pause, no audio, no DOM ownership. */
(()=>{
"use strict";
if(window.SKosifMotionV38)return;

const VERSION="38.0";
const PREF="skosif_v38_motion_mode";
const MODES=["flow","constellation","vortex","celebration","off"];
const MODE_LABELS={
  flow:"انسياب",
  constellation:"شبكة",
  vortex:"دوامة",
  celebration:"وميض",
  off:"إيقاف"
};
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const prefersReduced=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile=()=>matchMedia("(max-width:760px)").matches;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

let canvas,ctx,w=0,h=0,dpr=1,raf=0,running=false,mode=localStorage.getItem(PREF)||"flow";
let particles=[],waves=[],pointer={x:null,y:null,active:false};
let fps=60,frames=0,lastFps=performance.now(),slowSamples=0;
let baseCount=0,lastTheme="";

const palettes={
  light:["rgba(15,118,110,.34)","rgba(5,150,105,.28)","rgba(180,83,9,.26)","rgba(71,85,105,.18)"],
  dark:["rgba(52,211,153,.42)","rgba(56,189,248,.30)","rgba(251,191,36,.32)","rgba(148,163,184,.22)"],
  gourmet:["rgba(180,83,9,.34)","rgba(120,53,15,.28)","rgba(22,101,52,.25)","rgba(251,191,36,.20)"]
};

function themeKey(){
  const root=document.documentElement;
  const body=document.body;
  const t=(root.dataset.skTheme||body?.dataset.skTheme||"").toLowerCase();
  if(/dark|night|black|graphite|obsidian/.test(t)||root.classList.contains("dark"))return "dark";
  if(/gourmet|meat|royal|gold|eataly/.test(t))return "gourmet";
  return "light";
}
function colors(){return palettes[themeKey()]||palettes.light}

class Particle{
  constructor(initial=true){this.reset(initial)}
  reset(initial=false){
    this.x=initial?Math.random()*w:w/2+(Math.random()-.5)*120;
    this.y=initial?Math.random()*h:h/2+(Math.random()-.5)*120;
    const a=Math.random()*Math.PI*2,s=.12+Math.random()*.42;
    this.vx=Math.cos(a)*s;this.vy=Math.sin(a)*s;
    this.r=.45+Math.random()*1.35;
    this.a=.18+Math.random()*.45;
    this.seed=Math.random()*1000;
    this.life=120+Math.random()*220;
    const p=colors();this.color=p[(Math.random()*p.length)|0];
  }
  update(t){
    if(mode==="flow"||mode==="constellation"){
      const a=Math.sin((this.x+this.seed)*.0026)+Math.cos((this.y-this.seed)*.0031);
      this.vx+=Math.cos(a)*.010;
      this.vy+=Math.sin(a)*.010;
    }
    if(pointer.x!==null&&pointer.y!==null){
      const dx=pointer.x-this.x,dy=pointer.y-this.y,ds=dx*dx+dy*dy;
      if(ds>64&&ds<100000){
        const d=Math.sqrt(ds),f=(1-d/316);
        if(mode==="vortex"){
          const nx=dx/d,ny=dy/d;
          this.vx+=(nx*.015-ny*.032)*f;
          this.vy+=(ny*.015+nx*.032)*f;
        }else if(mode==="celebration"&&pointer.active){
          this.vx-=(dx/d)*.055*f;
          this.vy-=(dy/d)*.055*f;
        }else{
          this.vx+=(dx/d)*.007*f;
          this.vy+=(dy/d)*.007*f;
        }
      }
    }
    const max=mode==="celebration"?2.2:1.35;
    const sp=Math.hypot(this.vx,this.vy);
    if(sp>max){this.vx=this.vx/sp*max;this.vy=this.vy/sp*max}
    this.x+=this.vx;this.y+=this.vy;
    this.vx*=.992;this.vy*=.992;
    if(this.x<0)this.x=w;if(this.x>w)this.x=0;if(this.y<0)this.y=h;if(this.y>h)this.y=0;
    if(mode==="celebration"&&--this.life<=0)this.reset(false);
    this.pulse=.78+.22*Math.sin(t*.0015+this.seed);
  }
  draw(){
    ctx.globalAlpha=this.a*(this.pulse||1);
    ctx.fillStyle=this.color;
    ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();
  }
}
class Wave{
  constructor(x,y,strong=false){this.x=x;this.y=y;this.r=4;this.alpha=strong?.55:.34;this.speed=strong?8:5;this.max=Math.min(Math.max(w,h)*.32,360)}
  update(){this.r+=this.speed;this.speed*=.974;this.alpha-=.018;return this.alpha>0&&this.r<this.max}
  draw(){
    const p=colors();ctx.globalAlpha=Math.max(0,this.alpha);ctx.strokeStyle=p[0];ctx.lineWidth=1.4;
    ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.stroke();
  }
}
function desiredCount(){
  if(mode==="off"||prefersReduced())return 0;
  const area=(w*h)/900000;
  const base=isMobile()?52:110;
  const factor=mode==="constellation"?.85:1;
  return Math.round(clamp(base*area*factor,isMobile()?34:60,isMobile()?90:180));
}
function initParticles(){
  baseCount=desiredCount();
  particles=Array.from({length:baseCount},()=>new Particle(true));
}
function resize(){
  if(!canvas)return;
  dpr=Math.min(devicePixelRatio||1,isMobile()?1.25:1.5);
  w=innerWidth;h=innerHeight;
  canvas.width=Math.max(1,Math.floor(w*dpr));canvas.height=Math.max(1,Math.floor(h*dpr));
  canvas.style.width=w+"px";canvas.style.height=h+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
  initParticles();
}
function drawConnections(){
  if(mode!=="constellation"||particles.length>150)return;
  ctx.lineWidth=.45;
  const maxD=isMobile()?68:82,max2=maxD*maxD;
  for(let i=0;i<particles.length;i+=2){
    const a=particles[i];
    for(let j=i+1;j<Math.min(particles.length,i+18);j+=2){
      const b=particles[j],dx=a.x-b.x,dy=a.y-b.y,ds=dx*dx+dy*dy;
      if(ds<max2){
        ctx.globalAlpha=(1-Math.sqrt(ds)/maxD)*.15;
        ctx.strokeStyle=a.color;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
    }
  }
}
function adaptFps(now){
  frames++;
  if(now-lastFps<1000)return;
  fps=Math.round(frames*1000/(now-lastFps));frames=0;lastFps=now;
  if(fps<42)slowSamples++;else slowSamples=Math.max(0,slowSamples-1);
  if(slowSamples>=2&&particles.length>30){
    particles.splice(0,Math.ceil(particles.length*.18));slowSamples=0;
  }
  const badge=$("#sk38-fps");if(badge)badge.textContent=fps+" FPS";
}
function loop(now){
  if(!running)return;
  raf=requestAnimationFrame(loop);
  adaptFps(now);
  ctx.clearRect(0,0,w,h);
  ctx.globalCompositeOperation=themeKey()==="dark"?"screen":"source-over";
  for(const p of particles){p.update(now);p.draw()}
  drawConnections();
  for(let i=waves.length-1;i>=0;i--){
    const v=waves[i];v.draw();if(!v.update())waves.splice(i,1);
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation="source-over";
}
function start(){
  if(running||mode==="off"||prefersReduced())return;
  running=true;lastFps=performance.now();frames=0;raf=requestAnimationFrame(loop);
  document.documentElement.classList.add("sk38-motion-on");
}
function stop(){
  running=false;if(raf)cancelAnimationFrame(raf);raf=0;
  if(ctx)ctx.clearRect(0,0,w,h);
  document.documentElement.classList.remove("sk38-motion-on");
}
function setMode(next){
  if(!MODES.includes(next))next="flow";
  mode=next;localStorage.setItem(PREF,mode);
  if(mode==="off"||prefersReduced())stop();else{initParticles();start()}
  updateControl();
  toast("الحركة: "+MODE_LABELS[mode]);
}
function cycleMode(){
  const i=MODES.indexOf(mode),next=MODES[(i+1)%MODES.length];
  setMode(next);
}
function shock(x,y,strong=false){
  if(mode==="off"||prefersReduced())return;
  waves.push(new Wave(x,y,strong));
  if(strong||mode==="celebration"){
    const add=isMobile()?7:12;
    for(let i=0;i<add;i++){
      const p=new Particle(false),a=Math.random()*Math.PI*2,s=.8+Math.random()*2.2;
      p.x=x;p.y=y;p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s;p.life=45+Math.random()*80;particles.push(p);
    }
    const limit=desiredCount()+24;if(particles.length>limit)particles.splice(0,particles.length-limit);
  }
  ring(x,y);
}
function ring(x,y){
  let r=$("#sk38-ring");
  if(!r){document.body.insertAdjacentHTML("beforeend",'<div id="sk38-ring" class="sk38-ring"></div>');r=$("#sk38-ring")}
  r.style.left=x+"px";r.style.top=y+"px";
  r.classList.remove("go");void r.offsetWidth;r.classList.add("go");
}
function toast(msg){
  let t=$("#sk38-toast");
  if(!t){document.body.insertAdjacentHTML("beforeend",'<div id="sk38-toast" class="sk38-toast"></div>');t=$("#sk38-toast")}
  t.textContent=msg;t.classList.add("show");clearTimeout(t._tm);t._tm=setTimeout(()=>t.classList.remove("show"),1800);
}
function ensureCanvas(){
  if($("#skosif-motion-canvas"))return;
  canvas=document.createElement("canvas");canvas.id="skosif-motion-canvas";canvas.setAttribute("aria-hidden","true");
  document.body.appendChild(canvas);ctx=canvas.getContext("2d",{alpha:true,desynchronized:true});
  resize();
}
function ensureAmbient(){
  if($("#sk38-ambient"))return;
  const d=document.createElement("div");d.id="sk38-ambient";d.setAttribute("aria-hidden","true");
  d.innerHTML='<i></i><i></i>';document.body.appendChild(d);
}
function ensureControl(){
  if($("#sk38-motion-btn"))return;
  const b=document.createElement("button");b.id="sk38-motion-btn";b.type="button";b.className="sk38-motion-btn";b.title="أنماط الحركة";b.innerHTML='<i>✦</i><span id="sk38-motion-label"></span><small id="sk38-fps"></small>';
  b.onclick=cycleMode;
  const host=$("#sx-taskbar .sx-status");
  if(host)host.prepend(b);else document.body.appendChild(b);
  updateControl();
}
function updateControl(){
  const b=$("#sk38-motion-btn");if(!b)return;
  b.classList.toggle("off",mode==="off"||prefersReduced());
  const l=$("#sk38-motion-label");if(l)l.textContent=prefersReduced()?"تقليل الحركة":MODE_LABELS[mode];
}
function reveal(root=document){
  const nodes=root.querySelectorAll?.(".sk-module,.sk-kpi,.sk34-match,.sk35-features article,.sk37-cut,.card,.stat-card,.modal-card,.dlg,.panel");
  if(!nodes)return;
  let i=0;for(const el of nodes){
    if(el.dataset.sk38Reveal==="1")continue;
    el.dataset.sk38Reveal="1";el.classList.add("sk38-reveal");
    el.style.setProperty("--sk38-delay",Math.min(i++,7)*28+"ms");
  }
}
function bindPointer(){
  addEventListener("pointermove",e=>{
    if(mode==="off"||prefersReduced())return;
    pointer.x=e.clientX;pointer.y=e.clientY;
  },{passive:true});
  addEventListener("pointerdown",e=>{
    if(mode==="off"||prefersReduced())return;
    pointer.active=true;pointer.x=e.clientX;pointer.y=e.clientY;
    const interactive=e.target.closest?.("input,textarea,select,[contenteditable=true]");
    if(!interactive)shock(e.clientX,e.clientY,mode==="celebration");
  },{passive:true,capture:true});
  addEventListener("pointerup",()=>pointer.active=false,{passive:true});
  addEventListener("pointerleave",()=>{pointer.active=false;pointer.x=null;pointer.y=null},{passive:true});
}
function observe(){
  const mo=new MutationObserver(ms=>{
    for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)reveal(n);
    ensureControl();
  });
  mo.observe(document.documentElement,{subtree:true,childList:true});
}
function syncTheme(){
  const k=themeKey();if(k===lastTheme)return;lastTheme=k;
  for(const p of particles){const c=colors();p.color=c[(Math.random()*c.length)|0]}
}
function boot(){
  ensureAmbient();ensureCanvas();ensureControl();bindPointer();observe();reveal();
  addEventListener("resize",()=>resize(),{passive:true});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();else if(mode!=="off"&&!prefersReduced())start()});
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener?.("change",()=>{updateControl();prefersReduced()?stop():mode!=="off"&&start()});
  setInterval(syncTheme,1200);
  if(mode!=="off"&&!prefersReduced())start();
  window.SKosifMotionV38=Object.freeze({
    version:VERSION,
    get mode(){return mode},
    setMode,
    cycleMode,
    shockwave:shock,
    get fps(){return fps},
    get particleCount(){return particles.length}
  });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();