# Temporary focus diagnostic preview

Base: exact PR137 head `c047cb34b77ba08fda7cefd072a1c25929366f33`. This is an observational candidate for a separate temporary preview. It is not a focus fix, must not be merged as enabled production behavior, and must not be composed with unrelated source/Excel changes while measuring the original failure.

## Activation

Off by default. Logs activate only when all three conditions hold:
- Host is a subdomain of `.s-kosif.pages.dev`, excluding the production apex.
- Path is `/app-safe` or `/app-safe.html`.
- Explicit query parameter `sqcFocusDebug=1` is present.

Use a fresh public synthetic-demo preview. After selecting the public demo company, reload its verified app-safe URL with the flag. Never enable this for private company data. A control run without the flag should retain the same focus behavior.

## Allowed record

Console records begin `SQC_FOCUS_DIAG ` and contain only:
- Constant lifecycle event name and local timestamp
- Active focus tag and a strictly allowlisted UI ID (`skp-inp`, numbered `skp-o` controls, or `pg-title`)
- Document-focus, visibility and fullscreen booleans

Unknown IDs are omitted. Typed text, DOM content, company names/IDs, credentials, document values, URLs, network requests, telemetry and persistence are not recorded. No input listener reads text. No focus action, timer-based repair or behavior change is added.

Observation points cover shared-stack notification eligibility, recovery entry/guards/attempts, native fullscreen request/exit promise stages, focus/blur, fullscreen/visibility change, and Ctrl+K/help key capture plus microtask/animation-frame samples. Logging itself can perturb timing; compare flagged and unflagged runs rather than treating diagnostics as a fix.

## Reproduction

Public demo → Print Center → ordinary income calculation → Print → Presentation.

Confirm native fullscreen via the observed `:fullscreen` DOM match. From End Presentation, press Ctrl+K without clicking search, then type a harmless synthetic word. Capture console records, actual `:focus` match, active element, visible palette state and search value. Repeat with physical Shift+/ to open keyboard help. Control: close/reopen palette after native fullscreen has already exited.

No hidden state execution, DOM focus injection, local browser/server or production data is needed. Diagnostics expose their state through console logs; the read-only cloud surface does not need to call unavailable document APIs.

## Verification and removal

Removing all `FOCUS_DIAG_BEGIN`…`FOCUS_DIAG_END` blocks reproduces the exact original PR137 `output.js` and `sk.js` bytes. Pure tests check that identity plus default-off/public-preview-only gates and the record allowlist. Existing behavior regressions remain green.

After collecting the two traces, revert this whole diagnostic patch (two product files, appended diagnostic tests, this note) before composing the final fix. Keep the evidence outside production. The parent owns publication and removal; no remote changes were made here.
