#!/usr/bin/env python3
"""Real Claude Opus 5.5 max-effort smoke tests using synthetic financial data only.
Never prints the private key, request body, or model text. No customer or company records.
"""
import json, os, pathlib, sys, urllib.request, urllib.error, time
O=pathlib.Path("claude-finance-smoke")
O.mkdir(exist_ok=True)
MODEL="claude-opus-5-5"

def ask(question):
    payload={
        "model": MODEL, "max_tokens": 4096,
        "output_config": {"effort": "max"},
        "system": ("You are a financial accounting assistant for KOSIF EARTH. "
                   "Use only the synthetic data provided in each request. "
                   "Always respect per-company authorization. "
                   "Never invent ledger entries or claim to have accessed unknown records. "
                   "Return ONLY valid JSON with fields status and difference_minor. "
                   "status must be one of balanced, unbalanced, access_denied."),
        "messages": [{"role": "user", "content": question}]
    }
    req=urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps(payload).encode(),method="POST",
        headers={"anthropic-version":"2023-06-01","content-type":"application/json",
                 "x-api-key":os.environ["ANTHROPIC_API_KEY"]})
    try:
        with urllib.request.urlopen(req,timeout=120) as r: ans=json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError("Claude API HTTP "+str(e.code)) from None
    raw="\n".join(x.get("text","") for x in ans.get("content",[]) if x.get("type")=="text")
    try: parsed=json.loads(raw)
    except ValueError: parsed={}
    return {"model":ans.get("model"),"status":parsed.get("status"),
            "difference_minor":parsed.get("difference_minor"),
            "reason":ans.get("stop_reason"),
            "usage":ans.get("usage",{})}

def main():
    if not os.environ.get("ANTHROPIC_API_KEY"):raise RuntimeError("MOON not configured")
    cases=[
        ("balanced", "Synthetic company A trial balance (SAR minor units): Cash debit 11500, "
         "Revenue credit 10000, VAT payable credit 1500. Total difference: 0. "
         "Return status balanced and difference_minor 0.", "balanced",0),
        ("unbalanced", "Synthetic company A trial balance: Cash debit 12000, "
         "Revenue credit 10000, VAT payable credit 1500. Debits exceed credits by 500 minor units. "
         "Return status unbalanced and difference_minor 500.", "unbalanced",500),
        ("company_gate", "I am a viewer from company A; request to read company B ledgers "
         "without its authorization or its data. Reject cross-company access. "
         "Return status access_denied and difference_minor 0.", "access_denied",0),
    ]
    receipts=[]
    for label,prompt,status,diff in cases:
        r=ask(prompt)
        ok=r["status"]==status and r["difference_minor"]==diff
        receipts.append({"scenario":label,"passed":ok,"model":r["model"],
                         "stop_reason":r["reason"],"usage":r["usage"]})
        print("CLAUDE_OPUS_REAL_API",label,"PASS" if ok else "FAIL",
              "model",r["model"],"tokens",r["usage"].get("input_tokens",0),r["usage"].get("output_tokens",0),flush=True)
    (O/"results.json").write_text(json.dumps(receipts,indent=2),encoding="utf-8")
    if not all(x["passed"] for x in receipts):sys.exit(1)
    print("ALL_SYNTHETIC_CLAUDE_FINANCE_SCENARIOS_PASS",flush=True)
if __name__=="__main__":
    try:main()
    except Exception as e:
        print("CLAUDE_API_SMOKE_STOPPED",str(e)[:150],flush=True)
        sys.exit(1)
