from pathlib import Path
import base64, gzip, hashlib, re, shutil
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
text=re.sub(r"<title>[^<]*</title>","<title>S.kosif</title>",text,count=1,flags=re.I)
text=re.sub(r'<meta\s+name=["\']apple-mobile-web-app-title["\'][^>]*>', '<meta name="apple-mobile-web-app-title" content="S.kosif">', text, count=1, flags=re.I)

# The S.kosif screens live in ui/ and ship as one stylesheet and one script.
# Order matters: shell.js provides the shared helpers the screens use.
UI_CSS=["skosif.css","offers.css","supply.css","smartmatch.css","meatops.css","kernel.css"]
UI_JS=["shell.js","jev.js","offers.js","inventory.js","supply.js","meatops.js","smartmatch.js","pricing-core.js","kernel.js","tools.js"]
bundle_css="\n".join(f"/* ---- ui/{n} ---- */\n"+Path("ui",n).read_text(encoding="utf-8") for n in UI_CSS)
bundle_js="\n".join(f"/* ---- ui/{n} ---- */\n"+Path("ui",n).read_text(encoding="utf-8") for n in UI_JS)
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

for name in ["sw.js","manifest.webmanifest","INSTALL-iPHONE-ar.txt","_headers"]:
    (out/name).write_bytes(Path(name).read_bytes())
(out/"skosif.css").write_text(bundle_css,encoding="utf-8")
(out/"skosif.js").write_text(bundle_js,encoding="utf-8")

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
print("Built S.kosif:",len(list(out.rglob("*"))),"entries")
