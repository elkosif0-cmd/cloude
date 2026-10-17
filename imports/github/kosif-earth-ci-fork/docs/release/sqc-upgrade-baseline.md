# SQC upgrade baseline

- Source commit: `906977ac5079c852a044b149cb478820722168bb`.
- Root tree: `1a362d06cccba7204c0236ce9a5f48cfd9660985`; 555 file blob hashes verified.
- Worker source version: **0.18.6**. The independent runtime contract pins supported and retired routes; no Worker runtime/bindings/secrets were changed.
- Original access tests: 11 passed, 3 failed on stale 0.17.13 assumptions. Original governance and council suites also pinned the stale version/routes. All auth, executor isolation, CORS, rate and body-size assertions are retained.
- Application baseline: 97 test files, 416 tests passed; all four TypeScript configurations passed using the committed lockfile.
- PR 97 remains a separate unmerged runtime/bindings proposal, claiming live 0.27.3. That claim is not independently verified here. Do not deploy this source over an unverified/newer live Worker.
- `think-mcp/LIVE-RUNTIME-VERSION` contains 0.18.1 and is historical, not live evidence.
- Real customer data and a complete user-browser baseline are unavailable. Only synthetic import/recovery data may be exercised.
- Cloud-shell Chromium could not create its IPC socket. Browser QA, Windows production smoke, production-secret checks, live source parity, PWA update and deployment rollback remain required and unverified.
