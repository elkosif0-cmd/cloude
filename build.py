from pathlib import Path
import base64, gzip

out = Path("dist")
out.mkdir(exist_ok=True)

parts = sorted(Path("payload").glob("index.html.gz.b64.part*"))
if not parts:
    raise SystemExit("No index payload parts found")

payload = "".join(p.read_text(encoding="utf-8").strip() for p in parts)
(out / "index.html").write_bytes(gzip.decompress(base64.b64decode(payload)))

for name in ["icon-192.png", "icon-512.png", "apple-touch-icon.png"]:
    src = Path("payload") / (name + ".b64")
    (out / name).write_bytes(base64.b64decode(src.read_text(encoding="utf-8").strip()))

for name in ["sw.js", "manifest.webmanifest", "INSTALL-iPHONE-ar.txt"]:
    src = Path(name)
    if src.exists():
        (out / name).write_bytes(src.read_bytes())

print("Built public-safe Aghnam Alwadi site:", len(list(out.iterdir())), "files")
