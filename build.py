from pathlib import Path
import base64, gzip, hashlib, re, shutil
import private_blocks

out = Path("dist")
if out.exists():
    shutil.rmtree(out)
out.mkdir()

parts = sorted(Path("payload").glob("index.html.gz.b64.part*"))
if not parts:
    raise SystemExit("No safe app payload parts found")
payload = "".join(p.read_text(encoding="utf-8").strip() for p in parts)
html = gzip.decompress(base64.b64decode(payload))
if b'const SEED_B64 = "";' not in html:
    raise SystemExit("Safe app marker missing")
text = html.decode("utf-8")

# Private-scope patches are semantic modules now; no release-number stacking.
for patch_name, anchor in [
    ("modules/app/react-import.js", "try{\n  const V25_PARSE_OLD=parseBackupPayload;"),
    ("modules/app/core-bridge.js", "if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();"),
]:
    if anchor in text:
        patch = Path(patch_name).read_text(encoding="utf-8")
        text = text.replace(anchor, patch + "\n" + anchor, 1)
    else:
        print(f"warning: {patch_name} not applied (anchor missing)")

# Product branding only; business data remains untouched.
text = re.sub(r"<title>[^<]*</title>", "<title>S.kosif</title>", text, count=1, flags=re.I)
text = re.sub(
    r'<meta\s+name=["\']apple-mobile-web-app-title["\'][^>]*>',
    '<meta name="apple-mobile-web-app-title" content="S.kosif">',
    text,
    count=1,
    flags=re.I,
)

CSS_ASSETS = [
    "modules/ui/mobile.css",
    "modules/decision/bridge.css",
    "modules/decision/question.css",
    "modules/tools/smart.css",
    "modules/app/core.css",
    "modules/features/supply.css",
    "modules/ui/workspace.css",
    "modules/features/catalog.css",
    "modules/ui/shell.css",
    "modules/features/matching.css",
    "modules/features/pricing.css",
    "modules/app/session.css",
    "modules/features/meatops.css",
    "modules/ui/motion.css",
]

JS_ASSETS = [
    "modules/ui/mobile.js",
    "modules/decision/bridge.js",
    "modules/decision/question.js",
    "modules/tools/smart.js",
    "modules/app/core.js",
    "modules/features/supply.js",
    "modules/ui/workspace.js",
    "modules/features/catalog.js",
    "modules/ui/shell.js",
    "modules/features/matching.js",
    "modules/features/pricing-core.js",
    "modules/features/pricing.js",
    "modules/app/session.js",
    "modules/features/meatops.js",
    "modules/ui/motion.js",
]

REV = "clean-20260924"
for asset in CSS_ASSETS:
    if asset not in text:
        text = text.replace("</head>", f'<link rel="stylesheet" href="./{asset}?rev={REV}"></head>', 1)

for asset in JS_ASSETS:
    if asset not in text:
        head, sep, tail = text.rpartition("</body>")
        if not sep:
            raise SystemExit("Final body close missing")
        text = head + f'<script src="./{asset}?rev={REV}" defer></script></body>' + tail

text, private = private_blocks.extract(text)
(out / "app-safe.html").write_text(text, encoding="utf-8")
(out / "index.html").write_bytes(Path("unlock.html").read_bytes())

for name in ["icon-192.png", "icon-512.png", "apple-touch-icon.png"]:
    src = Path("payload") / (name + ".b64")
    (out / name).write_bytes(base64.b64decode(src.read_text(encoding="utf-8").strip()))

for name in ["sw.js", "manifest.webmanifest", "INSTALL-iPHONE-ar.txt", "_headers"]:
    src = Path(name)
    if src.exists():
        (out / name).write_bytes(src.read_bytes())

for asset in CSS_ASSETS + JS_ASSETS:
    src = Path(asset)
    dst = out / asset
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_bytes(src.read_bytes())

shutil.copytree("secure", out / "secure")
if private:
    private_blocks.encrypt(private, Path("secure"), out / "secure")

# Content-address the service-worker cache so every successful release replaces old assets.
digest = hashlib.sha256()
for file in sorted(out.rglob("*")):
    if file.is_file() and file.name != "sw.js":
        digest.update(str(file.relative_to(out)).encode())
        digest.update(file.read_bytes())
sw = (out / "sw.js").read_text(encoding="utf-8")
sw, n = re.subn(r"const CACHE='[^']*';", f"const CACHE='skosif-{digest.hexdigest()[:12]}';", sw, count=1)
if n != 1:
    raise SystemExit("sw.js CACHE marker missing")
(out / "sw.js").write_text(sw, encoding="utf-8")

print("Built S.kosif semantic modular release:", len(list(out.rglob("*"))), "entries")
