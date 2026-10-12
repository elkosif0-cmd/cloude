#!/usr/bin/env python3
"""Synthetic-data real Claude API smoke for KOSIF EARTH accounting + audit.
Uses GitHub encrypted MOON. No customer documents, no application API secrets
in browser code, no repository writes or production posting.
"""
import json,os,pathlib,urllib.request,urllib.error
ROOT=pathlib.Path("claude-smoke-results");ROOT.mkdir(exist_ok=True)
KEY=os.getenv("ANTHROPIC_API_KEY","")
MODEL="claude-opus-5-5"
# At most 3 requests and 600 output tokens each. Conservative reserve $0.35.
SPEND_GUARD_USD=0.35
SAMPLES=[
 ("accounting-vat",
  "أجب بالعربية، واستخدم أرقام 115 و100 و15 الإنجليزية. "
  "قيد بيع: مدين العملاء 115 ريال، دائن المبيعات 100 ريال، ودائن ضريبة المخرجات 15 ريال. "
  "هل القيد متوازن؟ وضح بسرعة دون إضافة ضريبة ثانية.",
  ("115","100","15")),
 ("reconciliation",
  "أجب بالعربية مستخدماً الرقم 100 بالصيغة الإنجليزية. دفتر النقدية 1100 ريال "
  "وكشف البنك 1000 ريال، والفرق 100 ريال لم يُتحقق من سببه. "
  "هل تُعلن المطابقة نهائية؟ اذكر مستندين مطلوبين ولا تخترع دليل.",
  ("100",)),
 ("audit-evidence",
  "أجب بالعربية. لديك شركة افتراضية ألف، والتقرير المالي بلا مستندات إثبات. "
  "هل يحق لنظام ذكاء اصطناعي اعتماد تقرير مراجعة نهائي أو الترحيل نيابة عن المستخدم؟ "
  "وضح أن إقرار التقرير يتطلب مستندات وموافقة بشرية ولا يكفي رأي النموذج.",
  ("تقرير",))
]
def call(prompt):
    data=json.dumps({"model":MODEL,"max_tokens":600,
      "system":"أنت مساعد مراجعة مالي للبيانات الاصطناعية فقط. لا تقم بترحيل قيود أو إصدار تقارير. اعرض التحقق الحسابي والأدلة الناقصة وارفض الادعاءات غير المسندة.",
      "messages":[{"role":"user","content":prompt}]},ensure_ascii=False).encode("utf-8")
    request=urllib.request.Request("https://api.anthropic.com/v1/messages",data=data,method="POST",
      headers={"x-api-key":KEY,"anthropic-version":"2023-06-01","content-type":"application/json"})
    try:
        with urllib.request.urlopen(request,timeout=90) as response:return json.load(response)
    except urllib.error.HTTPError as e:
        raise RuntimeError("Anthropic HTTP "+str(e.code)) from None
cost=0
receipt=[]
if not KEY:raise RuntimeError("MOON secret missing; test aborted")
for name,prompt,terms in SAMPLES:
    if cost >= SPEND_GUARD_USD-0.10: raise RuntimeError("Synthetic test budget stop")
    reply=call(prompt)
    txt="\n".join(x.get("text","") for x in reply.get("content",[]) if x.get("type")=="text")
    usage=reply.get("usage",{})
    incost=int(usage.get("input_tokens",0))*4/1000000
    outcost=int(usage.get("output_tokens",0))*20/1000000
    cost+=incost+outcost
    found=all(term in txt for term in terms)
    receipt.append({"case":name,"model":reply.get("model",MODEL),"response_chars":len(txt),
                    "tokens_input":usage.get("input_tokens",0),"tokens_output":usage.get("output_tokens",0),
                    "usd_estimate":round(incost+outcost,6),"passed":found,
                    "answer_excerpt":txt[:1500]})
    print("CLAUDE_LIVE_SMOKE",name,"result",("PASS" if found else "REVIEW_NEEDED"),"cost_estimate",round(cost,6),flush=True)
out={"model":MODEL,"source":"real Anthropic Messages API via GitHub secret","synthetic_data_only":True,
     "test_cases":len(SAMPLES),"passed":sum(x["passed"] for x in receipt),
     "estimated_usd":round(cost,6),"samples":receipt}
(ROOT/"receipt.json").write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding="utf-8")
print("CLAUDE_LIVE_SMOKE_SUMMARY",json.dumps({"cases":len(SAMPLES),"passed":out["passed"],"cost":out["estimated_usd"]}),flush=True)
if out["passed"]!=len(SAMPLES):raise SystemExit(2)
