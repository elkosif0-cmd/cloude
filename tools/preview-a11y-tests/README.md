# Independent preview keyboard/lifecycle review

Final stable checkpoint: 37 acceptance checks, 3 mutation controls and 444 repository aggregate tests passed. See `FINAL-VERIFICATION.json` and `REVIEW.md`; browser execution remains unrun.

This directory is an independent test deliverable. It never edits product files, publishes code, opens private data, starts a local browser, or starts a server.

## Test sources and scope

- `output_focus_harness.mjs`: deterministic VM/DOM seam executing the selected production `ui/core/output.js` unchanged. Focus belongs to its owning document. `document.open()` clears document/window listeners. Timers are runnable and removable. `mutations()` explicitly delivers recorded observer callbacks.
- `output_focus_lifecycle.test.mjs`: independently authored acceptance tests against the production public output API. Core-modal integration loads the actual `modalStack`, `modalFocus`, `confirmDialog` and `formDialog` region from selected `ui/core/sk.js`; it does not replace these functions with mock modal behavior.
- `mutation_controls.test.mjs`: three negative controls mutate source only inside the test VM to remove focus return, final iframe rebinding, or restored background isolation. Their expected broken behavior must be observable. They do not modify production files.
- `preview_keyboard_ci.mjs`: real Chromium keyboard tests for an isolated synthetic host. It refuses to run outside GitHub Actions or when the checked-out SHA differs from `SQC_TESTED_SHA`. It requires no web server and blocks network requests.
- `frozen/output-89b6f181.js`: immutable PR126 negative-control source, SHA-256 `99e4093c382b9c23b80641f1ea2b34e85b9b7291b924a9fd0d28165ad05124c9`.

Run pure tests from the shared workspace:

```
SQC_OUTPUT_ROOT=/absolute/path/to/candidate node --test preview-a11y-tests/output_focus_lifecycle.test.mjs
SQC_OUTPUT_ROOT=/absolute/path/to/candidate node --test preview-a11y-tests/mutation_controls.test.mjs
```

Official CI integration, once separately approved:

```
SQC_TESTED_SHA="$EXPECTED_CHECKOUT_SHA" node path/to/preview_keyboard_ci.mjs "$GITHUB_WORKSPACE"
```

The CI directory must retain the adjacent `frozen/output-89b6f181.js`. The workflow must install Playwright/Chromium by its existing authorized process. A fake `GITHUB_ACTIONS=true` locally is prohibited; the environment guard is not permission to launch locally. No workflow or remote branch was changed here.

## Acceptance coverage

- Initial in-preview focus and visible dialog label; host and iframe Tab/Shift+Tab boundaries.
- Real toolbar/Escape/public API dismissal restores only the valid current-context opener.
- Embedded `window.close()` is programmatic closure and uses current safe context instead of restoring potentially obsolete action. This distinction was explicitly approved by the parent reviewer because report generation invokes window.close during cancellation/replacement/error.
- Loading cancellation and pending exports; old A completion/close cannot change B focus or isolation.
- Final `document.open/write/close` keyboard rebinding; no persistent flag is mistaken for a surviving listener.
- Source invalidation, company/period change, busy/tainted source context and same-ID new source generation.
- Presentation owns a separate top layer; Space retains native activation; dynamic background remains inactive after returning to preview.
- Hidden/disabled/disconnected opener fallback and exact pre-existing inert/aria-hidden preservation.
- Real core confirmation above preview and preview above existing core confirmation: no focus war, one active keyboard owner, one Escape per layer. Independent child promises remain unsettled during output invalidation; core forms above presentation retain ownership.
- Shared-stack callback faults, double/non-top release, zero/one tab stops and stale owner behavior.
- Same-layer status/live announcements for unavailable sharing without focus theft.
- Owned-only fullscreen exit, late request resolution and rejection handling at mocked promise boundaries; actual rendering is reserved for CI.
- pagehide cancels the preview; synthetic pageshow cannot revive it.
- Browser Ctrl+P is not intercepted; legacy unguarded output still functions.

## Evidence boundaries

The VM DOM is a test seam, not a real layout engine or accessibility tree. Its small selector/style/event model does not prove computed accessible names, browser default keyboard behavior, layout, full mutation ordering, nested browsing context behavior, screen-reader announcements, native print/share dialogs, zoom, or genuine BFCache navigation. Some cases intentionally test explicit observer delivery. Keyboard closure proves no source guard was bypassed only where a guard check/sink assertion is part of that test.

The CI file is syntax-checked and its non-CI refusal was executed. The real-browser suite has NOT run. Its viewport loops use synthetic host CSS and unchanged output source; they are not production layout, compact header-name, 200%-zoom or whole-app acceptance. The suite records exact active elements and source hashes, real key events and frozen-source negative controls when it runs. Full-app executive/management/source-guard suites still need their own exact-head CI evidence.

Native print/share UX and manual VoiceOver/Safari plus NVDA/Firefox or Chrome remain untested. Pagehide tests dispatch actual browser lifecycle event objects but do not demonstrate real Back/Forward-cache restoration.

## Reference

The [WAI-ARIA APG modal-dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) describes focus entering a dialog, cycling within it, Escape dismissal, inactive background and restoration to an appropriate invoking or successor element. This informed acceptance; it is not a claim of complete WCAG conformance.
