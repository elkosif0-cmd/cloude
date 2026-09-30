const VERSION = "0.8.3";
const CAPABILITY_MESH_VERSION = "2.0.1";
const AUTH0_ISSUER = "https://dev-zn5bwigg38b13ui8.us.auth0.com/";
const AUTH0_AUDIENCE = "https://kosif-think-mcp.kosif199022.workers.dev";
const AUTH0_JWKS = AUTH0_ISSUER + ".well-known/jwks.json";
const OAUTH_METADATA_URL = AUTH0_AUDIENCE + "/.well-known/oauth-protected-resource";
const FAST_AGENTS = [
  { id:"solver", source:"cloudflare", model:"@cf/meta/llama-3.3-70b-instruct-fp8-fast", role:"Lead solver: build the strongest answer and test feasibility." },
  { id:"skeptic", source:"cloudflare", model:"@cf/mistralai/mistral-small-3.1-24b-instruct", role:"Skeptical critic: find weak assumptions, contradictions, missing evidence, and downside risk." },
  { id:"alternatives", source:"cloudflare", model:"@cf/meta/llama-4-scout-17b-16e-instruct", role:"Alternatives analyst: compare approaches, identify overlooked options, and test trade-offs." }
];
const FRONTIER_AGENTS = [
  { id:"gpt", source:"cleanapis", model:"gpt-5.6-sol", role:"Lead frontier solver: produce the strongest feasible solution and challenge hidden assumptions." },
  { id:"claude", source:"cleanapis", model:"claude-opus-5", role:"Deep skeptical reviewer: stress-test logic, evidence, edge cases, and downside risk." },
  { id:"gemini", source:"cleanapis", model:"gemini-3.7-flash", micro:true, role:"Alternative-path analyst: compare approaches, surface missing options, and test trade-offs." },
  { id:"mythos", source:"cleanapis", model:"claude-mythos-preview", micro:true, role:"Adversarial scenario architect: test counterfactuals, failure modes, and hidden second-order effects." },
  { id:"fable", source:"cleanapis", model:"claude-fable-5.1", micro:true, role:"Creative synthesis challenger: seek unconventional but defensible alternatives and expose framing bias." }
];

const RUNTIME_DIAGNOSTICS = {
  startedAt: null,
  calls: 0,
  errors: 0,
  fallbacks: 0,
  degraded: 0,
  toolCounts: Object.create(null),
  modeCounts: Object.create(null),
  latencies: []
};
const FRONTIER_CIRCUIT = new Map();

function percentile(values,p){
  if(!values.length) return 0;
  const a=values.slice().sort((x,y)=>x-y);
  const i=Math.min(a.length-1,Math.max(0,Math.ceil(p*a.length)-1));
  return a[i];
}
function recordDiagnostic(tool,durationMs,meta={}){
  if(!RUNTIME_DIAGNOSTICS.startedAt) RUNTIME_DIAGNOSTICS.startedAt=Date.now();
  RUNTIME_DIAGNOSTICS.calls++;
  RUNTIME_DIAGNOSTICS.toolCounts[tool]=(RUNTIME_DIAGNOSTICS.toolCounts[tool]||0)+1;
  if(meta.error) RUNTIME_DIAGNOSTICS.errors++;
  if(meta.fallback) RUNTIME_DIAGNOSTICS.fallbacks++;
  if(meta.degraded) RUNTIME_DIAGNOSTICS.degraded++;
  if(meta.mode) RUNTIME_DIAGNOSTICS.modeCounts[meta.mode]=(RUNTIME_DIAGNOSTICS.modeCounts[meta.mode]||0)+1;
  RUNTIME_DIAGNOSTICS.latencies.push(Math.max(0,Number(durationMs)||0));
  if(RUNTIME_DIAGNOSTICS.latencies.length>200) RUNTIME_DIAGNOSTICS.latencies.splice(0,RUNTIME_DIAGNOSTICS.latencies.length-200);
}
function diagnosticsSnapshot(){
  if(!RUNTIME_DIAGNOSTICS.startedAt) RUNTIME_DIAGNOSTICS.startedAt=Date.now();
  const a=RUNTIME_DIAGNOSTICS.latencies;
  return {
    scope:"ephemeral-worker-isolate",
    startedAt:new Date(RUNTIME_DIAGNOSTICS.startedAt).toISOString(),
    uptimeMs:Date.now()-RUNTIME_DIAGNOSTICS.startedAt,
    calls:RUNTIME_DIAGNOSTICS.calls,
    errors:RUNTIME_DIAGNOSTICS.errors,
    fallbacks:RUNTIME_DIAGNOSTICS.fallbacks,
    degraded:RUNTIME_DIAGNOSTICS.degraded,
    errorRate:RUNTIME_DIAGNOSTICS.calls?RUNTIME_DIAGNOSTICS.errors/RUNTIME_DIAGNOSTICS.calls:0,
    fallbackRate:RUNTIME_DIAGNOSTICS.calls?RUNTIME_DIAGNOSTICS.fallbacks/RUNTIME_DIAGNOSTICS.calls:0,
    toolCounts:{...RUNTIME_DIAGNOSTICS.toolCounts},
    modeCounts:{...RUNTIME_DIAGNOSTICS.modeCounts},
    latencyMs:{samples:a.length,p50:percentile(a,0.5),p95:percentile(a,0.95),max:a.length?Math.max(...a):0}
  };
}
function transientFrontierReason(reason){
  return /(_TIMEOUT|_NETWORK|_429|_500|_502|_503|_504|_EMPTY_RESPONSE|_FORMAT_INVALID)$/.test(String(reason||""));
}
function circuitView(id){
  const now=Date.now();
  const s=FRONTIER_CIRCUIT.get(id)||{failures:0,windowStart:now,openUntil:0,lastReason:null};
  if(s.openUntil&&s.openUntil<=now){s.failures=0;s.windowStart=now;s.openUntil=0;s.lastReason=null;FRONTIER_CIRCUIT.set(id,s);}
  return {open:s.openUntil>now,failures:s.failures,openUntil:s.openUntil||0,lastReason:s.lastReason||null};
}
function circuitFailure(id,reason){
  const now=Date.now(),windowMs=120000,openMs=45000;
  const s=FRONTIER_CIRCUIT.get(id)||{failures:0,windowStart:now,openUntil:0,lastReason:null};
  if(now-s.windowStart>windowMs){s.failures=0;s.windowStart=now;}
  s.failures++;s.lastReason=String(reason||"UNKNOWN");
  if(s.failures>=2) s.openUntil=now+openMs;
  FRONTIER_CIRCUIT.set(id,s);
  return circuitView(id);
}
function circuitSuccess(id){
  FRONTIER_CIRCUIT.set(id,{failures:0,windowStart:Date.now(),openUntil:0,lastReason:null});
  return circuitView(id);
}

const HOST_TOOL_CATALOG = [
  {name:"Acumen by Talarion",lanes:["research"],cost:"existing_plan",priority:100,hints:["blind spot","missing","coverage","what am i missing","نقطة عمياء","ناقص"]},
  {name:"Tavily",lanes:["research"],cost:"existing_plan",priority:92,hints:["search","current","latest","web","بحث","حديث"]},
  {name:"Parallel Search",lanes:["research"],cost:"existing_plan",priority:90,hints:["parallel","compare sources","مصادر","مقارنة"]},
  {name:"Firecrawl",lanes:["research","browser"],cost:"existing_plan",priority:86,hints:["crawl","scrape","extract","website","موقع","استخراج"]},
  {name:"Consensus",lanes:["research","science"],cost:"existing_plan",priority:96,hints:["paper","study","evidence","دراسة","بحث علمي"]},
  {name:"Scite",lanes:["research","science"],cost:"existing_plan",priority:94,hints:["citation","cited","paper","استشهاد","مرجع"]},
  {name:"Readwise",lanes:["research","memory","docs"],cost:"existing_plan",priority:82,hints:["library","highlight","saved","مكتبة","ملاحظات"]},
  {name:"Legal Data Hunter",lanes:["research","legal"],cost:"existing_plan",priority:100,hints:["law","regulation","case","قانون","لائحة","نظام","امتثال"]},
  {name:"KOSIF Computer",lanes:["computer","browser","automation","dev","docs"],cost:"included",priority:125,hints:["computer","desktop","device","windows","browser","playwright","cdp","uia","file dialog","screen state","excel","android","متصفح","جهاز","كمبيوتر","ويندوز","تحكم","اكسل"]},
  {name:"Jev Bridge",lanes:["decision","browser","automation"],cost:"included",priority:120,hints:["jev","choice","noul","ambiguous","ambiguity","decision","candidate","اختيار","قرار","غموض","مرشح"]},
  {name:"TinyFish",lanes:["browser","research"],cost:"included",priority:100,hints:["browser","click","form","navigate","متصفح","اضغط","افتح"]},
  {name:"Remote Desktop Commander",lanes:["browser","dev"],cost:"included",priority:92,hints:["computer","desktop","terminal","file","كمبيوتر","جهاز","ترمينال"]},
  {name:"Opera Browser Connector",lanes:["browser"],cost:"existing_plan",priority:80,hints:["opera","tab","screenshot","تبويب","متصفح"]},
  {name:"GitHub",lanes:["dev"],cost:"existing_plan",priority:100,hints:["repo","pull request","code","github","كود","مستودع"]},
  {name:"Superpowers",lanes:["dev"],cost:"included",priority:96,hints:["tdd","debug","plan","test","اختبار","تصحيح"]},
  {name:"Codex Security",lanes:["dev"],cost:"included",priority:94,hints:["security","vulnerability","scan","أمن","ثغرة"]},
  {name:"Cloudflare",lanes:["deploy","dev"],cost:"existing_plan",priority:100,hints:["worker","pages","cloudflare","deploy","نشر"]},
  {name:"Vercel",lanes:["deploy","dev"],cost:"existing_plan",priority:94,hints:["vercel","deploy","hosting","نشر","استضافة"]},
  {name:"Supabase",lanes:["dev","deploy"],cost:"existing_plan",priority:90,hints:["database","postgres","auth","sql","قاعدة","مصادقة"]},
  {name:"PostHog",lanes:["observe","dev"],cost:"existing_plan",priority:100,hints:["analytics","error","feature flag","logs","تحليلات","أخطاء"]},
  {name:"Datadog",lanes:["observe","dev"],cost:"existing_plan",priority:95,hints:["logs","trace","rum","incident","monitor","سجل","تتبع"]},
  {name:"Replit",lanes:["dev"],cost:"existing_plan",priority:75,hints:["prototype","app","build","تطبيق","برمجة"]},
  {name:"Lovable",lanes:["dev","design"],cost:"existing_plan",priority:78,hints:["frontend","tailwind","shadcn","واجهة","تصميم"]},
  {name:"Base44",lanes:["dev"],cost:"existing_plan",priority:72,hints:["full stack","app","تطبيق"]},
  {name:"Webflow",lanes:["design","dev","deploy"],cost:"existing_plan",priority:82,hints:["website","cms","webflow","واجهة","موقع"]},
  {name:"WordPress.com",lanes:["docs","design","deploy"],cost:"existing_plan",priority:76,hints:["wordpress","site","blog","موقع","مدونة"]},
  {name:"Railway",lanes:["deploy","observe"],cost:"existing_plan",priority:72,hints:["railway","service","deploy","logs","نشر"]},
  {name:"Floot",lanes:["dev","deploy"],cost:"existing_plan",priority:70,hints:["full stack","host","database","تطبيق"]},
  {name:"Figma",lanes:["design","image"],cost:"existing_plan",priority:100,hints:["figma","ui","ux","layout","font","واجهة","خط","تصميم"]},
  {name:"Adobe Express",lanes:["design","image"],cost:"free",priority:98,hints:["poster","flyer","social","template","بوستر","فلاير","تصميم"]},
  {name:"Canva",lanes:["design","image"],cost:"mixed",priority:88,hints:["canva","poster","brand","social","بوستر","هوية"]},
  {name:"Runway",lanes:["image","video"],cost:"credits",priority:88,hints:["video","animate","image edit","فيديو","تحريك","صورة"]},
  {name:"OpenArt",lanes:["image","video"],cost:"unknown",priority:84,hints:["image","video","model","صورة","فيديو"]},
  {name:"Higgsfield",lanes:["image","video","design"],cost:"unknown",priority:86,hints:["hero shot","product","creative","إعلان","منتج","صورة"]},
  {name:"Adobe",lanes:["image","design","video"],cost:"mixed",priority:90,hints:["retouch","photoshop","lightroom","تنقيح","إضاءة","ألوان"]},
  {name:"HeyGen",lanes:["video"],cost:"unknown",priority:82,hints:["avatar","voice","presenter","أفاتار","مقدم"]},
  {name:"Descript",lanes:["video"],cost:"unknown",priority:80,hints:["edit video","captions","b-roll","مونتاج","ترجمة"]},
  {name:"Google Drive",lanes:["docs","memory"],cost:"existing_plan",priority:100,hints:["drive","docs","sheets","slides","ملف","مستند","شيت"]},
  {name:"Notion",lanes:["docs","memory"],cost:"existing_plan",priority:90,hints:["notion","wiki","knowledge","ملاحظات","معرفة"]},
  {name:"Dropbox Dash",lanes:["memory","docs"],cost:"existing_plan",priority:86,hints:["workspace","knowledge","ملفات","معرفة"]},
  {name:"Granola",lanes:["memory","docs"],cost:"existing_plan",priority:88,hints:["meeting","decision","transcript","اجتماع","قرار"]},
  {name:"Gmail",lanes:["communication","docs"],cost:"existing_plan",priority:90,hints:["email","mail","بريد","ايميل"]},
  {name:"Resend",lanes:["communication","dev"],cost:"existing_plan",priority:82,hints:["transactional email","broadcast","webhook","بريد","ويب هوك"]}
,
  {name:"AgentMail",lanes:["communication","automation"],cost:"existing_plan",priority:82,hints:["agent mail","inbox","email agent","بريد","صندوق"]},
  {name:"Airtable",lanes:["docs","data","project"],cost:"existing_plan",priority:90,hints:["airtable","table","base","record","جدول","سجل"]},
  {name:"Amplitude",lanes:["analytics","observe","product"],cost:"existing_plan",priority:90,hints:["amplitude","product analytics","event","funnel","تحليلات","حدث"]},
  {name:"Asana",lanes:["project","automation"],cost:"existing_plan",priority:86,hints:["asana","task","project","مهمة","مشروع"]},
  {name:"Atlassian Rovo (Legacy)",aliases:["Atlassian Rovo"],lanes:["project","docs","research"],cost:"existing_plan",priority:55,hints:["atlassian","rovo","jira","confluence"]},
  {name:"Coda",lanes:["docs","data","automation"],cost:"existing_plan",priority:84,hints:["coda","doc","table","row","مستند","جدول"]},
  {name:"Cloudflare API",aliases:["Cloudflare_API"],lanes:["deploy","dev","observe"],cost:"existing_plan",priority:98,hints:["cloudflare api","worker api","dns","zone","كلاودفلر"]},
  {name:"Gamma",lanes:["presentation","design","docs"],cost:"mixed",priority:82,hints:["gamma","deck","presentation","عرض","شرائح"]},
  {name:"Genspark AI Slides",lanes:["presentation","design"],cost:"unknown",priority:78,hints:["genspark","slides","presentation","شرائح","عرض"]},
  {name:"GitBook",lanes:["docs","dev","knowledge"],cost:"existing_plan",priority:84,hints:["gitbook","documentation","docs site","توثيق"]},
  {name:"Goodnotes",lanes:["docs","memory"],cost:"existing_plan",priority:70,hints:["goodnotes","notes","ملاحظات"]},
  {name:"HubSpot",lanes:["crm","communication","analytics"],cost:"existing_plan",priority:88,hints:["hubspot","crm","deal","contact","صفقة","عميل"]},
  {name:"Hugging Face",aliases:["Hugging_Face"],lanes:["dev","research","model"],cost:"existing_plan",priority:88,hints:["hugging face","model","dataset","space","نموذج","بيانات"]},
  {name:"HyperFrames by HeyGen",aliases:["HeyGen"],lanes:["video","design"],cost:"unknown",priority:80,hints:["heygen","hyperframes","avatar","video","فيديو","افاتار"]},
  {name:"KOSIF Engineering Copilot",lanes:["dev","automation"],cost:"included",priority:72,hints:["engineering copilot","kosif engineering","release","code"]},
  {name:"KOSIF Release Bridge",lanes:["deploy","dev","observe"],cost:"included",priority:112,hints:["release bridge","release","deployment","نشر","اصدار"]},
  {name:"KOSIF Voice Director",lanes:["voice","audio","creative"],cost:"included",priority:105,hints:["voice director","voice","tts","song","صوت","اغنية"]},
  {name:"KOSIF WhatsApp",lanes:["communication","messaging"],cost:"included",priority:112,hints:["whatsapp","واتساب","message","رسالة"]},
  {name:"Linear",lanes:["project","dev"],cost:"existing_plan",priority:90,hints:["linear","issue","project","bug","مشكلة","تذكرة"]},
  {name:"LinkedIn",lanes:["research","communication"],cost:"existing_plan",priority:74,hints:["linkedin","profile","professional","لينكدإن"]},
  {name:"Microsoft SharePoint",aliases:["SharePoint","Microsoft_SharePoint"],lanes:["docs","memory","project"],cost:"existing_plan",priority:90,hints:["sharepoint","onedrive","site","مشاركة","مستند"]},
  {name:"MindMap",lanes:["design","docs","planning"],cost:"included",priority:72,hints:["mind map","mindmap","خريطة ذهنية"]},
  {name:"Miro",lanes:["design","planning","project"],cost:"existing_plan",priority:82,hints:["miro","board","whiteboard","لوحة"]},
  {name:"monday.com",aliases:["monday_com"],lanes:["project","automation","data"],cost:"existing_plan",priority:86,hints:["monday","board","project","مشروع","لوحة"]},
  {name:"Neon",lanes:["dev","data","deploy"],cost:"existing_plan",priority:90,hints:["neon","postgres","database","branch","قاعدة"]},
  {name:"OpenAI Developers",aliases:["OpenAI Platform","OpenAI_Platform"],lanes:["dev","model"],cost:"existing_plan",priority:94,hints:["openai","api key","platform","developer","واجهة برمجية"]},
  {name:"PDF",lanes:["docs"],cost:"included",priority:82,hints:["pdf","بي دي اف","ملف"]},
  {name:"Plugin Creator",aliases:["Plugin_Creator"],lanes:["plugin_admin","dev"],cost:"included",priority:96,hints:["plugin creator","create plugin","update plugin","اضافة","بلجن"]},
  {name:"Plugin Management",aliases:["Plugin_Management"],lanes:["plugin_admin","automation"],cost:"included",priority:94,hints:["plugin management","install plugin","permissions","اضافات","صلاحيات"]},
  {name:"Presentations",lanes:["presentation","docs","design"],cost:"included",priority:90,hints:["presentation","powerpoint","slides","بوربوينت","عرض"]},
  {name:"Read AI",aliases:["Read_AI"],lanes:["memory","docs","meeting"],cost:"existing_plan",priority:84,hints:["read ai","meeting","transcript","اجتماع","محضر"]},
  {name:"Remotion",lanes:["video","dev","design"],cost:"existing_plan",priority:84,hints:["remotion","react video","render video","فيديو"]},
  {name:"Render",lanes:["deploy","dev","observe"],cost:"existing_plan",priority:84,hints:["render","deploy","service","logs","نشر"]},
  {name:"Sentry",lanes:["observe","dev"],cost:"existing_plan",priority:98,hints:["sentry","error","exception","trace","خطأ","تتبع"]},
  {name:"Sites",lanes:["deploy","design","docs"],cost:"included",priority:78,hints:["sites","website","publish site","موقع"]},
  {name:"Slack",lanes:["communication","project"],cost:"existing_plan",priority:86,hints:["slack","channel","message","قناة","رسالة"]},
  {name:"Smartsheet US",aliases:["Smartsheet","Smartsheet_US"],lanes:["spreadsheet","project","data"],cost:"existing_plan",priority:86,hints:["smartsheet","sheet","project","شيت","مشروع"]},
  {name:"Spreadsheets",lanes:["spreadsheet","data","docs"],cost:"included",priority:100,hints:["spreadsheet","excel","sheet","جدول","اكسل"]},
  {name:"Statsig",lanes:["analytics","dev","product"],cost:"existing_plan",priority:90,hints:["statsig","experiment","feature flag","تجربة","ميزة"]},
  {name:"Supermetrics",lanes:["analytics","data","marketing"],cost:"existing_plan",priority:88,hints:["supermetrics","marketing data","ads","تحليلات","اعلانات"]},
  {name:"Template Creator",lanes:["design","docs"],cost:"included",priority:62,hints:["template","قالب"]},
  {name:"TickTick:To-Do List & Calendar",aliases:["TickTick To-Do List & Calendar","TickTick"],lanes:["project","calendar","automation"],cost:"existing_plan",priority:76,hints:["ticktick","todo","calendar","مهمة","تقويم"]},
  {name:"Todoist: To Do List & Calendar",aliases:["Todoist"],lanes:["project","calendar","automation"],cost:"existing_plan",priority:76,hints:["todoist","todo","calendar","مهمة","تقويم"]},
  {name:"vidIQ",lanes:["analytics","video","marketing"],cost:"existing_plan",priority:76,hints:["vidiq","youtube","seo","keyword","يوتيوب"]},
  {name:"Whimsical",lanes:["design","planning","docs"],cost:"existing_plan",priority:84,hints:["whimsical","flowchart","wireframe","diagram","مخطط"]},
  {name:"Windsor.ai",aliases:["Windsor_ai"],lanes:["analytics","data","marketing"],cost:"existing_plan",priority:86,hints:["windsor","marketing","ads","analytics","تحليلات"]},
  {name:"Wix",lanes:["design","deploy","docs"],cost:"existing_plan",priority:78,hints:["wix","website","site","موقع"]},
  {name:"Wolfram",lanes:["research","science","data"],cost:"existing_plan",priority:92,hints:["wolfram","calculate","math","compute","حساب","رياضيات"]},
  {name:"Zoho CRM",aliases:["Zoho_CRM"],lanes:["crm","communication","analytics"],cost:"existing_plan",priority:82,hints:["zoho","crm","deal","contact","عميل","صفقة"]},
  {name:"ClickUp",lanes:["project","docs","communication"],cost:"existing_plan",priority:88,hints:["clickup","task","project","doc","مهمة","مشروع"]},
  {name:"Adobe Acrobat",aliases:["Adobe_Acrobat"],lanes:["docs"],cost:"mixed",priority:90,hints:["acrobat","pdf","edit pdf","redact","بي دي اف"]},
  {name:"Documents",lanes:["docs"],cost:"included",priority:82,hints:["documents","document","مستند"]},
  {name:"Default templates",lanes:["design","docs"],cost:"included",priority:50,hints:["default template","قالب"]},
  {name:"Demos",lanes:["docs","dev"],cost:"included",priority:45,hints:["demo","مثال"]},
  {name:"Onboarding",lanes:["docs","project"],cost:"included",priority:45,hints:["onboarding","تهيئة","بدء"]},
  {name:"Pets",lanes:["creative"],cost:"included",priority:30,hints:["pets","حيوان"]}
];
const COST_CLASSES = new Set(["free","included","existing_plan","mixed","credits","paid","unknown"]);
const AUTO_COST_CLASSES = new Set(["free","included","existing_plan"]);
const LANE_RULES = [
  ["decision",/(jev|choice|noul|decision|ambiguous|ambiguity|candidate|اختيار|قرار|غموض|مرشح)/i],
  ["computer",/(computer|desktop|device|windows|uia|mouse|keyboard|file dialog|screen state|excel|android|كمبيوتر|جهاز|ويندوز|ماوس|كيبورد|اكسل|اندرويد)/i],
  ["automation",/(automation|workflow|agent loop|autonomous|batch|orchestrat|أتمتة|سير عمل|وكيل ذاتي|دفعة)/i],
  ["legal",/(legal|law|regulat|compliance|contract|case\b|قانون|لائحة|نظام|امتثال|عقد|قضية)/i],
  ["science",/(study|paper|journal|scientific|evidence|clinical|دراسة|ورقة|بحث علمي|دليل علمي)/i],
  ["browser",/(browser|website|page\b|click|navigate|form|screenshot|متصفح|موقع|صفحة|اضغط|افتح|سكرين)/i],
  ["dev",/(code|coding|program|bug|debug|api\b|github|frontend|backend|react|css|javascript|typescript|كود|برمج|خطأ|واجهة برمجية)/i],
  ["deploy",/(deploy|hosting|cloudflare|vercel|worker|railway|production|نشر|استضافة|كلاودفلر|فيرسل)/i],
  ["observe",/(log|trace|monitor|analytics|error tracking|incident|rum\b|سجل|تتبع|مراقبة|تحليلات|أخطاء)/i],
  ["design",/(design|ui\b|ux\b|layout|font|typography|figma|webflow|واجهة|تصميم|خط|ألوان|تنسيق)/i],
  ["image",/(image|photo|poster|graphic|illustration|picture|صورة|بوستر|رسم|جرافيك|تصوير)/i],
  ["video",/(video|animation|avatar|motion|reel|فيديو|تحريك|أفاتار|موشن)/i],
  ["docs",/(document|pdf|doc\b|sheet|slide|report|مستند|ملف|اكسل|عرض|تقرير)/i],
  ["memory",/(meeting|notes|highlight|library|history|context|اجتماع|ملاحظات|مكتبة|سياق|سابق)/i],
  ["communication",/(email|mail|message|whatsapp|بريد|رسالة|واتساب)/i],
  ["research",/(research|search|source|verify|latest|current|compare|fact|بحث|ابحث|مصدر|تحقق|أحدث|مقارنة|معلومة)/i],
  ["crm",/(crm|customer|contact|deal|pipeline|عميل|جهة اتصال|صفقة|مسار مبيعات)/i],
  ["project",/(project|task|issue|board|todo|calendar|مشروع|مهمة|تذكرة|لوحة|تقويم)/i],
  ["spreadsheet",/(spreadsheet|excel|sheet|cell|workbook|جدول|اكسل|شيت|خلية)/i],
  ["presentation",/(presentation|slides|deck|powerpoint|عرض|شرائح|بوربوينت)/i],
  ["voice",/(voice|tts|sp --- TRUNCATED --- 104,930 chars