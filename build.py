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

# Patches that must run inside the app's private scope are spliced in
# ahead of a known anchor. A payload that no longer has the anchor is
# built without the patch rather than failing the deploy.
for patch_name, anchor in [
    ("react-import-v33.js", "try{\n  const V25_PARSE_OLD=parseBackupPayload;"),
    ("core-bridge-v31.js", "if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();"),
]:
    if anchor in text:
        patch=Path(patch_name).read_text(encoding="utf-8")
        text=text.replace(anchor, patch+"\n"+anchor, 1)
    else:
        print(f"warning: {patch_name} not applied (anchor missing)")


# Product branding: keep business data intact, rename only the application shell.
text=re.sub(r"<title>[^<]*</title>","<title>S.kosif</title>",text,count=1,flags=re.I)
text=re.sub(r'<meta\s+name=["\']apple-mobile-web-app-title["\'][^>]*>', '<meta name="apple-mobile-web-app-title" content="S.kosif">', text, count=1, flags=re.I)

for css_name, version in [
    ("mobile-v28.css","28"),
    ("jev-v1.css","1"),
    ("jev-question-v1.css","1"),
    ("v29-smart.css","29"),
    ("skosif-v30.css","30"),
    ("skosif-supply-v31.css","31"),
    ("skosif-catalog-v32.css","32")
]:
    if css_name not in text:
        text=text.replace("</head>",f'<link rel="stylesheet" href="./{css_name}?v={version}"></head>',1)

for js_name, version in [
    ("mobile-v28.js","28"),
    ("jev-v1.js","1"),
    ("jev-question-v1.js","1"),
    ("v29-smart.js","29"),
    ("skosif-v30.js","30"),
    ("skosif-supply-v31.js","31"),
    ("skosif-catalog-v32.js","32")
]:
    if js_name not in text:
        head,sep,tail=text.rpartition("</body>")
        if not sep: raise SystemExit("Final body close missing")
        text=head+f'<script src="./{js_name}?v={version}" defer></script></body>'+tail

text,private=private_blocks.extract(text)
(out/"app-safe.html").write_text(text,encoding="utf-8")
(out/"index.html").write_bytes(Path("unlock.html").read_bytes())

for name in ["icon-192.png","icon-512.png","apple-touch-icon.png"]:
    src=Path("payload")/(name+".b64")
    (out/name).write_bytes(base64.b64decode(src.read_text(encoding="utf-8").strip()))

for name in [
    "sw.js","manifest.webmanifest","INSTALL-iPHONE-ar.txt","_headers",
    "mobile-v28.css","mobile-v28.js","jev-v1.css","jev-v1.js",
    "jev-question-v1.css","jev-question-v1.js","v29-smart.css","v29-smart.js","skosif-v30.css","skosif-v30.js","skosif-supply-v31.css","skosif-supply-v31.js","skosif-catalog-v32.css","skosif-catalog-v32.js"
]:
    src=Path(name)
    if src.exists(): (out/name).write_bytes(src.read_bytes())

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
print("Built S.kosif V30 password-locked Fusion release:",len(list(out.rglob("*"))),"entries")
