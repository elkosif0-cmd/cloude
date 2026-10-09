from pathlib import Path
import base64, gzip, hashlib, html as htmlmod, json, os, re, shutil
import private_blocks
from build_mode import build_mode

MODE=build_mode()  # production, or preview: no private data at all (see build_mode.py)

# The front door is the company gallery (unlock.html). A production build keeps the private company's locked card
# and the reviewed unlock script; a preview build has no private data, so both are cut out and the page is noindex.
PRIVATE_COMPANY_NAME=(os.environ.get("SQC_PRIVATE_COMPANY_NAME") or "تصيف").strip() or "تصيف"
# The door's data (FOUNDATION §3): the three entries and the sectors from the capability registry, and the bundle companies
# the audit entry lists (id, name, sector, country, year — not their trial balances), inlined so the door works offline.
def entry_data():
    reg=json.loads(Path("ui/core/capabilities.json").read_text(encoding="utf-8"))
    bundle=json.loads(Path("ui/data/bundle-clients.json").read_text(encoding="utf-8"))
    gates=[{k:g[k] for k in ("id","label","short","sub","icon","home") if k in g} for g in reg.get("gateways",[])]
    corpus=[{"id":c["id"],"company":c.get("company",""),"sector":c.get("sector",""),"country":c.get("countryAr") or c.get("country",""),"fy":c.get("fy","")} for c in bundle.get("clients",[]) if c.get("id")]
    js=lambda v: json.dumps(v,ensure_ascii=False,separators=(",",":")).replace("</","<\\/")
    return "window.SQC_GATES="+js(gates)+";window.SQC_SECTORS="+js(reg.get("sectors",[]))+";window.SQC_CORPUS="+js(corpus)+";"
def entry_page(mode):
    page=Path("unlock.html").read_text(encoding="utf-8")
    assert page.count('data-locked-name="تصيف"')==1, "unlock.html: locked company name marker"
    page=page.replace('data-locked-name="تصيف"','data-locked-name="'+htmlmod.escape(PRIVATE_COMPANY_NAME,quote=True)+'"')
    page,nd=re.subn(r"/\*SQC:ENTRY-DATA\*/",lambda _:entry_data(),page,count=1)
    if nd!=1: raise SystemExit("unlock.html: SQC:ENTRY-DATA marker missing")
    if mode=="preview":
        page,n1=re.subn(r"<!--SQC:LOCKED:START-->.*?<!--SQC:LOCKED:END-->\n?","",page,flags=re.S)
        page,n2=re.subn(r"<!--SQC:AUTH:START-->.*?<!--SQC:AUTH:END-->\n?","",page,flags=re.S)
        if n1!=1 or n2!=1: raise SystemExit("unlock.html: SQC:LOCKED / SQC:AUTH markers missing")
        page=page.replace('data-locked="1"','data-locked="0"',1)
        page=page.replace('<meta charset="utf-8">','<meta charset="utf-8">\n<meta name="robots" content="noindex,nofollow">',1)
        if "crypto.json" in page or 'id="f"' in page: raise SystemExit("preview entry page still carries the unlock form")
    return page


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
text=re.sub(r"<meta\s+name=['\"]theme-color['\"][^>]*>", '<meta name="theme-color" content="#0b1030">', text, flags=re.I)
head_end=text.find("</head>")
if head_end<0: raise SystemExit("Page head close missing")
head,tail=text[:head_end],text[head_end:]
# Canonicalize install metadata from the legacy payload. Remove every old icon/manifest link first
# so browser precedence cannot resurrect favicon-32x32.png, kosif-cloud.svg or manifest.json.
head=re.sub(r"<link\b(?=[^>]*\brel=['\"](?:shortcut\s+)?icon['\"])[^>]*>\s*", "", head, flags=re.I)
head=re.sub(r"<link\b(?=[^>]*\brel=['\"]manifest['\"])[^>]*>\s*", "", head, flags=re.I)
head += '<link rel="icon" type="image/svg+xml" href="./art/sqc-icon.svg">'
head += '<link rel="icon" type="image/png" href="./icon-192.png">'
head += '<link rel="manifest" href="./manifest.webmanifest">'
text=head+tail
# Product identity is audit-first SQC; أغنام الوادي is only the demo company, never the product description.
DESCRIPTION="SQC — Smart Quality Control: منصة المراجعة والتأكيد — ملف المراجعة والأدلة والقوائم والتقارير، مع أدوات مساعدة للمحاسب، تعمل دون اتصال."
text,nd=re.subn(r'<meta\s+name=["\']description["\'][^>]*>',f'<meta name="description" content="{DESCRIPTION}">',text,count=1,flags=re.I)
if nd!=1: raise SystemExit("Page description meta missing")
# the rail brand: the SQC mark and name (the core markup is kept; only the brand block is replaced)
text,nb=re.subn(r'<div class="brand-mark" aria-hidden="true">.*?</div>\s*<div><h1 id="app-name">[^<]*</h1>',
  '<div class="brand-mark" aria-hidden="true"><img src="./art/sqc-icon.svg" alt="" width="24" height="24"></div>\n        <div><h1 id="app-name">SQC</h1>',text,count=1,flags=re.S)
if nb!=1: raise SystemExit("Rail brand markup missing")
# R10 (docs/rebuild/HARSH_REVIEW_20261008_ar.md): the butchery lab's note named the cells of the owner's spreadsheet
# (AD46, AG44:AG46, AD48); a user reads where the numbers come from, not which cells held them
text,ny=re.subn(r'القيم الافتراضية مأخوذة من الحسابات الجانبية في ملفك: (<b>27\.2 كجم</b> عجل) \(الخلية AD46\)، و(<b>4\.07 \+ 2\.7 = 6\.77 كجم</b> غير لحم) \(AG44:AG46\)، (والعظم <b>2\.7 كجم × 7\.5</b>) \(AD48\)\.',
  r'القيم الافتراضية من آخر تجربة تقطيع مسجّلة: \1، و\2، \3.',text,count=1)
if ny!=1: raise SystemExit("Butchery lab note missing")
# the core's English eyebrows (a section's small label above its title) read in Arabic like the rest of the app
for en,ar in (("System Health · Read Only","فحص للقراءة فقط"),("Safe Matching Assistant · v18","مساعد المطابقة الآمنة"),
              ("Product 360 · التعرض التجاري","المنتج الشامل · التعرض التجاري"),("Order-to-Cash 360","من الطلب إلى التحصيل"),
              ("Exception Inbox · حتمي · بلا خادم","صندوق الاستثناءات · حتمي · بلا خادم"),("Dry Run قبل الكتابة","تجربة قبل الكتابة"),
              ("Customer Master · المصدر الخام","سجل العملاء · المصدر الخام"),("Customer & Demand Intelligence · v18","العملاء والطلب"),
              ("Customer & Demand Intelligence","العملاء والطلب"),("Catalog Mapping Domain","ربط الكتالوج")):
  text,ny=re.subn(r'(class="eyebrow">)'+re.escape(en)+'<',lambda m:m.group(1)+ar+'<',text)
  if ny<1: raise SystemExit("Core eyebrow missing: "+en)
# R13: the decision center's «الحكم» tile read «Choice + Score + Noul» (Jev's three question kinds, one of them misspelt)
n=text.count('<div class="d">Choice + Score + Noul</div>')
if n!=1: raise SystemExit("Decision center Jev tile missing")
text=text.replace('<div class="d">Choice + Score + Noul</div>','<div class="d">نعم/لا · اختيار من بدائل · تقييم</div>')
# R14 (#26): «طرق التقطيع المطلوبة» drew an empty table when no order named a cutting method
n=text.count("<tbody>${cutTable}</tbody>")
if n!=1: raise SystemExit("Cutting methods table missing")
text=text.replace("<tbody>${cutTable}</tbody>","<tbody>${cutTable||'<tr><td class=\"s\" colspan=\"3\">لا طلبات تذكر طريقة تقطيع في هذه الفترة.</td></tr>'}</tbody>")
# R11 (#10): «ذكاء العملاء والطلب» segments by recency and frequency, «ذكاء المبيعات» by RFM; both said «أوفياء»,
# «أبطال», «معرضون للفقد», «خاملون» for different groups (22 loyal customers on one screen, 4 on the next). The core's
# operational segments get their own words; the RFM names stay with the RFM engine.
for en,ar in (("champion:['أبطال',","champion:['الأعلى قيمة',"),("loyal:['أوفياء',","loyal:['منتظمون',"),
              ("risk:['معرضون للفقد',","risk:['غائبون بعد تكرار',"),("dormant:['خاملون',","dormant:['منقطعون',"),
              ('<div class="d">معرضون للفقد + خاملون</div>','<div class="d">غائبون بعد تكرار + منقطعون</div>')):
  n=text.count(en)
  if n!=1: raise SystemExit("Core segment label missing: "+en)
  text=text.replace(en,ar)

# The UI ships as one stylesheet and one script, in layer order:
#   design system (ui/ds) → core services (ui/core) → components → layout → features.
# ui/core/capabilities.json is the single list of screens; it is inlined for the registry.
UI_CSS=["ds/fonts.css","ds/tokens.css","ds/components.css","ds/elements.css","ds/shell.css","ds/luxe.css","core/save-state.css","components/studio.css",
        "features/offers.css","features/supply.css","features/smartmatch.css","features/meatops.css","features/kernel.css",
        "features/enterprise.css","features/reports.css","features/erp-plus.css","features/operations.css","features/capabilities-v2.css","features/devices.css","features/luxe-screens.css","features/channel-profit.css","features/capability-gate.css","features/tbreview.css","features/assistant.css","features/accounting-guidance.css","features/audit-bench.css","features/fieldwork.css","features/helper-center.css","features/corpus-lab.css","features/product-tree.css","features/sales-map.css","features/entry-sim.css","features/product-flow.css","features/customer-flow.css","features/pulse.css","features/benchmarks.css","features/advances.css","features/legacy-apps.css","features/management-report.css","features/sales-intel.css","ds/sqc.css","ds/surfaces.css"]
UI_JS=["core/sk.js","core/output.js","core/bus.js","core/errors.js","core/store.js","core/save-state.js","core/services.js","core/engines.js","core/management-report-model.js","core/registry.js","core/perm.js","core/audit.js","core/device.js","core/ai.js","core/demo.js","core/helper-space.js","core/company.js","core/company-platform.js","core/gate.js","core/standards.js","core/templates.js","core/flow.js","core/screen-tabs.js","core/a11y.js","core/motion.js",
       "components/states.js","components/studio.js","layouts/shell.js","layouts/rail-audit.js","layouts/topbar.js","components/palette.js","components/keys.js","components/charts.js","components/table.js","components/xlsx.js","components/file-input.js","features/command-center.js",
       "features/jev.js","features/offers.js","features/inventory.js","features/supply.js","features/meatops.js","features/smartmatch.js",
       "features/pricing-core.js","features/kernel.js","features/tools.js","features/enterprise.js","features/reports.js","features/report-pack.js",
       "features/erp-plus.js","features/operations.js","features/capabilities-v2.js","features/audit-bridge.js",
       "features/audit-inbox.js","features/ledger.js","features/management-report-source.js","features/management-report-output.js","features/management-report.js","features/advances.js","features/legacy-apps.js","features/month-close.js","features/purchasing.js","features/definition-pickers.js","features/workspace.js","features/master-data.js","features/reporting-intake.js","features/followup.js","features/devices.js","features/notifications.js","features/risks.js","features/accounting-guidance.js","features/codex.js","features/audit-bench.js","features/report-docs.js","features/integrated-report.js","features/audit-practice.js","features/corpus-lab.js","features/product-tree.js","features/sales-map.js","features/entry-sim.js","features/tb-council.js","features/tb-fieldwork.js","features/tb-review.js","features/sales-intel.js","features/channel-profit.js","features/capability-gate.js","features/sales-lab.js","features/assistant.js","features/helper-center.js","features/product-flow.js","features/customer-flow.js","features/pulse.js","features/benchmarks.js"]
listed={Path("ui",n).as_posix() for n in UI_CSS+UI_JS}
stray=[f.as_posix() for f in Path("ui").glob("*.*") if f.suffix in (".js",".css")]
stray+=[f.as_posix() for d in ("core","ds","components","layouts","features") for f in Path("ui",d).glob("*.*") if f.suffix in (".js",".css") and f.as_posix() not in listed]
if stray: raise SystemExit("UI files not wired into the build (add them to UI_CSS/UI_JS or delete them): "+", ".join(sorted(stray)))
caps=json.loads(Path("ui/core/capabilities.json").read_text(encoding="utf-8"))
bundle_css="\n".join(f"/* ---- ui/{n} ---- */\n"+Path("ui",n).read_text(encoding="utf-8") for n in UI_CSS)
# Each module is isolated: an error while one loads is logged and the modules after it still load.
def management_css_script(css):
  # Exact reviewed source; escape '<' even if this external bundle is later embedded inline.
  return "window.__SK_MANAGEMENT_REPORT_CSS__="+json.dumps(css,ensure_ascii=True).replace("<","\\u003c")+";\n"

bundle_js=management_css_script(Path("ui/features/management-report.css").read_text(encoding="utf-8"))+"window.__SK_CAPS__="+json.dumps(caps,ensure_ascii=False,separators=(",",":"))+";\n"+"\n".join(f"/* ---- ui/{n} ---- */\ntry{{\n"+Path("ui",n).read_text(encoding="utf-8")+f"\n}}catch(e){{console.error('S.kosif module ui/{n} failed to load',e)}}" for n in UI_JS)
# The build number: the ?v= of the bundle and the <meta name="sqc-build"> the core's error log records with each error,
# so an error can be told apart from one raised by another release. It covers the core too, not only the bundle.
tag=hashlib.sha256((text+bundle_css+bundle_js).encode()).hexdigest()[:10]
text=text.replace("</head>",f'<meta name="sqc-build" content="{tag}"><link rel="stylesheet" href="./skosif.css?v={tag}"></head>',1)
head,sep,tail=text.rpartition("</body>")
if not sep: raise SystemExit("Final body close missing")
text=head+f'<script src="./skosif.js?v={tag}" defer></script></body>'+tail

text,private=private_blocks.extract(text)
if MODE=="preview": private=None  # cut out above; a preview drops the blocks instead of encrypting them
(out/"app-safe.html").write_text(text,encoding="utf-8",newline="\n")
# the front door: the company gallery, with the private company only in a production build
(out/"index.html").write_bytes(entry_page(MODE).encode("utf-8"))

for name in ["icon-192.png","icon-512.png","apple-touch-icon.png"]:
    src=Path("payload")/(name+".b64")
    (out/name).write_bytes(base64.b64decode(src.read_text(encoding="utf-8").strip()))

for name in ["sw.js","manifest.webmanifest","INSTALL-iPHONE-ar.txt","INSTALL-LAPTOP-ar.txt","_headers"]:
    (out/name).write_bytes(Path(name).read_bytes())
if MODE=="preview":
    with open(out/"_headers","a",encoding="utf-8",newline="\n") as h: h.write("/*\n  X-Robots-Tag: noindex, nofollow\n")
(out/"skosif.css").write_text(bundle_css,encoding="utf-8",newline="\n")
(out/"skosif.js").write_text(bundle_js,encoding="utf-8",newline="\n")
shutil.copytree("ui/art",out/"art")
# The audit studio stays as ES modules (loaded on first use), outside the bundle.
shutil.copytree("ui/audit",out/"audit")
if Path("ui/data").exists(): shutil.copytree("ui/data",out/"data")
# the original systems (الأنظمة الأصلية), opened inside the helper tools with demo data
if Path("ui/legacy").exists(): shutil.copytree("ui/legacy",out/"legacy")

if MODE=="production":
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
(out/"sw.js").write_text(sw,encoding="utf-8",newline="\n")
print("Built SQC ("+MODE+"):",len(list(out.rglob("*"))),"entries")
