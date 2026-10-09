/* SQC — «عالم البلورات»: a living ice world behind the front door and the command center (window.SQCCrystal).
   Original work, written for SQC: procedural low-poly ice shards that drift, breathe and catch a cold key light,
   fog that swallows the far ones, falling snow, and a cursor / touch / scroll parallax. Plain WebGL, no library, no
   assets, ~20 KB, so it loads offline with the PWA and never delays the page: the page paints first, the world
   fades in after.
   Respect: `prefers-reduced-motion` renders one still frame (no animation); a hidden tab or a canvas out of view
   stops the loop; the device pixel ratio is capped (1 on phones) and the shard count follows the device.
   API: SQCCrystal.mount(canvas, opts) → world | null (no WebGL). world.setMood("open"|"locked"|"unlock"),
   world.pulse(), world.destroy(). opts: {density:0..1, interactive:bool, scroll:bool, still:bool}. */
(function(){
"use strict";
if(window.SQCCrystal)return;
const reduce=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return false}};
/* a small deterministic random so the world looks the same on every visit of a device */
function rng(seed){let s=seed>>>0||1;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}

/* ---------- geometry: an ice shard = a stretched, slightly irregular hexagonal prism with pointed ends ---------- */
function shard(r,len,irr,rand){
  const ring=[],n=6;
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2,k=1+(rand()-.5)*irr;ring.push([Math.cos(a)*r*k,Math.sin(a)*r*k])}
  const top=len*(0.55+rand()*0.25),bot=-len*(0.55+rand()*0.25),cap=len*0.35,pos=[];
  const tri=(a,b,c)=>pos.push(...a,...b,...c);
  const mid=(p,z)=>[p[0],p[1],z];
  for(let i=0;i<n;i++){
    const a=ring[i],b=ring[(i+1)%n];
    /* side quad as two triangles (flat shading comes from per-face normals computed below) */
    tri(mid(a,bot),mid(b,bot),mid(b,top));tri(mid(a,bot),mid(b,top),mid(a,top));
    /* pointed caps */
    tri(mid(a,top),mid(b,top),[0,0,top+cap]);tri(mid(b,bot),mid(a,bot),[0,0,bot-cap]);
  }
  /* per-face normals */
  const nor=[];
  for(let i=0;i<pos.length;i+=9){
    const ax=pos[i+3]-pos[i],ay=pos[i+4]-pos[i+1],az=pos[i+5]-pos[i+2],bx=pos[i+6]-pos[i],by=pos[i+7]-pos[i+1],bz=pos[i+8]-pos[i+2];
    let nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
    for(let k=0;k<3;k++)nor.push(nx,ny,nz);
  }
  return{pos:new Float32Array(pos),nor:new Float32Array(nor),count:pos.length/3};
}

/* ---------- shaders ---------- */
const VS=`attribute vec3 aPos;attribute vec3 aNor;
uniform mat4 uProj,uView,uModel;uniform mat3 uNormal;
varying vec3 vN;varying vec3 vP;varying float vDepth;
void main(){vec4 w=uModel*vec4(aPos,1.0);vP=w.xyz;vN=normalize(uNormal*aNor);vec4 v=uView*w;vDepth=-v.z;gl_Position=uProj*v;}`;
const FS=`precision mediump float;
varying vec3 vN;varying vec3 vP;varying float vDepth;
uniform vec3 uEye,uKey,uFog,uTint,uIceA,uIceB,uSkyA,uSkyB,uRim;uniform float uTime,uGlow,uFogNear,uFogFar;
void main(){
  vec3 N=normalize(vN),V=normalize(uEye-vP),L=normalize(uKey);
  float ndl=max(dot(N,L),0.0);
  /* the palette of the identity on screen (PALETTES below): a dark body turning to the accent on the upper facets, a sky
     "reflected" by the facet, a fresnel rim and a sharp key highlight */
  vec3 ice=mix(uIceA,uIceB,N.y*0.5+0.5);
  vec3 sky=mix(uSkyA,uSkyB,smoothstep(-0.6,0.9,reflect(-V,N).y));
  float fres=pow(1.0-max(dot(N,V),0.0),2.6);
  vec3 H=normalize(L+V);float spec=pow(max(dot(N,H),0.0),64.0);
  vec3 c=ice*(0.35+0.65*ndl)+sky*0.35+uRim*fres*0.9+vec3(1.0)*spec*0.8;
  c=mix(c,c*uTint,0.6);
  c+=uTint*uGlow*0.35*fres;
  float fog=smoothstep(uFogNear,uFogFar,vDepth);
  c=mix(c,uFog,fog);
  gl_FragColor=vec4(c,1.0);
}`;
const SVS=`attribute vec3 aPos;attribute float aSize;uniform mat4 uProj,uView;uniform float uTime,uDpr;varying float vA;
void main(){vec3 p=aPos;p.y=mod(p.y-uTime*(0.25+aSize*0.15),16.0)-8.0;p.x+=sin(uTime*0.6+p.z*3.1+aSize*7.0)*0.25;
vec4 v=uView*vec4(p,1.0);gl_Position=uProj*v;float d=-v.z;gl_PointSize=(1.5+aSize*3.5)*uDpr*clamp(10.0/d,0.2,2.5);vA=clamp(1.2-d/22.0,0.05,0.8);}`;
const SFS=`precision mediump float;varying float vA;uniform vec3 uSnow;void main(){vec2 d=gl_PointCoord-0.5;float r=dot(d,d);if(r>0.25)discard;float a=smoothstep(0.25,0.0,r)*vA;gl_FragColor=vec4(uSnow,a);}`;

function compile(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const m=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error("shader: "+m)}return s}
/* linking is started here and never waited for: reading LINK_STATUS (or any uniform location) before the driver has finished
   blocks the main thread — on some machines for tens of seconds (an Intel/ANGLE D3D11 compile measured at 38 s on 2026-10-07).
   With KHR_parallel_shader_compile the world polls COMPLETION_STATUS_KHR each frame and draws once both programs are ready. */
function link(gl,vs,fs){const p=gl.createProgram();gl.attachShader(p,compile(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);return p}
const SLOW_KEY="sqc_world_slow";
function program(gl,vs,fs){const p=link(gl,vs,fs);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error("program: "+gl.getProgramInfoLog(p));return p}

/* ---------- tiny matrix helpers (column-major, like WebGL) ---------- */
function perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),nf=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0])}
function lookAt(eye,at,up){const z=norm3(sub3(eye,at)),x=norm3(cross3(up,z)),y=cross3(z,x);
  return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot3(x,eye),-dot3(y,eye),-dot3(z,eye),1])}
function model(p,rx,ry,rz,s){const cx=Math.cos(rx),sx=Math.sin(rx),cy=Math.cos(ry),sy=Math.sin(ry),cz=Math.cos(rz),sz=Math.sin(rz);
  /* R = Rz*Ry*Rx, scaled */
  const m=new Float32Array(16);
  m[0]=(cz*cy)*s;m[1]=(sz*cy)*s;m[2]=(-sy)*s;m[3]=0;
  m[4]=(cz*sy*sx-sz*cx)*s;m[5]=(sz*sy*sx+cz*cx)*s;m[6]=(cy*sx)*s;m[7]=0;
  m[8]=(cz*sy*cx+sz*sx)*s;m[9]=(sz*sy*cx-cz*sx)*s;m[10]=(cy*cx)*s;m[11]=0;
  m[12]=p[0];m[13]=p[1];m[14]=p[2];m[15]=1;return m}
function normalMat(m){/* rotation part only (uniform scale): the 3x3 of the model matrix, renormalised */
  const n=new Float32Array(9);for(let c=0;c<3;c++){const x=m[c*4],y=m[c*4+1],z=m[c*4+2],l=Math.hypot(x,y,z)||1;n[c*3]=x/l;n[c*3+1]=y/l;n[c*3+2]=z/l}return n}
const sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot3=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm3=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]};
const lerp=(a,b,t)=>a+(b-a)*t;

const MOODS={open:{tint:[0.72,0.94,1.0],fog:[0.02,0.03,0.11],glow:0.6,speed:1},
  locked:{tint:[0.5,0.62,0.86],fog:[0.016,0.02,0.08],glow:0.25,speed:0.55},
  unlock:{tint:[0.86,0.98,1.0],fog:[0.05,0.07,0.2],glow:1.6,speed:1.6}};
/* R20 (FOUNDATION §3.11.2, one identity): the world wears the identity on screen. «دفتر KOSIF» (data-brand="ledger", the
   default) is amber glass on warm ink — ink #1d1814 turning to saffron #d9530e, a cream sky and ember-coloured snow;
   «كوبالت وجليد» keeps its night cobalt and ice. mount(…, {palette}) chooses; without it the page's data-brand decides. */
const PALETTES={
  cobalt:{iceA:[0.043,0.063,0.19],iceB:[0.10,0.76,0.85],skyA:[0.03,0.04,0.12],skyB:[0.86,0.95,1.0],rim:[0.60,0.93,0.97],snow:[0.85,0.95,1.0],moods:MOODS},
  ledger:{iceA:[0.114,0.094,0.078],iceB:[0.85,0.33,0.055],skyA:[0.086,0.075,0.063],skyB:[0.98,0.95,0.90],rim:[0.98,0.76,0.55],snow:[1.0,0.9,0.78],
    moods:{open:{tint:[1.0,0.86,0.72],fog:[0.07,0.058,0.047],glow:0.6,speed:1},
      locked:{tint:[0.82,0.66,0.52],fog:[0.05,0.042,0.034],glow:0.25,speed:0.55},
      unlock:{tint:[1.0,0.93,0.82],fog:[0.11,0.085,0.065],glow:1.6,speed:1.6}}}};
const paletteOf=name=>PALETTES[name]||PALETTES[(()=>{try{return document.documentElement.dataset.brand==="ledger"?"ledger":"cobalt"}catch{return"cobalt"}})()];

function mount(canvas,opts){
  opts=Object.assign({density:1,interactive:true,scroll:true,still:false,seed:20261005},opts||{});
  const P=paletteOf(opts.palette),MO=P.moods;
  let gl=null;try{gl=canvas.getContext("webgl",{antialias:true,alpha:true,premultipliedAlpha:true,powerPreference:"low-power"})||canvas.getContext("experimental-webgl")}catch{gl=null}
  if(!gl)return null;
  try{if(localStorage.getItem(SLOW_KEY))return null}catch{}
  let prog,sprog,buffers=[],snowBuf,snowN=0,loc=null,sloc=null;
  const par=gl.getExtension("KHR_parallel_shader_compile"),linkedAt=performance.now();
  try{prog=link(gl,VS,FS);sprog=link(gl,SVS,SFS)}catch(e){return null}
  const rand=rng(opts.seed);
  const phone=Math.min(innerWidth,innerHeight)<720,cores=navigator.hardwareConcurrency||4,mem=navigator.deviceMemory||4;
  const budget=(phone?14:30)*(cores<=4||mem<=4?0.7:1)*opts.density;
  const N=Math.max(6,Math.round(budget));
  const items=[];let built=false;
  /* ready(): both programs linked. With the extension this never blocks; without it the first status read blocks once, and a
     device where that took long keeps its still background from then on (SLOW_KEY) */
  function ready(){
    if(built)return true;
    if(par&&!(gl.getProgramParameter(prog,par.COMPLETION_STATUS_KHR)&&gl.getProgramParameter(sprog,par.COMPLETION_STATUS_KHR))){
      if(performance.now()-linkedAt>12000){remember();world.destroy()}return false}
    const t=performance.now(),ok=gl.getProgramParameter(prog,gl.LINK_STATUS)&&gl.getProgramParameter(sprog,gl.LINK_STATUS);
    if(performance.now()-t>1500)remember();
    if(!ok){world.destroy();return false}
    build();return true;
  }
  function remember(){try{localStorage.setItem(SLOW_KEY,"1")}catch{}}
  function build(){
  /* the shards: one geometry each (a few variants would do, but N is small), scattered in a slab in front of the camera */
  for(let i=0;i<N;i++){
    const g=shard(0.35+rand()*0.5,1.2+rand()*2.2,0.45,rand);
    const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,g.pos,gl.STATIC_DRAW);
    const nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,g.nor,gl.STATIC_DRAW);
    buffers.push(b,nb);
    const depth=-(4+rand()*14);
    items.push({pos:b,nor:nb,count:g.count,p:[(rand()-.5)*(16+Math.abs(depth)*0.6),(rand()-.5)*10,depth],
      r:[rand()*6.28,rand()*6.28,rand()*6.28],w:[(rand()-.5)*0.25,(rand()-.5)*0.35,(rand()-.5)*0.2],
      s:0.6+rand()*0.9,bob:rand()*6.28,bobA:0.15+rand()*0.35});
  }
  /* snow */
  {const n=phone?160:360,a=new Float32Array(n*4);for(let i=0;i<n;i++){a[i*4]=(rand()-.5)*24;a[i*4+1]=(rand()-.5)*16;a[i*4+2]=-(2+rand()*18);a[i*4+3]=rand()}
    snowBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,snowBuf);gl.bufferData(gl.ARRAY_BUFFER,a,gl.STATIC_DRAW);snowN=n}
  const U=n=>gl.getUniformLocation(prog,n),A=n=>gl.getAttribLocation(prog,n);
  loc={proj:U("uProj"),view:U("uView"),model:U("uModel"),normal:U("uNormal"),eye:U("uEye"),key:U("uKey"),fog:U("uFog"),tint:U("uTint"),time:U("uTime"),glow:U("uGlow"),fogNear:U("uFogNear"),fogFar:U("uFogFar"),iceA:U("uIceA"),iceB:U("uIceB"),skyA:U("uSkyA"),skyB:U("uSkyB"),rim:U("uRim"),aPos:A("aPos"),aNor:A("aNor")};
  sloc={proj:gl.getUniformLocation(sprog,"uProj"),view:gl.getUniformLocation(sprog,"uView"),time:gl.getUniformLocation(sprog,"uTime"),dpr:gl.getUniformLocation(sprog,"uDpr"),snow:gl.getUniformLocation(sprog,"uSnow"),aPos:gl.getAttribLocation(sprog,"aPos"),aSize:gl.getAttribLocation(sprog,"aSize")};
  gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  built=true;
  }

  const state={mood:MO.open,cur:{tint:MO.open.tint.slice(),fog:MO.open.fog.slice(),glow:MO.open.glow,speed:1},px:0,py:0,tx:0,ty:0,scroll:0,pulse:0,alive:true,visible:true,dpr:1,w:0,h:0,t0:performance.now(),frames:0,last:0};
  let raf=0,still=opts.still||reduce();

  function resize(){
    const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,phone?1:1.5);
    const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));
    if(w!==canvas.width||h!==canvas.height){canvas.width=w;canvas.height=h}
    state.w=w;state.h=h;state.dpr=dpr;gl.viewport(0,0,w,h);
  }
  function frame(now){
    raf=0;if(!state.alive)return;
    if(!ready()){if(state.alive)raf=requestAnimationFrame(frame);return}
    resize();
    const t=(now-state.t0)/1000;state.frames++;state.last=now;
    /* ease towards the mood and the pointer */
    const c=state.cur,m=state.mood,k=0.04;
    for(let i=0;i<3;i++){c.tint[i]=lerp(c.tint[i],m.tint[i],k);c.fog[i]=lerp(c.fog[i],m.fog[i],k)}
    c.glow=lerp(c.glow,m.glow+state.pulse,k);c.speed=lerp(c.speed,m.speed,k);state.pulse*=0.92;
    state.px=lerp(state.px,state.tx,0.06);state.py=lerp(state.py,state.ty,0.06);
    const aspect=state.w/state.h;
    const eye=[state.px*1.6+Math.sin(t*0.11)*0.6,0.4+state.py*1.0+Math.cos(t*0.09)*0.4,6.5-state.scroll*4];
    const view=lookAt(eye,[state.px*0.4,state.py*0.3-state.scroll*1.5,-8],[0,1,0]),proj=perspective(0.95,aspect,0.1,60);
    gl.clearColor(c.fog[0],c.fog[1],c.fog[2],0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(prog);
    gl.uniformMatrix4fv(loc.proj,false,proj);gl.uniformMatrix4fv(loc.view,false,view);
    gl.uniform3fv(loc.eye,eye);gl.uniform3f(loc.key,0.5,0.9,0.6);gl.uniform3fv(loc.fog,c.fog);gl.uniform3fv(loc.tint,c.tint);
    gl.uniform1f(loc.time,t);gl.uniform1f(loc.glow,c.glow);gl.uniform3fv(loc.iceA,P.iceA);gl.uniform3fv(loc.iceB,P.iceB);gl.uniform3fv(loc.skyA,P.skyA);gl.uniform3fv(loc.skyB,P.skyB);gl.uniform3fv(loc.rim,P.rim);gl.uniform1f(loc.fogNear,6);gl.uniform1f(loc.fogFar,24);
    gl.enableVertexAttribArray(loc.aPos);gl.enableVertexAttribArray(loc.aNor);
    const sp=c.speed;
    for(const it of items){
      const rx=it.r[0]+t*it.w[0]*sp,ry=it.r[1]+t*it.w[1]*sp,rz=it.r[2]+t*it.w[2]*sp;
      const y=it.p[1]+Math.sin(t*0.5*sp+it.bob)*it.bobA;
      const M=model([it.p[0],y,it.p[2]],rx,ry,rz,it.s);
      gl.uniformMatrix4fv(loc.model,false,M);gl.uniformMatrix3fv(loc.normal,false,normalMat(M));
      gl.bindBuffer(gl.ARRAY_BUFFER,it.pos);gl.vertexAttribPointer(loc.aPos,3,gl.FLOAT,false,0,0);
      gl.bindBuffer(gl.ARRAY_BUFFER,it.nor);gl.vertexAttribPointer(loc.aNor,3,gl.FLOAT,false,0,0);
      gl.drawArrays(gl.TRIANGLES,0,it.count);
    }
    gl.disableVertexAttribArray(loc.aNor);
    /* snow, additive over the shards */
    gl.useProgram(sprog);gl.depthMask(false);gl.blendFunc(gl.ONE,gl.ONE);
    gl.uniformMatrix4fv(sloc.proj,false,proj);gl.uniformMatrix4fv(sloc.view,false,view);gl.uniform1f(sloc.time,t*sp);gl.uniform1f(sloc.dpr,state.dpr);gl.uniform3fv(sloc.snow,P.snow);
    gl.bindBuffer(gl.ARRAY_BUFFER,snowBuf);gl.enableVertexAttribArray(sloc.aPos);gl.enableVertexAttribArray(sloc.aSize);
    gl.vertexAttribPointer(sloc.aPos,3,gl.FLOAT,false,16,0);gl.vertexAttribPointer(sloc.aSize,1,gl.FLOAT,false,16,12);
    gl.drawArrays(gl.POINTS,0,snowN);
    gl.disableVertexAttribArray(sloc.aSize);gl.depthMask(true);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    if(!still&&state.visible)raf=requestAnimationFrame(frame);
  }
  const kick=()=>{if(state.alive&&!raf)raf=requestAnimationFrame(frame)};
  /* input */
  const onMove=e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;state.tx=(x-.5)*2;state.ty=-(y-.5)*2;if(still)kick()};
  const onTouch=e=>{const t=e.touches&&e.touches[0];if(t)onMove(t)};
  const onLeave=()=>{state.tx=0;state.ty=0};
  const onScroll=()=>{const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);state.scroll=Math.min(1,(scrollY||0)/Math.min(max,900));if(still)kick()};
  if(opts.interactive){addEventListener("pointermove",onMove,{passive:true});addEventListener("touchmove",onTouch,{passive:true});addEventListener("pointerleave",onLeave)}
  if(opts.scroll)addEventListener("scroll",onScroll,{passive:true});
  const onVis=()=>{state.visible=!document.hidden&&io_visible;if(state.visible)kick()};
  let io_visible=true,io=null;
  if("IntersectionObserver" in window){io=new IntersectionObserver(es=>{io_visible=es.some(x=>x.isIntersecting);onVis()},{threshold:0});io.observe(canvas)}
  document.addEventListener("visibilitychange",onVis);
  addEventListener("resize",()=>{resize();if(still)kick()},{passive:true});
  const mq=(()=>{try{return matchMedia("(prefers-reduced-motion: reduce)")}catch{return null}})();
  const onMq=()=>{still=opts.still||reduce();kick()};
  mq&&mq.addEventListener&&mq.addEventListener("change",onMq);
  kick();
  const world={
    canvas,gl,ready:()=>built,
    setMood(name){state.mood=MO[name]||MO.open;kick()},palette:()=>P===PALETTES.ledger?"ledger":"cobalt",
    pulse(k){state.pulse=Math.min(3,(state.pulse||0)+(k==null?1:k));kick()},
    frames:()=>state.frames,still:()=>still,shards:()=>items.length,
    destroy(){state.alive=false;if(raf)cancelAnimationFrame(raf);raf=0;
      if(opts.interactive){removeEventListener("pointermove",onMove);removeEventListener("touchmove",onTouch);removeEventListener("pointerleave",onLeave)}
      if(opts.scroll)removeEventListener("scroll",onScroll);document.removeEventListener("visibilitychange",onVis);io&&io.disconnect();mq&&mq.removeEventListener&&mq.removeEventListener("change",onMq);
      try{buffers.forEach(b=>gl.deleteBuffer(b));gl.deleteBuffer(snowBuf);gl.deleteProgram(prog);gl.deleteProgram(sprog);const x=gl.getExtension("WEBGL_lose_context");x&&x.loseContext()}catch{}}
  };
  return world;
}
window.SQCCrystal=Object.freeze({mount,shard,MOODS,PALETTES,version:"1.1.0"});
})();
