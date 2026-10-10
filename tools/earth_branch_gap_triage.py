"""Read-only comparison of GitHub inventory SHAs with the current review branch.
A branch not in ancestry may still have cherry-picked work; investigate before merge.
"""
from pathlib import Path
import csv,subprocess,collections
ROOT=Path(__file__).resolve().parent.parent
DIR=ROOT/"docs"/"rebuild"
source=DIR/"KOSIF_EARTH_ALL_BRANCHES_20261010.csv"
target=DIR/"KOSIF_EARTH_BRANCH_GAP_TRIAGE_20261010.csv"
def git(*args):
 try:
  r=subprocess.run(["git","-C",str(ROOT),*args],capture_output=True,
                   text=True,encoding="utf-8",errors="replace",timeout=12)
  return r.returncode,r.stdout.strip()
 except Exception:return 99,""
with source.open(encoding="utf-8-sig",newline="") as f:
 rows=list(csv.DictReader(f))
categories=[
 ("audit",("audit","review","ifrs","standards","tbreview","pbc","risk")),
 ("accounting",("ledger","finance","account","vat","company","erp","cost")),
 ("ui",("theme","screen","nav","search","ui","ux","mobile","layout","visual")),
 ("security",("security","guard","auth","privacy","scope","permission")),
 ("report",("report","excel","export","pdf","statement")),
 ("tools",("tool","think","helper","motion","studio","plugin")),
]
for row in rows:
 repo=row["repo"];b=row["branch"];sha=row["head_sha"]
 name=b.lower().replace("_","-")
 row["capability_area"]=next((cat for cat,terms in categories
                            if any(x in name for x in terms)),"unclassified")
 if repo!="elkosif0-cmd/cloude":
  row["git_relation"]="DIFFERENT_REPOSITORY"
  row["next_step"]="Compare module manifests/readmes and tests; never merge repositories directly"
 else:
  available,_=git("cat-file","-e",sha+"^{commit}")
  if available:
   row["git_relation"]="SHA_NOT_IN_LOCAL_OBJECTS"
   row["next_step"]="Fetch SHA or compare via GitHub API"
  else:
   is_ancestor,_=git("merge-base","--is-ancestor",sha,"HEAD")
   if is_ancestor==0:
    row["git_relation"]="ANCESTOR_OF_CURRENT_BRANCH"
    row["next_step"]="Verify capability at code level; no direct merge needed"
   else:
    row["git_relation"]="NOT_ANCESTOR_OF_CURRENT_BRANCH"
    row["next_step"]="Diff changed paths and tests; cherry-pick ONLY reviewed nonduplicate additions"
with target.open("w",newline="",encoding="utf-8-sig") as f:
 cols=["repo","branch","head_sha","triage","capability_area","git_relation","next_step"]
 w=csv.DictWriter(f,fieldnames=cols);w.writeheader();w.writerows(rows)
print("TOTAL",len(rows),flush=True)
print("RELATIONS",dict(collections.Counter(x["git_relation"] for x in rows)),flush=True)
print("AREAS",dict(collections.Counter(x["capability_area"] for x in rows)),flush=True)
