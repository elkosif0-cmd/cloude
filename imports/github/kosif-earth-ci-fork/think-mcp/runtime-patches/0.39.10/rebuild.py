import gzip, hashlib, json
from pathlib import Path
root = Path(__file__).resolve().parent
source = gzip.decompress((root / "worker-0.39.9.mjs.gz").read_bytes()).decode()
assert hashlib.sha256(source.encode()).hexdigest() == "dbc932a288c6ee523765d4d4aa0c6dcddfae38945fa0d8fbec52f7eb94853990"
for patch in json.loads((root / "patches.json").read_text()):
    assert source.count(patch["old"]) == 1
    source = source.replace(patch["old"], patch["new"])
assert hashlib.sha256(source.encode()).hexdigest() == "75d5cb6f437a1efb7a301a678a742d180a1199dbcb0a0a7cc0f8906047aa6521"
(root / "worker-live-patched.mjs").write_text(source)
