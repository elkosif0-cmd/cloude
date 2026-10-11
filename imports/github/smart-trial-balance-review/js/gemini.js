/* ============================================================
   عميل Google Gemini API — نداءات JSON منظمة من المتصفح
   المفتاح يبقى في المتصفح فقط
   ============================================================ */
(function(){
"use strict";

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function friendlyError(status, body){
  const msg = (body && body.error && body.error.message) || "";
  if(status===400 && /api key not valid/i.test(msg)) return "مفتاح API غير صالح — تحقق منه في تبويب الإعدادات.";
  if(status===403) return "المفتاح مرفوض أو غير مصرح له بهذا الموديل (403).";
  if(status===429) return "تجاوزت حصة الاستخدام المجانية (429) — انتظر قليلاً أو استخدم flash-lite.";
  if(status>=500) return "خطأ من خدمات Google ("+status+") — أعد المحاولة بعد لحظات.";
  if(status===0) return "تعذر الاتصال بالشبكة — تحقق من اتصالك (أو من مانع إعلانات يحجب generativelanguage.googleapis.com).";
  return "خطأ "+status+": "+(msg||"غير معروف");
}

/**
 * نداء عام للموديل مع مخطط استجابة JSON اختياري.
 * parts: [{text:".."}] أو [{inlineData:{mimeType,data(base64)}}]
 * يعيد: نص JSON محللًا (عند تمرير schema) أو نصًا خامًا
 */
async function call({apiKey, model, parts, system, schema, temperature=0.3}){
  if(!apiKey) throw new Error("لم يتم ضبط مفتاح API — اذهب إلى الإعدادات.");
  const url = `${BASE}/${encodeURIComponent(model)}:generateContent`;
  const body = {
    contents:[{role:"user", parts}],
    generationConfig:{temperature}
  };
  if(system) body.systemInstruction = {parts:[{text:system}]};
  if(schema){
    body.generationConfig.responseMimeType = "application/json";
    body.generationConfig.responseSchema = schema;
  }
  let res;
  try{
    res = await fetch(url,{
      method:"POST",
      headers:{"Content-Type":"application/json","x-goog-api-key":apiKey},
      body:JSON.stringify(body)
    });
  }catch(e){ throw new Error(friendlyError(0)); }

  let data=null;
  try{ data = await res.json(); }catch(e){}
  if(!res.ok) throw new Error(friendlyError(res.status, data));

  const cand = data.candidates && data.candidates[0];
  const txt = cand && cand.content && cand.content.parts
    ? cand.content.parts.map(p=>p.text||"").join("") : "";
  if(!txt){
    const fr = cand && cand.finishReason;
    throw new Error(fr==="SAFETY"? "رفض النموذج الرد لأسباب تتعلق بسياسة المحتوى."
      : "استجابة فارغة من النموذج"+(fr?` (${fr})`:"")+" — أعد المحاولة.");
  }
  if(schema){ try{ return JSON.parse(txt); }catch(e){ return null; } }
  return txt;
}

async function testKey(){
  return call({
    apiKey:App.state.settings.apiKey,
    model:App.state.settings.model,
    parts:[{text:'أجب بكلمة واحدة فقط: جاهز'}],
    temperature:0
  });
}

/* ====== مخططات الاستجابة (responseSchema) ====== */
const ENUM_SEV = ["منخفضة","متوسطة","عالية","جسيمة"];

const SCHEMA_ROUND = {
  type:"OBJECT",
  properties:{
    status:{type:"STRING", enum:["needs_docs","complete"], description:"needs_docs إذا لزم مستندات إضافية، complete إذا اكتملت المراجعة"},
    executiveSummary:{type:"STRING"},
    riskScore:{type:"INTEGER", description:"0-100"},
    boardOpinions:{type:"ARRAY", items:{
      type:"OBJECT",
      properties:{
        reviewer:{type:"STRING", enum:["المراجع الفني المحاسبي","مراجع الامتثال للمعايير والإفصاح","مدقق المخاطر والأدلة"]},
        opinion:{type:"STRING"}
      },
      required:["reviewer","opinion"]
    }},
    findings:{type:"ARRAY", items:{
      type:"OBJECT",
      properties:{
        accountName:{type:"STRING"},
        standardCode:{type:"STRING"},
        issueType:{type:"STRING", enum:["تصنيف","قياس","إفصاح","اكتمال المعلومات","أخرى"]},
        severity:{type:"STRING", enum:ENUM_SEV},
        comment:{type:"STRING"},
        recommendation:{type:"STRING"}
      },
      required:["accountName","standardCode","severity","comment","recommendation"]
    }},
    standardsCoverage:{type:"ARRAY", items:{
      type:"OBJECT",
      properties:{
        standardCode:{type:"STRING"},
        relevance:{type:"STRING"},
        roleInAccount:{type:"STRING"}
      },
      required:["standardCode","roleInAccount"]
    }},
    requestedDocuments:{type:"ARRAY", items:{
      type:"OBJECT",
      properties:{
        id:{type:"STRING", description:"معرّف قصير مثل DOC-1"},
        title:{type:"STRING"},
        purpose:{type:"STRING"},
        relatedItems:{type:"ARRAY", items:{type:"STRING"}},
        priority:{type:"STRING", enum:["عالية","متوسطة","منخفضة"]}
      },
      required:["id","title","purpose","priority"]
    }},
    documentsReviewed:{type:"ARRAY", items:{
      type:"OBJECT",
      properties:{
        fileName:{type:"STRING"},
        requestId:{type:"STRING"},
        verdict:{type:"STRING", enum:["مقبول","غير كافٍ","مرفوض"]},
        notes:{type:"STRING"}
      },
      required:["fileName","verdict","notes"]
    }},
    nextStepGuidance:{type:"STRING"}
  },
  required:["status","executiveSummary","riskScore","boardOpinions","findings","requestedDocuments","standardsCoverage","nextStepGuidance"]
};

const SCHEMA_REPORT = {
  type:"OBJECT",
  properties:{
    overallOpinion:{type:"STRING", enum:["رأي نظيف","رأي بتأكيدات معدلة","رأي متحفظ","غير قادر على إبداء الرأي"]},
    headline:{type:"STRING"},
    summary:{type:"STRING"},
    keyRisks:{type:"ARRAY", items:{type:"OBJECT", properties:{
      title:{type:"STRING"}, detail:{type:"STRING"}, mitigation:{type:"STRING"}
    }, required:["title","detail"]}},
    recommendations:{type:"ARRAY", items:{type:"STRING"}},
    closingStatement:{type:"STRING"}
  },
  required:["overallOpinion","headline","summary","keyRisks","recommendations","closingStatement"]
};

/* نص التعليمات الثابت لمجلس المراجعين */
function boardSystem(entityName, periodLabel, currency){
  return [
`أنت «مجلس المراجعين» افتراضي متخصص في مراجعة ميزان المراجعة، تتصرف بصفة ثلاثة مراجعين مستقلين بصوت موحّد:` ,
`- المراجع الفني المحاسبي: يدقق التصنيف والقياس والعرض.`,
`- مراجع الامتثال للمعايير والإفصاح: يتحقق من ملاءمة المعايير (IFRS كما تعتمدها SOCPA) وكفاية الإفصاح والمستندات النظامية (فاتورة، عقد، تسوية...).`,
`- مدقق المخاطر والأدلة: يقيم الأخطار الجوهرية ويقرر كفاية أدلة المراجعة.`,
``,
`الكيان: ${entityName||"غير مسمّى"} — الفترة: ${periodLabel||"غير محددة"} — العملة: ${currency||"ريال سعودي"}.`,
`قواعد ملزمة:`,
`1) راجع كل بند مقابل المعايير المرتبطة به، واستخدم أكواد المعايير كما هي (IAS 2, IFRS 9...)، ولا تخترع معايير غير موجودة.`,
`2) إن كان عنصر قائم/غياب بنود واضح (سجل ثابت بدون استحقاقات، ائتمان متوقع ECL مفقود على الذمم، دفعات مقدمة بدون التزام عقد تحت IFRS 15، عقود إيجار دون IFRS 16...) فاذكره صراحة.`,
`3) رشح في findings أهم ما لا يتجاوز 12 بندًا خطورة؛ وقيم الخطورة بواقعية.`,
`4) عند الحاجة لمستندات، اطلبها بعناوين عملية قابلة للتوريد («كشف حساب بنكي مؤرخ 31/12 مع تسوية بنكية»)؛ رقم المستند DOC-n متسلسل ومحافظ عليه بين الجولات.`,
`5) لا تعتبر المراجعة complete إلا إذا اعتبرت الأدلة كافية وجميع الملاحظات الجوهرية عُولجت أو فُصلت بدقة.`,
`6) خليتك "غير كافٍ" للمستندات تستوجب شرحًا في notes لماذا هو غير كافٍ وما الذي يعوضه.`,
`7) كل التوثيق بالعربية الفصحى المهنية، موجزة وواضحة.`
  ].join("\n");
}

window.GeminiAI = { call, testKey, SCHEMA_ROUND, SCHEMA_REPORT, boardSystem };
})();
