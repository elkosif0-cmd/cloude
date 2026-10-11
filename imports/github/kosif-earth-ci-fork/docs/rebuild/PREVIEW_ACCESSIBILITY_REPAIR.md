# Preview accessibility repair: isolated candidate

## Base and scope

This is a separate additive patch on reconciled PR126 `684f6240eb04cb835ab66cb226055252f0853f65`, which includes main `6677caaa1b818d8392165bc7e95e81b3a1524765`. It does not publish, merge, change authentication, read private records, or alter financial source identity and export business logic. The frozen publication workspaces are unchanged.

Seven product files change:
- `ui/core/output.js`: live-session host/iframe focus containment, initial Close focus, owned background inertness, final-document keyboard rebinding, validated focus restoration, in-modal notices and owned fullscreen lifecycle.
- `ui/core/sk.js`: backward-compatible shared modal registration options and temporary visual stack ownership for identified wrappers.
- `ui/layouts/topbar.js`: explicit Arabic user-menu name, refreshed after profile repaint.
- `ui/core/a11y.js`: explicit quick-sale name independent of hidden text, refreshed after header repaint.
- `ui/components/palette.js`: real command palette registers with the shared stack, including lazy first open, persistent cached-wrapper reopening and idempotent public open/close.
- `ui/components/keys.js`: keyboard-help joins the same stack while preserving its F1/question-mark shortcuts.
- `ui/features/assistant.js`: deliberately suppresses opening the nonmodal assistant drawer while a preview or presentation exists. This is enforced at its open/toggle boundary, including palette invocation and delayed textarea focus. Closing stays allowed. The assistant remains available after output dismissal.

Supported integration scope is the identified preview, presentation, core confirmation/form, command palette and keyboard-help layers. This is not a claim that every custom application overlay has been integrated.

## Lifecycle and source safety

Explicit toolbar/Escape/public output Close restores only a visible, enabled, connected same-context opener. Embedded `window.close()` is programmatic cancellation/error handling and uses a safe current heading instead. Replacement, navigation, pagehide and old-session closure cannot move newer-session focus. Busy/tainted/changed-generation strict scope never restores an old opener. Source invalidation still blanks captured output and denies export sinks.

`SK.modalFocus(root, invoker, options)` retains default keyboard behavior for existing callers. `managed` registers the iframe-aware output layer without adding a competing generic trap; `restore:false` delegates validated restoration; `onTopChange(top, root)` coordinates ownership. Removing an old non-top entry and double release cannot change the current owner. Callback errors do not strand the stack. Independent confirmation/form promises are not resolved or canceled by report invalidation.

A persistent palette wrapper can already have output-owned inertness before it opens. The active registered root releases only the oldest recorded output-owned inert state; returning to output reconciles the remaining background. Pre-existing and distinct later caller-owned inert values are preserved.

Production CSS puts palette/help/core wrappers at z-index 400/410/420, below preview/presentation at 500/520. The shared stack temporarily raises a newly registered known wrapper above its previous registered layer when needed. It preserves inline z-index value and priority, and restores them only while the registration still owns that exact value. Later caller changes survive release. No global stylesheet redesign is included.

Presentation requests exit from only its own fullscreen when suspended by a newer app dialog. It handles rejected and late fullscreen promises and does not automatically re-enter. Native visibility still requires official browser execution.

The original four output notices keep their exact strings: no tables, Excel completion, unsupported full-file share, and blocked popup. A polite in-modal status replaces those global toasts so an inert background cannot suppress the message. No duplicate global announcement is emitted, and stale output cannot announce into a replacement session.

## Verification

Portable pure command:

`SQC_OUTPUT_ROOT="$PWD" node --test tools/*.test.mjs tools/preview-a11y-tests/*.test.mjs`

Current result: **554 passed, 0 failed**:
- 448 original reconciled pure boundary/regression cases, including customer studio.
- 36 implementation-owned focus, names, notices, fullscreen and shortcut cases.
- 40 independently authored lifecycle/mutation cases.
- 27 independently authored real-module overlay cases, including frozen pre-repair negative controls.
- 3 independent workflow wiring contracts/negative checks.

The original output-guard assertions are unchanged; its DOM fixture only gained the DOM methods required by production focus code. Red evidence covers the initial preview failures, final iframe rewrite, invalid opener/scope restoration, competing real-modal traps, first/reopened palette, keyboard help, assistant routes, background ownership, production z-order and fullscreen boundaries.

All 17 upstream reconciliation files, including the 75-capability registry, customer/studio code, build and aggregate workflow additions, are retained byte-for-byte in the local snapshot and excluded from this additive patch.

## CI wiring and remaining gates

`.github/workflows/sqc-preview-accessibility.yml` checks out the exact PR head, verifies the SHA, runs the explicit output/focus/name/shortcut/independent test list, installs pinned Playwright 1.51.1 only in official CI, then actually invokes `tools/preview-a11y-tests/preview_keyboard_ci.mjs`. It retains exact-head synthetic evidence with read-only repository permissions. Path triggers cover all seven product files, shared source dependencies, `build.py`, the entire UI CSS cascade and test fixtures.

The native fixture refuses non-GitHub execution and mismatched checkout SHAs. It imports the actual `build.py` CSS cascade in order, records CSS/source hashes, and checks `elementFromPoint` visibility as well as focus, including native fullscreen. It uses synthetic data and blocks network requests. It does not replace whole-app routing or full-app accessibility acceptance.

No local browser, server or loopback request was run. The fixture is syntax-checked and its non-CI refusal is tested. Current Actions jobs are failing before steps, so native acceptance remains blocked. Do not describe this candidate as browser-fixed or fully accessible.

Still required on the final composed head:
- Actual browser/AX verification of host and iframe keyboard behavior, visible/unobscured focus, real known-layer stacking and native fullscreen.
- Full-app computed accessible names across compact/wide widths and profile/route repaints, including Enter/Space behavior.
- Production RTL layouts at 320/390/768/1180/1280 and 200% zoom.
- Native print/share cancellation/return, detached windows and genuine BFCache navigation.
- Manual VoiceOver/Safari and NVDA/Firefox or Chrome, long-document reading and live announcements.
- Existing executive/management/review/legacy export and native-DOM accessibility suites against the exact final head.
