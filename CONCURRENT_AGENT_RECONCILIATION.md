# Concurrent Agent Reconciliation — Zero-Legacy Rebuild

Date: 2026-09-25
Continuation branch: `rebuild/zero-legacy-jev-continuation-20260925`
Upstream active branch: `rebuild/zero-legacy-ui-20260925`

## Rule

Preserve capabilities and real user data, not legacy presentation implementations. Concurrent agent branches are treated as evidence/capability sources. No `ui/*.js` screen is copied into the new presentation layer.

## Reviewed concurrent work

- Active Zero-Legacy branch and PR #4.
- Main-line operational additions (ZATCA TLV verifier, carcass presets/anatomy, POS hotkeys).
- Legacy service/parity report commit that kept `ui/*.js` as presentation.
- Historical cleanup/fusion/Claude branches.

A written “100% parity” claim is **not** accepted as Zero-Legacy proof when the claimed replacement is still a legacy UI module. The Zero-Legacy Gate stays closed until the reconstructed implementation itself passes coverage and CI.

## Exact historical storage compatibility

| Capability | Historical key used by reconstructed repository |
|---|---|
| Traceability batches | `skosif_v38_batches` |
| Cold-chain readings | `skosif_v38_coldchain` |
| B2B credit ledger | `skosif_v38_ledger` |
| Aging chamber | `skosif_ops_aging_chamber` |
| Purchase/receiving history | `skosif_ops_po_history` |
| Butcher yield shifts | `skosif_ops_butcher_shifts` |
| Meat subscriptions | `skosif_ops_subscriptions` |

No seed data is written over these collections.

## Capabilities ported from concurrent work

- ZATCA TLV decode/verification as a typed service + tests + new POS UI.
- Carcass presets and economics via the existing typed meatOps engine, not UI formulas.
- Purchase-order composition and carcass receiving audit.
- Butcher yield benchmarking.
- Meat subscriptions.
- Camera barcode scanner with manual fallback and MediaStream cleanup.
- Culinary/chef reference guide.
- Existing rebuilt features remain: inventory/count/FIFO, supplier receiving, blending/labels, traceability/cold-chain, aging, finance, orders/customers/POS/B2B/catering, Jev, migration/backup/search.

## Still blocking the final Zero-Legacy Gate

Accounting/audit specialist parity still requires a new implementation or validated non-presentation core adapter for:
- Benford analytics.
- Sampling.
- Journal-entry tests.
- Reviewer council / issue workflow depth.
- Standards research lab.

Legacy audit presentation must not be shipped as the final UI merely to claim parity.

## CI policy

The reconstructed TypeScript app must pass:
1. strict rebuild typecheck;
2. deterministic pricing tests;
3. meatOps tests;
4. reconstructed capability/specialist/operations tests;
5. Vite build;
6. encrypted production assembly;
7. bundle assertions proving legacy presentation did not leak.

Only after these gates and capability coverage are verified should the final Legacy Purge and production switch occur.
