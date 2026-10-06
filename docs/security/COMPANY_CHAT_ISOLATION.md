# Bounded local company-chat isolation repair

## Scope and basis

Candidate based on the materialized PR143 runtime at `20f04e7fe730fb80f8d8337383f6235509cc5159`. Latest-main mandatory instructions were read from the supplied `bc56afc735c77af4446121169f6f004d765fcf0a` snapshot. This is an isolated local candidate, not an integrated main branch, release, deployment, or backend authorization implementation.

The starting regression used actual `SK.load` / `SK.save` string-storage semantics. A synthetic A conversation entered B's mock provider payload and displayed under B because `skosif_chat_v1` was global. The earlier standards fixture hid this by silently prefixing storage with the current company. This repair removes that misleading adapter.

## What changes

- New chat envelopes use `skosif_chat_v2:` plus an encoded JSON tuple `[localUserId, companyId]`. Each envelope carries version, local-user ID and company ID. Reads validate the envelope and the real workspace registries.
- Missing, inconsistent, duplicate-company, busy, tainted, locked or stale-tab contexts fail closed before chat reads/rendering, sends and assistant-managed tool dispatch. The getter never creates user registries or adopts unknown data.
- `SKosifSpace.chatScopeSnapshot()` is a separate, read-only local routing contract. It does not require an accounting period and does not change the existing management-report `scopeSnapshot()` contract.
- Switch begin/end synchronously notify the assistant, clearing visible messages, draft, suggestions, speech state and pending request ownership before asynchronous restore. Captured lifecycle and chat epochs are checked after awaits and before subsequent provider requests, callbacks, confirmations and scoped mutations.
- Same-origin persisted lifecycle generations catch another tab's switch before its storage event is delivered when the generation write succeeds. A redundant BroadcastChannel sends only the literal `invalidate`, no chat, company identity, financial data or credentials. A receiving tab requires reload before using cached company data.
- Lock emits an explicit event before redirect; delayed replies cannot repaint after lock. Already-started provider requests receive an abort signal. Abort cannot recall a request already received by a provider.
- Palette item/box continuations accept an optional context guard and are awaited. Books import captures its own local lifecycle for every caller, checks it before work and after approval/build awaits, and combines it with all existing source/review/ledger guards at commit. The assistant can additionally pass its request guard.
- Unknown-owner `skosif_chat_v1` is never read, displayed, reassigned, sent or deleted by this repair. Invalid/mismatched/corrupt v2 envelopes are also preserved and block new sends/clear rather than being overwritten.
- Scoped chat remains outside automatic full backups and company snapshots. Failed initial chat saves prevent provider submission; failed clear saves report failure and retain the previous bytes.
- No-provider canonical standards responses and truthful provider-error fallback remain available. A refused local action is never reported as executed by that fallback.

## Intentional assistant restrictions

These restrictions apply only to assistant automation; ordinary manual application controls are unchanged.

- Generic `click` runs only the explicitly scoped books-import controls (`tbreview` books and ledger to-review). Other buttons return actionable manual-use guidance. Detached/replaced targets are rechecked after confirmation. Screen navigation remains available through `go_to_screen`.
- Generic `fill_field` does not dispatch arbitrary input/change handlers; users are directed to enter values manually until a scoped field adapter exists.
- Assistant palette `backup`, `install`, and `demo` are refused because their asynchronous continuations do not accept this context guard. Ordinary palette callers still execute those actions.
- `print_page` opens the browser's direct print dialog instead of invoking arbitrary page button handlers. Specialized report printing stays manual.
- `export_table` print preview is refused pending a scoped preview integration. Existing Excel/CSV/copy routes remain available. An initiated download/clipboard operation cannot be recalled by later invalidation.

## Threat model and residual limits

This repairs accidental cross-company/local-user chat routing and assistant-managed stale continuations in one browser application's cooperating tabs. It is not a security boundary against script injection, malicious extensions, a user with developer tools or access to the browser profile, or someone rewriting local registries/storage. Local-user IDs and optional local PINs are not proof of authenticated backend tenants. Stored chat is plaintext local storage, not new encryption.

The chat key and lifecycle intentionally do not bind accounting period, audit engagement, or every field of the company profile. No accounting period is required for standards help. Same-company period/framework/profile changes have not been certified as request invalidation boundaries. Global engagement ownership, audit state, shared tasks/risks/notifications and the provenance of data exposed by other tools remain separate architectural work. A matching chat scope cannot attest that every global screen/store contains data belonging to that company. There is no universal tenant isolation claim.

Cross-tab failure limits are explicit: successful persisted generation writes permit synchronous drift detection. When writes fail, BroadcastChannel invalidation works only after delivery; before delivery another tab may not know about the change. If storage invalidation and BroadcastChannel are both unavailable, the originating tab still fails closed, but other tabs cannot be guaranteed to invalidate. This is tested as a documented residual limitation, not presented as a passing distributed-authentication guarantee. Tabs should be reloaded/closed after such storage failures.

Guards cover assistant-managed requests and the named integrations, not every descendant callback in all existing application modules. Manual application flows outside the added books-import lifecycle retain their prior behavior. Native browser focus/layout, real storage-event scheduling, reload/back-forward behavior and live provider transmission were not accepted in this local VM test pass.

## Safe legacy recovery, separately authorized

No automatic recovery or current-company assignment exists. A future recovery flow must first identify the history's rightful local user and company independently, let the user explicitly select/confirm that ownership, preserve the original bytes, and keep ambiguous messages in a separately labeled unassigned archive. Recovery must not feed unknown-owner text to a provider. This repair does not claim to have identified any real legacy conversation or read private legacy data.

## Preservation

No accounting engine, ledger posting rule, source adapter, source observation, audit conclusion, report calculation, capability registry or financial fixture was changed. The only `tb-review.js` production changes add lifecycle checks to `fromBooks`; existing source-only/reference prohibitions and import disclosures/acceptance checks remain in place. Unknown legacy storage is not cleared. Mandatory product documents copied into the candidate for instruction context are excluded from the patch; they are not competing mandate edits.

Verification results and exact file hashes are supplied in the accompanying repair report/manifest. No publication is included.
