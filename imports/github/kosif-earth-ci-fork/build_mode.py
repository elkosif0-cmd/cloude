"""Which kind of build this is: production (the private data, encrypted) or preview (no private data at all).

Cloudflare Pages builds every branch with the same command. Preview deployments have no unlock password, and they
must never carry private data, not even encrypted: a preview URL is shared and indexed more freely than production.
So a preview build cuts the private blocks out like production does, then drops them instead of encrypting them,
and leaves out secure/ (the encrypted seed) entirely.

Production stays exactly as strict as before. Only these select preview:
  SQC_BUILD_MODE=preview                            explicit, for local checks
  CF_PAGES=1 with CF_PAGES_BRANCH other than main   a Cloudflare Pages preview deployment
Everything else, including an unknown Cloudflare branch value, is a production build. A production build still stops
when the password is missing (private_blocks.encrypt).
"""
import os

PRODUCTION_BRANCH = "main"


def build_mode(env=None):
    env = os.environ if env is None else env
    explicit = (env.get("SQC_BUILD_MODE") or "").strip().lower()
    if explicit not in ("", "preview", "production"):
        raise SystemExit(f"SQC_BUILD_MODE must be 'preview' or 'production', not {explicit!r}")
    if explicit:
        return explicit
    branch = (env.get("CF_PAGES_BRANCH") or "").strip()
    if env.get("CF_PAGES") == "1" and branch and branch != PRODUCTION_BRANCH:
        return "preview"
    return "production"
