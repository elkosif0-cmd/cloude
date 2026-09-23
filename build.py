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
(out/"app-safe.html").write_bytes(html)
(out/"index.html").write_bytes(Path("unlock.html").read_bytes())

for name in ["icon-192.png","icon-512.png","apple-touch-icon.png"]:
    src=Path("payload")/(name+".b64")
    (out/name).write_bytes(base64.b64decode(src.read_text(encoding="utf-8").strip()))
for name in ["sw.js","manifest.webmanifest","INSTALL-iPHONE-ar.txt","_headers"]:
    src=Path(name)
    if src.exists(): (out/name).write_bytes(src.read_bytes())
shutil.copytree("secure",out/"secure")
print("Built password-locked full-data release:",len(list(out.rglob("*"))),"entries")
