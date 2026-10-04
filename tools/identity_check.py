"""Product identity is audit-first SQC; أغنام الوادي is the demo company, never the product.

Runs on a built dist/ (either build mode) and fails when:
  - the page description, rail tagline, unlock page or manifest describe the product as pricing / orders / customers;
  - the first manifest shortcuts are not audit entry points, or any shortcut points at a screen that does not exist;
  - the accountant helpers stop being reachable from the manifest (they are secondary, never removed);
  - أغنام الوادي disappears as the demo company.
Usage: python3 tools/identity_check.py [dist]
"""
from pathlib import Path
import json, re, sys

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

DIST = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
SALES_FIRST = ["التسعير والطلبات والعملاء", "منظومة أغنام الوادي", "مع العمليات والتسعير والمالية", "مع التسعير والطلبات والمخزون"]
failures = []
def ok(name, cond, extra=""):
    print(("✓ " if cond else "✗ ") + name + (f" — {extra}" if extra and not cond else ""))
    if not cond: failures.append(name)

app = (DIST / "app-safe.html").read_text(encoding="utf-8")
css = (DIST / "skosif.css").read_text(encoding="utf-8")
index = (DIST / "index.html").read_text(encoding="utf-8")
manifest = json.loads((DIST / "manifest.webmanifest").read_text(encoding="utf-8"))
headers = (DIST / "_headers").read_text(encoding="utf-8")
caps = {c["id"]: c for c in json.loads(Path("ui/core/capabilities.json").read_text(encoding="utf-8"))["capabilities"]}

app_head = app.split("</head>", 1)[0]
unlock_head = index.split("</head>", 1)[0]

desc = re.search(r'<meta\s+name=["\']description["\']\s+content="([^"]*)"', app)
ok("page description exists and names SQC", bool(desc) and desc.group(1).startswith("SQC"))
ok("page description is audit-first", bool(desc) and "المراجعة" in desc.group(1) and not any(s in desc.group(1) for s in SALES_FIRST), desc.group(1) if desc else "")
tag = re.search(r'#biz-name::after\{content:"([^"]*)"', css)
ok("rail tagline is audit-first", bool(tag) and "المراجعة" in tag.group(1) and not any(s in tag.group(1) for s in SALES_FIRST), tag.group(1) if tag else "missing")
ok("manifest description is audit-first", "المراجعة" in manifest["description"] and not any(s in manifest["description"] for s in SALES_FIRST))
ok("manifest theme matches canonical SQC navy", manifest.get("theme_color") == "#0c2340", str(manifest.get("theme_color")))
ok("unlock / landing page carries no sales-first product line", not any(s in index for s in SALES_FIRST))
ok("app shell uses canonical SQC theme color", 'name="theme-color" content="#0c2340"' in app_head)
ok("app shell uses SQC favicon", 'href="./art/sqc-icon.svg"' in app_head and "kosif-cloud.svg" not in app_head)
ok("app shell advertises manifest", 'rel="manifest" href="./manifest.webmanifest"' in app_head)
ok("unlock page has audit-first meta description", 'name="description"' in unlock_head and "المراجعة" in unlock_head)
ok("unlock page advertises manifest", 'rel="manifest" href="./manifest.webmanifest"' in unlock_head)
if 'data-locked="0"' not in index: ok("unlock password has an explicit label", 'for="p">كلمة المرور الآمنة</label>' in index)
preview_door = 'data-locked="0"' in index
ok("front door is the company gallery" + (" (preview: no private company)" if preview_door else " with the private company locked"),
   'id="co-list"' in index and (('id="locked"' not in index and 'id="f"' not in index) if preview_door else ('data-locked="1"' in index and 'id="locked"' in index)))
if 'data-locked="0"' not in index: ok("unlock feedback exposes alert/status semantics", 'id="msg" role="alert"' in index and 'id="progress" role="status"' in index)
if 'data-locked="0"' not in index: ok("password visibility toggle exposes pressed state", 'id="eye" type="button" aria-label="إظهار كلمة المرور" aria-pressed="false"' in index)
ok("root entry is explicitly non-cacheable", re.search(r"(?m)^/$\n\s+Cache-Control:\s*no-cache, no-store, must-revalidate\s*$", headers) is not None)
ok("manifest is explicitly revalidated", re.search(r"(?m)^/manifest\.webmanifest$\n\s+Cache-Control:\s*no-cache, must-revalidate\s*$", headers) is not None)
for f in ("app-safe.html", "skosif.css", "skosif.js", "manifest.webmanifest", "index.html"):
    text = (DIST / f).read_text(encoding="utf-8")
    hit = [s for s in SALES_FIRST if s in text]
    ok(f"{f}: no sales-first product wording", not hit, ", ".join(hit))

shortcuts = manifest.get("shortcuts", [])
gos = [re.search(r"[?&]go=([\w-]+)", s["url"]) for s in shortcuts]
ok("every ?go= shortcut opens a registered screen", all(caps.get(g.group(1)) for g in gos if g), ", ".join(g.group(1) for g in gos if g and g.group(1) not in caps))
primary = [g.group(1) if g else None for g in gos[:3]]
ok("the first three shortcuts are audit entry points", all(p and caps[p].get("group") == "audit" for p in primary), str(primary))
ok("sales shortcuts are not primary", not any(re.search(r"go=(zatca|inventory|commerce|catalog)|do=sale", s["url"]) for s in shortcuts[:3]))
ok("accountant helpers stay reachable from the manifest", any("go=helperdesk" in s["url"] for s in shortcuts))
ok("أغنام الوادي remains the demo company", "أغنام الوادي" in app)

if failures:
    print(f"\n{len(failures)} identity check(s) failed"); sys.exit(1)
print("\nProduct identity is audit-first SQC; the demo company and the helpers are intact.")
