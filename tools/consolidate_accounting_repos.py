#!/usr/bin/env python3
"""Stage selected public accounting repositories under imports/github.

Non-destructive: source repositories and existing app source are unchanged.
Only run this from the dedicated consolidation branch in GitHub Actions.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "imports" / "github"
SOURCES = [
    ("kosif-audit-studio", "60352af4dd095b7def57dfa32f5a20f74b7fc003"),
    ("see", "158e31cf26db1e6b77c5e068fa26dee64c45753e"),
    ("new", "e0a0cc351f6620416a649f62b05d00c83bed5848"),
    ("moon", "52baec7a598ecbfb42db97c2e9e3e6ed852781f5"),
    ("kosif-audit-pro", "1be540e2b397ea2106b931a0fbde1c174e6558a9"),
    ("kosif-earth-ci-fork", "b324b99a6d649da1be3c687b5d9f3e4ca860a83e"),
    ("smart-trial-balance-review", "9b646fd704b0f5ccf48c8bce7877e96e3783335b"),
]
BLOCK_DIRS = {
    ".git", ".private-assets", ".secrets", "secrets", "credentials",
    ".ssh", ".aws", ".terraform", "node_modules", ".venv", "venv",
    ".next", ".cache", "__pycache__", ".pytest_cache", "coverage",
    "dist", "build", "secure",
}
BLOCK_EXTS = {".pem", ".key", ".p12", ".pfx", ".jks", ".keystore", ".sqlite", ".db"}
BLOCK_NAMES = {"id_rsa", "id_ed25519", ".env", ".npmrc.local", ".netrc", ".credentials"}
MAX_SIZE = 20 * 1024 * 1024
KEY_PATTERNS = [
    re.compile(rb"gh[opsu]_[A-Za-z0-9]{25,}"),
    re.compile(rb"github_pat_[A-Za-z0-9_]{40,}"),
    re.compile(rb"sk-ant-[A-Za-z0-9_-]{18,}"),
    re.compile(rb"sk-proj-[A-Za-z0-9_-]{18,}"),
    re.compile(rb"AKIA[A-Z0-9]{16}"),
    re.compile(rb"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(rb"(?i)(?:ANTHROPIC_API_KEY|OPENAI_API_KEY|CLOUDFLARE_API_TOKEN|NPM_TOKEN|GITHUB_TOKEN)\s*[:=]\s*[\"']?[A-Za-z0-9_+/=-]{20,}"),
    re.compile(rb"(?i)(?:password|passwd|secret_key|api_key|access_token|client_secret|auth_token)\s*[:=]\s*[\"']?[A-Za-z0-9_+/=-]{25,}"),
]


def run(*args: str, cwd: Path | None = None) -> str:
    proc = subprocess.run(args, cwd=cwd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return proc.stdout.strip()


def excluded(rel: Path, size: int) -> bool:
    parts = rel.parts
    filename = parts[-1]
    lower = filename.lower()
    if any(piece.lower() in BLOCK_DIRS for piece in parts[:-1]):
        return True
    if lower in BLOCK_NAMES or lower.startswith(".env.") or lower.startswith("id_rsa") or lower.startswith("id_ed25519"):
        return True
    if rel.suffix.lower() in BLOCK_EXTS or size > MAX_SIZE:
        return True
    if "token" in lower or "credential" in lower or "secret" in lower or "private_key" in lower:
        return True
    return False


def main() -> None:
    if os.getenv("GITHUB_REPOSITORY") != "elkosif0-cmd/cloude":
        raise RuntimeError("Wrong repository")
    branch = run("git", "branch", "--show-current", cwd=ROOT)
    if branch != "consolidate/accounting-repositories-20261011":
        raise RuntimeError("Wrong branch: " + branch)
    DEST.mkdir(parents=True, exist_ok=True)
    manifest = []
    with tempfile.TemporaryDirectory(prefix="kosif-import-") as temporary:
        for name, sha in SOURCES:
            scratch = Path(temporary) / name
            scratch.mkdir()
            # Pin exact recorded source revisions, rather than moving main.
            run("git", "init", "-q", cwd=scratch)
            run("git", "remote", "add", "origin", f"https://github.com/kosif199022-jpg/{name}.git", cwd=scratch)
            run("git", "fetch", "--quiet", "--depth=1", "origin", sha, cwd=scratch)
            run("git", "checkout", "--quiet", "--detach", "FETCH_HEAD", cwd=scratch)
            actual = run("git", "rev-parse", "HEAD", cwd=scratch)
            if actual != sha:
                raise RuntimeError("Revision mismatch for " + name)
            target = DEST / name
            if target.exists():
                raise RuntimeError(f"Destination already exists: {target}")
            target.mkdir()
            copied = skipped = 0
            for source_file in scratch.rglob("*"):
                if not source_file.is_file() or ".git" in source_file.relative_to(scratch).parts:
                    continue
                relative = source_file.relative_to(scratch)
                size = source_file.stat().st_size
                if excluded(relative, size):
                    skipped += 1
                    continue
                raw = source_file.read_bytes()
                if any(pattern.search(raw) for pattern in KEY_PATTERNS):
                    skipped += 1
                    continue
                output = target / relative
                output.parent.mkdir(parents=True, exist_ok=True)
                output.write_bytes(raw)
                copied += 1
            manifest.append({
                "source": f"kosif199022-jpg/{name}",
                "commit": sha,
                "copied": copied,
                "excluded": skipped,
                "note": "Snapshot, not full Git history; secrets scan is best-effort.",
            })
            print(f"IMPORTED {name}: {copied} copied, {skipped} excluded", flush=True)

    (DEST / "MANIFEST.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (DEST / "README.md").write_text(
        "# Accounting repository source snapshots\n\n"
        "All seven sources remain intact. These copies are for comparison and integration,\n"
        "not executable components of the deployed KOSIF EARTH application.\n\n"
        "See MANIFEST.json for source commit hashes and exclusions.\n"
        "Security screening is best-effort, not a guarantee of zero leaked credentials.\n"
        "Do not merge, deploy, or delete original repositories without validation,\n"
        "independent history backups, and credential review.\n",
        encoding="utf-8",
    )
    run("git", "add", "--", "imports/github", cwd=ROOT)
    staged = run("git", "diff", "--cached", "--name-only", cwd=ROOT).splitlines()
    if len(staged) < 100:
        raise RuntimeError("Unexpectedly small import: " + str(len(staged)))
    print(f"STAGED_TOTAL {len(staged)}", flush=True)
    run("git", "-c", "user.name=KOSIF Consolidation", "-c", "user.email=actions@users.noreply.github.com",
        "commit", "-m", "chore: collect seven accounting repositories for review", cwd=ROOT)
    run("git", "push", "origin", "HEAD:consolidate/accounting-repositories-20261011", cwd=ROOT)
    print("PUSH_COMPLETE", flush=True)


if __name__ == "__main__":
    main()
