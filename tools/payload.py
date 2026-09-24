"""Decode or re-encode the core app payload (payload/index.html.gz.b64.partNNN).

  python3 tools/payload.py decode core.html   # payload -> editable HTML
  python3 tools/payload.py encode core.html   # HTML -> payload parts (old parts replaced)
"""
from pathlib import Path
import base64, gzip, sys

PAYLOAD = Path(__file__).resolve().parent.parent / "payload"
PART = 40000

def decode(dst):
    parts = sorted(PAYLOAD.glob("index.html.gz.b64.part*"))
    data = "".join(p.read_text(encoding="utf-8").strip() for p in parts)
    Path(dst).write_bytes(gzip.decompress(base64.b64decode(data)))

def encode(src):
    html = Path(src).read_bytes()
    if b'const SEED_B64 = "";' not in html: raise SystemExit("seed marker missing")
    b64 = base64.b64encode(gzip.compress(html, 9, mtime=0)).decode()
    for p in PAYLOAD.glob("index.html.gz.b64.part*"): p.unlink()
    for i in range(0, len(b64), PART):
        (PAYLOAD / f"index.html.gz.b64.part{i // PART + 1:03d}").write_text(b64[i:i + PART] + "\n", encoding="utf-8")
    print("parts:", -(-len(b64) // PART))

if __name__ == "__main__":
    if len(sys.argv) != 3 or sys.argv[1] not in ("decode", "encode"): raise SystemExit(__doc__)
    (decode if sys.argv[1] == "decode" else encode)(sys.argv[2])
