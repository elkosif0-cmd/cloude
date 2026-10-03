# Live KOSIF Think runtime sync — 2026-10-03

This branch synchronizes GitHub with the live Cloudflare Worker before any future source-based deployment.

- Live Worker: `kosif-think-mcp`
- Runtime: `0.27.3`
- Live source SHA-256: `a20cf097f9259711b0953bb3e5e07fa7d0351c6088d4170465ebe9d84cf02c0b`
- Plugin: `kosif A1990 M v2.7.1`
- Capability Atlas: `attachment-capability-atlas-v3` (36 packs)
- Performance: `quality-neutral-parallelism-v4`
- OAuth audience normalization: strip trailing slash
- OAuth scopes include `offline_access`
- Semantic clusters: 20 preserved, concurrency 5
- Stability: 2 preserved, concurrency 2
- Council: 500 preserved
- Einstein: 7/7 preserved
- Verification gates: 4 preserved

The secret `KOSIF_THINK_TOKEN` is intentionally not committed. Production bindings in `wrangler.think.toml` were reconstructed from the Cloudflare Worker settings API.

## Deployment guard
Before deploying from GitHub, compare the source SHA/version against the live Worker. Do not deploy a stale branch over a newer live runtime.
