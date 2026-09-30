# Environment / Bindings Example

This file intentionally contains **names and types only**, not secret values.

## KOSIF Think Worker bindings

- `AI` — Cloudflare Workers AI binding.
- `cleanapis` — secret_text. Configure through Cloudflare secret management.
- `KOSIF_THINK_TOKEN` — secret_text. Configure through Cloudflare secret management.
- `THINK_ALLOWED_ORIGINS` — plain text.
- `THINK_ALLOW_PATH_TOKEN` — plain text; live value observed as `false`.
- `THINK_AUTH_FAILS_PER_MIN` — plain text; live observed value `20`.
- `THINK_FRONTIER_ENABLED` — plain text; live observed value `true`.
- `THINK_MAX_BODY_BYTES` — plain text; live observed value `131072`.
- `THINK_MODEL_LIMITER` — Cloudflare rate-limit binding.
- `THINK_MODEL_RPM` — plain text; live observed value `10`.
- `THINK_RATE_LIMITER` — Cloudflare rate-limit binding.
- `THINK_RPM` — plain text; live observed value `30`.

## Runtime compatibility observed

- Cloudflare compatibility date: `2026-09-27`
- usage model: `standard`
- observability/logging enabled in the live Worker.

Do not copy secrets from production into source control. Use environment-specific secret stores and separate staging/production credentials.
