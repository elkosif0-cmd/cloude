# Explicit public-demo selection admission

## Purpose and boundaries

This corrects the fresh-entry regression observed on PR143 `fcdbdd8439314b03138b0fbc37ea69a56aa64198`: the public demo and local main user could be visible while their helper selection registries were absent. Reconfirming the same company or user returned success without establishing a valid chat scope. A real away/back switch happened to create the missing registrations.

Both `chatScopeSnapshot()` and report `scopeSnapshot()` remain byte-identical. The ordinary company snapshot/restore functions also remain unchanged. This is a checked explicit-selection operation, not a read-side migration, automatic ownership inference, new authentication mechanism, or Task3 routing implementation.

## Initial user experience

A direct fresh app entry may remain unbound until the user explicitly selects/confirms the public demo from the company switcher. The assistant explains that step. Selecting the already visible demo works without switching to another company or reloading. Same-user confirmation alone reports that company confirmation is still required. A valid already bound same-ID selection remains a no-op.

`SK.company.open()` and a public same-ID front-door intent delegate to the same checked selection path. A failed public intent does not mark the chooser complete or remember an unverified label. Existing first-time front-door selection before any seed continues through the original full switch and reload reconciliation.

## Admission requirements

- The target must be the canonical public `demo-co`, represented by exactly one nonempty named, demo-marked company record and a company-section seed marker. It cannot be marked as the private space.
- The application-local main user and existing helper records must be structurally consistent. Malformed memberships, conflicting active records, another user's membership or lastSpace claim, and stale/locked/tainted contexts refuse.
- A company marker alone is insufficient. All populated company helper stores must be recognized public demo shapes with applicable demo markers. Mixed/unmarked ledger, purchasing, customer/order, catalog memo, or unknown helper data refuses. Empty stores may remain empty.
- Full demo compatibility covers all 14 actual seed sections, actual ledger/advances posting, scalar opex, raw credit CSV, IndexedDB meta/non-meta rows, and the actual empty core pricing factory and reload normalizer. The three unmarked advance control accounts are accepted only with their exact canonical shape, demo advances and linked demo journal entries. No arbitrary account-ID prefix exemption exists.
- Unknown or unreadable data is not deleted, copied to an owner, or silently converted. Unsupported/corrupt stores require separate recovery or review.

## Coherent observation and checked handoff

The selection stays busy during its asynchronous proof read, rejecting overlapping local transitions. Application IndexedDB stores are read in one readonly transaction spanning every existing store. Snapshot validation and synchronous selection-registry writes occur in the final cursor callback while that transaction remains active. An overlapping write transaction therefore cannot change an earlier store midway through proof collection or before this handoff.

The original user, helper, company, demo, private-marker and generation bytes are rechecked after the async read; local helper bytes are compared again. Both proposed registry writes must succeed and read back exactly, and the lifecycle generation must match, before success. A failure remains closed. Rollback only replaces this attempt's exact proposed bytes, never a conflicting peer's registry. Failed attempts do not schedule reload. Session chooser preferences are not ownership proof.

This is not a distributed transaction across localStorage and IndexedDB, or a lock over every writer in the app. A non-cooperating writer may change data after the coherent admission transaction completes; other modules' persistent authorization and mutation ownership remain full-P0 work. The existing cross-tab transport limitations and application-local identity limitations continue to apply. Demo eligibility is a conservative compatibility/provenance check, not authenticated tenant attestation or cryptographic proof of ownership.

## Preservation and remaining work

No ledger calculation, source adapter, catalog/report count, account posting rule, protected unlock script, or unknown-owner chat history is changed. Chat restrictions from the accepted isolation repair remain in force. Global non-helper stores, private/legacy ownership recovery, audit engagement ownership, broad entry routing, and automatic first-entry admission are not implemented by this patch.

Native-browser fresh-entry/reload verification must use the exact republished head after independent source review. Local VM tests do not establish production, backend-authentication, or complete platform acceptance.
