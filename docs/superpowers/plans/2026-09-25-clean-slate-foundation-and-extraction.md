# S.kosif Clean-Slate Foundation + Capability Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a brand-new S.kosif application foundation with no inherited presentation code, plus a machine-readable extraction map that classifies every reusable capability from the four source products before any domain feature is ported.

**Architecture:** The new application is a React 19 + TypeScript + Vite shell built from an empty application root. Legacy repositories and backup branches are read-only mining sources. The foundation establishes a typed capability registry, theme engine, permissions/session boundary, storage discovery layer, error boundary, test harness, and CI gates before any accounting, audit, sales, or operations capability is implemented.

**Tech Stack:** React 19, React DOM 19, TypeScript 7, Vite 8, Vitest 5, Tailwind CSS 4, lucide-react, motion, browser IndexedDB/localStorage APIs, GitHub Actions, Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-09-25-major-from-zero-fusion-design.md`

## Global Constraints

- Production project remains Cloudflare Pages `s-kosif` and final production URL remains `https://s-kosif.pages.dev`.
- Execution must begin from a clean application root; existing S.kosif presentation files are reference-only.
- Production must not require `skosif.js`, `skosif.css`, old shell/route registries, iframe embedding, nested apps, duplicate sidebars, duplicate headers, or floating docks.
- No capability is considered complete merely because a screen renders.
- Every retained capability is classified `KEEP-LOGIC`, `MERGE`, `REBUILD`, or `DROP` before implementation.
- Real user data and historical storage keys are preserved non-destructively; unknown data remains archived/read-only until classified.
- Five first-class themes are required from one token architecture: Aghnam Executive Light, Audit Professional, Midnight Intelligence, Desert Gold, Handwritten Notebook.
- Handwritten typography is restricted to headings/annotations; transactional numbers, controls, tables, and body text remain highly legible.
- Device session persistence is capped at 24 hours and must never store the plaintext password.
- Every task follows TDD: failing test -> minimal implementation -> passing test -> commit.

## Review Focus

1. Unknown legacy storage keys must never be deleted or overwritten during discovery; the discovery layer returns them as `unknown`.
2. A theme missing typography, chart, motion, surface, or spacing tokens must fail validation before runtime.
3. Session persistence must reject expired/corrupt records and must not serialize a password or raw secret.
4. Capability routes must be unique and permission-gated; duplicate route IDs or unknown roles fail registry validation.
5. The build must fail if any production source imports from banned legacy presentation paths or references `skosif.js`/`skosif.css`.

---

## File Structure Locked By This Plan

```text
app/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  src/
    main.tsx
    app/
      AppRoot.tsx
      router.tsx
      capability-types.ts
      capability-registry.ts
      capability-registry.test.ts
    shell/
      AppShell.tsx
      CommandPalette.tsx
      shell.test.tsx
    design/
      theme-contract.ts
      themes.ts
      ThemeProvider.tsx
      theme-contract.test.ts
      base.css
    data/
      storage-types.ts
      storage-discovery.ts
      storage-discovery.test.ts
      migration-registry.ts
      migration-registry.test.ts
    security/
      roles.ts
      permissions.ts
      permissions.test.ts
      session.ts
      session.test.ts
    platform/
      ErrorBoundary.tsx
      error-log.ts
      error-log.test.ts
    domains/
      command-center/
        CommandCenter.tsx
        command-center.test.tsx
    test/
      setup.ts
      fixtures/
        legacy-storage-fixture.ts
  scripts/
    check-no-legacy.mjs
    check-no-legacy.test.mjs
  docs/
    capability-extraction.schema.json
    capability-extraction.json
.github/
  workflows/
    S.kosif.yml
```

The clean execution branch may keep only repository-level non-presentation files that are explicitly needed for CI/deployment; old UI/application trees are not copied into this structure.

---

### Task 1: Create the clean execution branch and repository guard

**Files:**
- Create: `scripts/check-no-legacy.mjs`
- Create: `scripts/check-no-legacy.test.mjs`
- Create: `.gitignore`
- Modify later: `.github/workflows/S.kosif.yml`

**Interfaces:**
- Consumes: Git working tree rooted at the clean execution branch.
- Produces: `checkNoLegacy(rootDir: string): string[]` returning forbidden-path violations.

- [ ] **Step 1: Create a successor execution branch from a clean tree, not from inherited UI files**

Create a new branch named `rebuild/grand-fusion-clean-slate-20260925` whose first commit contains only the spec, this plan, repository metadata required for GitHub, and a new empty `app/` root. Do not copy `ui/`, old `app/src`, old generated bundles, old `dist/`, old payload presentation files, or old shell files.

- [ ] **Step 2: Write the failing guard test**

```js
// scripts/check-no-legacy.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {checkNoLegacy} from './check-no-legacy.mjs';

const fixture = {
  files: [
    'app/src/main.tsx',
    'ui/shell.js',
    'dist/skosif.js',
    'app/src/legacy/Product360Modal.tsx'
  ]
};

test('flags banned legacy presentation paths and bundles', () => {
  const violations = checkNoLegacy(fixture.files);
  assert.deepEqual(violations.sort(), [
    'app/src/legacy/Product360Modal.tsx',
    'dist/skosif.js',
    'ui/shell.js'
  ].sort());
});
```

- [ ] **Step 3: Run the test and verify failure**

Run: `node --test scripts/check-no-legacy.test.mjs`
Expected: FAIL because `check-no-legacy.mjs` does not exist.

- [ ] **Step 4: Implement the minimal guard**

```js
// scripts/check-no-legacy.mjs
const banned = [
  /^ui\//,
  /(^|\/)legacy\//,
  /skosif\.js$/i,
  /skosif\.css$/i,
  /Product360Modal/,
  /SKosifCore\.registerView/
];

export function checkNoLegacy(files) {
  return files.filter((path) => banned.some((rule) => rule.test(path)));
}
```

- [ ] **Step 5: Run the test and verify pass**

Run: `node --test scripts/check-no-legacy.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts .gitignore docs/superpowers
 git commit -m "chore: establish clean-slate branch and legacy guard"
```

---

### Task 2: Bootstrap the new React/Vite/TypeScript application

**Files:**
- Create: `app/package.json`
- Create: `app/index.html`
- Create: `app/tsconfig.json`
- Create: `app/vite.config.ts`
- Create: `app/src/main.tsx`
- Create: `app/src/app/AppRoot.tsx`
- Create: `app/src/test/setup.ts`

**Interfaces:**
- Consumes: browser DOM only.
- Produces: `AppRoot` React component and Vite production build under `app/dist`.

- [ ] **Step 1: Write `app/package.json` with exact scripts**

```json
{
  "name": "s-kosif-grand-fusion",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "build": "npm run typecheck && npm run test && vite build",
    "check:no-legacy": "node ../scripts/check-no-legacy.mjs"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^6.1.1",
    "vite": "^8.3.0",
    "typescript": "^7.0.2",
    "vitest": "^5.0.1",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24"
  },
  "devDependencies": {
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@types/node": "^22.14.0"
  }
}
```

- [ ] **Step 2: Write the first failing app test**

```tsx
// app/src/app/AppRoot.test.tsx
import {describe, expect, it} from 'vitest';
import {APP_NAME} from './AppRoot';

describe('AppRoot', () => {
  it('exposes the new product identity without legacy naming dependencies', () => {
    expect(APP_NAME).toBe('S.kosif');
  });
});
```

- [ ] **Step 3: Run and verify failure**

Run: `cd app && npm install && npm test -- AppRoot.test.tsx`
Expected: FAIL because `AppRoot.tsx` does not exist.

- [ ] **Step 4: Implement minimal root**

```tsx
// app/src/app/AppRoot.tsx
export const APP_NAME = 'S.kosif';

export function AppRoot() {
  return <div dir="rtl" lang="ar" data-app="s-kosif">{APP_NAME}</div>;
}
```

- [ ] **Step 5: Add `main.tsx`, `index.html`, TS/Vite config and setup**

`main.tsx` must mount only `AppRoot`; it must not import any source outside the new `app/src` tree.

- [ ] **Step 6: Verify typecheck/test/build**

Run: `cd app && npm run typecheck && npm test && npm run build`
Expected: all PASS and `app/dist/index.html` exists.

- [ ] **Step 7: Commit**

```bash
git add app
 git commit -m "feat: bootstrap clean S.kosif application root"
```

---

### Task 3: Define the capability contract and extraction matrix

**Files:**
- Create: `app/src/app/capability-types.ts`
- Create: `app/src/app/capability-registry.ts`
- Create: `app/src/app/capability-registry.test.ts`
- Create: `app/docs/capability-extraction.schema.json`
- Create: `app/docs/capability-extraction.json`

**Interfaces:**
- Consumes: capability records mined from the four source products.
- Produces:
  - `CapabilityDecision = 'KEEP-LOGIC' | 'MERGE' | 'REBUILD' | 'DROP'`
  - `CapabilityDefinition`
  - `validateCapabilityRegistry(entries): RegistryProblem[]`

- [ ] **Step 1: Write failing registry tests**

```ts
import {describe, expect, it} from 'vitest';
import {validateCapabilityRegistry} from './capability-registry';

describe('capability registry', () => {
  it('rejects duplicate ids and duplicate routes', () => {
    const problems = validateCapabilityRegistry([
      {id:'audit', route:'/audit', domain:'audit', decision:'REBUILD'},
      {id:'audit', route:'/review', domain:'audit', decision:'REBUILD'},
      {id:'ar', route:'/audit', domain:'finance', decision:'REBUILD'}
    ] as any);
    expect(problems.map((p) => p.code).sort()).toEqual(['duplicate-id','duplicate-route']);
  });

  it('rejects a capability without an explicit migration decision', () => {
    const problems = validateCapabilityRegistry([
      {id:'ar', route:'/receivables', domain:'finance'}
    ] as any);
    expect(problems.some((p) => p.code === 'missing-decision')).toBe(true);
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `cd app && npm test -- capability-registry.test.ts`
Expected: FAIL because the registry module does not exist.

- [ ] **Step 3: Implement exact capability types**

```ts
export type CapabilityDecision = 'KEEP-LOGIC' | 'MERGE' | 'REBUILD' | 'DROP';
export type ProductDomain =
  | 'command'
  | 'sales'
  | 'inventory'
  | 'procurement'
  | 'finance'
  | 'audit'
  | 'catalog'
  | 'intelligence'
  | 'reports'
  | 'system';

export type CapabilityDefinition = {
  id: string;
  route: `/${string}`;
  domain: ProductDomain;
  decision: CapabilityDecision;
  sourceRefs: string[];
  dataStores: string[];
  proof: string[];
};
```

Implement `validateCapabilityRegistry` with errors for duplicate ID, duplicate route, missing decision, missing sourceRefs on non-new capabilities, and missing proof for `KEEP-LOGIC`.

- [ ] **Step 4: Create the extraction JSON schema**

The schema must require: `id`, `label`, `domain`, `source`, `decision`, `businessValue`, `dataStores`, `logicFiles`, `tests`, `knownFailures`, `targetOwner`, `proof`.

- [ ] **Step 5: Seed the extraction matrix with the known high-risk capabilities**

Seed at minimum these records, all initially `REBUILD` unless proven otherwise:

```text
receivables
finance-ledger
trial-balance
journal-tests
benford
sampling
pbc
reviewer-workflow
standards-research
inventory
procurement
zatca-pos
carcass-economics
butcher-yield
subscriptions
barcode-scanner
jev-decision
```

No record may be `KEEP-LOGIC` without a concrete test/file proof reference.

- [ ] **Step 6: Verify registry and JSON schema tests pass**

Run: `cd app && npm test -- capability-registry.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/src/app app/docs
 git commit -m "feat: define capability extraction contract"
```

---

### Task 4: Build the five-theme token engine

**Files:**
- Create: `app/src/design/theme-contract.ts`
- Create: `app/src/design/themes.ts`
- Create: `app/src/design/ThemeProvider.tsx`
- Create: `app/src/design/theme-contract.test.ts`
- Create: `app/src/design/base.css`

**Interfaces:**
- Produces: `ThemeId`, `ThemeDefinition`, `THEMES`, `validateTheme(theme)`.

- [ ] **Step 1: Write the failing theme completeness test**

```ts
import {describe, expect, it} from 'vitest';
import {THEMES, validateTheme} from './themes';

describe('theme matrix', () => {
  it('ships exactly five complete themes', () => {
    expect(Object.keys(THEMES)).toEqual([
      'aghnam-executive-light',
      'audit-professional',
      'midnight-intelligence',
      'desert-gold',
      'handwritten-notebook'
    ]);
    for (const theme of Object.values(THEMES)) {
      expect(validateTheme(theme)).toEqual([]);
    }
  });

  it('keeps transactional typography legible in handwritten mode', () => {
    expect(THEMES['handwritten-notebook'].typography.numeric).not.toBe(
      THEMES['handwritten-notebook'].typography.display
    );
  });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `cd app && npm test -- theme-contract.test.ts`
Expected: FAIL because theme modules do not exist.

- [ ] **Step 3: Implement `ThemeDefinition`**

It must require these groups: `typography`, `color`, `surface`, `border`, `radius`, `shadow`, `spacing`, `chart`, `icon`, `motion`, `report`.

- [ ] **Step 4: Implement all five theme objects**

Do not use inherited CSS variables. `ThemeProvider` writes only the new token set to `document.documentElement.dataset.theme` and CSS custom properties owned by `base.css`.

- [ ] **Step 5: Verify theme tests**

Run: `cd app && npm test -- theme-contract.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/design
 git commit -m "feat: add five-theme design token engine"
```

---

### Task 5: Implement read-only legacy storage discovery

**Files:**
- Create: `app/src/data/storage-types.ts`
- Create: `app/src/data/storage-discovery.ts`
- Create: `app/src/data/storage-discovery.test.ts`
- Create: `app/src/test/fixtures/legacy-storage-fixture.ts`

**Interfaces:**
- Produces:
  - `StorageRecordSummary`
  - `discoverLocalStorage(storage: StorageLike): StorageRecordSummary[]`
  - `classifyDiscoveredRecord(record, registry): 'known' | 'unknown'`

- [ ] **Step 1: Write the failing non-destructive discovery test**

```ts
import {describe, expect, it} from 'vitest';
import {discoverLocalStorage} from './storage-discovery';

it('discovers unknown keys without mutating them', () => {
  const state = new Map([
    ['aghnam-pricing-v3','{"x":1}'],
    ['mystery-key','secret-ish-data']
  ]);
  const storage = {
    length: state.size,
    key: (i:number) => [...state.keys()][i] ?? null,
    getItem: (k:string) => state.get(k) ?? null,
    setItem: () => { throw new Error('write not allowed'); },
    removeItem: () => { throw new Error('delete not allowed'); }
  } as any;

  const rows = discoverLocalStorage(storage);
  expect(rows.find((r) => r.key === 'mystery-key')?.classification).toBe('unknown');
  expect(state.get('mystery-key')).toBe('secret-ish-data');
});
```

- [ ] **Step 2: Run and verify failure**

Run: `cd app && npm test -- storage-discovery.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement read-only discovery**

Discovery may calculate byte length and a SHA-256 digest, but must not parse sensitive values unnecessarily and must never write/delete.

- [ ] **Step 4: Add known store registry entries**

Known records must include at minimum historical identifiers already observed in S.kosif/Aghnam flows such as `aghnam-pricing-v3`, `aghnam-app-v7` IndexedDB, `skosif_v38_ledger`, and audit-related stores. Unknown keys remain `unknown` until explicitly classified.

- [ ] **Step 5: Run tests**

Run: `cd app && npm test -- storage-discovery.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/data app/src/test/fixtures
 git commit -m "feat: add non-destructive legacy data discovery"
```

---

### Task 6: Add migration registry with idempotency and rollback contracts

**Files:**
- Create: `app/src/data/migration-registry.ts`
- Create: `app/src/data/migration-registry.test.ts`

**Interfaces:**
- Produces `Migration<TBefore,TAfter>` with `detect`, `backup`, `migrate`, `verify`, `rollback`.

- [ ] **Step 1: Write failing idempotency and rollback tests**

```ts
it('running the same migration twice does not duplicate records', async () => {
  const first = await runMigration(sampleMigration, source);
  const second = await runMigration(sampleMigration, first.output);
  expect(second.output).toEqual(first.output);
});

it('rolls back to the exact backup after verification failure', async () => {
  await expect(runMigration(failingMigration, source)).rejects.toThrow('verification failed');
  expect(store.read()).toEqual(source);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `cd app && npm test -- migration-registry.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement migration contract and runner**

The runner sequence is fixed: `detect -> backup -> migrate -> verify`; any failure after `backup` must call `rollback` before surfacing the error.

- [ ] **Step 4: Run tests and commit**

Run: `cd app && npm test -- migration-registry.test.ts`
Expected: PASS.

```bash
git add app/src/data
 git commit -m "feat: add reversible idempotent migration framework"
```

---

### Task 7: Implement roles, permissions, and the 24-hour device session

**Files:**
- Create: `app/src/security/roles.ts`
- Create: `app/src/security/permissions.ts`
- Create: `app/src/security/permissions.test.ts`
- Create: `app/src/security/session.ts`
- Create: `app/src/security/session.test.ts`

**Interfaces:**
- Produces `RoleId`, `PermissionAction`, `can(role, capabilityId, action)`, `createDeviceSession`, `readDeviceSession`, `invalidateDeviceSession`.

- [ ] **Step 1: Write failing session tests**

```ts
it('rejects sessions older than 24 hours', () => {
  const issuedAt = Date.now() - (24 * 60 * 60 * 1000) - 1;
  const raw = createFixtureSession({issuedAt});
  expect(readDeviceSession(raw, Date.now())).toBeNull();
});

it('never serializes password fields', () => {
  const raw = createDeviceSession({userId:'u1', role:'admin'}, Date.now());
  expect(JSON.stringify(raw).toLowerCase()).not.toContain('password');
});
```

- [ ] **Step 2: Write failing permission tests**

```ts
it('denies unknown capabilities and unknown roles by default', () => {
  expect(can('viewer' as any, 'does-not-exist', 'view')).toBe(false);
  expect(can('nobody' as any, 'command-center', 'view')).toBe(false);
});
```

- [ ] **Step 3: Implement minimal secure session record**

Persist only opaque session ID/proof, issued-at, expires-at, user ID, role, and version. No plaintext password, provider API keys, or raw authentication secrets.

- [ ] **Step 4: Implement deny-by-default permissions**

Permissions consume capability IDs from the new registry; they must not reference legacy screen IDs.

- [ ] **Step 5: Run tests and commit**

Run: `cd app && npm test -- session.test.ts permissions.test.ts`
Expected: PASS.

```bash
git add app/src/security
 git commit -m "feat: add permission boundary and secure device session"
```

---

### Task 8: Build the new RTL shell, router, and command center skeleton

**Files:**
- Create: `app/src/app/router.tsx`
- Create: `app/src/shell/AppShell.tsx`
- Create: `app/src/shell/CommandPalette.tsx`
- Create: `app/src/shell/shell.test.tsx`
- Create: `app/src/domains/command-center/CommandCenter.tsx`
- Create: `app/src/domains/command-center/command-center.test.tsx`
- Modify: `app/src/app/AppRoot.tsx`

**Interfaces:**
- Consumes: capability registry, permissions, ThemeProvider.
- Produces one shell and one route outlet; command palette searches the same capability registry.

- [ ] **Step 1: Write failing single-shell tests**

```ts
it('exposes one navigation source and no nested app frame', () => {
  const source = renderShellForTest();
  expect(source.navigationSources).toBe(1);
  expect(source.containsIframe).toBe(false);
  expect(source.containsFloatingDock).toBe(false);
});
```

- [ ] **Step 2: Write failing route uniqueness test**

All visible navigation items and command-palette items must resolve from the same `CapabilityDefinition[]`; no hand-maintained second nav list is allowed.

- [ ] **Step 3: Implement shell layout**

Required behavior: RTL right rail/drawer, top utility bar, content outlet, mobile drawer, theme selector, command palette trigger. Do not implement domain cards beyond Command Center placeholder state in this task.

- [ ] **Step 4: Implement Command Center empty/real-data states**

The first version must show only data supplied by repositories; if no real source is connected it renders an explicit empty state rather than fabricated KPI values.

- [ ] **Step 5: Run tests and commit**

Run: `cd app && npm test -- shell.test.tsx command-center.test.tsx`
Expected: PASS.

```bash
git add app/src/app app/src/shell app/src/domains/command-center
 git commit -m "feat: add canonical RTL shell and command center"
```

---

### Task 9: Add platform error boundary and append-only local error log

**Files:**
- Create: `app/src/platform/ErrorBoundary.tsx`
- Create: `app/src/platform/error-log.ts`
- Create: `app/src/platform/error-log.test.ts`
- Modify: `app/src/app/AppRoot.tsx`

**Interfaces:**
- Produces `recordClientError(event): ErrorRecord` and `readRecentErrors(limit)`.

- [ ] **Step 1: Write failing sanitization test**

```ts
it('redacts secret-like fields before persistence', () => {
  const rec = recordClientError({message:'failed', context:{password:'abc', apiKey:'xyz'}} as any);
  expect(JSON.stringify(rec)).not.toContain('abc');
  expect(JSON.stringify(rec)).not.toContain('xyz');
});
```

- [ ] **Step 2: Implement append-only sanitized log**

Store timestamp, error class, message, route, capability ID, build version, and sanitized context only. Never persist passwords, access tokens, API keys, document contents, or uploaded binary data.

- [ ] **Step 3: Mount ErrorBoundary once at AppRoot**

There must be one top-level boundary, not one competing boundary per legacy sub-app.

- [ ] **Step 4: Run tests and commit**

Run: `cd app && npm test -- error-log.test.ts`
Expected: PASS.

```bash
git add app/src/platform app/src/app/AppRoot.tsx
 git commit -m "feat: add sanitized platform error boundary"
```

---

### Task 10: Replace CI with clean-slate gates and Cloudflare-preview readiness

**Files:**
- Modify/Create: `.github/workflows/S.kosif.yml`
- Modify: `scripts/check-no-legacy.mjs`
- Create: `scripts/list-source-files.mjs`

**Interfaces:**
- CI must fail before build completion if any legacy-presentation file/import is detected.

- [ ] **Step 1: Extend no-legacy test to scan actual tracked files**

`list-source-files.mjs` must enumerate tracked files via `git ls-files`; `check-no-legacy.mjs` must accept that list and exit non-zero on violations.

- [ ] **Step 2: Define exact CI order**

```text
checkout
setup-node 22
npm ci in app/
node --test scripts/check-no-legacy.test.mjs
node scripts/check-no-legacy.mjs --tracked
npm run typecheck
npm test
npm run build
assert app/dist/index.html exists
assert app/dist contains no skosif.js/skosif.css references
```

- [ ] **Step 3: Add artifact upload for `app/dist` on PRs**

Preview artifacts are immutable outputs of the same verified build. Do not rebuild with a different command for deployment.

- [ ] **Step 4: Preserve Cloudflare Pages Git integration for final production cutover**

Do not add a second manual Wrangler deployment path unless repository secrets and ownership are explicitly provisioned later. The production project remains `s-kosif`.

- [ ] **Step 5: Run local-equivalent commands**

Run:

```bash
node --test scripts/check-no-legacy.test.mjs
cd app
npm ci
npm run typecheck
npm test
npm run build
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/S.kosif.yml scripts app
 git commit -m "ci: enforce clean-slate production gates"
```

---

### Task 11: Complete the four-source extraction matrix before domain implementation

**Files:**
- Modify: `app/docs/capability-extraction.json`
- Create: `app/docs/capability-extraction-report.md`
- Create: `app/src/app/capability-extraction.test.ts`

**Interfaces:**
- Produces a reviewed matrix where every candidate capability has a decision and evidence.

- [ ] **Step 1: Add failing matrix completeness test**

The test must fail if any extraction row lacks `decision`, `targetOwner`, `proof`, or `knownFailures`.

- [ ] **Step 2: Audit source 1 — current/historical S.kosif**

For each capability, record concrete source file(s), data store(s), existing tests, observed broken paths, and decision.

- [ ] **Step 3: Audit source 2 — Audit Studio repository/site snapshot**

Capture evidence/materiality/journal/issue/reviewer/report/standards capabilities separately rather than treating Audit Studio as one monolith.

- [ ] **Step 4: Audit source 3 — Audit Studio Pages snapshot**

Record only materially distinct workflows; duplicate capabilities point to a `MERGE` target rather than creating a second implementation.

- [ ] **Step 5: Audit source 4 — Aghnam operations/sales family**

Capture validated pricing, inventory, procurement, POS/ZATCA, carcass/yield, subscriptions, barcode, customer/order, and dashboard interaction ideas. Fabricated/demo-only records are marked `DROP`.

- [ ] **Step 6: Verify matrix completeness**

Run: `cd app && npm test -- capability-extraction.test.ts`
Expected: PASS only when every row has a decision and proof.

- [ ] **Step 7: Commit**

```bash
git add app/docs app/src/app/capability-extraction.test.ts
 git commit -m "docs: complete four-source capability extraction matrix"
```

---

### Task 12: Foundation acceptance gate

**Files:**
- No new product files unless a defect is found.
- Update: `app/docs/capability-extraction-report.md` with final gate evidence.

**Interfaces:**
- Produces the prerequisite baseline for all later domain plans.

- [ ] **Step 1: Run the complete gate**

```bash
node --test scripts/check-no-legacy.test.mjs
node scripts/check-no-legacy.mjs --tracked
cd app
npm ci
npm run typecheck
npm test
npm run build
```

Expected: all PASS.

- [ ] **Step 2: Verify clean-slate invariants manually**

Confirm all of the following:

```text
one app root
one shell
one capability registry
one permission boundary
one theme engine with exactly five themes
no iframe
no old ui/ imports
no skosif.js/skosif.css runtime dependency
no fabricated KPI seed values
storage discovery is read-only
session maximum is 24h
```

- [ ] **Step 3: Open a draft PR for foundation review**

The PR body must include exact gate outputs, the clean-slate branch name, capability extraction summary counts by decision, and a statement that no domain capability is yet considered production-complete.

- [ ] **Step 4: Do not merge until review approves the foundation**

The next plans depend on this foundation and are written separately:

```text
Plan 2 — Finance & Accounting
Plan 3 — Audit & Assurance
Plan 4 — Sales & Customers
Plan 5 — Inventory, Production, Procurement & Suppliers
Plan 6 — Catalog, Costing, Pricing & POS/ZATCA
Plan 7 — Intelligence / Jev / AI Council
Plan 8 — Reports & Executive Analytics
Plan 9 — Data Migration, Cutover & Cloudflare Production Release
```

- [ ] **Step 5: Commit final evidence update**

```bash
git add app/docs/capability-extraction-report.md
 git commit -m "test: record clean-slate foundation acceptance evidence"
```
