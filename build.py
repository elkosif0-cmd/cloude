from pathlib import Path
import base64, gzip, hashlib, json, re, shutil
import private_blocks

out=Path("dist")
if out.exists(): shutil.rmtree(out)
out.mkdir()

parts=sorted(Path("payload").glob("index.html.gz.b64.part*"))
if not parts: raise SystemExit("No safe app payload parts found")
payload="".join(p.read_text(encoding="utf-8").strip() for p in parts)
html=gzip.decompress(base64.b64decode(payload))
if b'const SEED_B64 = "";' not in html: raise SystemExit("Safe app marker missing")
text=html.decode("utf-8")

# Product branding: keep business data intact, rename only the application shell.
text=re.sub(r"<title>[^<]*</title>","<title>SQC — Smart Quality Control</title>",text,count=1,flags=re.I)
text=re.sub(r'<meta\s+name=["\']apple-mobile-web-app-title["\'][^>]*>', '<meta name="apple-mobile-web-app-title" content="SQC">', text, count=1, flags=re.I)
# the rail brand: the SQC mark and name (the core markup is kept; only the brand block is replaced)
text,nb=re.subn(r'<div class="brand-mark" aria-hidden="true">.*?</div>\s*<div><h1 id="app-name">[^<]*</h1>',
  '<div class="brand-mark" aria-hidden="true"><img src="./art/sqc-icon.svg" alt="" width="24" height="24"></div>\n        <div><h1 id="app-name">SQC</h1>',text,count=1,flags=re.S)
if nb!=1: raise SystemExit("Rail brand markup missing")

# The UI ships as one stylesheet and one script, in layer order:
#   design system (ui/ds) → core services (ui/core) → components → layout → features.
# ui/core/capabilities.json is the single list of screens; it is inlined for the registry.
UI_CSS=["ds/fonts.css","ds/tokens.css","ds/components.css","ds/elements.css","ds/shell.css","ds/luxe.css",
        "features/offers.css","features/supply.css","features/smartmatch.css","features/meatops.css","features/kernel.css",
        "features/enterprise.css","features/reports.css","features/erp-plus.css","features/operations.css","features/capabilities-v2.css","features/devices.css","features/luxe-screens.css","features/tbreview.css","features/assistant.css","features/accounting-guidance.css","features/audit-bench.css","features/fieldwork.css","features/helper-center.css","features/corpus-lab.css","features/product-flow.css","ds/sqc.css"]
UI_JS=["core/sk.js","core/output.js","core/bus.js","core/errors.js","core/store.js","core/services.js","core/engines.js","core/registry.js","core/perm.js","core/audit.js","core/device.js","core/ai.js","core/demo.js","core/templates.js","core/flow.js","core/a11y.js",
       "components/states.js","layouts/shell.js","layouts/topbar.js","components/palette.js","components/keys.js","components/charts.js","components/table.js","components/xlsx.js","features/command-center.js",
       "features/jev.js","features/offers.js","features/inventory.js","features/supply.js","features/meatops.js","features/smartmatch.js",
       "features/pricing-core.js","features/kernel.js","features/tools.js","features/enterprise.js","features/reports.js","features/report-pack.js",
       "features/erp-plus.js","features/operations.js","features/capabilities-v2.js","features/audit-bridge.js",
       "features/ledger.js","features/month-close.js","features/purchasing.js","features/workspace.js","features/followup.js","features/devices.js","features/notifications.js","features/risks.js","features/accounting-guidance.js","features/codex.js","features/audit-bench.js","features/report-docs.js","features/integrated-report.js","features/audit-practice.js","features/corpus-lab.js","features/tb-council.js","features/tb-fieldwork.js","features/tb-review.js","features/sales-lab.js","features/assistant.js","features/helper-center.js","features/product-flow.js"]
listed={"ui/"+n for n in UI_CSS+UI_JS}
stray=[str(f) for f in Path("ui").glob("*.*") if f.suffix in (".js",".css")]
stray+=[str(f) for d in ("core","ds","components","layouts","features") for f in Path("ui",d).glob("*.*") if f.suffix in (".js",".css") and str(f) not in listed]
if stray: raise SystemExit("UI files not wired into the build (add them to UI_CSS/UI_JS or delete them): "+", ".join(sorted(stray)))
caps=json.loads(Path("ui/core/capabilities.json").read_text(encoding="utf-8"))
bundle_css="\n".join(f"/* ---- ui/{n} ---- */\n"+Path("ui",n).read_text(encoding="utf-8") for n in UI_CSS)
# Each module is isolated: an error while one loads is logged and the modules after it still load.
bundle_js="window.__SK_CAPS__="+json.dumps(caps,ensure_ascii=False,separators=(",",":"))+";\n"+"\n".join(f"/* ---- ui/{n} ---- */\ntry{{\n"+Path("ui",n).read_text(encoding="utf-8")+f"\n}}catch(e){{console.error('S.kosif module ui/{n} failed to load',e)}}" for n in UI_JS)
tag=hashlib.sha256((bundle_css+bundle_js).encode()).hexdigest()[:10]
text=text.replace("</head>",f'<link rel="stylesheet" href="./skosif.css?v={tag}"></head>',1)
head,sep,tail=text.rpartition("</body>")
if not sep: raise SystemExit("Final body close missing")
text=head+f'<script src="./skosif.js?v={tag}" defer></script></body>'+tail

text,private=private_blocks.extract(text)
(out/"app-safe.html").write_text(text,encoding="utf-8")
(out/"index.html").write_bytes(Path("unlock.html").read_bytes())

for name in ["icon-192.png","icon-512.png","apple-touch-icon.png"]:
    src=Path("payload")/(name+".b64")
    (out/name).write_bytes(base64.b64decode(src.read_text(encoding="utf-8").strip()))

for name in ["sw.js","manifest.webmanifest","INSTALL-iPHONE-ar.txt","INSTALL-LAPTOP-ar.txt","_headers"]:
    (out/name).write_bytes(Path(name).read_bytes())
(out/"skosif.css").write_text(bundle_css,encoding="utf-8")
(out/"skosif.js").write_text(bundle_js,encoding="utf-8")
shutil.copytree("ui/art",out/"art")
# The audit studio stays as ES modules (loaded on first use), outside the bundle.
shutil.copytree("ui/audit",out/"audit")

shutil.copytree("secure",out/"secure")
if private: private_blocks.encrypt(private,Path("secure"),out/"secure")

# Name the service-worker cache after the build contents so every release
# replaces the copy cached on installed phones.
digest=hashlib.sha256()
for f in sorted(out.rglob("*")):
    if f.is_file() and f.name!="sw.js":
        digest.update(str(f.relative_to(out)).encode()); digest.update(f.read_bytes())
sw=(out/"sw.js").read_text(encoding="utf-8")
sw,n=re.subn(r"const CACHE='[^']*';",f"const CACHE='skosif-{digest.hexdigest()[:12]}';",sw,count=1)
if n!=1: raise SystemExit("sw.js CACHE marker missing")
(out/"sw.js").write_text(sw,encoding="utf-8")
print("Built SQC:",len(list(out.rglob("*"))),"entries")
