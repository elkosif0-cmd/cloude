# KOSIF Cloudflare-only verification — 2026-10-01

Live backend: 0.13.61. Deployment: c4ce007fa23840e796d7cb0bf13e48a2.

## Changes
- Removed external council transport and all retired-provider references from deployed Worker code.
- Deleted the retired provider secret binding; remaining secret name: KOSIF_THINK_TOKEN.
- Five compatibility role aliases call five distinct Workers AI model IDs directly. Aliases are not claims of GPT/Claude/Gemini model identity.
- Added Jev packet/question identity requirement to discovery schema.
- Consolidated selected mobile front doors into kosif-think-20-s-mobile 20.0.1. Legacy entry renamed KOSIF Mobile Compatibility (Legacy), 10.2.3.

## Verification
| Check | Result |
|---|---|
| Deployed source read-back | Exact match, no retired provider references |
| Deterministic runtime suite | 9/9, receipt f628cc81-150f-44ff-a4b0-dc22ab3575b2 |
| Local regression | Five direct role calls, zero external fetch calls; duplicate/missing guards and roster/schema checks passed |
| Live five-role council | 5/5 artifacts, zero fallbacks; 80% correct vote agreement; one role dissented at confidence 0 |
| Jev final review | correct, reported confidence 0.99 |
| Internal Jev service | 1/1 observed call, receipt bff1b40f-fac8-4331-8f9e-735203dfae0a |
| Fast smoke after final release | 3/3 artifacts, result 42, receipt f35897f9-0b30-46b7-bca3-150cb0c823f5 |
| Durable expert canary | canary_experts_complete; 1/1 expert, 100 ideas, 100 questions, 112 observed Jev calls; receipt 3d0f38a6-e93f-40b9-9055-daeeffb7bbbf |
| Protected executor unauthenticated read | Authentication required |
| Health, resource metadata, Auth0 discovery/JWKS | HTTP 200 |
| MCP GET | HTTP 405 expected; tool POST transport tested successfully |

## Limits
The canary is a one-expert queue/resume test, not exhaustive Full Pro. General roster is 155; visual roster is 167. Full roster, cross-expert court, Einstein seven stages, secure authorization, image execution and artifact QA were not run end to end. Protected execution requires an authenticated connection. Model identity is declared in provider artifacts, not independently attested. Plugin release source was read back, but refreshed iOS picker/cache behavior has not been observed.

## Reproduce regression
Run node think-mcp/cloudflare-council.test.mjs from repository root.
