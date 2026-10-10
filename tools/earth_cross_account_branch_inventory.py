"""Read-only GitHub inventory for both authorized KOSIF accounts.
Uses the owner's connected gh session, reads repository/branch metadata only.
Never reads secrets, code contents, or mutates repositories.
"""
import csv, json, subprocess
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / "docs" / "rebuild"
DEST.mkdir(parents=True, exist_ok=True)
ACCOUNTS = {
 "kosif199022-jpg": [
  "mafateeh-al-tharwa", "mafateeh-al-tharwa2", "-", "CLOUDFLARE_API_TOKEN",
  "moon", "kosif-audit-studio", "smart-trial-balance-review", "kosif-audit-pro",
  "new", "see", "whatsapp-personal-bridge", "think", "kosif-omni",
  "kosif-atlas-private", "kosif-atlas", "100-superskills",
  "kosif-studio", "kosif-render-lab", "kosif-one"
 ],
 "elkosif0-cmd": ["cloude", "moon"]
}
def gh(endpoint, paged=False, jq=None):
 args=["gh","api"]
 if paged: args += ["--paginate"]
 if jq: args += ["--jq",jq]
 args += [endpoint]
 try:
  result=subprocess.run(args,capture_output=True,text=True,encoding="utf-8",
                        errors="replace",timeout=100)
  return result.stdout if result.returncode==0 else None
 except Exception:
  return None
meta=[]
branches=[]
for owner,names in ACCOUNTS.items():
 for name in names:
  full=owner+"/"+name
  raw=gh("repos/"+full)
  item=None
  if raw:
   try: item=json.loads(raw)
   except json.JSONDecodeError: pass
  info={"repo":full,"default_branch":(item or {}).get("default_branch",""),
        "visibility":(item or {}).get("visibility","unknown"),
        "archived":(item or {}).get("archived","unknown"),
        "size_kb":(item or {}).get("size",""),
        "pushed_at":(item or {}).get("pushed_at",""),
        "branch_count":0,"status":"OK" if item else "NO_ACCESS"}
  rawbr=gh("repos/"+full+"/branches?per_page=100",paged=True,jq=".[] | [.name, .commit.sha] | @tsv")
  if rawbr is None:
   info["status"]="BRANCH_READ_FAILED" if item else "NO_ACCESS"
  else:
   for entry in rawbr.splitlines():
    if "\t" not in entry: continue
    b,sha=entry.split("\t",1)
    branches.append({"repo":full,"branch":b,"head_sha":sha,"triage":"NOT_REVIEWED"})
    info["branch_count"]+=1
  meta.append(info)
  print(full,info["status"],info["branch_count"],flush=True)
def write_csv(name,items,keys):
 with (DEST/name).open("w",newline="",encoding="utf-8-sig") as out:
  w=csv.DictWriter(out,fieldnames=keys);w.writeheader();w.writerows(items)
write_csv("KOSIF_EARTH_REPO_METADATA_20261010.csv",meta,list(meta[0]))
write_csv("KOSIF_EARTH_ALL_BRANCHES_20261010.csv",branches,
          ["repo","branch","head_sha","triage"])
summary={"generated_utc":datetime.now(timezone.utc).isoformat(),
 "accounts":list(ACCOUNTS),"repos":len(meta),"branch_records":len(branches),
 "failed":[x["repo"] for x in meta if x["status"]!="OK"],
 "note":"Metadata only. No branch was merged or certified; capability code still requires review."}
(DEST/"KOSIF_EARTH_REPO_METADATA_20261010.json").write_text(
 json.dumps({"summary":summary,"repositories":meta},ensure_ascii=False,indent=2),encoding="utf-8")
print("SUMMARY",json.dumps(summary,ensure_ascii=False))
