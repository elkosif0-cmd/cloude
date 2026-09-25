# S.kosif — tested calculation engines

This folder holds only the strict TypeScript engines and their tests. The UI lives in `../ui`
(see `../docs/rebuild/REBUILD_PLAN.md`); the browser mirror of the pricing core is
`../ui/features/pricing-core.js`.

| Engine | Source | Tests |
|---|---|---|
| Pricing core (usable unit cost, rounding policy, box pricing, circular dependency) | `src/engine/corePricing` | `pricing.test.ts` |
| Meat operations (carcass cost allocation, dressing %, receivables aging) | `src/engine/meatOps` | `ops.test.ts` |

```bash
npm ci
npx tsc -p tsconfig.pricing-core.json --noEmit && npx vitest run src/engine/corePricing/pricing.test.ts
npx tsc -p tsconfig.meatops.json --noEmit && npx vitest run src/engine/meatOps/ops.test.ts
```
