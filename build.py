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
if "mobile-v28.css" not in text:
    text=text.replace("</head>",'<link rel="stylesheet" href="./mobile-v28.css?v=28"></head>',1)
if "mobile-v28.js" not in text:
    head,sep,tail=text.rpartition("</body>")
    if not sep: raise SystemExit("Final body close missing")
    text=head+'<script src="./mobile-v28.js?v=28" defer></script></body>'+tail
(out/"app-safe.html").write_text(text,encoding="utf-8")
(out/"index.html").write_bytes(Path("unlock.html").read_bytes())

for name in ["icon-192.png","icon-512.png","apple-touch-icon.png"]:
    src=Path("payload")/(name+".b64")
    (out/name).write_bytes(base64.b64decode(src.read_text(encoding="utf-8").strip()))
for name in ["sw.js","manifest.webmanifest","INSTALL-iPHONE-ar.txt","_headers","mobile-v28.css","mobile-v28.js"]:
    src=Path(name)
    if src.exists(): (out/name).write_bytes(src.read_bytes())
shutil.copytree("secure",out/"secure")
print("Built password-locked full-data mobile v28 release:",len(list(out.rglob("*"))),"entries")
