# S.KOSIF — SHARED AGENT WORKLOG

> Mandatory live coordination ledger.
> Authority: Owner → FOUNDATION.md → Claude lead-development coordination → execution docs → this log.

## Rules
- Read FOUNDATION.md and this log before significant work.
- Claude is the Lead Development Agent for architecture, capability placement, sequencing, and reconciliation of parallel work, subject to the Owner and FOUNDATION.md.
- Every Agent still performs the full Rule Zero inventory.
- Before editing, register: Task ID, Agent, status, scope, branch/PR, expected files/modules.
- Update the entry when scope changes, a material discovery appears, an important milestone completes, or a PR/branch changes.
- If another Agent overlaps, split scope or follow the existing handoff. Do not create a silent competing architecture.
- If you disagree with Claude's current direction, log PROPOSAL / CONFLICT with evidence before implementing a parallel path.
- On stop/completion record evidence, unfinished work, and NEXT ACTION.
- Do not remove another Agent's history; add a new update.

## Status
CLAIMED · ACTIVE · WAITING · BLOCKED · HANDOFF · DONE · SUPERSEDED · PROPOSAL · CONFLICT

## Template
### TASK <id> — <title>
- Agent:
- Status:
- Goal:
- Scope:
- Expected touch set:
- Branch / PR:
- Current progress:
- Evidence / tests:
- Risks / conflicts:
- Unfinished:
- NEXT ACTION:
- Commit(s):

---

### TASK GOVERNANCE-20261005-001 — Constitution and coordination baseline
- Agent: ChatGPT
- Status: HANDOFF
- Goal: Establish canonical product rules, deep inventory, no-capability-loss, and shared Agent coordination.
- Scope: Governance/documentation only.
- Current progress:
  - FOUNDATION.md is canonical.
  - Rule Zero covers every repository under kosif199022-jpg.
  - Inventory must be deep at file/module level and produce a Capability Migration Matrix.
  - No old/unmerged capability may be ignored without a documented decision.
  - Claude is Lead Development Agent for architectural coordination.
  - The 12,506-page financial reference library is an official benchmark source.
- Risks / conflicts:
  - Several open PRs contain useful work but some follow older architecture assumptions.
- Unfinished:
  - Fresh all-repository deep inventory.
  - Capability Migration Matrix.
  - Reconciliation of open PRs/branches.
  - Runtime implementation of the new architecture.
- NEXT ACTION:
  - Active Agents must re-read the latest FOUNDATION.md, register their current task here, inspect Claude's current related work, and continue only in a non-conflicting scope.
- Commit(s):
  - 252bb8ab85ff54070396b0bea886bcc9d6980707
  - c93200c9e620ceed271322d018856e8d3263b243
  - 46fc6610d7c12da15e9f20139d204333019fa793

### TASK DOT-INVENTORY-20261005-001 — Deep inventory and preservation evidence
- Agent: dot
- Status: ACTIVE
- Goal: Deliver the current all-repository Capability Migration Matrix and requirement-to-evidence crosswalk under FOUNDATION.md and Claude lead-development coordination.
- Scope: Read-only repository, file/module, branch/PR and test-evidence inventory; no competing architecture or feature implementation.
- Expected touch set: This append-only worklog claim. Registry/matrix and acceptance documents are being prepared for coordinated review; no runtime files claimed for new edits.
- Branch / PR: No new branch or PR. Sources pinned to main 799d8afa959215ab1eed27bd995f35029b98512d; PR116 and draft PR150 are historical assets for reconciliation.
- Current progress: Re-read current FOUNDATION.md, AGENTS.md and this worklog. Enumerated 17 accessible owner repositories; deep coverage and remaining paths are being tracked. Matched all 78 current cloude capability IDs to their UI registry without removing any. These counts do not establish completed Rule Zero inventory.
- Evidence / tests: Read-only source and manifest checks; no source-repository scripts executed by this inventory. Current code still includes historical four-gateway classifications, README-only capability/sector/runbook folders and an empty repository book catalog. Findings are being checked against branches and prior work rather than used to discard capabilities.
- Risks / conflicts: PR150's older mandate/FOUNDATION edits must not overwrite the current constitution. Existing bootstrap and admission patches overlap; their separate test results are not composed acceptance. No current architectural position is attributed to Claude without explicit current evidence.
- Unfinished: Deep per-repository coverage; duplicate/best-source/rights evaluation; complete migration decisions, acceptance tests and owner/NEXT ACTION per capability; reconciliation with Claude's related active work.
- NEXT ACTION: Complete and submit the evidence matrix for lead coordination, preserving independent audit/tools, sector-first accounting, the shared visual system and every useful legacy capability. Keep new feature work and publication held pending the inventory and required review/authorization.
- Commit(s): Read-only baseline 799d8afa959215ab1eed27bd995f35029b98512d; no implementation commit from this task.

### TASK DOT-SAFETY-HANDOFF-20261005-001 — Existing local safety repairs
- Agent: dot
- Status: HANDOFF
- Goal: Preserve already prepared safety work for coordinated review and integration.
- Scope: Local, unpublished startup-compatibility and three-entry admission packages; no architecture expansion.
- Expected touch set: Both packages overlap in ui/core/helper-space.js, ui/core/demo.js, tools/bootstrap_demo_fixture.mjs, tools/bootstrap_scope.test.mjs and .github/workflows/S.kosif.yml. Admission additionally touches company/entry/assistant/output/build paths; obtain its exact manifest before any overlapping edit.
- Branch / PR: The additional repair deltas are not published; their existing base is draft PR143. Startup base 7da550d6debc90a3d0012b6e96cf99ab39a7cd96; both packages require reconciliation with current main.
- Evidence / tests: Startup patch SHA-256 1a35441307cf4be546ab51809fa29fce7f740700734390758205837fff48aeeb is accepted for bounded local source/VM repair: 48 independent probes, 73 startup/scope tests and 86 existing regressions rerun, plus lint and package verification. Admission patch SHA-256 dd3cd474a431ef0840176da0832f403dced23b583e27d367b7eccb57f85a5201 is independently accepted for the bounded local repair: 323 focused cases, 3 additional whole-runtime protected controls and 26 rebuilt-runtime tests; 7 output hashes and 815 reconstructed file hashes matched. Test groups overlap and are not a combined total.
- Risks / conflicts: Startup is not included in the admission package. Native-browser acceptance, final composed behavior, sector-first navigation, independent audit ownership and full server-side isolation are not established. Protected first-use/recovery remains unavailable; no seed-shape-based automatic binding is allowed. Preserve all protected blobs unchanged.
- Unfinished: Exact overlap reconciliation, current-main compatibility, composed regression/native checks and any authorized publication.
- NEXT ACTION: Coordinate one integration owner with Claude, inspect exact manifests and latest verdicts, and retest the composed artifact before proposing publication. Do not treat either package as completion of P1/P10.
- Commit(s): No remote repair commit or deployment from this handoff.


### TASK KOSIFSEE-FOUNDATION-20261006-001 — Execute FOUNDATION Rule Zero verification sub-scope
- Agent: KOSIF See / ChatGPT
- Status: ACTIVE
- Goal: Execute the current FOUNDATION from its required first gate: fresh deep inventory evidence, then hand verified capability findings into the shared migration/reconciliation process before any architecture-changing runtime work.
- Scope: Explicit non-conflicting verification sub-scope for the AI/agent/tooling family: `see`, `think`, `kosif-omni`, `100-superskills`, `kosif-atlas`, `kosif-atlas-private`, and `whatsapp-personal-bridge`. Read-only source inspection plus inventory artifacts/coordination only; no competing runtime architecture and no destructive action.
- Expected touch set: `AGENT_WORKLOG.md` plus new inventory evidence under `docs/registry/` on a dedicated branch/PR after inspection. No production UI/runtime files are claimed at task start.
- Branch / PR: To be created from current `main`; draft PR will be opened when the first evidence artifact exists.
- Current progress:
  - Read current `FOUNDATION.md`, `AGENT_WORKLOG.md`, `AGENTS.md`, `docs/START_HERE.md`, and `docs/PRODUCT_MANDATE_ar.md`.
  - Verified 17 repositories currently visible under owner `kosif199022-jpg`.
  - Inspected current open PR state and recent Claude-related branches. The old `claude/company-first-20261005` branch is diverged and conflicts with the current section-first constitution; no current Claude architectural position is inferred from it.
  - KOSIF Think frontier council (GPT/Claude/Gemini/Fable) completed; Jev judged the inventory-first non-conflicting sub-scope as the correct next step with 0.88 yes probability.
  - Live Skill Atlas consulted from `100-superskills`; relevant skills loaded include legacy migration, code review/refactor, complete testing, Git/GitHub workflow, and unified website design system.
- Evidence / tests: Read-only GitHub evidence so far; no runtime completion claim. KOSIF Think engine 0.39.21 receipt and Jev 1.13.0 decision obtained in-session.
- Risks / conflicts: DOT-INVENTORY-20261005-001 owns the broad all-repository inventory. This task is a bounded verification sub-scope and must hand findings back rather than create a separate migration matrix. Open PRs 140/143/150 remain draft/incomplete and must be reconciled, not bulk-merged.
- Unfinished: Deep file/module/branch/PR inspection of the seven scoped repositories; capability decisions/evidence; branch artifact; handoff to DOT/Claude coordination.
- NEXT ACTION: Inspect recursive trees and high-signal source/docs/tests for the seven scoped repositories, record capability evidence and Keep/Merge/Rebuild/Relocate/Specialize/Retire recommendations, then publish the bounded evidence artifact on a dedicated branch and update this task.
- Commit(s): coordination claim pending this append.


### UPDATE KOSIFSEE-FOUNDATION-20261006-001 — first Rule Zero evidence milestone
- Status: ACTIVE
- Branch / PR: `kosif-see/foundation-rule-zero-20261006` / draft PR #151.
- Milestone: Completed a fresh high-signal inventory pass for the seven declared AI/agent/tooling repositories and published `docs/registry/KOSIFSEE_AI_TOOLING_INVENTORY_20261006.md`.
- Evidence: Main-tree SHAs, file counts/tree truncation state, open PR/branch state, representative source/docs/tests and unmerged capability manifests are recorded in PR #151. Public `kosif-atlas` recursive tree returned truncated and is explicitly NOT marked complete. Restricted `kosif-atlas-private` contents were not copied or executed.
- Material findings: SEE audit/evidence engines are migration candidates but its old product-shell authority is obsolete; Think PR #6 contains capability-truth/evidence/ledger verification candidates; Omni contains reusable MCP/skill/Jev/WhatsApp primitives; old WhatsApp personal-bridge main is an in-memory prototype and its replacement branch remains only partially production-verified.
- Tests / receipts: Draft PR #151 head `c4fb6a65a9ca02fbd369642401d01e331f17eef6`; this milestone is documentation/inventory only and makes no runtime-test completion claim.
- Conflict check: Scope remains subordinate to `DOT-INVENTORY-20261005-001`; findings are for handoff into its shared matrix, not a competing matrix.
- NEXT ACTION: Continue the staged Atlas/index search and reconcile these findings with the broader accounting/audit repositories before any architecture-changing runtime implementation is proposed.

### UPDATE DOT-INVENTORY-20261005-001 — Independently reviewed partial checkpoint
- Status: ACTIVE
- Branch / PR: `docs/rule-zero-checkpoint-20261005-r2` / draft [PR #152](https://github.com/kosif199022-jpg/cloude/pull/152).
- Commit: `66ed51216c0862c035762a0003f1ed0fe3bfaafe`, based on `d5cd45fe9fe71f628dec23bf987faeece6ac493c`.
- Milestone: Published eight documentation additions only under `docs/registry/rule-zero-2026-10-05/`. The seven-file reviewed subset and package index preserve 17 accessible repositories, 78 capability IDs, 28 cloude families, and 127 overlapping source-evidence records. These are not 127 unique completed features.
- Evidence: Independent artifact review passed; source manifest SHA-256 `ebf4d67a69d737c7a75b8dbf8a5ff34c519105186d7840eed3fdbc41b1aa05ab`. All eight remote contents matched their prepared files and the tree diff contains only those additions. No product tests were run as part of the inventory; P0 remains incomplete.
- Coordination: Read and reconciled KOSIFSEE-FOUNDATION-20261006-001 and PR #151 as a subordinate evidence handoff. Its source findings are retained without creating a rival migration matrix or inferring a current Claude architecture decision.
- Material findings: Static producer/consumer paths show globally stored tasks/risks feeding company-labelled reports and incomplete backup coverage. Audit parse-error propagation and legacy reliance/final-report boundaries require deeper testing. These are source-supported risks, not observed private-data incidents or proof of all runtime behavior.
- Current non-conflicting sub-scopes: Read-only deep tracing of company/engagement storage, backup/restore and asynchronous import ownership; and audit TB parsing/reliance/report gates across audit-pro, Moon, SEE and cloude. Separate evidence batches will not mutate the sealed checkpoint.
- Unfinished: Remaining file/subtree and branch inspection; rights/dependency checks; best-source comparisons; full migration decisions and acceptance evidence; lead reconciliation. Atlas folder metadata is not installed capability or full semantic review.
- NEXT ACTION: Continue the two documented deep-review batches and append their source-linked findings to a subsequent reviewed checkpoint. Keep architecture-changing runtime work, repair composition and runtime publication held until the required inventory and lead coordination gates are met.

### UPDATE DOT-INVENTORY-20261005-001 — Posting-contract inspection and checkpoint checks
- Status: ACTIVE
- Scope addition: Read-only source-to-posting/GL/TB and reconciliation inspection across cloude finance, sales, procurement and UI call sites, plus the pinned `new` finance-core and ALTAREEQ PR #2 candidates. This is an explicitly separated evidence batch; no product implementation or architectural selection.
- Expected touch set: New local evidence/contract/coverage artifacts only until reviewed. No runtime file edits, source execution, real company data or provider calls.
- Acceptance boundary: Proposed synthetic tests are descriptions, not executed results. Preserve existing partial reconciliations and useful implementations; record uninspected paths and defects without claiming an observed production incident.
- PR #152 checks: The eight-document remote diff and contents are verified. Foundation Guard, Production Build and Windows smoke ended in failure before recorded job steps; logs were unavailable (BlobNotFound), so the cause is unverified and no CI pass is claimed. The configured Cloudflare integration created a successful branch preview automatically. The PR remains draft and unmerged.
- NEXT ACTION: Finish source-linked audit/storage/posting batches, independently review their claims and proposed acceptance cases, then append a coordinated evidence checkpoint. No runtime publication follows from this log.

### TASK DOT-REPORT-EXTRACTION-20261005-001 — Reports across all accessible repositories
- Agent: dot
- Status: ACTIVE
- Goal: Fulfil the owner's request to inspect every repository and extract its reports into a unified source-linked collection.
- Scope: The 17 accessible repositories and relevant unmerged branches; ready report documents, templates, generation/export engines, financial/audit/management/operational outputs and print formats. This is a sub-scope of the broad Rule Zero inventory, not a competing product architecture.
- Expected touch set: Isolated local extraction, catalog and evidence artifacts. No runtime changes, report generation from real customer data, provider calls, public redistribution or source-code execution.
- Branch / PR: No extraction branch yet. The partial general inventory remains draft PR #152; KOSIFSEE PR #151 remains a related evidence source.
- Current progress: Reusing pinned repository trees and reviewed reporting findings; separating finished documents, templates, generators, examples and documentation. Existing audit/storage/posting reviews are finishing their bounded batches to supply evidence.
- Risks / conflicts: A generator is not a finished report. Preserve source units, periods, extracted/inferred/synthetic labels and licensing. Restricted Atlas material, private customer data and credentials are excluded from copying; retain permitted source links and original analysis instead.
- Unfinished: Complete candidate coverage, deeper reporting-path inspection, safe extraction, duplicate comparison, format/dependency/status verification and delivery.
- NEXT ACTION: Produce an Arabic report index and machine-readable catalog with exact repository/commit/file provenance, then deliver the permitted extraction bundle with honest working/untested/missing-dependency status.

### UPDATE DOT-REPORT-EXTRACTION-20261005-001 — Verified extraction delivered
- Status: HANDOFF
- Result: Delivered a private extraction ZIP and the two original synthetic PDF/XLSX examples to the owner. No public hosting, runtime deployment, integration or product-code execution occurred.
- Coverage: 17 repository summaries; 86 overlapping catalog records distinguishing finished artifacts, templates, generators, examples and references; 218 approved exact-source files plus 24 index/evidence/README files. This is bounded reporting-path coverage, not completion of the deep inventory or review of every branch.
- Evidence: ZIP size 2,052,736 bytes; SHA-256 `1bd3406487ec2b6a0d2aea39cddee305ba65c7939672e1df9e9e7759ca9e9d11`. Independent review verified source hashes, archive members/CRC, 194 pinned citations and eight relative index links.
- Limits: The 15-page PDF is a synthetic demonstration with a disclosed RTL numeric-order defect. The 12-sheet workbook was inspected without recalculation or native Excel rendering. Legacy HTML .doc/browser-print exports are distinguished from real DOCX/PDF generators. Restricted Atlas material, private CVs, credentials and customer payloads were excluded.
- Unfinished: Remaining source/branch depth, report-generator execution and financial/visual correctness acceptance, dependency recovery and any coordinated migration into S.KOSIF. Neither the extraction nor a source-file count proves production readiness.
- NEXT ACTION: Retain the verified catalog as evidence in the broad Rule Zero matrix. Continue independent review of the already prepared posting-contract batch and reconcile the accepted audit/storage findings under lead coordination before proposing runtime changes.

### UPDATE DOT-INVENTORY-20261005-001 — Reviewed static batches handoff
- Status: HANDOFF
- Result: Independent reviews accepted the bounded audit-reliance batch, corrected storage revision 2, and corrected posting-contract revision 2 as static evidence only. Broad Rule Zero inventory remains incomplete.
- Evidence: Audit batch contains 13 contracts and 25 proposed cases; storage contains 26 contracts and 26 proposed cases; posting has 80 proposed cases across overlapping engine/UI/candidate groups. All proposed cases remain unexecuted. Source-copy integrity checks are not product-test results.
- Accepted seals: audit `72a8bd053fa84a1fc7f4ce1ef9e1311185df70b765ca8870773afd7fe74e9ca9`; storage `a58ba8ceec146f654c263afebd6d08198e9f80b6d543d9e81c1e578ff79f4c96`; posting revision 2 `a48a7afcad86dc05d66426fdd3efdc2852679516cad719372002b57921c00fcc`.
- Important boundaries: Audit parse errors may be ignored by a reliance signal while actual issuance remains separately blocked. Exact-money behavior differs between TB/statements, sampling and already-rounded Number inputs. Storage restore, stale ownership and global-report inputs need dedicated synthetic acceptance tests. Pure posting-builder gaps must be distinguished from existing UI/transaction safeguards.
- Preservation: Original source copies, the eight frozen PR #152 publication files and the delivered extraction ZIP remain unchanged. No runtime fixes, compiler/test/SQL execution, provider calls or migration occurred in these batches.
- Unfinished: Complete remaining file/branch coverage and rights/dependency checks; reconcile candidates with Claude lead coordination; choose and execute scoped acceptance tests; compose and natively verify the unpublished safety repairs only when the required gates are satisfied.
- NEXT ACTION: Use the shared matrix and reporting catalog to select the next non-conflicting deep-review/test scope. Do not infer P0/P1/P10 completion, production readiness or permission to bypass failed CI from this evidence handoff.

---

### TASK CLAUDE-20261006-001 — P1: three-entry front door (section → sector → company) and the registry fold of the fourth gateway
- Agent: Claude (Lead Development Agent, FOUNDATION §0.0.3)
- Status: HANDOFF (PR open for owner review; merging to `main` deploys production and needs the owner's explicit approval)
- Goal: FOUNDATION §3 / §3.7 at runtime. The door shows the three sections first; accounting → sector → that sector's companies (+ new company under the sector); audit → audit files, the 47 bundle companies with trial balances and the 12,506-page reference library; tools → an existing space, a new space, or no company at all. The shell paints only the chosen section's menu with a section switcher at the top of the rail. The former fourth gateway «reporting» becomes a cross-cutting layer (`also`) inside accounting and tools — no screen removed, the 78-id baseline unchanged.
- Scope: navigation and registry only. No engine numbers change; no company data moves; the private company's unlock script is untouched.
- Expected touch set: `unlock.html` (gallery script + markup, not the reviewed auth script), `ui/core/capabilities.json` (gateways → 3 with `home`, `also`, `sectors`), `ui/core/registry.js`, `ui/core/gate.js` (new), `ui/core/helper-space.js` (`applyIntent`: gate/sector/corpus/landing), `ui/core/company.js` (sector field), `ui/core/company-platform.js` (`setTool` accepts shared tools), `ui/features/helper-center.js`, `ui/layouts/shell.js` (`paintNav`), `ui/ds/shell.css`, `build.py` (adds `core/gate.js`), tests `tools/company_entry.test.mjs`, `tools/company_entry_e2e.mjs`, `tools/four_gateway_contract.mjs` → `tools/gateway_contract.mjs`, `tools/helper_gateway.test.mjs`, `tools/feature_audit.mjs`, `tools/company_platform_contract.test.mjs`, `tools/capability_docs.py` (+ regenerated `docs/rebuild/*`), `.github/workflows/S.kosif.yml` (contract step name), `docs/registry/*`.
- Branch / PR: `claude/m1-gates-20261006` from `main` @ 0aa54be; PR to follow.
- Current progress: read FOUNDATION (incl. §0.0.0–§0.0.3), START_HERE, PRODUCT_MANDATE §12, FUSION_ALL_REPOS; inspected open PRs #150 #143 #140 #139 #137 #133 #116 #96 #7 #4 and the 150 remote branches; mapped the live reference library (companies.json: 50 companies + a sources directory; documents-manifest: 12,506 pages in 84 PDF segments; `ui/data/bundle-clients.json`: 47 companies with trial balances). Implementation started on the registry and the gate module.
- Evidence / tests (local, 2026-10-06; GitHub Actions is blocked by account billing, so no CI pass is claimed):
  - Unit/contract (node --test): company_entry 10/10, door_tokens 2/2 (new), unlock_runtime 5/5 (auth script byte-identical), company_platform_contract 11/11, ai_exception 5/5, sidebar_lifecycle 10/10, workspace_validation 5/5, journal_review 2/2, standards_layer 4/4; `tools/gateway_contract.mjs` OK; `tools/capability_docs.py --check` OK.
  - helper_gateway 18/19 — the one failure (registry class mismatch) fails identically on untouched `main`.
  - Browser (Edge, preview build, SQC_BLOCK_FONTS=1): company_entry_e2e 88/88 (`Company front door: 88 checks OK`); ui_smoke 78 screens × 2 viewports; feature_audit 143/146 on this branch vs 142/146 on untouched `main` (8767). Remaining 3: legacy V8.2/V31/V33/V40 restore and the bundle full audit file fail on `main` too; «أدوات التحليل بتبويبات التطبيق» passed in the previous run and a direct probe shows 18 tabs / 2 tools on both builds (timing flake).
  - FOUNDATION §3.11.2 (added by 799d8af during this task): the door's new rules now use `--sk-*` tokens equal to the KOSIF Luxe look in `ui/ds/tokens.css`; `tools/door_tokens.test.mjs` fails on drift or on a literal colour in those rules. The older sign-in card rules (22 literal colours, pre-existing on `main`) are a recorded follow-up, not changed here.
- Risks / conflicts:
  - PR #140 (unified financial OS) touches `unlock.html`, `capabilities.json`, `helper-space.js` and is already CONFLICTING with main; it is treated as an asset for the inventory (its definitions/intake work is largely merged via #144), not merged as-is.
  - PR #150 (docs) keeps the M1–M7 ids; PRODUCT_MANDATE §12 now declares those historical. Reconcile after this task: keep its 21-row evidence matrix, point it at the P-waves.
  - PR #116 (worklog) is SUPERSEDED by the owner's `AGENT_WORKLOG.md` (0aa54be); its format is not adopted.
  - `tools/four_gateway_contract.mjs` and `docs/rebuild/FOUR_GATEWAYS_FINANCE_ARCHITECTURE.md` assert four gateways; both are replaced/annotated in this task.
  - Overlap with DOT-SAFETY-HANDOFF-20261005-001: its unpublished startup/admission packages also touch `ui/core/helper-space.js`. This PR changes `applyIntent`/`land` only; the integration owner must reconcile those packages against this branch before either is published.
- Unfinished: tokenizing the pre-existing sign-in card colours (§3.11.2); P3 sector packs (the sector picker records the sector, sector-specific charts/costing are not built yet); audit-file "same results" replay over the 47 bundle companies (P5).
- NEXT ACTION: owner reviews the PR and decides on merge (production deploy). After merge: P5 bundle replay e2e, then P2 accounting integrity, then P3 sector packs (meat, then hospital).
- Commit(s): see the PR on `claude/m1-gates-20261006`.

### TASK CLAUDE-20261006-002 — P0: deep inventory → Capability Migration Matrix (FOUNDATION §0.0.0)
- Agent: Claude
- Status: HANDOFF (re-scoped: evidence input, not a rival matrix)
- Goal: one matrix row per capability across the 17 repositories under `kosif199022-jpg` (repository, branch/PR/commit, source modules, description, Accounting/Audit/Tools/Shared, sector applicability, state, dependencies, tests, duplicates, best source, target location, decision Keep/Merge/Rebuild/Relocate/Specialize/Retire, migration status, acceptance tests, risks, owner + NEXT ACTION), with explicit per-repository coverage and an UNAVAILABLE FOR INVENTORY list.
- Scope: `docs/registry/CAPABILITY_MIGRATION_MATRIX_ar.md` + `.json`, `docs/registry/INVENTORY_2026-10-06_ar.md`, `docs/registry/CURRENT_STATE_2026-10-06_ar.md`; builds on `docs/FUSION_ALL_REPOS_ar.md`, `docs/product/capability-source-registry.json` and the other agent's 463-id inventory referenced in PR #150.
- Expected touch set: docs under `docs/registry/` and `docs/capabilities/` only; a generator script `tools/capability_matrix.py` reading `capabilities.json`, `app/src/engine/fusion/**`, `ui/features/**` and the GitHub listings.
- Branch / PR: after -001.
- Current progress: repository list (17), branch list (150 in cloude), PR counts (95 merged / 22 closed / 10 open), open issues (18, all WhatsApp pairing codes), open PRs in other repos (kosif-audit-studio 5, think 3, see 1) captured on 2026-10-06.
- Coordination (2026-10-06): `main` now records DOT-INVENTORY-20261005-001 as owner of the broad all-repository matrix (draft PR #152), KOSIFSEE-FOUNDATION-20261006-001 for the seven AI/tooling repositories (draft PR #151) and DOT-REPORT-EXTRACTION-20261005-001 for report extraction. This task therefore hands its artifacts to those owners as evidence and does not compete with them.
- Delivered artifacts (on this branch):
  - `tools/capability_matrix.py` → `docs/registry/CAPABILITY_MIGRATION_MATRIX_ar.md` + `capability-migration-matrix.json`: cloude 78 screens, 94 engines (3 without tests, 30 with no screen/engine consumer), 8 services, 10 open PRs, 150 branches (93 unmerged).
  - `tools/repo_inventory.py` → `docs/registry/repos/<repo>_ar.md` for all 16 other repositories, generated from shallow clones (structure, README head, modules with first comment/exports/TODO, tests, schemas, routes, AI material, open PRs/issues/branches) plus manual decisions in `docs/registry/repos/decisions.json`.
  - `docs/registry/CURRENT_STATE_2026-10-06_ar.md`: P0–P10 status.
- Coverage notes: kosif-atlas (72,590 files) and kosif-atlas-private (29,325) needed `core.longpaths` on Windows; earlier clones were partial and were restored. Atlas content is listed structurally, not read semantically; the kosif-atlas-private report quotes no README, comment or TODO text (paths and counts only, `RESTRICTED` in `tools/repo_inventory.py`). CLOUDFLARE_API_TOKEN: secret-format scan of HEAD found only regex patterns inside a scanner; no value copied; history not scanned.
- Cross-check: an Antigravity report the owner pasted on 2026-10-06 was verified file by file; confirmations and corrections are in `decisions.json` → `_crosscheck_antigravity_20261006`.
- NEXT ACTION: DOT / KOSIFSEE owners pull these per-repository reports and decisions into PR #152 / #151; Claude reconciles the final matrix with them as lead, without duplicating rows.
