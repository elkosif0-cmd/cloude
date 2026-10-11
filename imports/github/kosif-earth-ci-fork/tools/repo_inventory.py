"""Deep repository inventory (FOUNDATION §0.0.0) — one report per repository under kosif199022-jpg.

    SQC_REPOS=<folder with one shallow clone per repository> python tools/repo_inventory.py [name ...]

For every clone it writes docs/registry/repos/<name>_ar.md: what the repository is (GitHub metadata, README), how it is
built (entry points, scripts, workers), what it holds (every source module with its first comment, exports and TODOs;
schemas and data; routes and workers; AI/agent material; tests), what is still open there (PRs, issues, branches), and
the capability decisions kept by hand in docs/registry/repos/decisions.json (merged in, never overwritten). The index
docs/registry/repos/README.md states the coverage of each repository. This repository (cloude) is covered by
tools/capability_matrix.py, so it is not scanned here.
"""
from pathlib import Path
import json, os, re, subprocess, sys, datetime

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs/registry/repos"
DECISIONS = OUT / "decisions.json"
REPOS = Path(os.environ.get("SQC_REPOS", "")).expanduser() if os.environ.get("SQC_REPOS") else None
OWNER = "kosif199022-jpg"
TODAY = datetime.date.today().isoformat()
SKIP_DIRS = {".git", "node_modules", "dist", "build", ".next", "__pycache__", ".venv", "venv", "vendor", ".engines-build", "coverage"}
CODE = {".ts": "TypeScript", ".tsx": "TypeScript", ".js": "JavaScript", ".mjs": "JavaScript", ".cjs": "JavaScript", ".py": "Python", ".html": "HTML", ".sql": "SQL", ".toml": "config", ".yml": "config", ".yaml": "config", ".json": "data", ".md": "docs", ".css": "CSS", ".csv": "data", ".txt": "text"}
# restricted libraries: structure and counts only — no README, comment or TODO text is quoted
RESTRICTED = {"kosif-atlas-private"}
MAX_MODULES = 140          # modules listed per repository (the largest first); the rest are counted by folder
MAX_READ = 400_000         # bytes read from a file for its first comment / counts

def sh(*args, cwd=None):
    try:
        return subprocess.run(list(args), cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=120).stdout
    except Exception as e:
        return ""

def gh_json(path, default):
    out = sh("gh", "api", path)
    try: return json.loads(out) if out.strip() else default
    except Exception: return default

def meta(name):
    r = gh_json(f"repos/{OWNER}/{name}", {})
    prs = gh_json(f"repos/{OWNER}/{name}/pulls?state=open&per_page=50", [])
    issues = [i for i in gh_json(f"repos/{OWNER}/{name}/issues?state=open&per_page=100", []) if "pull_request" not in i]
    branches = gh_json(f"repos/{OWNER}/{name}/branches?per_page=100", [])
    return {"private": r.get("private"), "language": r.get("language"), "size_kb": r.get("size"), "pushed": (r.get("pushed_at") or "")[:10], "default_branch": r.get("default_branch"),
            "description": r.get("description") or "", "archived": r.get("archived"), "fork": r.get("fork"),
            "prs": [{"n": p["number"], "title": p["title"], "head": p["head"]["ref"], "updated": p["updated_at"][:10], "draft": p.get("draft")} for p in prs if isinstance(p, dict)],
            "issues": [{"n": i["number"], "title": i["title"], "updated": i["updated_at"][:10]} for i in issues if isinstance(i, dict)],
            "branches": [b["name"] for b in branches if isinstance(b, dict)]}

def read_head(p, n=MAX_READ):
    try:
        with open(p, "rb") as f: return f.read(n).decode("utf-8", "replace")
    except Exception: return ""

def first_comment(text, ext):
    if ext == ".py":
        m = re.search(r'^\s*(?:"""|\'\'\')(.*?)(?:"""|\'\'\')', text, re.S)
        if m: return re.sub(r"\s+", " ", m.group(1)).strip()[:220]
        lines = [l.strip("# ").strip() for l in text.splitlines()[:8] if l.strip().startswith("#") and not l.startswith("#!")]
        return " ".join(lines)[:220]
    m = re.search(r"/\*\*?(.*?)\*/", text[:6000], re.S)
    if m: return re.sub(r"\s+", " ", m.group(1).replace("*", " ")).strip()[:220]
    lines = [l.strip("/ ").strip() for l in text.splitlines()[:8] if l.strip().startswith("//")]
    if lines: return " ".join(lines)[:220]
    if ext == ".html":
        t = re.search(r"<title>(.*?)</title>", text, re.S | re.I)
        return ("<title> " + re.sub(r"\s+", " ", t.group(1)).strip()) [:220] if t else ""
    return ""

def scan(root):
    files, by_ext, folders = [], {}, {}
    for dp, dns, fns in os.walk(root):
        dns[:] = [d for d in dns if d not in SKIP_DIRS and not d.startswith(".")]
        rel_dir = os.path.relpath(dp, root).replace("\\", "/")
        for fn in fns:
            p = Path(dp) / fn
            try: size = p.stat().st_size
            except Exception: continue
            ext = p.suffix.lower()
            rel = (rel_dir + "/" + fn).lstrip("./") if rel_dir != "." else fn
            files.append((rel, size, ext))
            by_ext[ext] = by_ext.get(ext, 0) + 1
            top = rel.split("/")[0] if "/" in rel else "(root)"
            folders.setdefault(top, [0, 0]); folders[top][0] += 1; folders[top][1] += size
    return files, by_ext, folders

def analyse(root, files):
    modules, tests, schemas, routes, ai, todos, entries, scripts = [], [], [], [], [], [], [], []
    for rel, size, ext in sorted(files, key=lambda x: -x[1]):
        low = rel.lower()
        if ext in (".sql", ".prisma") or re.search(r"schema|migration", low): schemas.append(rel)
        if re.search(r"(^|/)(package\.json|wrangler[^/]*\.toml|pyproject\.toml|requirements[^/]*\.txt|setup\.py|manifest\.(json|webmanifest)|index\.html|main\.py|app\.py|server\.(js|mjs|py)|worker\.(js|mjs))$", low): entries.append(rel)
        if re.search(r"(^|/)(skill\.md|skills?/|prompts?/|council|jev|agents?/)", low) and ext in (".md", ".json", ".py", ".js", ".ts", ".txt"): ai.append(rel)
        if ext in (".ts", ".tsx", ".js", ".mjs", ".cjs", ".py", ".html", ".sql") and not low.endswith(".min.js") and "/vendor/" not in low and size < 3_000_000:
            text = read_head(root / rel)
            is_test = bool(re.search(r"(\.test\.|\.spec\.|^tests?/|/tests?/|_test\.py|test_[^/]*\.py)", low))
            lines = text.count("\n") + 1
            exports = len(re.findall(r"^\s*export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class|let|var|interface|type|enum)\b|^\s*(?:def|class)\s+\w+", text, re.M))
            td = re.findall(r"^.*\b(TODO|FIXME|HACK|DEPRECATED|XXX)\b.*$", text, re.M)
            for t in td[:6]: todos.append(rel + ": " + re.sub(r"\s+", " ", t.strip())[:160])
            for m in re.finditer(r"(addEventListener\(['\"]fetch['\"]|app\.(get|post|put|delete|route)\(['\"][^'\"]+|router\.(get|post|put|delete)\(['\"][^'\"]+|@app\.(get|post|route)\(['\"][^'\"]+|@router\.(get|post)\(['\"][^'\"]+|url\.pathname\s*===?\s*['\"][^'\"]+|case\s+['\"]/[^'\"]*['\"])", text):
                routes.append(rel + ": " + m.group(0)[:90])
            if ext in (".js", ".ts", ".mjs") and re.search(r"(^|/)(package\.json)$", low): pass
            (tests if is_test else modules).append({"path": rel, "size": size, "lines": lines, "exports": exports, "todos": len(td), "doc": first_comment(text, ext)})
    pkg = root / "package.json"
    if pkg.exists():
        try:
            j = json.loads(read_head(pkg)); scripts = [f"`{k}`: {v}" for k, v in (j.get("scripts") or {}).items()]
            deps = list((j.get("dependencies") or {}).keys()); devd = list((j.get("devDependencies") or {}).keys())
            entries.append(f"package.json — deps: {', '.join(deps[:25]) or '—'}; devDeps: {', '.join(devd[:15]) or '—'}")
        except Exception: pass
    routes = sorted(set(routes))[:60]
    return modules, tests, schemas, routes, sorted(set(ai))[:80], todos[:60], entries[:40], scripts

def readme(root):
    for n in ("README.md", "readme.md", "README.ar.md", "README_ar.md", "README", "README.txt"):
        p = root / n
        if p.exists():
            t = read_head(p, 20000)
            lines = [l for l in t.splitlines() if l.strip()][:45]
            return n, "\n".join("    " + l[:200] for l in lines)
    return "", ""

def decisions():
    try: return json.loads(DECISIONS.read_text(encoding="utf-8"))
    except Exception: return {}

def esc(s): return str(s).replace("|", "¦").replace("\n", " ")

def report(name, root, m):
    files, by_ext, folders = scan(root)
    modules, tests, schemas, routes, ai, todos, entries, scripts = analyse(root, files)
    rn, rtext = readme(root)
    if name in RESTRICTED:
        rtext = ""; todos = []
        for x in modules + tests: x["doc"] = ""
    commit = sh("git", "rev-parse", "--short", "HEAD", cwd=root).strip()
    dec = decisions().get(name, {})
    total = sum(s for _, s, _ in files)
    doc = [f"# {name} — تقرير الجرد العميق ({TODAY})", "",
           f"> مولَّد بـ `tools/repo_inventory.py` من نسخة سطحية عند `{commit}`؛ قسم «القدرات والقرارات» يُكتب يدوياً في `decisions.json` ويُدمج هنا. مرجع القاعدة: `FOUNDATION.md` §0.0.0–§0.0.1.", "",
           "## 1. المستودع", "",
           f"- `github.com/{OWNER}/{name}` — {'خاص' if m.get('private') else 'عام'} · اللغة الرئيسية {m.get('language') or '—'} · {m.get('size_kb') or 0:,} ك.ب على GitHub · آخر دفع {m.get('pushed') or '—'} · الفرع الافتراضي `{m.get('default_branch') or '—'}`" + (" · مؤرشف" if m.get("archived") else "") + (" · متفرع (fork)" if m.get("fork") else ""),
           f"- الوصف على GitHub: {m.get('description') or '—'}",
           f"- النسخة المفحوصة: **{len(files):,} ملفاً** ({total/1024/1024:.1f} م.ب) بعد استبعاد {', '.join(sorted(SKIP_DIRS))}.",
           f"- الفروع: {len(m.get('branches') or [])} · طلبات الدمج المفتوحة: {len(m.get('prs') or [])} · Issues المفتوحة: {len(m.get('issues') or [])}", "",
           "## 2. التغطية", "",
           f"- حالة الجرد: **{dec.get('coverage', 'مسح آلي كامل للملفات + قراءة بشرية للوحدات الرئيسية المذكورة في §6')}**",
           f"- ما لم يُفحص: {dec.get('not_covered', 'الملفات الثنائية والوسائط؛ المحتوى داخل المجلدات المستبعدة أعلاه')}", "",
           "## 3. البنية", "",
           "| المجلد | الملفات | الحجم |", "|---|---|---|"]
    for k, (n, s) in sorted(folders.items(), key=lambda x: -x[1][1])[:30]: doc.append(f"| `{esc(k)}` | {n} | {s/1024:.0f} ك.ب |")
    doc += ["", "الامتدادات: " + "، ".join(f"`{k or '(بلا)'}` {v}" for k, v in sorted(by_ext.items(), key=lambda x: -x[1])[:16]), ""]
    if entries: doc += ["نقاط الدخول والإعداد:", ""] + [f"- `{esc(e)}`" if not e.startswith("package.json —") else f"- {esc(e)}" for e in entries] + [""]
    if scripts: doc += ["سكربتات package.json: " + "؛ ".join(esc(s) for s in scripts[:20]), ""]
    if rtext: doc += [f"## 4. README (`{rn}`، أول الأسطر)", "", rtext, ""]
    elif name in RESTRICTED: doc += ["## 4. README", "", "مستودع مقيد الترخيص: لا يُقتبس نصه هنا — البنية والأعداد فقط.", ""]
    else: doc += ["## 4. README", "", "لا يوجد README.", ""]
    doc += ["## 5. الوحدات المصدرية", "", f"{len(modules)} وحدة (الأكبر أولاً؛ تُعرض {min(len(modules), MAX_MODULES)}). «ماذا تفعل» = أول تعليق في الملف كما كُتب.", "",
            "| الملف | أسطر | تصديرات | TODO | ماذا تفعل |", "|---|---|---|---|---|"]
    for x in modules[:MAX_MODULES]: doc.append(f"| `{esc(x['path'])}` | {x['lines']} | {x['exports']} | {x['todos'] or ''} | {esc(x['doc']) or '—'} |")
    if len(modules) > MAX_MODULES:
        rest = {}
        for x in modules[MAX_MODULES:]:
            top = "/".join(x["path"].split("/")[:2]); rest[top] = rest.get(top, 0) + 1
        doc += ["", "الباقي بالمجلد: " + "، ".join(f"`{k}` {v}" for k, v in sorted(rest.items(), key=lambda x: -x[1])[:40])]
    doc += ["", f"## 6. الاختبارات ({len(tests)})", ""]
    doc += [f"- `{esc(t['path'])}` ({t['lines']} سطراً) {esc(t['doc'])}" for t in tests[:60]] or ["- لا اختبارات."]
    doc += ["", "## 7. المخططات والبيانات", ""] + ([f"- `{esc(s)}`" for s in schemas[:40]] or ["- لا مخططات أو ملفات ترحيل ظاهرة."])
    doc += ["", "## 8. المسارات والعمّال وواجهات API", ""] + ([f"- `{esc(r)}`" for r in routes] or ["- لا مسارات ظاهرة."])
    doc += ["", "## 9. مواد الذكاء الاصطناعي والوكلاء", ""] + ([f"- `{esc(a)}`" for a in ai] or ["- لا مهارات أو مطالبات أو مجالس ظاهرة."])
    doc += ["", "## 10. TODO / FIXME / HACK / DEPRECATED", ""] + ([f"- {esc(t)}" for t in todos] or ["- لا شيء."])
    doc += ["", "## 11. المفتوح على GitHub", ""]
    doc += [f"- PR #{p['n']} ({p['updated']}{'، مسودة' if p.get('draft') else ''}) `{esc(p['head'])}`: {esc(p['title'])}" for p in m.get("prs") or []] or ["- لا طلبات دمج مفتوحة."]
    doc += [f"- Issue #{i['n']} ({i['updated']}): {esc(i['title'])}" for i in (m.get("issues") or [])[:40]] or ["- لا Issues مفتوحة."]
    doc += ["- الفروع: " + ("، ".join(f"`{b}`" for b in (m.get("branches") or [])[:60]) or "—"), ""]
    doc += ["## 12. القدرات والقرارات (يدوي — `decisions.json`)", ""]
    caps = dec.get("capabilities") or []
    if caps:
        doc += ["| القدرة | ماذا تفعل فعلياً | التصنيف | القطاع | الحالة | الأفضل بين التنفيذات | الموضع في S.KOSIF | القرار | اختبار القبول | NEXT |", "|---|---|---|---|---|---|---|---|---|---|"]
        for c in caps: doc.append("| " + " | ".join(esc(c.get(k, "—")) for k in ("name", "what", "class", "sector", "state", "best", "target", "decision", "acceptance", "next")) + " |")
    else: doc += ["لم تُكتب بعد — المستودع مجرود آلياً فقط."]
    if dec.get("notes"): doc += ["", "ملاحظات: " + esc(dec["notes"])]
    doc.append("")
    return "\n".join(doc), {"name": name, "files": len(files), "modules": len(modules), "tests": len(tests), "prs": len(m.get("prs") or []), "issues": len(m.get("issues") or []), "branches": len(m.get("branches") or []), "coverage": dec.get("coverage", "مسح آلي"), "caps": len(caps), "pushed": m.get("pushed"), "private": m.get("private")}

def main():
    if not REPOS or not REPOS.exists(): raise SystemExit("set SQC_REPOS to the folder holding one clone per repository")
    OUT.mkdir(parents=True, exist_ok=True)
    wanted = sys.argv[1:]
    rows = []
    for d in sorted(REPOS.iterdir()):
        if not (d / ".git").exists(): continue
        name = "-" if d.name == "dash-repo" else d.name
        if wanted and name not in wanted: continue
        m = meta(name)
        text, row = report(name, d, m)
        fname = ("dash" if name == "-" else name) + "_ar.md"
        (OUT / fname).write_text(text, encoding="utf-8", newline="\n")
        row["file"] = fname; rows.append(row); print("wrote", fname, row["files"], "files", row["modules"], "modules")
    # rows from earlier runs stay in the index; a run over some repositories refreshes only those
    known = OUT / "index.json"
    merged = {r["name"]: r for r in (json.loads(known.read_text(encoding="utf-8")) if known.exists() else [])}
    merged.update({r["name"]: r for r in rows})
    rows = sorted(merged.values(), key=lambda r: r["name"].lower())
    known.write_text(json.dumps(rows, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    idx = [f"# تقارير جرد المستودعات ({TODAY})", "", "> واحد لكل مستودع تحت `kosif199022-jpg` عدا `cloude` (مجرود في `../CAPABILITY_MIGRATION_MATRIX_ar.md`). تُولَّد بـ `tools/repo_inventory.py`؛ القرارات اليدوية في `decisions.json`.", "",
           "| المستودع | التقرير | ملفات | وحدات | اختبارات | PRs | Issues | فروع | آخر دفع | التغطية | قدرات مقررة |", "|---|---|---|---|---|---|---|---|---|---|---|"]
    for r in rows: idx.append(f"| `{r['name']}`{' (خاص)' if r['private'] else ''} | [{r['file']}]({r['file']}) | {r['files']:,} | {r['modules']} | {r['tests']} | {r['prs']} | {r['issues']} | {r['branches']} | {r['pushed'] or '—'} | {esc(r['coverage'])} | {r['caps']} |")
    (OUT / "README.md").write_text("\n".join(idx) + "\n", encoding="utf-8", newline="\n")
    print("index:", len(rows), "repositories")

if __name__ == "__main__":
    main()
