#!/usr/bin/env bash
# Read-only check of the KOSIF contact-sync pending queue on the wa-kosif Worker.
# It only calls GET /contact-sync/pending: it never marks a contact done, so it is safe
# to run before and after the iPhone Shortcut.
#
#   CONTACT_SYNC_API_KEY=... tools/contact-sync-check.sh
#
# The key is read from the environment and sent through a header file, so it never
# appears in the output or in the process list.
set -euo pipefail

: "${CONTACT_SYNC_API_KEY:?Set CONTACT_SYNC_API_KEY (the Contact Sync key, not the bridge key).}"
BASE="${KOSIF_BASE_URL:-https://wa-kosif.kosif199022.workers.dev}"

KEY=$(printf '%s' "$CONTACT_SYNC_API_KEY" | tr -d '[:space:]')
if [ "$KEY" != "$CONTACT_SYNC_API_KEY" ]; then
  # A stored key with a trailing newline or space is the usual reason a Shortcut gets 401.
  echo "warning: the key contained whitespace; it was stripped for this check." >&2
fi

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
printf 'Authorization: Bearer %s\nAccept: application/json\n' "$KEY" > "$tmp/headers"

code=$(curl -sS -m 30 -o "$tmp/body" -w '%{http_code}' -H @"$tmp/headers" "$BASE/contact-sync/pending")
echo "HTTP $code"

if ! jq -e 'type == "object"' "$tmp/body" >/dev/null 2>&1; then
  echo "error: response is not a JSON object:" >&2
  head -c 300 "$tmp/body" >&2; echo >&2
  exit 1
fi

if jq -e 'has("error")' "$tmp/body" >/dev/null; then
  echo "Cloudflare error: $(jq -r '.error' "$tmp/body")"
  exit 1
fi

if ! jq -e '.contacts | type == "array"' "$tmp/body" >/dev/null; then
  echo "error: response has no \"contacts\" array (keys: $(jq -c 'keys' "$tmp/body"))" >&2
  exit 1
fi

echo "pendingContactsCount = $(jq '.contacts | length' "$tmp/body")"
jq -r '.contacts[] | "  - \(.name)  +\(.phone)  [\(.status // "pending")]  id=\(.id)"' "$tmp/body"
