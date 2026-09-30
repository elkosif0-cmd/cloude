#!/usr/bin/env python3
import json, sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent))
from pro_receipt_verify import validate as receipt_validate, MODULES, PROFILES
from source_taint_check import validate as taint_validate
from budget_stop_check import decide as budget_decide
from self_improvement_eval import evaluate as improve_eval

def valid_receipt():
    profiles={p:"complete" for p in PROFILES}
    return {
      "trace_version":"2.7.1",
      "modules":{m:"relevant" for m in MODULES},
      "profiles":profiles,
      "models_tools":[{"id":"kosif-gpt","kind":"model","requested":True,"available":True,"used":True,"actual_source":"cleanapis","actual_model":"gpt-5.6-sol","fallback_used":False,"receipt_id":"r1"}],
      "dissent_ledger":[{"profile":p,"conclusion":"x","strongest_objection":"y","disposition":"accepted","what_would_change_it":"new evidence"} for p in PROFILES],
      "source_taint":{"checked":True,"blocked_supports":0},
      "evidence_gaps":[],
      "gates":{"bias_gate":"pass","optimizer_gate":{"feasible":1},"self_critic":"pass","verifier":"pass"},
      "execution_contract":"present","postcondition":"pass",
      "budget":{"model_calls_used":5,"max_model_calls":10,"tool_calls_used":3,"max_tool_calls":12,"retries_used":0,"max_retries":3,"no_change_count":0,"max_no_change":2,"status":"completed"}
    }

def run():
    tests=[]
    def check(name,cond): tests.append((name,bool(cond)))
    good=valid_receipt(); check("valid-receipt",receipt_validate(good)["ok"])
    spoof={"trace_version":"2.7.1","modules":good["modules"],"profiles":good["profiles"],"dissent_ledger":good["dissent_ledger"],"source_taint":good["source_taint"],"evidence_gaps":[],"gates":good["gates"],"execution_contract":"present","postcondition":"pass","budget":good["budget"]}
    check("spoofed-no-capability-receipts-blocked",not receipt_validate(spoof)["ok"])
    bad=json.loads(json.dumps(good)); bad["models_tools"][0]["available"]=False
    check("used-unavailable-blocked",not receipt_validate(bad)["ok"])
    host=json.loads(json.dumps(good)); host["models_tools"][0].pop("receipt_id",None); host["models_tools"][0]["receipt_evidence"]={"type":"host-tool-result","observed":True,"limitation":"no native provider receipt id"}
    check("host-tool-result-evidence-accepted",receipt_validate(host)["ok"])
    missing=json.loads(json.dumps(host)); missing["models_tools"][0]["receipt_evidence"]["observed"]=False
    check("unobserved-receipt-evidence-blocked",not receipt_validate(missing)["ok"])
    bad=json.loads(json.dumps(good)); bad["dissent_ledger"]=bad["dissent_ledger"][1:]
    check("missing-dissent-blocked",not receipt_validate(bad)["ok"])
    taint={"claims":[{"id":"c1","requires_source":True,"current_authority":False}],"sources":[{"id":"jaynes-testbank","status":"quarantined","supports":["c1"]}]}
    check("quarantined-source-blocked",not taint_validate(taint)["ok"])
    hist={"claims":[{"id":"c1","requires_source":True,"current_authority":True}],"sources":[{"id":"ifrs2018","status":"historical","supports":["c1"]}]}
    check("historical-current-authority-blocked",not taint_validate(hist)["ok"])
    check("budget-hard-stop",budget_decide({"model_calls":10,"max_model_calls":10,"tool_calls":1,"max_tool_calls":10,"retries":0,"max_retries":2,"elapsed_seconds":1,"max_elapsed_seconds":60,"no_change_count":0,"max_no_change":2})["action"]=="stop")
    check("no-change-escalate",budget_decide({"model_calls":1,"max_model_calls":10,"tool_calls":1,"max_tool_calls":10,"retries":0,"max_retries":2,"elapsed_seconds":1,"max_elapsed_seconds":60,"no_change_count":2,"max_no_change":2})["action"]=="escalate")
    criteria={"false_success_rate":{"direction":"lower","required":True,"max_regression":0,"min_improvement":0},"source_support":{"direction":"higher","required":True,"max_regression":0,"min_improvement":0}}
    check("bad-self-improvement-rejected",not improve_eval({"baseline":{"false_success_rate":0.1,"source_support":0.8},"candidate":{"false_success_rate":0.2,"source_support":0.81},"criteria":criteria})["ok"])
    check("good-self-improvement-passes",improve_eval({"baseline":{"false_success_rate":0.1,"source_support":0.8},"candidate":{"false_success_rate":0.05,"source_support":0.9},"criteria":criteria})["ok"])
    root=Path(__file__).resolve().parents[3]
    manifest=json.loads((root/"plugin.json").read_text())
    skill=(root/"skills/kosif-think-pro/SKILL.md").read_text()
    runtime=(root/"skills/kosif-think-pro/references/runtime-consistency.md").read_text()
    check("manifest-2.7.3",manifest.get("version")=="2.7.3")
    check("skill-version-2.7.3","# KOSIF Think Pro 2 — v2.7.3" in skill)
    check("skill-binds-new-layer","verified-self-improvement.md" in skill and "pro_receipt_verify.py" in skill and "source-taint-protocol.md" in skill and "runtime-consistency.md" in skill)
    check("runtime-answer-evidence-guard","quarantined" in runtime.lower() and "deterministically valid arithmetic" in runtime.lower() and "92" in runtime)
    check("runtime-host-exposure-guard","host tool catalog" in runtime.lower() and "server" in runtime.lower())
    failed=[n for n,ok in tests if not ok]
    print(json.dumps({"ok":not failed,"passed":sum(1 for _,ok in tests if ok),"total":len(tests),"failed":failed},ensure_ascii=False,sort_keys=True))
    return 0 if not failed else 1
if __name__=="__main__": raise SystemExit(run())
