from pathlib import Path
import base64, gzip, shutil

out=Path("dist")
if out.exists(): shutil.rmtree(out)
out.mkdir()

parts=sorted(Path("payload").glob("index.html.gz.b64.part*"))
if not parts: raise SystemExit("No safe app payload parts found")
payload="".join(p.read_text(encoding="utf-8").strip() for p in parts)
html=gzip.decompress(base64.b64decode(payload))
if b'const SEED_B64 = "";' not in html: raise SystemExit("Safe app marker missing")
text=html.decode("utf-8")
for css_name, version in [("mobile-v28.css","28"),("jev-v1.css","1")]:
    if css_name not in text:
        text=text.replace("</head>",f'<link rel="stylesheet" href="./{css_name}?v={version}"></head>',1)
for js_name, version in [("mobile-v28.js","28"),("jev-v1.js","1")]:
    if js_name not in text:
        head,sep,tail=text.rpartition("</body>")
        if not sep: raise SystemExit("Final body close missing")
        text=head+f'<script src="./{js_name}?v={version}" defer></script></body>'+tail
(out/"app-safe.html").write_text(text,encoding="utf-8")
(out/"index.html").write_bytes(Path("unlock.html").read_bytes())

for name in ["icon-192.png","icon-512.png","apple-touch-icon.png"]:
    src=Path("payload")/(name+".b64")
    (out/name).write_bytes(base64.b64decode(src.read_text(encoding="utf-8").strip()))
for name in ["sw.js","manifest.webmanifest","INSTALL-iPHONE-ar.txt","_headers","mobile-v28.css","mobile-v28.js","jev-v1.css","jev-v1.js"]:
    src=Path(name)
    if src.exists(): (out/name).write_bytes(src.read_bytes())
shutil.copytree("secure",out/"secure")
print("Built password-locked full-data mobile v28 + Jev release:",len(list(out.rglob("*"))),"entries")
