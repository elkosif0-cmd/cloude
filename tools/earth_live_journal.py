"""Append-only, repo-local development ledger. Stores file names, not data contents."""
import argparse, hashlib, json, subprocess, time
from pathlib import Path
from datetime import datetime, timezone, timedelta

ROOT=Path(__file__).resolve().parent.parent
LEDGER=ROOT/"docs"/"rebuild"/"KOSIF_EARTH_LIVE_EVENTS_20261010.jsonl"
def git(*args):
 r=subprocess.run(["git","-C",str(ROOT),*args],capture_output=True,
                  text=True,encoding="utf-8",errors="replace")
 if r.returncode: raise RuntimeError(r.stderr.strip() or str(args))
 return r.stdout.rstrip('\r\n')
def status():
 items=[]
 for line in git("status","--porcelain=v1","--untracked-files=normal").splitlines():
  if not line.strip():continue
  filename=line[3:].strip()
  if filename.replace("\\","/").endswith(LEDGER.name):continue
  items.append({"state":line[:2],"path":filename})
 return items
def snapshot(kind,task,next_action="",note="",previous=None):
 state=status()
 digest=hashlib.sha256(json.dumps(state,sort_keys=True,ensure_ascii=False).encode()).hexdigest()
 if previous==digest:return digest,False
 row={"time_riyadh":datetime.now(timezone(timedelta(hours=3))).isoformat(),
      "event":kind,"task":task,"branch":git("branch","--show-current"),
      "sha":git("rev-parse","HEAD"),"changed_files":state,
      "next_action":next_action,"note":note}
 LEDGER.parent.mkdir(parents=True,exist_ok=True)
 with LEDGER.open("a",encoding="utf-8") as f:
  f.write(json.dumps(row,ensure_ascii=False,separators=(",",":"))+"\n")
 print(json.dumps({"event":kind,"task":task,"changed":len(state),"sha":row["sha"][:9]},ensure_ascii=False),flush=True)
 return digest,True
parser=argparse.ArgumentParser()
parser.add_argument("mode",choices=["snapshot","watch"])
parser.add_argument("--task",required=True)
parser.add_argument("--next",default="")
parser.add_argument("--note",default="")
parser.add_argument("--interval",type=float,default=10)
args=parser.parse_args()
prev,_=snapshot("CHECKPOINT",args.task,args.next,args.note)
if args.mode=="watch":
 try:
  while True:
   time.sleep(max(2,args.interval))
   prev,_=snapshot("AUTO_CHANGE",args.task,args.next,previous=prev)
 except KeyboardInterrupt:
  snapshot("STOP",args.task,args.next,"Watcher stopped normally")
