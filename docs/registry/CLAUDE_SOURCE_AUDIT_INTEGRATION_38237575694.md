# Claude public-source audit integration — run 38237575694 (2026-10-12)

## Evidence and scope
- Source: [GitHub Actions run](https://github.com/elkosif0-cmd/cloude/actions/runs/38237575694), head `279dfe563b532dda619f4837aad25144636115c8`, artifact `claude-public-source-audit-38237575694` (ID 11741253666).
- Artifact ZIP digest (GitHub): `439e45a241d3468d05f61c204601fdc6273ac65fa4988c76557ce1cc17b5ab2c` (SHA-256).
- `summary.json`: `130cc4ff8448136859ef2c3289f8fdbae561395cdf2fc5f4fbe2a858c60843a3` (SHA-256).
- `inventory.json`: `6fe0d90c60a457133a5b6c37c89aeb7e82601f1bfe8aee67e112eead43bead24` (SHA-256).
- `actual-source-reviews.json`: `d881005432f4c4567d25f7a8cb63be5fc759c2be15846d4b52425479ac7e309a` (SHA-256).
- `review-manifest.json`: `ef8e365b98b57d5075cc86a8c13d0d72f4a2e542b7da2f79dfaa3d40544da562` (SHA-256).
- Scope: **14 public repositories, 570 public branches, 80 unique branch code scopes, 526 additional selected code scopes**; 606 Messages API calls. This is **not** 606 original Managed Agents and is **not** proof of 1000 autonomous agents.
- Results: 606 entries marked reviewed, **25 with non-empty textual findings**, 581 empty findings, 51 partial source reads; estimate USD **4.0392** for the completed run, not a measured invoice. No private repositories reviewed; no production writes.
- Critical limitation: a completed API call with empty findings is not evidence of useful evaluation. This report only summarizes the actual public, source-bound findings.

## Integration decisions vs canonical main
| Source review | Finding or idea | Decision for canonical app | Verification |
| --- | --- | --- | --- |
| #102: `kosif199022-jpg/new` / `packages/accounting/src/journals/types.ts` (source SHA-256 `cd1525bb3abe8cb239c820764aacf27718525b4ff740660a18f64c157e38ed7c`) | Draft journal type-safety and double-entry guards; type definitions alone do not prove safe posting | **Implement narrow local account identifier guard** in canonical `ledger-engine.ts` to prevent nameless GL accounts, without copying external code. Existing debit/credit controls kept. | TypeScript 4 configs, focused finance Vitest, full engine Vitest, generated bundle integrity |
| #211: `kosif199022-jpg/new` / `account-service.ts` | Server-derived tenant ID and atomic action/audit log in illustrative service | **Not portable yet**: requires authenticated server transaction and RBAC/tenant tests, not browser-only duplication | Proposed for dedicated security PR |
| #190: `kosif199022-jpg/kosif-earth-ci-fork` / `evidence-engine.ts` | Evidence status changes have insufficient actor/timestamp/reason trail, no transitions | **Do not copy** unsafe state machine; assess canonical PBC/evidence control separately and add traceability with state-machine tests | Follow-up candidate |
| #26: `kosif199022-jpg/kosif-audit-studio` / `audit-report-engine.js` | ISA report generator is only a scaffold; missing critical sections and traceability | **Do not port** or claim IFRS/ISA compliance; improve separately with standard/version and reviewer approval | Follow-up candidate |
| #50: `kosif199022-jpg/kosif-earth-ci-fork` / `app/src/types/audit.ts` | Bare audit-record types cannot guarantee tamper-proof audit logging or ZATCA compliance | **Do not port** absent durable server audit trail and actual regulatory validation | Follow-up candidate |

## Implemented in this isolated branch
- `app/src/engine/fusion/finance/ledger-engine.ts`: reject journal lines whose `accountId` is not a non-empty trimmed string; no automatic mutation or entries posted.
- `app/src/engine/fusion/finance/journal-account-required.test.ts`: test blank, whitespace, missing, non-string identifiers; prove normal 15% VAT balanced journal still passes.
- `ui/core/engines.js`: deterministic regenerated bundle, so browser and TypeScript logic match.
- `ui/features/ledger.js`: Arabic user-facing error text for the new `LINE_ACCOUNT_REQUIRED` validator code; no change to company/workspace storage or posting authorization.
- Local authorised Windows laptop: targeted finance suite **121/121**, full `npm run check` **575/575 across 119 files**, four TypeScript tsconfigs passed, `node tools/build_engines.mjs --check` passed; tenant/company-context regression **7/7** passed.
- GitHub CI and browser E2E require their own status; `pages-deploy.yml` explicitly excludes this branch from Cloudflare deployment (including preview). **No Cloudflare deployment**.
- Investigated earlier PR #264's **showcase-picker E2E 3 failures** (61 pass / 3 fail): assertion hard-coded 47 catalog entries while source-backed browser catalog had 48. Updated the test to compare the actual set of auditable IDs against the runtime model catalog, rather than changing business data or hiding a model. Chromium browser preview check **64/64 passed** (laptop, 390px and 320px). Full PR CI and release still need their own checks.

## Paid-provider policy
The owner subsequently allowed paid AI use if needed to diagnose or correct failures. This integration used **zero new paid Anthropic API calls**: the verified archived results and deterministic tests were sufficient. Future provider calls need a concrete defect-driven purpose and cost log.

## Release gates
Keep this change isolated until latest `main` comparison, PR review, required checks, tenant-isolation regression and live browser smoke pass. No merging of conflicting or unlicensed code; no source, secrets, tokens, private audit/company data or credentials published. No production Cloudflare release without explicit readiness verification and rollback.
