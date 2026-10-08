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
- Status: DONE — merged as PR #153 on the owner's explicit instruction in chat on 2026-10-06 («ادمج وكمل»). GitHub checks did not run: every job reports «The job was not started because recent account payments have failed» (billing), the same on `main`; the Cloudflare Pages preview built successfully. Acceptance rests on the local evidence below.
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

### TASK CLAUDE-20261006-003 — P5: one company, one set of figures + corpus scorecard and regression matrix
- Agent: Claude (Lead Development Agent)
- Status: DONE — merged as PR #154 on the owner's explicit instruction in chat on 2026-10-06 («ادمج وكمل»). GitHub jobs were not started (billing); acceptance rests on the local evidence below.
- Goal: PRODUCT_MANDATE P5 — every bundle company opened from the audit door reaches the corpus replay's results; a per-company scorecard (the auditor's key matters found, materiality against the disclosed figure, report structure) pinned as a regression matrix.
- Finding that opened the task: on `main` 0 of 47 bundle companies opened from the audit door matched the replay; Allianz, Hon Hai and e& showed materiality ×1000 (bundle-clients rows in thousands under the model's "million" label); Unilever and Sanofi about −30%. Root cause: PR #144 (b92bd4a) reverted PR #134's `ui/features/tb-review.js` changes (verified model + source-only safeguards); `tools/apple_source_*` tests went 9/24 on `main`.
- Scope: `ui/features/tb-review.js` (replay #134 three-way; bundle companies take the verified model's trial balance/overrides/currency), new tests `tools/corpus_same_results.test.mjs`, scorecard generator + baseline under `docs/registry/corpus/`, workflow wiring.
- Expected touch set: `ui/features/tb-review.js`, `tools/corpus_*`, `docs/registry/corpus/*`, `.github/workflows/S.kosif.yml`, this worklog.
- Branch / PR: `claude/p5-corpus-scorecard-20261006` from `main` @ 5559672.
- Risks / conflicts: the older bundle-clients rows (more granular, unverified units) stay in `ui/data/bundle-clients.json` as descriptive data; reconciling their detail to the verified totals is a follow-up, not deleted.
- Evidence (local; GitHub Actions jobs are not started on the account — billing):
  - `tools/corpus_same_results.test.mjs`: 47/47 companies match; the same test on `main`'s `tb-review.js` fails with 55 mismatches.
  - `tools/apple_source_{reporting,bridge,ci_contract}.test.mjs`: 28/28 (main 9/24). `tools/corpus_scorecard.test.mjs` 2/2; `node tools/corpus_scorecard.mjs --check` OK.
  - All 34 node test files referenced by the workflows: 288 pass / 52 fail vs `main` 270 / 67 — no test fails only with this change; 15 source-safeguard tests are fixed. The 52 shared failures (review-import guard, confirmation, accessibility…) fail identically on `main` and are outside this task.
  - Browser (Edge, preview): door e2e 88/88; feature_audit 144/146 before moving the walk-through to Amazon (see below). `tools/apple_source_browser_e2e.mjs` refuses to run outside GitHub Actions by design — not run locally.
  - feature_audit's bundle walk-through used Apple; with #134 restored Apple is source-only, so its PBC letter is blocked by design. The walk-through now uses Amazon (letter: 5 stages, 71 rows, logo). Its old expectation (third round `complete` + an earned opinion and KAMs) contradicted #134's simulation contract (`demo-engagement-engine.ts`: synthetic documents never complete a round or earn an opinion) and failed on `main` before this task; the check now asserts the #134 contract: three rounds, ≥5 uploads, an insufficient verdict, a final marked `simulation` / «لم يُقيّم» with no KAMs or opinion, no zakat requests.
  - feature_audit over three runs on this branch: 144, 144, 143 of 146; every one of the 146 checks passed in at least one run. The alternating ones (morning summary, sales lab, V40 item costs/tree, earlier the letter before the Amazon move) are outside this change — timing flakes of the local runner.
- Unfinished: reconciling bundle-clients' granular rows to the verified totals; P5 synthetic packs and local AI runs.
- NEXT ACTION: owner reviews the PR; then P2 accounting integrity (posting contract findings from DOT-INVENTORY's reviewed batches), then P3 sector packs.

### TASK CLAUDE-20261006-004 — P2: the company's VAT policy governs posting + books integrity on the demo company
- Agent: Claude (Lead Development Agent)
- Status: DONE — merged on the owner's explicit instruction in chat on 2026-10-06 («ادمج وكمل»); GitHub jobs not started (billing), acceptance on local evidence.
- Goal: PRODUCT_MANDATE P2 (operation → entry → ledger → trial balance with the same figures). First gap closed here: every sale was posted at a hard-coded 15% whatever the company (Egypt 14%, UAE 5%, a company not registered…); purchase lines defaulted to 15%.
- Scope: `app/src/engine/fusion/finance/vat-policy-engine.ts` (+test; engines rebuilt), `ui/core/company-platform.js` (profile `vatRegistered`/`vatRate`, `vatPolicy()`), `ui/features/ledger.js` (sale entry + VAT return rate), `ui/features/purchasing.js` (line default), `ui/features/master-data.js` (two fields + the rate in force), `ui/core/demo.js` (demo receipt entries name their supplier, as real postings do), tests `tools/vat_policy_contract.test.mjs`, `tools/books_integrity_e2e.mjs`, workflow wiring.
- Branch / PR: `claude/p2-ledger-integrity-20261006` from `main` @ 76e7e06.
- Not changed (recorded): other fixed 15% outside the posting path — `ui/features/enterprise.js` (legacy invoices/WhatsApp text), `offers.js`, `operations.js` pricing, `audit-bridge.js`; they should read the same policy in a follow-up.
- Evidence: vat-policy 6/6; engines 452/452 (`--check` up to date); vat_policy_contract + company_platform 14/14; workflow node tests 294 pass / 52 fail, the 52 identical on `main` (no new failure); books_integrity_e2e OK; feature_audit 146/146; door 88/88; sales_reports 28/28; advances 26/26 (after one local load timeout).
- The browser test caught a defect in the first version (selecting «حسب الدولة» did not reset registration: `??` treated null as missing) — fixed and pinned.
- NEXT ACTION: the remaining fixed 15% outside the posting path (enterprise/offers/operations/audit-bridge) read the same policy; then P2 definitions → purchase/sale pickers; then P3 sector packs (meat first).

### TASK CLAUDE-20261006-005 — P2 follow-up: every screen that prices, posts or prints VAT reads the company policy
- Agent: Claude (Lead Development Agent)
- Status: DONE — merged on the owner's explicit instruction in chat on 2026-10-06 («ادمج وكمل»); GitHub jobs not started (billing), acceptance on local evidence.
- Goal: close the follow-up recorded in CLAUDE-20261006-004 — the remaining fixed 15% outside the posting path.
- Scope: `ui/core/sk.js` (`SK.vatRate()` / `SK.vatPct()` from `SKosifCompanyPlatform.vatPolicy()`); `ledger.js` (VAT return labels and rate warning) and `purchasing.js` (line options: company rate, exempt, and an older line's own rate kept) use it; `enterprise.js` (simplified e-invoice amount, labels, QR tag check text, WhatsApp text), `offers.js` (offer default and texts), `operations.js` (pricing VAT and texts), `audit-bridge.js` (operational trial balance of the open company). Guard: `tools/vat_policy_contract.test.mjs` fails on a fixed 15% tax pattern in these six screens; `tools/receipt_boundary.test.mjs` stub gains `vatRate`.
- Branch / PR: `claude/vat-policy-everywhere-20261006` from `main` @ 19bc83a.
- Not changed: «الرقم الضريبي (15 رقم)» is the Saudi VAT-number length, not a rate.
- Evidence: vat_policy_contract 3/3; workflow node tests 294 pass / 52 fail, identical to `main` (no new failure); books_integrity OK; feature_audit 146/146; door 88/88; sales_reports 28/28; advances 26/26.
- NEXT ACTION: P2 — company definitions feed the purchase and sale pickers; then P3 sector packs (meat first).

### TASK CLAUDE-20261006-006 — P2: the company's definitions feed the purchase and sale pickers
- Agent: Claude (Lead Development Agent)
- Status: DONE — merged as PR #157 on the owner's explicit instruction in chat on 2026-10-06 («ادمج وكمل»); GitHub jobs not started (billing), acceptance on local evidence.
- Goal: one master data per company — suppliers, products and customers defined in «التعريفات» are offered where operations are recorded, so the books, statements and ageing name the same parties.
- Scope: `ui/features/purchasing.js` (supplier and item pickers start with the definitions; a defined product's purchase price is the line's default cost when the supplier has no dated price); `ui/features/definition-pickers.js` (new, in `build.py`): the core sale dialog's customer field (#v12s-customer) gets a suggestion list of defined customers then customers already sold to — attached on focus, no core payload edit; `tools/books_integrity_e2e.mjs` checks all three through the real screens.
- Branch / PR: `claude/p2-definitions-pickers-20261006` from `main` @ dfd4dd0.
- Not changed: the core sale dialog's product picker is the core catalog (items with prices); defined products without a selling price are not added there.
- Evidence: workflow node tests 294 pass / 52 fail, identical to `main` (no new failure); books_integrity_e2e OK incl. the three picker checks; feature_audit 146/146; door 88/88; sales_reports 28/28; advances 26/26.
- NEXT ACTION: owner approval to merge; then P3 sector packs (meat first).

### TASK CLAUDE-20261006-007 — P3: sector packs (the company structure follows its sector) + the meat cutting run in the books
- Agent: Claude (Lead Development Agent)
- Status: DONE — merged on the owner's explicit instruction in chat on 2026-10-06 («ادمج وكمل»); GitHub jobs not started (billing), acceptance on local evidence.
- Goal: PRODUCT_MANDATE P3 acceptance — «the same capability behaves by Sector Pack, not just renamed labels». FOUNDATION §3.7 step 4: a company created under a sector receives the sector's accounting structure; §3.7 «عمق قطاع اللحوم»: yield, cutting and conversion, waste and by-products, cost per kilo.
- Scope:
  - `app/src/engine/fusion/system/sector-pack-engine.ts` (+test): a pack for each of the 10 registry sectors on the same base chart — accounts, cost centers, units, warehouses, tools, KPIs; `depth` deep (meat) / base (others, deepened wave by wave); `packAdditions` adds only what is missing.
  - `app/src/engine/fusion/stock/cutting-run-engine.ts` (+test): IAS 2 joint products — by-products at NRV deducted from the joint cost, main cuts by relative sales value (weight when unpriced), abnormal waste beyond the normal tolerance expensed; halala-exact (largest remainder); `cuttingRunJournal` → Dr 1320 cuts, Dr 1330 by-products, Dr 5100 abnormal waste, Cr 1310 carcass.
  - `ui/core/company-platform.js` (`sectorPack`, `applySectorPack`, `ensureSectorPack`), `ui/core/company.js` (`packPending`), `ui/core/helper-space.js` (a created company is marked pending), `ui/features/master-data.js` + `ledger.js` (apply once on first open; the chart button builds the sector's chart; «إضافة حسابات قطاع …» for existing companies — never automatic for them), `ledger.js` `postEntry` (balanced, open period, once per source, accounts must exist) exported with the existing `ensureAccounts`.
  - `ui/features/meatops.js` + `.css`: by-product flag per cut (presets mark offal/head/bone), «تشغيلة التقطيع في الدفاتر» (preview from the engine, posting blocked when weights exceed the carcass).
  - Tests: engines 12 new; `tools/company_entry_e2e.mjs` +3 checks ×2 viewports (health pack applied once; demo untouched); `tools/meat_pack_e2e.mjs` (new, in the workflow).
- Branch / PR: `claude/p3-meat-pack-20261006` from `main` @ c449d50.
- Not yet: carcass purchases still receive into 1300 unless the user picks the account (receipt → 1310 by item type is the next step); the other priority sectors are `base` depth.
- Evidence: engines 464/464 (12 new, `--check` up to date); workflow node tests 294 pass / 52 fail, identical to `main`; meat_pack_e2e OK (1,450.00 → cuts 1,349.00 + offal 72.00 + abnormal waste 29.00; refused twice / over-weight / unbalanced); door 94/94; feature_audit 146/146; books OK; sales 28/28; advances 26/26.
- NEXT ACTION: carcass receipts → 1310 by item type; deepen the hospital pack.

### TASK AGY-DESIGN-RESPONSIVE-20261006-001 — Responsive Modal, Dialog, and Graphic Identity Polish
- Agent: Antigravity / Google Deepmind
- Status: DONE
- Goal: Implement user graphic design request: redraw application dialogs/windows to adapt responsively across Laptop and Mobile viewports, maintaining strict adherence to KOSIF tokens, zero-regression on all 24 gateway/audit tests, and mobile ergonomics (bottom sheet modal behavior).
- Scope: `ui/ds/luxe.css` responsive modal/dialog graphic enhancements, touch targets, grab handles, and `AGENT_WORKLOG.md`.
- Expected touch set: `ui/ds/luxe.css`, `AGENT_WORKLOG.md`.
- Branch / PR: `main`.
- Current progress:
  - Redesigned dialogs and windows (`.skd`, `.dlg`, `.modal`) in `ui/ds/luxe.css`: glassmorphic luxury card styling on laptop/desktop with `backdrop-filter: blur(12px) saturate(180%)`, glowing subtle borders, and layered depth shadows.
  - On mobile/small tablets (<=768px): transformed into native iOS/Android-style bottom sheets (`align-items: flex-end`, `border-radius: var(--sk-r-l) var(--sk-r-l) 0 0`, top grab handle, safe-area bottom padding, 48px touch targets, and 16px input font size preventing iOS viewport zoom).
  - Passed all design token audit tests with zero regressions, zero !important, and zero off-grid spacing.
  - Validated all 24 contract and gateway tests on the newly merged `main` (including gateway_contract, vat_policy, company_entry, identity_audit, unlock_runtime).
- Evidence / tests:
  - `node --test tools/company_entry.test.mjs`: 10/10 pass.
  - `node --test tools/door_tokens.test.mjs`: 2/2 pass.
  - `node --test tools/gateway_contract.mjs`: pass (78 capabilities, 10 sectors).
  - `node --test tools/identity_audit.test.mjs`: pass (zero regressions against ratchet baseline).
  - `node --test tools/unlock_runtime.test.mjs`: 5/5 pass.
  - `node --test tools/vat_policy_contract.test.mjs`: 3/3 pass.
  - Preview build: 163 entries in `dist/` with zero errors.
- Risks / conflicts: None. Zero changes to cryptographic boundaries or sensitive markers.
- NEXT ACTION: Push to `origin/main` for immediate Cloudflare Pages live deployment to https://s-kosif.pages.dev/.

### TASK CLAUDE-20261006-008 — P3 meat: carcass receipts in 1310, the cutting run credits the stock that holds them
- Agent: Claude (Lead Development Agent)
- Status: DONE — merged on the owner's explicit instruction in chat on 2026-10-06 («ادمج واكمل»); GitHub jobs not started (billing), acceptance on local evidence.
- Goal: close CLAUDE-20261006-007's next action — the meat pack keeps carcasses and live animals apart from other stock.
- Scope: `procurement/procurement-posting-engine.ts` optional `inventoryAccountFor(itemId)` (one debit per stock account, rounded per account; payable unchanged; default behaviour identical) + test; `ui/features/ledger.js` receipts of the catalog's raw items post to 1310 for a meat company whose chart has 1310 (every other company unchanged); `ui/features/meatops.js` the run credits 1310 when it holds a balance, else 1300 (no negative carcass account); `tools/meat_pack_e2e.mjs` receipt split check.
- Branch / PR: `claude/meat-receipts-1310-20261006` from `main` @ 7dbb529.
- Evidence: engines 465/465; workflow node tests 294 pass / 52 fail, identical to `main`; meat_pack_e2e OK (receipt: 1310 1,400.00 · 1300 30.00 · VAT 214.50 · suppliers 1,644.50); books OK; sales 28/28; advances 26/26; door 94/94 (after one local load timeout); feature_audit 146/146.
- NEXT ACTION: deepen the hospital pack (insurance claims, rejections, case cost, revenue by department).

### TASK CLAUDE-20261006-009 — P3 health: the claims cycle (visits, payer claims, remittances, rejections) in the books
- Agent: Claude (Lead Development Agent)
- Status: DONE — merged on the owner's explicit instruction in chat («ادمج»); GitHub jobs not started (billing), acceptance on local evidence.
- Goal: FOUNDATION §3.7 «عمق قطاع المستشفيات» — payers, claims, rejections and settlements, revenue by department, payer ageing; the same books behave by sector.
- Scope: `app/src/engine/fusion/finance/insurance-claims-engine.ts` (+6 tests): a visit splits into the patient's share (cash) and the payer's claim (1210, named to the payer, coverage % and co-payment cap), revenue by department (4010 outpatient, 4020 inpatient, 4030 lab/radiology, 4040 pharmacy); a remittance posts paid to cash and rejected to 5110 with its reason, never above the payer's open claims; `payerStats` (billed, paid, rejected, open, rejection rate). `ui/features/ledger.js`: a «المطالبات والجهات» tab shown only for a health company (visit form, remittance form, payer table with ageing from the books), posting through `postEntry`. `tools/health_pack_e2e.mjs` (new, in the workflow).
- Limits recorded: amounts are before VAT — VAT on healthcare depends on the patient and the service and is not posted by this tab yet; no patient data (a case is a reference number).
- Branch / PR: `claude/p3-health-claims-20261006` from `main` @ 3a13930.
- Evidence: engines 471/471; workflow node tests 294 pass / 52 fail, the same failure set as `main`; health_pack_e2e, meat_pack_e2e, books OK; advances 26/26; sales 28/28; door 94/94; feature_audit 146/146 — all on the first attempt.
- NEXT ACTION: healthcare VAT treatment; doctors' commissions and case cost; then deepen hospitality/construction/digital packs.

### TASK CLAUDE-20261006-010 — Owner-ordered review of all open PRs; rebuild of #133 + #137 on current main
- Agent: Claude (Lead Development Agent)
- Status: DONE for the merge part — the rebuilt #133 + #137 merged on the owner's explicit approval («أعد بناء #133 + #137 وادمجهما»); #161/#162 open for the owner's review.
- Owner instruction (chat, 2026-10-06): review every open PR, then «كل شيء» — rebuild and merge #133 + #137, merge #151 and #152, close #116 #139 #150 #7 #4, extract the document vault from #140 and the safety fixes from #143 for review before merge.
- Done so far: closed #116 (superseded by AGENT_WORKLOG.md), #139 (diagnostic, DO NOT MERGE), #150 (door implemented in #153; older FOUNDATION edits), #7 and #4 (superseded reconstruction) — branches kept, each with a comment. Merged docs-only #151 (a6abc87) and #152 (d0056fa) after a secret scan.
- Security finding (#96): the live `wa-kosif-mcp` answers `initialize` as version 1.4.1 and has no protected-resource metadata (404) — the 1.5.0 owner-only gate in #96 (base: a feature branch, not main) is not deployed. Per #96 itself, 1.4.1 runs tool calls without checking the caller. Deployment needs the owner's Auth0 API and Worker secrets; reported to the owner with an interim mitigation (unlink or pause the Worker). No tool was called during the check.
- This branch: `claude/report-a11y-rebuilt-20261006` = `main` + `codex/sqc-native-focus-completion-20261005` (contains #133). One conflict, `ui/core/sk.js` export line: kept both `onSave` (#133) and `vatRate,vatPct` (#156).
- Evidence for this branch (local; GitHub jobs not started — billing): engines 471/471; with `SQC_OUTPUT_ROOT` set to the repository as the workflow sets it, 695 node tests: 641 pass / 54 fail — the 52 of `main`'s failure set plus `tools/header_names.test.mjs` (2), which fails identically on the #137 branch itself (a Windows-only `new URL(...).pathname` path, `C:\C:\...`); every other new #133/#137 test passes. Browser: health, meat, books OK; advances 26/26; sales 28/28; door 94/94; feature_audit 145/146, rerun 146/146 (the one miss, «شعار SQC في كل الثيمات غير التراثية», checks with a 120 ms wait; a direct probe shows the SQC mark in every non-heritage theme at 120 ms and 600 ms). `dashboard_box_kpi_e2e`, `executive_pack_context_e2e`, `mercury_ci_e2e` refuse to run outside GitHub Actions by design — not run.
- Extractions opened for the owner's review (not merged): #161 the R2 document vault from #140 (nine commits cherry-picked; fails closed until the bucket, binding, D1 schema and Worker deploy exist); #162 per-company chat isolation + explicit public-demo admission from #143 (82/82 scope tests; without #143's older FOUNDATION/CLAUDE.md edits and its source-model fixtures).
- NEXT ACTION: merge this PR on the audit rerun; close #133/#137 as carried here; owner reviews #161/#162; the #96 WhatsApp gate needs the owner's Auth0/secret steps.

### UPDATE CLAUDE-20261006-010 — extractions merged on the owner's approval
- #161 (R2 document vault from #140) merged after door 94/94, books OK and feature_audit 146/146 run alone (a parallel run's miss of «استوديو المراجعة يفتح على بيانات تجريبية» was the studio's cold-load timing: a direct probe showed the demo data after 5 s on a cold server and at 5 s warm; restoring each vault UI file changed nothing). The vault stays fail-closed until the owner creates the R2 bucket, the DOCUMENTS binding, the D1 schema and deploys the capabilities-v2 Worker.
- #162 (chat isolation + public-demo admission from #143) merged after merging current `main` (#161, #163) into it: node 726 pass / 54 fail (= `main`'s 52 + the 2 Windows-only header tests), door 94/94, health/meat/books OK, advances 26/26, sales 28/28, feature_audit 146/146 — all first attempt. Carried one more 7da550d file: `tools/management_report_scope.test.mjs` (a same-space click on a tainted scope is refused).
- #140 and #143 remain open only as source assets, each with a comment on what was extracted; #96 waits on the owner's Auth0/secret steps (live WhatsApp MCP still 1.4.1).

### TASK CLAUDE-20261006-011 — P3 health: doctors' fees and the cost of a case
- Agent: Claude (Lead Development Agent)
- Status: DONE — merged as PR #164 on the owner's explicit instruction in chat («ادمج ومل»); GitHub jobs not started (billing), acceptance on local evidence.
- Goal: FOUNDATION §3.7 «عمق قطاع المستشفيات» — doctors and commissions, case cost. The health pack becomes `deep`.
- Scope: `system/sector-pack-engine.ts` health pack: `deep`, accounts 5210 (doctors' fees) and 5220 (medicines and supplies used); `finance/insurance-claims-engine.ts`: `doctorFee` (share or fixed, capped at the visit), `caseCostJournal` (Dr 5210 / Cr 2150 named to the doctor; Dr 5220 / Cr 1360), `caseCosts` (revenue, fee, supplies, margin per case) + tests; `ui/features/ledger.js` claims tab: doctor, fee %, supplies on the visit form, a second entry named to the doctor, a «تكلفة الحالة» table, supplies refused beyond the pharmacy stock; `tools/health_pack_e2e.mjs` extended.
- Branch / PR: `claude/health-case-cost-20261006` from `main` @ 047373e.
- Evidence: engines 473/473; node 726 pass / 54 fail (= `main`'s 52 + 2 Windows-only header tests); health (incl. case cost) OK; door 94/94; meat, books OK; advances 26/26; sales 28/28; feature_audit 146/146 — all first attempt.
- NEXT ACTION: owner approval to merge; then healthcare VAT, then deepen hospitality/construction/digital packs.

### TASK CLAUDE-20261006-012 — P3 health: VAT on healthcare visits
- Agent: Claude (Lead Development Agent)
- Status: DONE — merged as PR #165 on the owner's explicit instruction in chat («ادمج وكمل»); GitHub jobs not started (billing), acceptance on local evidence.
- Goal: close the limit recorded in CLAUDE-20261006-009 (claims amounts were before VAT).
- Sources checked (web, 2026-10-06): Saudi Arabia — private healthcare standard-rated for non-Saudi patients; for Saudi citizens the state bears the VAT and the provider issues a 0% invoice (Royal Order); qualifying medicines and medical goods listed by MOH/SFDA zero-rated; government providers outside the scope. Egypt — medical services exempt (VAT Law 67/2016). The official ZATCA healthcare guideline URL returned 404; the reimbursement/reporting mechanism of the citizens' state-borne VAT is not posted and is stated on the screen as to be confirmed with the company's tax adviser.
- Scope: `finance/insurance-claims-engine.ts`: `healthVatTreatment` (country × VAT policy × patient category), `encounterJournal` posts output VAT on standard-rated visits and shares the VAT-inclusive bill (co-payment cap on the total) + tests; claims tab: patient category, treatment from the company's country and `SK.vatRate()`, 2200 required only when taxable, the treatment recorded on each visit, a note of the rules; `tools/health_pack_e2e.mjs` (citizen visits keep their figures; a non-Saudi visit posts VAT 30 on 200, 115/115).
- Not yet: zero-rated / state-borne sales are recorded per visit but not yet laid out as separate boxes of the VAT return.
- Branch / PR: `claude/health-vat-20261006` from `main` @ ef5c967.
- Evidence: engines 475/475; node 726 pass / 54 fail (= `main`'s 52 + 2 Windows-only header tests); health incl. VAT OK; door 94/94; meat, books OK; advances 26/26; sales 28/28; feature_audit 146/146 — all first attempt.
- NEXT ACTION: owner approval to merge; then zero-rated/state-borne boxes on the VAT return; then deepen hospitality/construction/digital.

### TASK CLAUDE-20261006-013 — VAT return: the health visits in boxes 2, 3 and 5
- Agent: Claude (Lead Development Agent)
- Status: HANDOFF (PR open; merge deploys production — owner approval)
- Goal: close CLAUDE-20261006-012's open item — zero-rated / state-borne / exempt visits laid out on the return.
- Source (web, 2026-10-06): the ZATCA VAT return sales section — 1 standard-rated sales, 2 private healthcare / private education / first house sales to citizens, 3 zero-rated domestic sales, 4 exports, 5 exempt sales (Zoho, Tally, Wafeq guides).
- Scope: `finance/insurance-claims-engine.ts` `healthSalesBoxes(entries, start, end)` (+test); `ui/features/ledger.js` VAT return rows 2 / 3 / 5 when they carry an amount (box 2 has no VAT column: the state bears it); `tools/health_pack_e2e.mjs` (box 2 = 920, box 1 = 200 / 30).
- Branch / PR: `claude/vat-return-boxes-20261006` from `main` @ f1d7106.
- Evidence: engines 476/476; node 726 pass / 54 fail (= `main`'s 52 + 2 Windows-only header tests); health incl. return rows OK; door 94/94; meat, books OK; advances 26/26; sales 28/28; feature_audit 146/146 — all first attempt.
- Constitution check (owner asked «ارجع للدستور»): P3 still `base` for hospitality, construction and digital marketing; §3.6 asks for complete sample companies that ran a real accounting cycle (large hospital, school, factory, bakery, farm, trade) — only the meat demo exists today. Planned next: construction (progress billings, retentions, advance recovery, project profitability), then the §3.6 sample companies as their own wave.
- NEXT ACTION: owner approval to merge.

### TASK CLAUDE-20261006-014 — P3 construction: contracts, advances, progress billings, retentions, project costs
- Agent: Claude (Lead Development Agent)
- Status: DONE — merged as PR #167 on the owner's explicit instruction in chat («نفذ»); GitHub jobs not started (billing), acceptance on local evidence.
- Goal: FOUNDATION §3.7 «عمق قطاع المقاولات» — the contract and its progress billings (المستخلصات), advances and retentions, revenue and cost per project, completion and margin. The construction pack becomes `deep`.
- Scope: `app/src/engine/fusion/finance/progress-billing-engine.ts` (+6 tests): advance (cash, 2320, VAT), certificate (this period's work = certified to date − last certificate; retention 1220; advance recovery from 2320 capped at the advance left; VAT on the work less the recovery; receivable 1200; revenue 4070; refused above the contract value — a change order first — or without new work), retention release at handover, project profitability (margin, completion by cost, expected margin from the budget). `ui/features/ledger.js`: «المشروعات والمستخلصات» tab for construction companies only — contracts saved in the books, each contract's state read back from its own entries; direct costs (5130 subcontract, 5140 materials) tagged to the project. `tools/construction_pack_e2e.mjs` (new, in the workflow).
- Not yet: change orders and claims, subcontractor retentions (2310), WIP/contract assets under IFRS 15 when costs run ahead of billing.
- Branch / PR: `claude/construction-pack-20261006` from `main` @ f1d7106.
- Evidence: engines 481/481; node 726 pass / 54 fail (= `main`'s 52 + 2 Windows-only header tests); construction, health, meat, books OK; door 94/94; advances 26/26; sales 28/28; feature_audit 146/146 — all first attempt.
- NEXT ACTION: owner approval to merge; then hospitality and digital marketing packs; then the §3.6 sample companies.

### TASK CLAUDE-20261006-015 — P3 hospitality: deposits, the night audit, channel commissions, occupancy / ADR / RevPAR
- Agent: Claude (Lead Development Agent)
- Status: HANDOFF (PR open; merge deploys production — owner approval)
- Goal: FOUNDATION §3.7 «عمق قطاع الفنادق» — the hospitality pack becomes `deep`: its own posting, not just accounts and labels.
- Scope: `app/src/engine/fusion/finance/hotel-engine.ts` (+6 tests): `depositJournal` (cash with VAT / 2300 / 2200); `nightAudit` (settled from the guest's deposit left first, VAT only on the rest, then cash 1100 or receivable 1200 with the guest or channel as party; rooms 4050, F&B 4060) and the channel commission (Dr 5120 / Cr 2160 on room revenue); `hotelKpis` (occupancy, ADR, RevPAR, share by channel). `ui/features/ledger.js` tab «الغرف والإقفال الليلي» for hospitality companies only; deposits left and KPIs are read back from the posted entries; the hotel's room count is remembered. `tools/hotel_pack_e2e.mjs` (in the workflow).
- Not yet: room types and rate plans, no-shows / cancellation fees against deposits, city/tourism levies, a room-status board.
- Branch / PR: `claude/hospitality-pack-20261006` from `main` @ 35f4cec.
- Evidence: engines 488/488; node 726 pass / 54 fail (= `main`'s 52 + 2 Windows-only header tests); hotel, construction, health, meat, books OK; door 94/94; advances 26/26; sales 28/28; feature_audit 146/146 (local; GitHub jobs not started — billing).
- NEXT ACTION: owner approval to merge; then the digital-marketing pack; then the §3.6 sample companies.

### TASK CLAUDE-20261006-016 — P3 digital marketing: retainers, deferred revenue, ad spend, rebills, campaign profitability
- Agent: Claude (Lead Development Agent)
- Status: DONE on merge — the owner gave a standing instruction in chat to merge without asking («ادمج اي شيء دون الرجوع لي», then «اكمل التطوير دون الرجوع لي ونفذ كل الاصلاحات والدمج»). CLAUDE-20261006-015 (hospitality) merged as PR #168 (9e9e7eb) under the same instruction and is live (bundle `skosif.js?v=490d123c64` carries «الغرف والإقفال الليلي»).
- Goal: FOUNDATION §3.7 «عمق قطاع التسويق الإلكتروني» — the digital pack becomes `deep`.
- Scope: `app/src/engine/fusion/finance/agency-engine.ts` (+6 tests): `retainerSchedule`, `retainerInvoiceJournal` (Dr 1200 with VAT / Cr 2400 deferred / Cr 2200), `recognitionJournal` (months served and not yet recognised: Dr 2400 / Cr 4080), `mediaSpendJournal` (Dr 5150 / Cr 2170, the platform as party), `rebillJournal` (spend + agency markup + VAT to the client: Dr 1200 / Cr 4080 / Cr 2200), `campaignProfitability` (margin, ROAS = attributed sales ÷ spend, CAC = what the client paid ÷ new customers). `ui/features/ledger.js` tab «العملاء والحملات» for digital agencies only; each campaign's state is read back from its entries; months recognised once (source id per months); rebill refused beyond the spend not yet rebilled. `tools/digital_pack_e2e.mjs` (in the workflow).
- Not yet: the agent-vs-principal choice per client (net media revenue), reverse-charge VAT on foreign platforms' invoices, hours/timesheets per campaign, platform settlement in foreign currency.
- Branch / PR: `claude/digital-pack-20261006` from `claude/hospitality-pack-20261006` @ be3074e.
- Evidence: engines 494/494; node 726 pass / 54 fail (= `main`'s 52 + 2 Windows-only header tests); digital, hotel, construction, health, meat, books OK; door 94/94; advances 26/26; sales 28/28; feature_audit 146/146 (local; GitHub jobs not started — billing).
- NEXT ACTION: the §3.6 sample companies (a real accounting cycle per sector).

### TASK CLAUDE-20261006-017 — §3.6 reference model companies: a full accounting cycle per sector
- Agent: Claude (Lead Development Agent)
- Status: DONE on merge — the owner's standing instruction in chat: «ادمج اي شيء دون الرجوع لي» / «اكمل التطوير دون الرجوع لي ونفذ كل الاصلاحات والدمج».
- Goal: FOUNDATION §3.6 «نماذج محاسبية افتراضية إلزامية» — companies that have really been through a cycle (operation → entry → ledger → trial balance → receivables / inventory / cost → statements → close), with normal cases, exceptions, adjustments and a corrected error.
- Scope: `app/src/engine/fusion/system/model-books-engine.ts` (+10 tests): `MODEL_COMPANIES`, `modelBooks(id)` (seeded and deterministic, January–September 2026, closed at 30 September) and `checkModelBooks` (every entry balances and posts to the chart, trial balance zero, cash never negative at a month end, nothing after the close).
  - Hospital «مستشفى الشفاء النموذجي»: about 11.25 million a month; 2,190 daily department visits through `insurance-claims-engine` (citizens' VAT state-borne, residents' 15%); three payers remitting 94% and rejecting 3% the following month; doctors' fees; pharmacy purchases and consumption; a stock-count shortage.
  - School «مدارس المستقبل النموذجية»: two terms billed in advance into 2410 and earned monthly into 4090; scholarships 5160; staged collections leaving arrears; transport; a withdrawn student's credit note.
  - Factory «مصنع الخليج النموذجي للبلاستيك»: raw materials → WIP with labour and overhead absorbed; output at standard; 2% scrap; adverse or favourable variances 5170; no WIP left; credit sales and collections.
  - Bakery «مخبز السنابل النموذجي»: daily cash sales, monthly batch, cost of sales and 7% waste 5180.
  - Farm «مزرعة الوادي الأخضر النموذجية»: a flock with feed capitalised, lambing, mortality 5190, sales at the average cost per head.
  - Trade «شركة النخبة التجارية النموذجية»: purchases on credit, cash and named credit customers, a count shortage and a bad debt.
  - Every company also has: VAT quarters closed into 2250 (Q1 and Q2 paid, Q3 payable), a duplicated rent entry reversed, and overheads.
  - The meat sector's model remains the demo company «شركة الوادي التجريبية للحوم».
- UI:
  - `unlock.html` lists each sector's model company in that sector of the accounting entry (not in audit or tools).
  - `helper-space.js` and `company.js` record and expose `model`.
  - `demo.js` `seedModel()`: the first open of a model company writes its generated books, a closed period and a 2026 financial year, instead of the meat demo. All records are marked demo and model.
- Tests: `tools/company_entry.test.mjs` updated, plus a model-company test; `tools/model_companies_e2e.mjs` (in the workflow) opens all six from the door.
- Not yet:
  - IAS 41 fair value of the flock (held at cost);
  - fixed assets and depreciation;
  - payroll sub-ledgers;
  - a statements pack per model;
  - a year-end close into retained earnings.
- Branch / PR: `claude/model-companies-20261006` from `main` @ 9905485.
- Open PRs from the other agent: #169 (UX clarity) and #170 (independent audit context) were verified together locally (all suites pass except one door test that #169's own card reordering broke; fix found: look up the locked card by its flag). They were not merged: the session's permission classifier refused merging another agent's PR without review. They wait for the owner.

### TASK CLAUDE-20261006-018 — P2 accounting-cycle proof on every company's own books
- Agent: Claude (Lead Development Agent)
- Status: DONE on merge — the owner's standing instruction in chat: «كمل تطوير وراجع الدستور وادمج بنفسك».
- Goal: PRODUCT_MANDATE P2 acceptance «عملية → قيد → أستاذ → ميزان → قوائم بالأرقام نفسها», and FOUNDATION §3.6's chain through to the close, proven on the books rather than asserted.
- Scope:
  - `app/src/engine/fusion/reports/cycle-proof-engine.ts` (+8 tests) checks six steps:
    1. operations → entries: balanced, inside the chart, carrying their operation's source;
    2. ledger → trial balance: debits equal credits;
    3. trial balance → statements: every account lands on a line, and the financial position balances, using the chart's own account types;
    4. the same numbers: the statements' profit equals ledger revenue minus expenses, and total assets equal the ledger's assets;
    5. sub-ledgers: each control account (1200, 1210, 2100, 2150, 2160, 2170) equals its parties, and lines without a party are named;
    6. the close.
  - The books' close tab has a «إثبات الدورة المحاسبية» card with a date. `SKosifLedger.proof(end)` is the same check, read-only.
  - `tools/model_companies_e2e.mjs` now requires all six steps green on each of the six model companies; all six were green on the first run (100% of accounts mapped).
- Not yet: a click from a statement line to its accounts and entries in the UI (the engine's notes already list them); cash-flow tie-out with a prior year.
- Branch / PR: `claude/cycle-proof-20261006` from `main` @ cb1d0a1.

### TASK CLAUDE-20261006-019 — P3 education pack: terms billed in advance, earned monthly, scholarships, withdrawals, collections
- Agent: Claude (Lead Development Agent)
- Status: DONE on merge — the owner's standing instruction in chat («كمل تطوير وراجع الدستور وادمج بنفسك», then «كمل» / «طوره»).
- Goal: FOUNDATION §3.6 «المدارس: … رسوم وتحصيل، خصومات ومنح، ذمم الطلاب/أولياء الأمور … وإيراد مؤجل/مكتسب وفق السياسة» — the education pack becomes `deep`.
- VAT, already sourced for the health pack (CLAUDE-20261006-012):
  - Saudi Arabia: the state bears the VAT on citizens' private education and healthcare (Royal Order, 2018), so the invoice shows 0%; residents pay the standard rate.
  - Egypt: educational services are exempt under VAT Law 67/2016.
  - The screen's note tells the company to confirm the return mechanism with its tax adviser.
- Scope:
  - `app/src/engine/fusion/finance/tuition-engine.ts` (+5 tests):
    - `tuitionVat`;
    - `termInvoiceJournal`: Dr 1200, with the term as party / Cr 2410 / Cr 2200 on residents only;
    - `recognitionJournal`: the deferred amount left is spread over the months left, the last month takes the remainder, and no month is recognised twice;
    - `discountJournal`: Dr 2410 / Cr 1200 with its VAT, and the gross fee is shown as 4090 against 5160 scholarships;
    - `withdrawalJournal`: a credit note for the months not yet taught;
    - `collectionJournal`: never more than the parents owe;
    - `termSummary`: collection rate and revenue per student.
  - `ui/features/ledger.js`: a «الرسوم الدراسية» tab for schools only. Terms are kept in the books (`d.terms`), and each term's state is read back from its entries.
  - The model school (#172) is regenerated through the same engine with the same meta, so the tab shows its two terms. `ModelBooks.ledger` carries the terms, and `demo.js` writes them with the entries.
  - `tools/education_pack_e2e.mjs` is added to the workflow.
- Not yet:
  - per-student or per-family accounts (the parents are aggregated per term);
  - instalment plans with due dates;
  - transport and activities as their own fee lines;
  - expected credit losses on old arrears.
- Branch / PR: `claude/education-pack-20261006` from `main` @ 227a88e.

### TASK CLAUDE-20261006-020 — P3 manufacturing and bakery packs: production orders, batches, standard cost, scrap, variances, waste
- Agent: Claude (Lead Development Agent)
- Status: DONE on merge — the owner's standing instruction in chat («كمل تطوير وراجع الدستور وادمج بنفسك», «طوره»).
- Goal: FOUNDATION §3.6:
  - «المصانع: BOM/وصفات إنتاج، أوامر تشغيل، مواد خام، تحت التشغيل، منتج تام، تكلفة معيارية وفعلية، تحميل صناعي، انحرافات، هالك»;
  - «المخابز: وصفات ودفعات إنتاج، مواد ومكونات، Yield، هالك وتالف وصلاحية، إنتاج يومي، تكلفة الصنف والتسعير».
  - Both packs become `deep`.
- Scope:
  - `app/src/engine/fusion/finance/production-order-engine.ts` (+5 tests):
    - `standardCost`: from the bill of materials, plus labour and overhead;
    - `materialsPurchaseJournal`;
    - `issueJournal`: 1370 → 1380, never more than the store holds;
    - `absorbJournal`: labour and overhead absorbed at standard, 6100 / 6300 → 1380;
    - `completeJournal`: good units to 1390 at standard, scrap to 5100 at its materials cost, and the rest of the order's WIP closed to 5170 (adverse or favourable), so no WIP is left; an order closes once;
    - `batchJournal`: ingredients plus the bakers' wages into 1390 at actual cost, with yield against the plan;
    - `wasteJournal` (5180) and `costOfSalesJournal`, never more than on hand;
    - `productionKpis` and `priceForMargin`.
  - `ui/features/ledger.js`:
    - «أوامر التشغيل» for factories: products with their bill of materials, orders and operations, and an orders table showing yield, unit cost and variance %;
    - «دفعات الإنتاج» for bakeries: recipes, batches, waste and cost of sales, a batches table, the waste ratio, and a price at a 40% margin with VAT;
    - the state is read back from the entries' `production` meta.
  - Manufacturing pack: adds 5100 (scrap and count differences), which the factory posts to.
  - Model factory and model bakery (#172) are regenerated through the same engine:
    - the factory has 9 monthly orders with variances of both signs;
    - the bakery has 273 daily batches plus monthly cost of sales and waste;
    - products and orders are carried in `ModelBooks.ledger`.
  - `tools/production_packs_e2e.mjs` is in the workflow.
- Not yet:
  - multi-level bills of materials and routings;
  - rework orders;
  - item-level stock quantities, lots and expiry dates (stock is still valued in riyals per account);
  - recipe costing from live purchase prices.
- Branch / PR: `claude/production-packs-20261006` from `main` @ ef28e95.

### TASK CLAUDE-20261006-021 — P3 agriculture pack: cycles as cost centres, feed capitalised, births, mortality, sales at average cost, IAS 41
- Agent: Claude (Lead Development Agent)
- Status: DONE on merge — the owner's standing instruction in chat («كمل تطوير وراجع الدستور وادمج بنفسك»).
- Goal: FOUNDATION §3.6 «الزراعة/المزارع: دورات إنتاج/مواسم، حقول/حظائر كمراكز تكلفة، أعلاف/مدخلات، نفوق/هدر، إنتاجية، مخزون حي/زراعي حيث ينطبق، وتكلفة الوحدة/الدورة». The agriculture pack becomes `deep`.
- Scope:
  - `app/src/engine/fusion/finance/livestock-engine.ts` (+3 tests):
    - stocking: 1395, paid or on credit, with input VAT;
    - feed purchase (1396) and feeding, capitalised 1396 → 1395 and never more than the store holds;
    - mortality at the average cost per head (5190), with a cause;
    - a sale: revenue, plus the heads' average cost out of 1395 into 5000, with the customer as party on credit; the last heads take exactly what is left;
    - IAS 41 `fairValueJournal`: fair value less costs to sell, with the gain or loss in 4950;
    - `cycleKpis`: cost per head, mortality, birth rate, feed per head, margin.
  - Agriculture pack adds 4950 «أرباح وخسائر القيمة العادلة للأصول الحيوية».
  - `ui/features/ledger.js`: a «الدورات والقطعان» tab for farms only. Cycles are kept in `d.cycles`. Births carry no cost, so they're kept in `d.cycleBirths` rather than posted. A cycle's state is read back from its entries.
  - Model farm (#172) is regenerated through the same engine and meta:
    - the 2,000-head flock now carries 15% input VAT, so its VAT nets to a refund;
    - lambing is recorded in `ledger.cycleBirths`;
    - the flock is remeasured to fair value less costs to sell at 30 September.
  - The model test now asserts that each closed quarter clears 2200 and 1400, whether the result is a payable or a refund.
  - `tools/agriculture_pack_e2e.mjs` is in the workflow.
- Not yet: crop cycles with harvest into agricultural produce (IAS 2 at the point of harvest), bearer plants (IAS 16), several cycles sharing one feed store by allocation.
- Branch / PR: `claude/agriculture-pack-20261006` from `main` @ e1b9bcc.

### TASK CLAUDE-20261007-001 — P3 general-trade pack: branches and their stock, discounts, margins, turnover, credit limits
- Agent: Claude (Lead Development Agent)
- Status: DONE on merge — the owner's standing instruction in chat («كمل تطوير وراجع الدستور وادمج بنفسك», then «اكمل»).
- Goal: FOUNDATION §3.6 «التجارة: فروع ومستودعات، شراء وبيع، تسعير وهوامش، خصومات، مخزون ودوران، عملاء وموردون وائتمان».
  - With this pack, every sector pack in `SECTOR_PACKS` is `deep`.
- Scope:
  - `app/src/engine/fusion/finance/trade-engine.ts` (+4 tests):
    - `branchPurchaseJournal`: purchases on credit for a branch;
    - `branchSaleJournals`:
      - gross sales to 4000, the discount allowed to 4100, VAT on the net, and cost out of the branch's stock;
      - refused when the cost exceeds the branch's stock;
      - a credit sale is refused without a limit or beyond it, and names the customer as party;
    - `transferJournal`: moves stock between branches at cost, with no change to the books' total;
    - `branchKpis`: stock, net sales, margin, discount rate and stock turnover per branch;
    - `creditPosition`.
  - Trade pack adds 4100 «خصومات المبيعات المسموح بها» and 5100.
  - `ui/features/ledger.js`: a «الفروع والهوامش» tab for trading companies only:
    - branches (`d.branches`) and credit limits (`d.creditLimits`);
    - operations: purchase, sale, transfer;
    - a branch table and a customer-credit table, with over-limit rows flagged.
  - The model distributor (#172) is regenerated through the same engine:
    - two branches; Riyadh buys and transfers 35% to Jeddah;
    - three named customers within their limits, with a 2% trade discount;
    - cash sales at 1%;
    - the count shortage and the bad debt are kept.
  - `tools/trade_pack_e2e.mjs` is in the workflow.
- Not yet:
  - item-level stock (quantities, average cost per item, reorder points);
  - price lists per customer group;
  - supplier rebates;
  - per-branch cash accounts.
- Branch / PR: `claude/trade-pack-20261007` from `main` @ f645381.

### TASK CLAUDE-20261007-002 — Relationship Health / Integration Monitor (FOUNDATION §3.6)
- Agent: Claude (Lead Development Agent)
- Status: DONE on merge — the owner's standing instruction in chat («كمل تطوير وراجع الدستور وادمج بنفسك», «اكمل»).
- Goal: FOUNDATION §3.6 «Relationship Health / Integration Monitor». A broken link must:
  - raise a clear alert;
  - name the affected link and the source of the error;
  - prevent silent corruption of the results;
  - allow the link to be re-mapped, refreshed and tested;
  - keep a history of the link's tests.
  - It is also open in `docs/registry/rule-zero-2026-10-05/REQUIREMENTS_AND_GATES_ar.md` line 115.
- Scope:
  - `app/src/engine/fusion/system/relationship-health-engine.ts` (+8 tests: the six model companies are clean, and every rule is exercised). It is pure and changes nothing. Its rules:
    - **mapping**: definitions whose `accountCode` is not in the chart, and pack accounts that aren't opened;
    - **posting**: helper-tool operations not yet posted; older than 30 days is a failure;
    - **reference**: sector meta naming a contract, term, order, product, cycle, retainer or branch that no longer exists; reversed entries are skipped;
    - **sync**: entries on accounts outside the chart, an operation posted twice (`sourceId`), unbalanced entries;
    - **party**: receivable or payable lines with no party.
  - Each finding carries the link, title, source, count, samples and repair.
  - `ui/features/ledger.js`: a «صحة الروابط» tab for every company:
    - a status pill and the findings, each with «فتح» to the tab where it is repaired;
    - «إعادة الفحص وتسجيله» keeps a dated history (`d.rhHistory`, the last 50 runs) and an audit-log line.
  - `tools/relationship_health_e2e.mjs` is in the workflow.
- Not yet:
  - re-mapping in place from the finding;
  - watching the helper tools' own stores (e.g. a sales record changed after posting);
  - running the check automatically before the month-end close.
- Branch / PR: `claude/relationship-health-20261007` from `main` @ 19f3460.

### TASK CLAUDE-20261007-003 — Whole-app review and test, on the live site
- Agent: Claude (Lead Development Agent)
- Status: DONE on merge — the owner asked in chat: «ادمج وراجع كل شيء في التطبيق واختبره».
- Merge: nothing of mine was open. The 4 open PRs are drafts:
  - #169 and #170 were extracted into `main` by the other agent;
  - #143 and #140 were recovered through the knowledge batches;
  - merging any of them would bring superseded code back, so they were left as they are.
- Live test (https://s-kosif.pages.dev, `skosif.js?v=726f7e55cd`, fresh browser contexts with no data of the owner's). All suites pass:
  - model companies, health, hotel, construction, digital, education, production, agriculture, trade and relationship health;
  - meat and books;
  - advances 26/26 and sales 28/28;
  - `feature_audit` **146/146**.
  - The door suite asserts the preview build. On production it correctly finds the private company «تصيف» as a locked card in the meat sector.
  - A separate live check:
    - the locked card shows only the password form and stays on the door;
    - a wrong password does not open it;
    - nothing private sits in localStorage;
    - the private blocks are encrypted (`crypto.json`).
  - The live hospital model: 2,287 entries, the cycle proof green on all six steps, link health «سليمة», the error log empty.
- Fixes found by the review:
  - `ui/features/ledger.js`: the `SKosifLedger` API object had a duplicate key `ensureAccounts` (eslint `no-dupe-keys`, an error in the lint CI runs); the older duplicate was removed. Same function, so no change in behaviour.
  - `eslint.config.mjs`: `SKosifCompanyPlatform` was missing from the app globals. `npx eslint ui` now gives 0 errors and 11 warnings, all unused variables in files not touched here.
  - 11 door-based e2e suites now wait for `/app-safe` as well as `/app-safe.html`. Pages serves the page without the extension, so the same suites run against production.
- Left for the owner and the other agent: `think-mcp/cloudflare-council-01713` and `regression-01713` fail on `main`. They pin the KOSIF Think worker's route versions (`/mcp/v0.18.4`), which that agent is changing, and they concern a deployed worker contract.
- Branch / PR: `claude/live-verification-20261007` from `main` @ dafd407.

### TASK CODEX-20261007-UI-REPAIR — bounded financial and context display regressions
- Agent: Codex
- Status: ACTIVE
- Base: main `fb74267d2cc412a7162c78ee37da237ce427581d`; branch `codex/company-context-vat-20261007`.
- Scope reservation: `ui/features/enterprise.js`, `ui/features/master-data.js`, `ui/features/month-close.js`, `ui/layouts/topbar.js`, `ui/layouts/rail-audit.js`, company-search rendering in `unlock.html`/`ui/features/tb-review.js`, essential focused tests; investigate ledger table footer via shared table renderer before reserving any additional edit. Preserve independent audit/accounting/tools contexts, actual company data, all 78 capabilities, and other owners' changes. No security/startup/admission changes.
- Governance: read current START_HERE, FOUNDATION, PRODUCT_MANDATE and coordination ledger. No repository .agents/skills found. Current connector listing returns 17 accessible repositories; existing deep-inventory coverage remains partial and is not claimed complete. Reviewed open drafts #170/#169 (already selectively extracted), #143/#140 (source assets); no competing architectural rewrite. PR157 is already merged and purchasing is excluded.
- Findings: current enterprise QR/tag verification/WhatsApp retain fixed 1.15; master-data still submits percentage text to fraction-or-percent API. New reported context/search, close counts and ledger-footer issues require synthetic reproduction.
- Plan: write failing behavioral regressions, apply minimal boundary/display fixes, run relevant Node/build/type/lint and isolated browser checks, independent review, then publish. Latest owner authorization allows merge and deployed verification only when checks/protections permit; never bypass CI.
- NEXT ACTION: reproduce the named defects on this base. Record all failed/blocked checks separately.

- Scope update: independently reproduced RTL negative-number parsing in `ui/components/table.js`, inappropriate movement-balance footer in `ui/features/ledger.js`, and pagination accessible names. Reserve only these shared display paths plus `tools/trial_balance_footer.test.mjs`; no changes to ledger amounts or sector operations. `ui/features/audit-practice.js` currency/unit labels also in scope.

- Material discovery / bounded scope update: independent reviewer reproduced the exact secondary Amazon misclassification (cost of revenue as revenue; tax/result lines as assets). Reserve `ui/features/audit-bridge.js` only for an explicit unsupported-mapping transport guard, not an alternate accounting engine. Primary mapped statements and stored data remain available/unchanged. Reserve `ui/features/tb-fieldwork.js` for completion counting of initial high-priority requests; secondary generated requests/adjustments are not represented as primary global readiness. Full secondary mapping/report-framework convergence is a recorded follow-up acceptance limit.

- Implementation / verification checkpoint (2026-10-07): VAT percentage boundary converts 0–100 UI values to API fractions; receipt/QR/check/message share rounded amounts. RTL signed cells, non-additive running-balance footer, pagination names, revenue residual labels, independent context labels, Arabic Amazon alias, optional-close counts and engagement currency scale repaired. Initial high-priority evidence stays unresolved until accepted. Unsupported mapped-corpus secondary conversion is explicitly withheld; no stored records or engine amounts changed.
- Evidence: focused Node tests 97/97 (VAT registered/unregistered rates 0%, 0.5%, 1%, 5%, 15%, invalid values and decimal edges; bridge, context, table); four TypeScript projects and 544 engine tests pass; preview build 163 entries; affected lint 0 errors/4 existing unused-variable warnings; capability docs check passes and all 78 registry entries unchanged. Local isolated Chromium 1365×900 and 390×844 pass bilingual search, audit context/scale, primary Amazon revenue 637,959 and unsupported secondary/report guard without page errors. Independent review passed 79 cases, with requested gate repaint and fixture fix completed; unavailable-request regression added.
- Broader workflow Node suite: 428/431 passed. Three failures reproduce on untouched main fb74267: company_entry old demo-company expectation; two sqc_accessibility fake modal roots lack closest(). No CI bypass or unrelated fixture repair. Exact-head CI and deployment remain pending.
- Acceptance limits: this is a bounded repair, not full secondary mapping/US-GAAP report support; manually mapped non-corpus imports remain outside this guard. TLV validation still uses current company policy and existing tolerance, not historical/external-rate inference. Arabic alias covers Amazon, not full transliteration. Browser checks use only isolated public/synthetic data; no live saves, messages, exports or production mutations.

### TASK CLAUDE-20261007-004 — Page-by-page review of the live app in a real browser
- Agent: Claude (Lead Development Agent)
- Status: DONE on merge — the owner asked in chat: «راجع التطبيق بفتحه في متصفح راجعه صفحة صفحة».
- `tools/page_review.mjs` (new; run by hand, not in CI because it takes about 15 minutes) opens screens on a desktop (1400×900) and a phone (390×844):
  - every visible screen of the registry, in the demo company;
  - every books tab of the six sector model companies;
  - per screen it records page errors, console errors, broken values shown to the user (undefined, NaN, null, [object Object], Infinity), horizontal overflow, an empty view, the time taken, and a screenshot.
- Result on https://s-kosif.pages.dev: **188 screens reviewed (79 distinct)**:
  - no page errors;
  - no broken values;
  - nothing overflowing on the phone;
  - no empty view.
  - The 10 "Failed to load resource" console lines came from the test's own font blocking (`SQC_BLOCK_FONTS`). Re-run without it, the same screens fail no request.
- Branch / PR: `claude/page-review-20261007` from `main` @ fb74267.

### TASK CODEX-20261007-CANONICAL-AUDIT — secondary mapped-model statement/report follow-on
- Agent: Codex; Status: ACTIVE. Stacked on PR205 head 949e0d170ab98fe7320095375b87575201284225; main a364d87 unchanged. Independent PR205 CI/diff reviewer owns its review; no CI/settings changes here.
- Scope: `ui/features/tb-review.js`, `ui/features/audit-bridge.js`, new focused canonical-view module if required, and essential tests. No imported studio engine rewrite, purchasing, VAT or generic search changes. Current Claude task is completed page review, no conflicting active ownership recorded.
- Root cause: secondary name-based classifier loses primary overrides (cost of revenue becomes revenue, tax/result become assets), secondary equity excludes current profit, and bridge defaults INTL to SA/IFRS. Canonical primary keys already hold correct before/after values and mapping lineage.
- Bounded design: pass a read-only canonical statement snapshot from the primary computed model to the secondary mapped-model preview. Render before/after/difference with exact same values, account lineage, corpus identity and honest framework/jurisdiction/scale. Keep unsupported full report issuance and secondary accounting transformations unavailable. Preserve published-source hard boundary and all stored evidence/secondary documents. Remove false Saudi/IFRS basis wording for international corpus statement previews; do not claim US-GAAP compliance.
- Verification plan: failing regressions for Amazon revenue 637959, profit 59248, assets 624894, closing equity 285970; comparison/prior/accepted changes and lineage; metadata US GAAP/US/million USD; no default IFRS/SA assertion or issue control; source-only boundary/race safety; desktop/mobile isolated preview. Then independent review and separate draft PR; no merge until exact-head gates permit.
- Verified implementation: secondary mapped-model preview now renders the same primary before/after PL and SFP (including closing equity), comparative values, balance/mapping warnings, accepted adjustment IDs and account lineage. Omitted zero-value rows are unioned across versions, with 0 baselines and unavailable comparatives retained. Source pages/framework/jurisdiction/currency/scale travel together; incompatible unit/framework metadata retains the explicit unavailable guard. Source-only models still cannot enter either ordinary secondary engine. No imports, stored-record mutation, issuance control or independent recalculation in this route.
- Primary international statement heading and basis note no longer claim IFRS18/Saudi-SOCPA/SAR defaults. Analytical limitations remain explicit; broader primary report templates and full US-GAAP support are not certified by this change.
- Validation: red/green regressions captured for missing canonical snapshot, imbalance warning, changed units, and introduced/cleared comparison lines. Focused102/102 pass; independent final review9/9 and no remaining blocker; four TypeScript projects +544 engine tests pass; preview build163 entries; desktop1365×900 and phone390×844 pass correct Amazon figures and metadata/no issuance/no page errors; affected lint0 errors/1 existing unused warning; capability docs unchanged. Broader466 Node tests:463 pass, same3 pre-existing main failures documented under PR205.
- CI diagnosis: exact PR205 preview succeeds but is not production acceptance. All9 Actions jobs failed before steps ran; connector annotation endpoint unsupported and authorized gh annotation call Forbidden. Root cause unconfirmed; no settings changes, rerun spam or CI bypass. Stacked follow-on draft will depend on PR205; merge/deployed verification blocked until required gates pass.
- PR206 independent-review follow-up (active): reproduce and repair conditional nonzero subtotal omission in `audit-bridge.js` comparison only, plus focused bridge regressions. The primary engine suppresses continuing-operations display rows when discontinued operations are zero, while retaining nonzero `keys.continuing`. Missing display row cannot generally mean zero. Reserve canonical subtotal-key lookup; retain zero fallback only for omitted line rows. No source-engine or issuance changes.
- Review follow-up verified: introduce/clear discontinued operations reproduced false continuing-subtotal deltas, then fixed using canonical subtotal keys; only missing detail lines default to zero, unknown subtotals remain unavailable. Added real accepted-adjustment tests both directions (continuing59,248→59,248, delta0). Comparative column uses explicit source-model priorPeriodEnd when provided; otherwise states date not documented, with no inferred year-end. Income-tax model labels are presentation-only neutral ضريبة الدخل. No engine/source labels or numbers mutated.
- Follow-up evidence:106/106 focused tests pass (13 bridge cases); independent reviewer12/12 at review time, no blocker; preview build and desktop/phone browser checks pass updated tax/date labels; lint0 errors/1 pre-existing warning. Print/export paths were not browser-tested. No issuance enablement, merge or canonical deployment; prior CI blocker persists pending new-head checks.

### TASK CLAUDE-20261007-005 — The SQC identity in navy and gold (owner's choice)
- Agent: Claude (Lead Development Agent)
- Status: DONE on merge — the owner asked in chat for «تحديث الهوية البصرية والوان الموقع بالكامل» and chose «كحلي وذهبي» among four directions.
- FOUNDATION §3.11.2 requires one identity set through central design tokens; it names no colours, so it needs no change.
- Tokens, `ui/ds/tokens.css`, `:root[data-look="kosif"]` (the default look):
  - Light:
    - navy `#0B1F3A` for the rail and gradients;
    - navy `#13305A` for buttons, links and focus;
    - gold `#C9A227` for accents only, and `#8A6A0E` for gold text (4.5:1 on ivory);
    - ivory `#F7F4EC` background with white cards and warm lines;
    - semantic green `#15803D`, amber `#B45309`, red `#B91C1C`;
    - new tokens `--sk-navy`, `--sk-gold`, `--sk-gold-ink`, `--sk-gold-soft`, `--sk-ivory`.
  - Dark: gold `#D4AF37` leads on navy.
  - Charts: c1 navy and c2 gold.
  - The other 10 looks are untouched.
- The old brand literals (#1668e3, #22b8e6, #0b1c33, #e8f1fe, #4a93ff, #3fd0f0 and their `rgba` forms) were mapped one-for-one in 22 UI files and `unlock.html`, a total of 101 changes. Print, export and report code is included.
- Front door:
  - its token copy is synced with the look;
  - a deep navy sky, an ivory panel and warm borders;
  - the side panel's sky is now navy to gold;
  - the reviewed unlock script is byte-identical, which was checked during the edit and by `unlock_runtime.test.mjs`.
- Art:
  - `sqc-logo`, `sqc-mark`, `sqc-mark-dark`, `sqc-icon` and `kosif-icon`: a gold «S» and gold accents on navy, with the silver kept;
  - the wordmark text is constrained to the logo width, fixing a «CONTRO[L]» clip that was there before;
  - the PNG app icons (192, 512, apple-touch 180) are re-rendered from the new SVG;
  - the crystal world: navy crystals warming to gold, a gold rim, and navy fog;
  - the manifest's theme and background colours.
- Tests:
  - `door_tokens.test.mjs` passes after the sync;
  - `mercury_report_presentation` passes 16/16, with its saved baseline mapped the same way;
  - `identity_audit` is within the ratchet (425 colours = baseline);
  - `docs/design/SQC-IDENTITY-ar.md` is regenerated, and KOSIF-LUXE.md and DESIGN_SYSTEM.md are noted.
  - Also fixed: `company_entry.test.mjs` still expected the audit door's pre-#170 intents; it now expects the independent-audit intents that #170's extraction put in the door. That fixes a failure already present on `main`.
- Evidence:
  - Pages check 544/544;
  - node tests 738 pass / 57 fail (one fewer than `main`, none new);
  - all 17 browser suites green;
  - door 96/96 and feature_audit 146/146 rerun after the final door changes.
- Not yet: images and motion from Higgsfield Marketing Studio. The owner chose to sign in in the browser pane; generation waits for that sign-in. The plan (10 images, 2 videos) is in the chat.
- Branch / PR: `claude/identity-navy-gold-20261007` from `main` @ 0d7ac61.

### TASK CLAUDE-20261007-006 — P2 traceability: statement line → accounts → entries
- Agent: Claude (Lead Development Agent)
- Status: DONE on merge — the owner's standing instruction in chat («اكمل العمل والتطوير…», «ادمج كل التعديلات في الموقع»).
- Goal: PRODUCT_MANDATE P2 «Traceability» — from a number in the statements down to the entries that make it.
- Scope:
  - `ui/features/ledger.js`: the cycle-proof card gains «تتبّع بنود القوائم إلى الحسابات والقيود». Each statement line the proof built shows its value and the accounts that make it up. An account opens the general ledger selected on it, with its entries and running balance (`trace-acc` → `glAcc`, tab `gl`).
  - `tools/model_companies_e2e.mjs`: on each of the six model companies, a statement line's account opens its entries in the general ledger.
- Evidence:
  - Pages check 544/544;
  - node tests: no new failure (the two `sqc_accessibility` modal tests now listed by name are the pre-existing ones recorded in #205; they surface because `linkedom` is on the path);
  - model companies e2e green with the new check.
- Repository: first change pushed to the transferred repository `elkosif0-cmd/cloude`.
- Branch / PR: `claude/statement-trace-20261007` from `main` @ d4a3121.

### TASK CLAUDE-20261007-007 — Deploy s-kosif.pages.dev from GitHub Actions after the repository transfer
- Agent: Claude (Lead Development Agent)
- Status: DONE on merge; the deploy itself waits for the owner's `CLOUDFLARE_API_TOKEN` secret.
- Context:
  - The owner transferred the repository to `elkosif0-cmd/cloude` on 2026-10-07.
  - The Pages project `s-kosif` stays linked to the old installation on `kosif199022-jpg` (repo id 1352281400), so pushes no longer build.
  - Cloudflare's own troubleshooting page says a transferred repository must be transferred back or connected to a new project, and a new project changes the pages.dev address.
- Owner's choice in chat: «Deploy from GitHub Actions».
- Done in the owner's Chrome, with the owner's explicit approval of the stated permissions: the «Cloudflare Workers and Pages» GitHub app is installed on `elkosif0-cmd`, for `cloude` only.
- Scope: `.github/workflows/pages-deploy.yml`.
  - On any push, it runs the same gate the Pages build ran (`cd app && npm install && npm run build`).
  - `python3 build.py` makes a production build on `main` (with the existing `KOSIF_UNLOCK_PASSWORD` secret, which moved with the transfer) and a preview build elsewhere (no private data).
  - It runs `wrangler pages deploy dist --project-name s-kosif --branch <branch>`.
  - The deploy step is skipped with a notice until the secret `CLOUDFLARE_API_TOKEN` (Account · Cloudflare Pages · Edit) exists.
- GitHub Actions now run on the new account (the old one was blocked by billing).
- Open, for the owner:
  - add `CLOUDFLARE_API_TOKEN`;
  - the Cloudflare account shows an overdue balance ($42.87) with a warning of service interruption.
- Branch / PR: `claude/pages-deploy-actions-20261007` from `main` @ 9364b03.

### TASK CLAUDE-20261007-008 — Publish main to s-kosif.pages.dev without an API token in the repository
- Agent: Claude (Lead Development Agent)
- Status: IN PROGRESS
- Context: the owner asked Claude to finish the deploy itself. An API token can only be created and pasted by the owner, so `CLOUDFLARE_API_TOKEN` is still missing and #210's deploy step is skipped.
- Scope: `.github/workflows/pages-deploy.yml` — while the secret is missing, the built site is uploaded as the artifact `site-dist` (3 days, private repository; it holds only what the site serves, the private company still encrypted). Claude then publishes that exact build with the account's existing wrangler login: `gh run download … --name site-dist` → `wrangler pages deploy dist --project-name s-kosif --branch main`.
- Once the owner adds the secret, the artifact step stops and Actions deploys by itself.
- Branch / PR: `claude/deploy-artifact-20261007` from `main` @ f4b87d0.

### TASK CLAUDE-20261007-009 — Higgsfield visuals in the interfaces (navy and gold)
- Agent: Claude (Lead Development Agent)
- Status: IN PROGRESS → DONE on merge
- Owner's request in chat: use Higgsfield to make images and motion for the app and update the visual identity fully; navy and gold; «About 10 images + 2 videos»; «Higgsfield استخدم api / Try again»; downloading the generated files approved in chat.
- Generated on the Higgsfield API platform playground with the owner's balance (no API key): 14 images (Marketing Studio Image 2.0, 2K) and 2 clips (Kling 3.0 Standard, 5 s), $3.79 in all (balance 16.40 → 12.61). Four of the images were added beyond the ten so the ten sectors are complete (hotels, construction, meat, digital marketing = priority sectors).
- Scope:
  - `ui/art/brand/` (1.8 MB): mirrored for right-to-left, the door clip graded toward the identity navy.
  - `unlock.html` (door film in the visual panel, wide screens only, never with reduced motion or saved data; pictures on the three sections and on the ten sector cards; the reviewed AUTH script untouched).
  - `ui/features/command-center.js` + `luxe-screens.css` (gold film under the crystal world, banner still).
  - `ui/features/tbreview.css` (audit picture in the audit file hero).
  - `ui/features/ledger.js` + `luxe-screens.css` (the open company's sector strip above the books).
  - `sw.js` (video and range requests are not cached).
  - `tools/brand_art.test.mjs` (in S.kosif.yml).
  - `docs/design/HIGGSFIELD_VISUALS_ar.md` (provenance, prompts, cost, processing).
- Identity ratchet: no metric worse.
- Branch / PR: `claude/higgsfield-visuals-20261007` from `main` @ 1fbd35a.

### TASK CLAUDE-20261007-010 — Deep review and reorganisation from the roots: R1 «one page head»
- Agent: Claude (Lead Development Agent)
- Status: IN PROGRESS
- Owner's request in chat: «قم بتحليل عميق جدًا ومراجعة لكل شيء في التطبيق… وأعد تنظيم كل شيء… رتّب كل شيء من الجذور وحلّ الازدحام وسوء التنظيم وعدم الوضوح» then «كمل التطوير والدمج».
- Review: `docs/rebuild/DEEP_REVIEW_20261007_ar.md` — every number measured (registry, bundle, tests, and the new `tools/clutter_audit.mjs`: content started at 465 px on average on a 900 px desktop and 589 px on an 844 px phone; 4.5 chrome rows per screen; the domain strip echoed the sidebar on all 64 screens, the flow chips on 48, the space bar on 45).
- R1 scope:
  - `ui/core/flow.js`: «يأتي من / يذهب إلى» folds behind one «مرتبط» button in the head (session memory).
  - `ui/core/helper-space.js` + `ui/layouts/topbar.js`: the space bar is gone; «تبديل الشركة», «تبديل المستخدم», «كل الشركات» live in the top bar's company menu; on phones the company/period chips sit in the head of every screen.
  - `ui/layouts/shell.js` strip: on wide screens only a hub's own pages show (the sidebar already lists the domain's hubs) — CSS in `shell.css`.
  - `ui/layouts/topbar.js`: the sector picture is the head icon on the books; the description shows one line, a tap opens it. `ui/features/ledger.js`: the sector strip from #212 removed (its picture moved into the head).
  - `ui/ds/luxe.css`: the head is 44 px icon, tighter padding.
  - Tests moved with the UI: `feature_audit` (company menu), `company_entry_e2e`, `executive_pack_context_e2e`, `brand_art.test`.
  - `tools/clutter_audit.mjs` ratchet (`tools/fixtures/clutter-baseline.json`, `--check` / `--write-baseline`).
- Found on the way (the four late suites timed out on `page.goto … load`): `SQCCrystal.mount` linked its shaders synchronously, and on the owner's machine that link (Intel Iris Xe · ANGLE D3D11) took **38 s** on the main thread this afternoon — the page froze, `load` never came within 30 s. Fix in `ui/art/crystal-world.js`: the programs link in parallel (`KHR_parallel_shader_compile`), the world polls each frame and draws once they are ready, a device whose link blocks long is remembered (`sqc_world_slow`) and keeps its still background. Also `ui/features/command-center.js`: the dashboard film gets its source only after `load` (a media element with a source delays the load event). `company_entry_e2e` reports a world whose shaders are still linking instead of failing it.
- Branch / PR: `claude/r1-one-head-20261007` from `main` @ 51306ad (PR #213).

### TASK CLAUDE-20261007-011 — Deep review wave R2: the books' tabs in families
- Agent: Claude (Lead Development Agent)
- Status: IN PROGRESS
- R1 (TASK -010) merged as PR #213 and published; GitHub «SQC Browser Suites» (new workflow, nothing in front of the suites) green on its last commit.
- Scope:
  - `ui/features/ledger.js`: the 13–14 tabs sit in four families — الإقفال (close, links) · الدفاتر (accounts, entries, gl, tb) · التشغيل (the sector's tabs, cash) · الضريبة والبنك (vat, recon); the family follows the tab (`open("vat")` lands in its family), each family remembers its last tab; `SKosifLedger.tabs()` / `families()` for tests and the page review.
  - `ui/features/luxe-screens.css`: the family strip as pills above the tabs (tokens only).
  - `ui/ds/luxe.css`: on phones the company/period chips are one slim row (40 px, no second line).
  - Tests reach tabs through the API (`feature_audit`, the sector packs' negative checks, `page_review`).
  - `.github/workflows/sqc-browser-suites.yml` also runs the sector packs, model companies, books integrity, relationship health and sales suites.
- FOUNDATION §3.0 (the owner, 2026-10-07, merged into this branch): rule 7 «the context is always on screen» — the top bar's company button now names the program, the activity (sector) and the company, and the line under every title names the section › domain (`ui/layouts/topbar.js`; the English name moved to the title's tooltip). Rule 11 «a crescent, not a cross, for health» — the health sector picture is being regenerated as a crescent (Higgsfield, one image).
- Branch / PR: `claude/r2-book-families-20261007` from the R1 head (PR #214; #213 closed as superseded).

### TASK OWNER-20261007-WORKSPACE-CONSTITUTION — تثبيت نموذج المسار/النشاط/الشركة والـAI
- Agent: ChatGPT
- Status: ACTIVE
- Owner instruction: تثبيت اقتراحات المحادثة الحالية في الدستور الأعلى.
- Scope: `FOUNDATION.md` أولًا، ثم مزامنة `docs/PRODUCT_MANDATE_ar.md` فقط إذا لزم لمنع تعارض تنفيذي. لا تغيير runtime في هذه المهمة.
- Rules being canonized: section → sector/activity where applicable → workspace/company → enabled capabilities; workspace ownership by entry scope; strict cross-company/context isolation; sector-specialized accounting/costing/reporting; opt-in helper tools; named or general audit; company-bound AI session through provider/API bridge; unified authorized event stream; server persistence/autosave status; persistent context/navigation; health-sector crescent visual note.
- Coordination: latest START_HERE/FOUNDATION/PRODUCT_MANDATE/WORKLOG read before edit; FOUNDATION remains highest authority.
- NEXT ACTION: fetch latest FOUNDATION immediately before write, add canonical section, then reconcile mandate and close this task with commit evidence.

### TASK ANTIGRAVITY-20261007-001 — Section-First Isolation and Gate-Aware Mobile Navigation (FOUNDATION §3, §3.0)
- Agent: Antigravity
- Status: DONE
- Goal: Enforce strict section separation (Accounting with 10 Sectors, Audit & Assurance, Helper Tools) across mobile navigation, breadcrumbs, topbar context ribbons, and guarantee zero workspace leakage between tools and accounting companies.
- Scope:
  - `ui/layouts/shell.js`:
    - Implemented gate-aware mobile bottom tabs (`TABS_BY_GATE` for `accounting`, `audit`, `tools`).
    - Made `tabIds()` filter customized tabs dynamically by active gateway (`SK.caps.inGatewayOf(cap, currentGate)`).
    - Polished `#pg-crumb` top breadcrumbs to display Section + Sector + Company + Studio + Screen without bleeding.
    - Synchronized mobile tabs and page title breadcrumbs on view render (`sk:render`).
  - `ui/layouts/topbar.js`:
    - Handled `tools` scope in `ctx()` so independent tool workspaces reflect cleanly in `#sk-tb-co`.
    - Hidden accounting period `#sk-tb-pe` in `tools` scope to avoid confusion.
    - Routed `#sk-tb-co` click in `tools` directly to `SKosifSpace.choose()` (independent space chooser).
  - `ui/core/helper-space.js`:
    - Enforced zero context leakage in `applyIntent()`: guarded company registration with `!it.scratch && gate !== "tools"`. Scratch tool workspaces (`space-tools`) never bleed into `skosif_companies_v1`.
  - `tools/gate_nav_contract.test.mjs`:
    - Added automated contract test suite validating gateway tab membership, dynamic gate tab resolution, and scratch tool space zero-leakage isolation.
- Evidence / tests:
  - `node --test tools/audit_context_independence.test.mjs tools/company_entry.test.mjs tools/door_tokens.test.mjs tools/gateway_contract.mjs tools/identity_audit.test.mjs tools/sidebar_lifecycle.test.mjs tools/unlock_runtime.test.mjs tools/vat_policy_contract.test.mjs tools/gate_nav_contract.test.mjs` passed (44 tests, 0 failures).
  - Preview build: `python build.py` produced 180 clean entries in `dist/`.
- NEXT ACTION:
  - Commit and push to main.


### TASK CLAUDE-20261007-012 — Deep review wave R3: each entry's menu in the constitution's order
- Agent: Claude (Lead Development Agent)
- Status: IN PROGRESS
- Scope:
  - `ui/core/capabilities.json`: `gateways[].menu` — accounting in the order of the company cycle (FOUNDATION §3.12: home · setup · entries and books · sales and collection · purchasing and stock · reconciliation · statements and reports · analysis and forecasting · decision and standards · settings), tools in the families of §3.3.1, audit around the audit file (§3.2).
  - `ui/core/registry.js`: `SK.caps.menu(gid)` (only the entry's own hubs; any hub no section lists lands in «أخرى», so nothing is lost), `SK.caps.section(id,gid)`, and `path(id,gid)` names the section of the entry the user is in.
  - `ui/layouts/shell.js`: the sidebar and the phone domain strip read the entry's menu (fallback to the registry groups for an entry without one).
- Evidence: browser read of the three menus on the preview (10 / 9 / 5 sections, every hub present, no page errors); gateway contract and navigation unit tests unchanged (the one red test is red without R3 too).
- Branch / PR: `claude/r3-menu-by-constitution-20261007` from the R2 head.

### TASK CLAUDE-20261007-013 — Deep review wave R5: clarity of the registry
- Agent: Claude (Lead Development Agent)
- Status: IN PROGRESS
- Scope: the 18 screen descriptions longer than 80 characters (up to 215) rewritten to one line in `ui/core/capabilities.json`; each old text moved into the screen's `kw` so the palette and the sidebar filter still find it by those words; `docs/rebuild/SYSTEM_CAPABILITY_INVENTORY.md` and `NEW_CAPABILITY_MAP.md` regenerated (`tools/capability_docs.py`); `tools/registry_clarity.test.mjs` (one-line descriptions, unique labels, distinct menu section names, known screens only) added to S.kosif.yml.
- Branch / PR: `claude/r5-clarity-20261007` from the R3 head.

### TASK CLAUDE-20261007-014 — Deep review wave R4: a lighter app bundle
- Agent: Claude (Lead Development Agent)
- Status: IN PROGRESS
- Finding: `ui/core/engines.js` (3.3 MB, in every page load) carried 2.4 MB of embedded report data for five reviewed published-source adapters (McDonald's 2022, Volkswagen, Mercedes, Home Depot, reference index) that no screen reads — only the source tests do.
- Scope:
  - `tools/build_engines.mjs` compiles two files: `ui/core/engines.js` (everything else, plus `SKEngines.loadSources()`) and `ui/data/engines-sources.js` (the five adapters, joining `SKEngines.reports` when loaded; generated entry `app/src/engine/fusion/sources.ts`). `--check` covers both.
  - `tools/apple-source-harness.mjs` loads both files.
- Result: `skosif.js` 5.35 MB → 3.17 MB (−41%), gzipped 1.15 → 0.92 MB; engines 544/544; source tests unchanged (Apple, McDonald's, corpus same-results green; the Volkswagen/Mercedes/Home Depot/pending/reference-catalog files fail identically on main and are in no workflow — one Home Depot case now passes).
- Branch / PR: `claude/r4-light-bundle-20261007` from the R5 head.

### TASK CLAUDE-20261007-015 — Deep review wave R7: the command center in four tabs
- Agent: Claude (Lead Development Agent)
- Status: IN PROGRESS
- R1–R5 + R4 merged as PR #218 (carrying #214, #216, #217) and published: live `skosif.js` 3.33 MB (was 5.6 MB), `data/engines-sources.js` served on demand.
- Finding: «مركز القيادة» stacked ten blocks from five modules — 5,942 px on a desktop, 11,530 px on a phone; two «quick start» blocks and three decision/recommendation blocks.
- Scope (`ui/features/command-center.js` + `luxe-screens.css`): a tab strip under the demo notice — اليوم (brief, pulse, hero, KPI tiles, ابدأ عملاً) · المبيعات (the core's sales blocks and its quick actions) · النقد والمخاطر (trend, heat map, cash structure) · القرارات والمهام (journeys, decision inbox, tasks, activity). Blocks are tagged and the other tabs' blocks hidden by CSS, so every module keeps rendering as before; an untagged block stays on اليوم; a MutationObserver re-tags blocks other modules add later; the tab lasts the session.
- Evidence (browser, demo company): every block tagged, no page errors; اليوم 2,052 px on a desktop (−65%), 3,928 px on a phone (−66%); النقد والمخاطر fits one screen.
- Branch / PR: `claude/r7-command-center-20261007` from `main` @ 09b8585.

### TASK CLAUDE-20261007-016 — Deep review wave R8: the longest screens
- Agent: Claude (Lead Development Agent)
- Status: IN PROGRESS
- R7 merged as PR #219 and published (live).
- Measured on the CI clutter artifact: «مختبر الشركات العالمية» 16,454 px on a desktop / 31,310 px on a phone (47 companies fully open), «المدونة المحاسبية والمعايير» 6,194 / 14,956 px with the library under two large cards.
- Scope:
  - `ui/features/corpus-lab.js` + `.css`: one line per company (name, sector, year, auditor, «وجد X من Y» coloured by how many of the auditor's matters SQC found); the matters, SQC's choices and «افتح كملف مراجعة» open under it; opened companies stay open across search and sector repaints.
  - `ui/features/codex.js`: three tabs — المدونة (first) · المساعد التطبيقي · التحديثات (with the pending count); all render, the inactive ones hidden; `SKosifCodex.tab(t)`.
  - `tools/feature_audit.mjs` opens the guidance tab before its checks.
- Evidence (browser): the lab 16,454 → 6,237 px (−62%), 47 summaries, one opens with its «افتح كملف مراجعة»; codex library first, guidance 944 px, updates one screen; no page errors.
  - `ui/core/screen-tabs.js` (new, in build.py): `SK.screenTabs.register(view,{tabs,blocks,tag})` splits a long screen into tabs without touching the modules that render it (blocks tagged by heading, the other tabs' blocks hidden with `data-st-off`, an unnamed block stays on the first tab, later blocks tagged on the next change). First user: «الإعدادات والمظهر» — الشركة والتقارير · الاحتساب والأهداف · المظهر · الصلاحيات والبيانات (4,550 px → the longest tab 2,204, the default 1,678; the appearance studio alone had been 1,700 px at the top).
- Branch / PR: `claude/r8-long-screens-20261007` from `main` @ 228e954 (PR #220).

### TASK CLAUDE-20261007-017 — Deep review wave R9: screen tabs on devices and customer intelligence
- Agent: Claude (Lead Development Agent)
- Status: IN PROGRESS
- Scope: `ui/core/screen-tabs.js` registers two more screens.
  - «الأجهزة والمزامنة»: هذا الجهاز والنقل · شريط الجوال · اللابتوب ولوحة المفاتيح. The bottom-bar picker alone was 850 px of 65 checkboxes; the default tab is now one screen.
  - «ذكاء العملاء والطلب»: الشرائح والاحتفاظ · مراجعة الأسعار · إعادة التنشيط (2,915 px → the longest tab 1,844).
- Evidence: browser check on the preview — every card tagged, no page errors.
- Branch / PR: `claude/r9-screen-tabs-20261007` stacked on R8 (#220).

### TASK CLAUDE-20261008-001 — Harsh review of every screen, wave R10: trust in the numbers
- Agent: Claude (Lead Development Agent)
- Status: IN PROGRESS
- Owner request: «كمل الدمج وراجع كل شاشات وقدرات وامكانية التطبيق بنقد لازع جداً وانتقاد لكل شيء لكي تقوم بالتطوير».
- Review: 188 screens captured on a GitHub runner (`sqc-screen-review.yml`, run 37684838237), read one by one; 26 ranked findings in `docs/rebuild/HARSH_REVIEW_20261008_ar.md`.
- R10 fixes: demo books scaled to the demo's own sales (loss −238,144 → profit 15,814, 13.8%); the open company's name instead of a fixed business name in 12 outputs (`SK.bizName`); no ZATCA QR for an invoice without a valid tax number, seller and lines; receivables from the books first; purchase order values; `sectors` in the registry (7 meat screens offered to meat companies only); the modules' second F-code tab bars removed; Arabic eyebrows (app + legacy core at build); Latin digits and the Gregorian calendar in 77 formatting calls; the butchery note without spreadsheet cells; catalog cards without empty squares; the analytics notice only on its screen; phone path on one line.
- Evidence: `tools/demo_books_health.test.mjs` (new), bootstrap admission 42/42, VAT/context/CSV display 77/77, receipts and reports 63/63, identity ratchet 3/3; browser suites on the runner.
- Branch / PR: `claude/r10-harsh-review-20261008` (carries the screen-review workflow from `claude/review-screens-20261007`).

### TASK CLAUDE-20261008-002 — Harsh review wave R12: one decision entry, engines behind the matching screens
- Agent: Claude (Lead Development Agent)
- Status: IN PROGRESS
- R10/R11 merged as PR #222 and published (live `skosif.js` 3.34 MB; core patches verified on /app-safe).
- Scope: «القرار» hub (decision center with Jev and the council as pages; menus list it once; no AI vendor names); smart-match and Excel-recon screens use `SKEngines.reports.smartMatch`; «ذكاء المبيعات» in four screen tabs (feature audit opens the lab tab); the scale label seeded from the company's catalog with sector wording; the receipt's address instead of a slogan; the catalog welcome line by sector; the cycle-proof engine prints money.
- Evidence: app build 115 files / 544 tests; registry contracts; harsh-review guards; browser suites on the runner.
- Branch / PR: `claude/r12-capabilities-20261008`.

### TASK CLAUDE-20261008-003 — Harsh review wave R13: the phone head, inventory figures, the helper desk
- Agent: Claude (Lead Development Agent)
- Status: IN PROGRESS
- R12 merged as PR #223 (clutter baseline re-recorded from its CI run 37695075061: content top 325→321 desktop, 416→410 phone).
- Scope: on phones the screen's buttons share the title's line (`ui/ds/luxe.css`); `tools/phone_layout.mjs` added to `sqc-browser-suites.yml` (it only ran in S.kosif after a red step); «المخزون والجرد» reads the expiry radar's stock (rows carry `item`, not `name`); the helper desk's full tool list folded under the map.
- Branch / PR: `claude/r13-phone-head-20261008`.

### TASK CLAUDE-20261008-004 — Harsh review wave R14: the audit studios, the cash log, the suppliers switch
- Agent: Claude (Lead Development Agent)
- Status: IN PROGRESS
- Scope: audit-bridge BASE keeps hero titles in the card's ink (they were dark on dark in the analytics studio and the research lab — measured with a local Edge probe); formatMoneyMinor defaults to Latin digits (three audit engine copies); research lab eyebrow in Arabic; the cash screen's hand-kept log named for what it is; the cutting-methods table's empty state (build patch); suppliers: one of ranking · comparison · shipment log at a time (3,038 → 1,562 px measured).
- Branch / PR: `claude/r14-audit-studios-20261008` (stacked on R13).


### TASK CLAUDE-20261008-005 — Code review of the whole codebase (R15)
- Agent: Claude (Lead Development Agent)
- Status: IN PROGRESS
- Owner request: «من مراجعتك السابقة وطور التطبيق ككل وفكرته وكل شيء — أريد مراجعة الكود بالكامل والنوافذ والقدرات وكل شيء».
- Review: `docs/rebuild/CODE_REVIEW_20261008_ar.md` — layers and sizes, the idea, findings by severity, next steps; measured with storage-key, unescaped-insert and engine-usage scans and a Linux run of every unit file.
- Fixes: company data isolation (`HELPER_KEY` missed skosif_erp_*_v1; risks, tasks and council cases added; demo admission rules) + `tools/company_scope_keys.test.mjs`; escaped the audit completion detail (stored rationale) and the receipt card reference; one ZATCA issue time and the 255-byte TLV limit; the events calculator on `sales.catering`; `modalFocus` without `closest`; a stale workspace expectation.
- CI: `.github/workflows/sqc-unit-all.yml` runs every unit file on Linux (942 pass / 112 fail on main; 17 red files listed with reasons in `tools/fixtures/unit-known-red.txt`, 14 of them PR #143's partial recovery).
- Branch / PR: `claude/r15-code-review-20261008` (PR #226).

### TASK CLAUDE-20261008-006 — Identity «كوبالت وجليد», the constitution review and its guard (رادع الدستور), owner scope, visible save state
- Agent: Claude (Lead Development Agent)
- Status: IN PROGRESS
- Owner request: «طوّر التطبيق ككل وراجع الدستور وكل شيء… وغيّر الهوية البصرية والقدرات وكل حاجة».
- Identity: navy & gold → «كوبالت وجليد» (night cobalt #0B1030 rail, cobalt #2340C4 actions 8.1:1, ice #19C3D9 accents, mist #F4F6FB ground) from the tokens; new SQC mark (Q = a cut crystal whose tail is the audit tick) + PNG icons (`tools/brand/make_marks.py`); identity art, sector art and the two brand videos recoloured gold → ice by a deterministic hue-band shift (`tools/brand/recolor_ice.py`); crystal world shader on ice; the previous identity kept as the look «الكحلي والذهبي» (`data-brand="navygold"` over the kosif layout rules). Identity audit not worse on any metric.
- Constitution: `docs/rebuild/CONSTITUTION_REVIEW_20261008_ar.md`; `tools/constitution_guard.mjs` + `docs/registry/constitution-rules.json` → `docs/registry/CONSTITUTION_SCORECARD_ar.md` (18 rules, 17 enforced, all passing, 1 gap); CI job in `foundation-guard.yml`; FOUNDATION §2 corrected to `elkosif0-cmd/cloude`.
- Capabilities: §3.0‑1/12 `ownerScope` stamped at creation (tools → TOOLS_ONLY, door/accounting → FULL_ACCOUNTING), the accounting menu no longer lists tools-owned companies (`tools/owner_scope.test.mjs`); §3.0‑8 visible save state chip (`ui/core/save-state.js`, `tools/save_state.test.mjs`) — device only, says so.
- Evidence: every unit file run locally — the only red files are red on untouched main too (header_names, management_report_build, shortcut_focus: Windows paths; sqc_accessibility: linkedom; sqc_audit_readability, vat_display_regression); headless Edge screenshots light / dark / phone, no page errors.
- Branch / PR: `claude/identity-constitution-20261008`.
