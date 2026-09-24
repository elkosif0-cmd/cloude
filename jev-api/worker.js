const APP_ORIGINS = new Set([
  "https://aghnam-alwadi.pages.dev",
  "https://aghnam-alwadi-iphone.pages.dev"
]);
const PREVIEW_RES = [
  /^https:\/\/[a-z0-9-]+\.aghnam-alwadi\.pages\.dev$/i,
  /^https:\/\/[a-z0-9-]+\.aghnam-alwadi-iphone\.pages\.dev$/i
];
const PASSWORD_SALT_B64 = "Tf6IJk44RB0qtFk4g8MJrg==";
const PASSWORD_HASH_HEX = "dd6f8fb3cbf42ff53ea48896a01f72c32ff832f9e69781983ec5883fb8295b47";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

const enc = new TextEncoder();
const dec = new TextDecoder();

function allowedOrigin(origin) {
  return APP_ORIGINS.has(origin) || PREVIEW_RES.some(re=>re.test(origin || ""));
}
function cors(origin) {
  return {
    "access-control-allow-origin": allowedOrigin(origin) ? origin : "https://aghnam-alwadi.pages.dev",
    "access-control-allow-methods": "POST,GET,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-max-age": "86400",
    "vary": "Origin"
  };
}
function json(data, status=200, origin="") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {"content-type":"application/json; charset=utf-8", ...cors(origin)}
  });
}
function b64url(bytes) {
  let s="";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function fromB64(s) {
  const bin=atob(s), out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i);
  return out;
}
function fromHex(h) {
  const out=new Uint8Array(h.length/2);
  for(let i=0;i<out.length;i++) out[i]=parseInt(h.slice(i*2,i*2+2),16);
  return out;
}
function equalBytes(a,b) {
  if(a.length!==b.length) return false;
  let d=0;
  for(let i=0;i<a.length;i++) d |= a[i]^b[i];
  return d===0;
}
async function verifyPassword(password) {
  if(typeof password!=="string" || password.length<8 || password.length>128) return false;
  const salt=fromB64(PASSWORD_SALT_B64);
  const pass=enc.encode(password);
  const input=new Uint8Array(salt.length+pass.length);
  input.set(salt,0); input.set(pass,salt.length);
  const digest=new Uint8Array(await crypto.subtle.digest("SHA-256",input));
  return equalBytes(digest,fromHex(PASSWORD_HASH_HEX));
}
async function hmac(secret, text) {
  const key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC",key,enc.encode(text)));
}
async function makeSession(secret) {
  const payload={aud:"aghnam-jev",iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+SESSION_TTL_SECONDS};
  const body=b64url(enc.encode(JSON.stringify(payload)));
  const sig=b64url(await hmac(secret,body));
  return body+"."+sig;
}
async function checkSession(secret, token) {
  if(!token || !token.includes(".")) return false;
  const [body,sig]=token.split(".");
  const expected=b64url(await hmac(secret,body));
  if(sig.length!==expected.length) return false;
  let diff=0; for(let i=0;i<sig.length;i++) diff|=sig.charCodeAt(i)^expected.charCodeAt(i);
  if(diff!==0) return false;
  try {
    const p=JSON.parse(dec.decode(Uint8Array.from(atob(body.replace(/-/g,"+").replace(/_/g,"/") + "===".slice((body.length+3)%4)),c=>c.charCodeAt(0))));
    return p.aud==="aghnam-jev" && p.exp>Math.floor(Date.now()/1000);
  } catch { return false; }
}
function normalizeBody(x) {
  if(!x || typeof x!=="object") throw new Error("طلب غير صالح");
  const type=["noul","choice","score"].includes(x.type)?x.type:null;
  if(!type) throw new Error("نوع القرار غير صالح");
  const state=typeof x.state==="string"?x.state:JSON.stringify(x.state??"");
  const instructions=String(x.instructions||"").trim();
  if(!instructions || instructions.length>2000) throw new Error("السؤال مطلوب وبحد أقصى 2000 حرف");
  if(state.length>15000) throw new Error("حجم البيانات المرسلة أكبر من المسموح");
  const args={state,instructions};
  if(x.model) args.model=String(x.model).slice(0,80);
  if(type==="noul") {
    if(x.true_criteria!==undefined) args.true_criteria=String(x.true_criteria).slice(0,1200);
    if(x.false_criteria!==undefined) args.false_criteria=String(x.false_criteria).slice(0,1200);
  } else if(type==="choice") {
    const c=x.criteria;
    if(!c || typeof c!=="object" || Array.isArray(c) || Object.keys(c).length<2 || Object.keys(c).length>12) throw new Error("أدخل من 2 إلى 12 خيارًا");
    args.criteria=Object.fromEntries(Object.entries(c).map(([k,v])=>[String(k).slice(0,100),v==null?null:String(v).slice(0,600)]));
  } else {
    if(!Array.isArray(x.criteria) || x.criteria.length<2 || x.criteria.length>10) throw new Error("سلم التقييم يجب أن يحتوي من 2 إلى 10 مستويات");
    args.criteria=x.criteria.map(v=>String(v).slice(0,500));
  }
  return {tool:"jev_"+type,args};
}
async function callBridge(env, body) {
  const {tool,args}=normalizeBody(body);
  const rpc={jsonrpc:"2.0",id:crypto.randomUUID(),method:"tools/call",params:{name:tool,arguments:args}};
  const req=new Request("https://jev.internal/mcp/"+env.JEV_BRIDGE_TOKEN,{
    method:"POST",
    headers:{"content-type":"application/json","accept":"application/json","mcp-protocol-version":"2025-06-18"},
    body:JSON.stringify(rpc)
  });
  const resp=await env.JEV_BRIDGE.fetch(req);
  const raw=await resp.text();
  let data; try{data=JSON.parse(raw)}catch{throw new Error("استجابة غير صالحة من Jev")}
  if(!resp.ok || data?.error) throw new Error(data?.error?.message || "تعذر الاتصال بـ Jev");
  const result=data?.result||{};
  if(result.isError) throw new Error(result?.content?.[0]?.text || "Jev أعاد خطأ");
  let structured=result.structuredContent;
  if(!structured && result?.content?.[0]?.text) {
    try{structured=JSON.parse(result.content[0].text)}catch{structured={text:result.content[0].text}}
  }
  return structured || result;
}

export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    const origin=request.headers.get("origin")||"";
    if(request.method==="OPTIONS") {
      if(!allowedOrigin(origin)) return new Response(null,{status:403});
      return new Response(null,{status:204,headers:cors(origin)});
    }
    if(url.pathname==="/health") return json({ok:true,service:"Aghnam Jev API",bridge:"service-binding",version:"1.1.0"},200,origin);
    if(!allowedOrigin(origin)) return json({ok:false,error:"Origin not allowed"},403,origin);
    if(request.method!=="POST") return json({ok:false,error:"Method not allowed"},405,origin);
    if(!env.SESSION_SECRET || !env.JEV_BRIDGE_TOKEN || !env.JEV_BRIDGE) return json({ok:false,error:"الخدمة غير مهيأة"},503,origin);

    if(url.pathname==="/session") {
      try {
        let body; try{body=await request.json()}catch{return json({ok:false,error:"طلب غير صالح"},400,origin)}
        const ok=await verifyPassword(body?.password);
        if(!ok) return json({ok:false,error:"بيانات الدخول غير صحيحة"},401,origin);
        return json({ok:true,token:await makeSession(env.SESSION_SECRET),expires_in:SESSION_TTL_SECONDS},200,origin);
      } catch(e) {
        return json({ok:false,error:"تعذر إنشاء جلسة آمنة"},500,origin);
      }
    }

    if(url.pathname==="/api/jev") {
      const auth=request.headers.get("authorization")||"";
      const token=auth.startsWith("Bearer ")?auth.slice(7):"";
      if(!(await checkSession(env.SESSION_SECRET,token))) return json({ok:false,error:"جلسة Jev غير صالحة. أعد فتح التطبيق."},401,origin);
      try {
        const body=await request.json();
        const result=await callBridge(env,body);
        return json({ok:true,result},200,origin);
      } catch(e) {
        return json({ok:false,error:e?.message||String(e)},400,origin);
      }
    }
    return json({ok:false,error:"Not found"},404,origin);
  }
};