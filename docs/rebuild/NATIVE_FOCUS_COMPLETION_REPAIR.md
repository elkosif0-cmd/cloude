# Native focus completion repair

## Pinned base and scope

Additive repair on draft PR133 head `775ac9f5cf476efbed7920523e490d679991a936`. At inspection, main was `f9091c8ea2ae6f4b0390bc1db1968196e4b88087`. The modified-file baselines were compared with GitHub blobs at that exact PR head. The prior frozen accessibility artifact remains unchanged.

Only two product files change: `ui/core/output.js` and `ui/core/sk.js`. Other changes are direct regression cases, more faithful focus fixtures, the native acceptance script, its workflow invocation and this note. There are no gateway, authentication, capability, financial-model, export-serialization or source-identity changes. No remote publication or branch operation was performed for this repair.

## Browser findings that motivated the repair

Manual cloud-browser QA of the earlier PR131 deployment found two remaining P1 failures. PR133 retains the same affected product blobs:

1. Ordinary Print Center income-sheet preview: Print/PDF → Shift+Tab into the document iframe → Escape removes the output but leaves BODY focused. Host-toolbar Close correctly reaches the safe screen heading.
2. Fullscreen presentation → Ctrl+K: the command palette is visible above the presentation, but focus settles on BODY. Initial entry must allow typing without another click.

The ordinary route is an unguarded draft from public demo data. These observations do not certify guarded executive-source behavior or historical company ownership.

## Reproduced lifecycle mechanisms and bounded change

The tests explicitly model native effects that the earlier DOM fixture did not represent. Their causal model is source-backed; the patched browser behavior still requires exact-head runtime verification.

### Focused iframe disposal

The restoration gate checked `document.hasFocus()` after removing the focused child browsing context. A boundary test makes that signal false only when the removed subtree still owns an active iframe; this reproduces lost restoration.

Before destruction, output now transfers focus from its own active iframe to its live host dialog wrapper, only when the document already owns focus and is visible. Replacement, navigation and pagehide skip that transfer. The existing restoration checks and same-context versus safe-heading decision remain in place, with an explicit hidden-document rejection. The repair neither calls `window.focus()` nor grants new restoration authority to a background document.

### Native fullscreen completion

The old code requested native fullscreen exit without coordinating its completion with the newly active modal. The deferred-exit tests clear focus after the actual palette has acquired its input, reproducing the BODY result.

The shared stack now gives output a recovery callback bound to the exact top registration and document-focus eligibility. It remembers the latest valid focused control. Once the native exit promise resolves, recovery can act only when the same live registration remains top, the document is visible and focused, no other fullscreen is active, and focus has fallen to BODY/HTML. A meaningful current target is never overwritten. Closing and reopening a persistent palette creates a different registration, so an old callback cannot act on reused DOM.

A single pending native exit is shared when a newer modal opens during the transition, including after `fullscreenElement` has already cleared. Each registration supplies its own checked callback; the old owner does not choose the newer target. Rejected, foreign and late fullscreen transitions remain bounded. There is no blind focus timer, polling loop or automatic fullscreen re-entry.

The fullscreen API resolves exit completion when the transition is done; the native fixture additionally waits for settled animation frames before checking keyboard entry. Reference: https://fullscreen.spec.whatwg.org/#api

## Regression evidence

Executed locally with no browser or server:

- Available snapshot regression suites: **582 passed, 0 failed**.
- Exact dedicated workflow pure command: **198 passed, 0 failed**.
- New independent timing/ownership cases include iframe body/first/last controls, native-print-return-style body focus, unknown strict scope, source invalidation, foreground-to-background transitions, hidden documents, newer meaningful targets, closed/reopened palette registrations, pending-exit reuse, rejection, and stale callbacks.
- Additional regression protects reentrant stack notifications from announcing an older layer as top.
- Both product files and the native fixture pass syntax checks. Non-CI native execution refusal is verified.

The workflow explicitly invokes the new independent `browser_focus_races.test.mjs`. The native fixture now covers the real body-only legacy document entered by Shift+Tab and verifies actual typing into the palette after fullscreen settles, without calling focus/fill to repair the symptom under test. It retains actual production CSS and source hashes.

## Remaining gate

No local browser, Chromium, server or loopback was run. The native suite is prepared but unexecuted; GitHub Actions currently fails before job steps. No patched Cloudflare preview exists from this local repair yet. The 582/198 counts are pure source-boundary evidence, not a native browser, full-app, accessibility-tree, screen-reader or physical-device pass.

Before closing either P1, repeat the two original user-visible routes on an exact deployed repair head and check the settled owning document/element. Keep guarded executive, stale export, detached/native window, visibility and full-app acceptance gates intact.
