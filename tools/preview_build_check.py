"""Proves a preview build cannot publish private data, and production is exactly as strict as before.

Builds a throwaway copy of the repository under five configurations:
  1. Cloudflare preview branch, no password                -> builds; contains no private data (checks below)
  2. Cloudflare preview branch, a password set anyway      -> builds; still no private data, nothing encrypted
  3. Cloudflare production branch (main), no password      -> refuses to build
  4. a plain local/CI build, no password                   -> refuses to build
  5. SQC_BUILD_MODE set to an unknown value                -> refuses to build
A preview dist must not contain:
  - secure/, any encrypted part, crypto.json or private.json;
  - any sample of the price catalog or the v25 modules (the blocks private_blocks cuts out);
  - any real mobile number.
It must also be marked noindex.
Usage: python3 tools/preview_build_check.py
"""
from pathlib import Path
import os, re, shutil, subprocess, sys, tempfile

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
import private_blocks  # noqa: E402

if hasattr(sys.stdout, "reconfigure"):
    try: sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception: pass
if hasattr(sys.stderr, "reconfigure"):
    try: sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception: pass

failures = []
def ok(name, cond, extra=""):
    print(("✓ " if cond else "✗ ") + name + (f" — {extra}" if extra and not cond else ""))
    if not cond: failures.append(name)

def private_samples():
    """Distinctive slices of every block private_blocks cuts out of the page, taken from the real payload."""
    import base64, gzip
    parts = sorted((ROOT / "payload").glob("index.html.gz.b64.part*"))
    text = gzip.decompress(base64.b64decode("".join(p.read_text(encoding="utf-8").strip() for p in parts))).decode("utf-8")
    _, blocks = private_blocks.extract(text)
    assert blocks, "private_blocks found nothing to cut out of the payload"
    samples = []
    for body in blocks.values():
        assert len(body) > 1000, "a private block is unexpectedly small"
        for at in (0, len(body) // 3, len(body) // 2, 2 * len(body) // 3, len(body) - 120):
            samples.append(body[at:at + 120])
    return samples, list(blocks)

def build(tmp, env_extra):
    env = {k: v for k, v in os.environ.items() if k not in ("KOSIF_UNLOCK_PASSWORD", "AGHNAM_UNLOCK_PASSWORD", "CF_PAGES", "CF_PAGES_BRANCH", "SQC_BUILD_MODE")}
    env.update(env_extra)
    shutil.rmtree(tmp / "dist", ignore_errors=True)
    return subprocess.run([sys.executable, "build.py"], cwd=tmp, env=env, capture_output=True, text=True, timeout=600)

def dist_files(tmp):
    return [f for f in (tmp / "dist").rglob("*") if f.is_file()]

def check_preview(tmp, label, samples, placeholders):
    files = dist_files(tmp)
    names = [str(f.relative_to(tmp / "dist")) for f in files]
    ok(f"{label}: no secure/ directory", not (tmp / "dist" / "secure").exists())
    bad = [n for n in names if re.search(r"(^|/)(secure/|crypto\.json|private\.json)|\.enc\b|seed\.enc", n)]
    ok(f"{label}: no encrypted or private files", not bad, ", ".join(bad[:5]))
    blob = "\n".join(f.read_bytes().decode("utf-8", "ignore") for f in files)
    hits = sum(1 for s in samples if s in blob)
    ok(f"{label}: none of {len(samples)} private-block samples is in the dist", hits == 0, f"{hits} found")
    ok(f"{label}: price catalog absent", "SEED_RAWS=[{" not in blob and private_blocks.CATALOG_START not in blob)
    app = (tmp / "dist" / "app-safe.html").read_text(encoding="utf-8")
    head = app.split("</head>", 1)[0]
    ok(f"{label}: each private block ({len(placeholders)}) is replaced by its placeholder", all(ph in app for ph in placeholders))
    ok(f"{label}: SQC theme color is canonical", 'name="theme-color" content="#0c2340"' in head)
    ok(f"{label}: SQC favicon replaces legacy cloud mark", 'href="./art/sqc-icon.svg"' in head and "kosif-cloud.svg" not in head)
    ok(f"{label}: app shell advertises the PWA manifest", 'rel="manifest" href="./manifest.webmanifest"' in head)
    phones = set(private_blocks.PHONE_RE.findall(blob)) - {f"05000000{i:02d}" for i in range(100)}
    ok(f"{label}: no real mobile numbers", not phones, f"{len(phones)} found")
    index = (tmp / "dist" / "index.html").read_text(encoding="utf-8")
    ok(f"{label}: index is the preview page, not the unlock page", "noindex" in index and "crypto.json" not in index and "app-safe.html" in index)
    ok(f"{label}: index is the company gallery without the private company", 'id="co-list"' in index and 'data-locked="0"' in index and 'id="f"' not in index and "SQC:AUTH" not in index)
    ok(f"{label}: every path is served noindex", "X-Robots-Tag: noindex" in (tmp / "dist" / "_headers").read_text(encoding="utf-8"))

def main():
    samples, placeholders = private_samples()
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t) / "repo"
        shutil.copytree(ROOT, tmp, ignore=shutil.ignore_patterns(".git", "dist", "node_modules", "__pycache__"))
        for label, env, expect_ok in [
            ("preview branch, no password", {"CF_PAGES": "1", "CF_PAGES_BRANCH": "claude/some-feature"}, True),
            ("preview branch, password present", {"CF_PAGES": "1", "CF_PAGES_BRANCH": "claude/some-feature", "KOSIF_UNLOCK_PASSWORD": "not-the-real-password"}, True),
            ("production branch main, no password", {"CF_PAGES": "1", "CF_PAGES_BRANCH": "main"}, False),
            ("local build, no password", {}, False),
            ("unknown SQC_BUILD_MODE", {"SQC_BUILD_MODE": "public"}, False),
        ]:
            r = build(tmp, env)
            if expect_ok:
                ok(f"{label}: builds", r.returncode == 0 and "(preview)" in r.stdout, (r.stderr or r.stdout)[-300:])
                if r.returncode == 0: check_preview(tmp, label, samples, placeholders)
            else:
                ok(f"{label}: refuses to build", r.returncode != 0, "it built")
                if "no password" in label:
                    ok(f"{label}: refuses because the password is missing", "refusing to publish private data unencrypted" in (r.stderr + r.stdout))
                ok(f"{label}: publishes no secure/ output", not (tmp / "dist" / "secure" / "private.json").exists())
    if failures:
        print(f"\n{len(failures)} preview-safety check(s) failed"); sys.exit(1)
    print("\nPreview build is private-data free; production still requires the password.")

if __name__ == "__main__":
    main()
