from pathlib import Path
import base64, gzip, hashlib, re, shutil
import private_blocks

ROOT=Path(__file__).resolve().parent
APP_DIST=ROOT/"app"/"dist"
OUT=ROOT/"dist"

if not APP_DIST.exists() or not (APP_DIST/"index.html").exists():
    raise SystemExit("New React build missing: run cd app && npm run build before build.py")

parts=sorted((ROOT/"payload").glob("index.html.gz.b64.part*"))
if not parts:
    raise SystemExit("Legacy data bootstrap payload missing")
payload="".join(p.read_text(encoding="utf-8").strip() for p in parts)
legacy_html=gzip.decompress(base64.b64decode(payload)).decode("utf-8")
if 'const SEED_B64 = "";' not in legacy_html:
    raise SystemExit("Encrypted seed bootstrap marker missing from legacy data source")
_, private = private_blocks.extract(legacy_html)

if OUT.exists():
    shutil.rmtree(OUT)
shutil.copytree(APP_DIST,OUT)

app=(OUT/"index.html").read_text(encoding="utf-8")
app=re.sub(r'<script>\s*const SEED_B64\s*=\s*"";[\s\S]*?EXCEL_REF[\s\S]*?</script>\s*','',app,count=1)
app=re.sub(r'<script\s+type="application/json"\s+id="v25-modules">[\s\S]*?</script>\s*','',app,count=1)
bootstrap='''<script>
const SEED_B64 = "";
/*AGHNAM_PRIVATE:catalog*/const SEED_RAWS=[],SEED_BOXES=[],SEED_EXPS=[],EXCEL_REF={raws:{},boxes:{}};
window.__SKOSIF_BOOTSTRAP__={seedB64:SEED_B64,raws:SEED_RAWS,boxes:SEED_BOXES,expenses:SEED_EXPS,excelRef:EXCEL_REF};
</script>
<script type="application/json" id="v25-modules">{"__aghnam_private":"modules"}</script>
'''
if "<body" not in app:
    raise SystemExit("New app body marker missing")
body_end=app.find(">",app.find("<body"))+1
app=app[:body_end]+bootstrap+app[body_end:]

catalog_placeholder=("/*AGHNAM_PRIVATE:catalog*/const SEED_RAWS=[],SEED_BOXES=[],SEED_EXPS=[],"
                     "EXCEL_REF={raws:{},boxes:{}};")
if 'const SEED_B64 = "";' not in app:
    raise SystemExit("New app seed marker missing after injection")
if catalog_placeholder not in app:
    raise SystemExit("New app private catalog placeholder missing")
if '{"__aghnam_private":"modules"}' not in app:
    raise SystemExit("New app private modules placeholder missing")

(OUT/"app-safe.html").write_text(app,encoding="utf-8")
(OUT/"index.html").write_bytes((ROOT/"unlock.html").read_bytes())

for name in ["icon-192.png","icon-512.png","apple-touch-icon.png"]:
    src=ROOT/"payload"/(name+".b64")
    (OUT/name).write_bytes(base64.b64decode(src.read_text(encoding="utf-8").strip()))

for name in ["manifest.webmanifest","INSTALL-iPHONE-ar.txt","_headers","sw.js"]:
    (OUT/name).write_bytes((ROOT/name).read_bytes())

shutil.copytree(ROOT/"secure",OUT/"secure",dirs_exist_ok=True)
if private:
    private_blocks.encrypt(private,ROOT/"secure",OUT/"secure")

digest=hashlib.sha256()
for f in sorted(OUT.rglob("*")):
    if f.is_file() and f.name!="sw.js":
        digest.update(str(f.relative_to(OUT)).encode())
        digest.update(f.read_bytes())
sw=(OUT/"sw.js").read_text(encoding="utf-8")
sw,n=re.subn(r"const CACHE='[^']*';",f"const CACHE='skosif-zero-{digest.hexdigest()[:12]}';",sw,count=1)
if n!=1:
    raise SystemExit("sw.js CACHE marker missing")
(OUT/"sw.js").write_text(sw,encoding="utf-8")

built=(OUT/"app-safe.html").read_text(encoding="utf-8")
for forbidden in ["skosif.js","skosif.css","SKosifCore.registerView","v29-fab","sk33-dock","Product360Modal"]:
    if forbidden in built:
        raise SystemExit("Legacy presentation marker leaked into new app: "+forbidden)
if not list((OUT/"assets").glob("*.js")):
    raise SystemExit("Vite JS bundle missing")
print("Built zero-legacy S.kosif:",len(list(OUT.rglob("*"))),"entries; private blocks:",len(private))
