"""Encrypt the private parts of the app page at build time.

The payload still carries some business data in plaintext: the Excel price
catalog and the five embedded v25 modules (sales analytics and CRM with
customer names and mobile numbers). The built app-safe.html is public, so
build.py cuts those blocks out, leaves a placeholder for each, and writes
them to secure/private.* encrypted with the same keys as the data seed.
unlock.html decrypts them with the entered password and puts them back
before opening the app.

Keys come from KOSIF_UNLOCK_PASSWORD (or AGHNAM_UNLOCK_PASSWORD) with the seed's own PBKDF2 salt and
iteration count, so unlocking costs no extra key derivation. The password
is checked against the seed's HMAC tag first, so a wrong password fails the
build instead of publishing data nobody can open.
"""
from pathlib import Path
import base64, gzip, hashlib, hmac, json, os, re, struct

PASSWORD_ENV = "KOSIF_UNLOCK_PASSWORD"
LEGACY_PASSWORD_ENV = "AGHNAM_UNLOCK_PASSWORD"

CATALOG_START = "/* ===== بيانات ملف الإكسل"
CATALOG_PLACEHOLDER = ("/*AGHNAM_PRIVATE:catalog*/const SEED_RAWS=[],SEED_BOXES=[],"
                       "SEED_EXPS=[],EXCEL_REF={raws:{},boxes:{}};")
MODULES_RE = re.compile(r'(<script type="application/json" id="v25-modules">)(.*?)(</script>)', re.S)
MODULES_PLACEHOLDER = '{"__aghnam_private":"modules"}'
PHONE_RE = re.compile(r"(?<!\d)05\d{8}(?!\d)")


def _rotl(v, n):
    return ((v << n) & 0xFFFFFFFF) | (v >> (32 - n))


def _block(key_words, counter, nonce_words):
    s = [0x61707865, 0x3320646E, 0x79622D32, 0x6B206574, *key_words, counter, *nonce_words]
    x = s[:]
    for _ in range(10):
        for a, b, c, d in ((0, 4, 8, 12), (1, 5, 9, 13), (2, 6, 10, 14), (3, 7, 11, 15),
                           (0, 5, 10, 15), (1, 6, 11, 12), (2, 7, 8, 13), (3, 4, 9, 14)):
            x[a] = (x[a] + x[b]) & 0xFFFFFFFF; x[d] = _rotl(x[d] ^ x[a], 16)
            x[c] = (x[c] + x[d]) & 0xFFFFFFFF; x[b] = _rotl(x[b] ^ x[c], 12)
            x[a] = (x[a] + x[b]) & 0xFFFFFFFF; x[d] = _rotl(x[d] ^ x[a], 8)
            x[c] = (x[c] + x[d]) & 0xFFFFFFFF; x[b] = _rotl(x[b] ^ x[c], 7)
    return struct.pack("<16I", *((x[i] + s[i]) & 0xFFFFFFFF for i in range(16)))


def chacha20(key, nonce, data, counter=1):
    """ChaCha20 (RFC 8439), matching xor() in unlock.html."""
    kw = struct.unpack("<8I", key)
    nw = struct.unpack("<3I", nonce)
    out = bytearray(len(data))
    for off in range(0, len(data), 64):
        ks = _block(kw, counter, nw)
        counter += 1
        chunk = data[off:off + 64]
        out[off:off + len(chunk)] = bytes(a ^ b for a, b in zip(chunk, ks))
    return bytes(out)


def _derive(password, meta):
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"),
                             base64.b64decode(meta["salt_b64"]), meta["iterations"], 64)
    return dk[:32], dk[32:]


def _check_password(mac_key, meta, secure_dir):
    ct = b"".join(base64.b64decode(Path(secure_dir.parent, p).read_text(encoding="utf-8").strip())
                  for p in meta["parts"])
    tag = hmac.new(mac_key, base64.b64decode(meta["nonce_b64"]) + ct, hashlib.sha256).digest()
    return hmac.compare_digest(tag, base64.b64decode(meta["tag_b64"]))


def extract(text):
    """Cut the private blocks out of the page. Returns (public_text, {placeholder: original})."""
    blocks = {}
    a = text.find(CATALOG_START)
    if a >= 0:
        ref = text.index("const EXCEL_REF=", a)
        b = text.index("\n", ref)
        blocks[CATALOG_PLACEHOLDER] = text[a:b]
        text = text[:a] + CATALOG_PLACEHOLDER + text[b:]
    m = MODULES_RE.search(text)
    if m and m.group(2) != MODULES_PLACEHOLDER:
        blocks[MODULES_PLACEHOLDER] = m.group(2)
        text = text[:m.start(2)] + MODULES_PLACEHOLDER + text[m.end(2):]
    leaked = sorted(set(PHONE_RE.findall(text)) - {f"05000000{i:02d}" for i in range(100)})
    if leaked:
        raise SystemExit(f"Refusing to build: {len(leaked)} mobile numbers left in the public page")
    return text, blocks


def encrypt(blocks, secure_dir, out_dir):
    """Write out_dir/private.json and its cipher parts. Needs the unlock password."""
    password = os.environ.get(PASSWORD_ENV) or os.environ.get(LEGACY_PASSWORD_ENV, "")
    if not password:
        raise SystemExit(f"{PASSWORD_ENV} is not set; refusing to publish private data unencrypted")
    meta = json.loads((secure_dir / "crypto.json").read_text(encoding="utf-8"))
    # A secret pasted into a dashboard often picks up a trailing space or
    # newline; only a candidate that opens the seed is accepted.
    for candidate in dict.fromkeys([password, password.strip()]):
        enc_key, mac_key = _derive(candidate, meta)
        if _check_password(mac_key, meta, secure_dir):
            break
    else:
        raise SystemExit(f"{PASSWORD_ENV} does not open secure/crypto.json "
                         f"(length {len(password)}); check the password")
    plain = gzip.compress(json.dumps(blocks, ensure_ascii=False).encode("utf-8"), mtime=0)
    nonce = os.urandom(12)
    ct = chacha20(enc_key, nonce, plain)
    tag = hmac.new(mac_key, nonce + ct, hashlib.sha256).digest()
    body = base64.b64encode(ct).decode("ascii")
    size = 900_000
    parts = []
    for i in range(0, len(body), size):
        name = f"secure/private.enc.b64.part{i // size:03d}"
        (out_dir.parent / name).write_text(body[i:i + size], encoding="ascii")
        parts.append(name)
    (out_dir / "private.json").write_text(json.dumps({
        "format": "gzip-json-placeholders",
        "cipher": "ChaCha20-IETF", "authentication": "HMAC-SHA-256",
        "keys": "same as crypto.json", "nonce_b64": base64.b64encode(nonce).decode(),
        "tag_b64": base64.b64encode(tag).decode(), "parts": parts,
    }, indent=1), encoding="utf-8")
