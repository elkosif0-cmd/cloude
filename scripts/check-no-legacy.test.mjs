import test from 'node:test';
import assert from 'node:assert/strict';
import {checkNoLegacy} from './check-no-legacy.mjs';

const files = [
  'app/src/main.tsx',
  'ui/shell.js',
  'dist/skosif.js',
  'app/src/legacy/Product360Modal.tsx'
];

test('flags banned legacy presentation paths and bundles', () => {
  const violations = checkNoLegacy(files);
  assert.deepEqual(violations.sort(), [
    'app/src/legacy/Product360Modal.tsx',
    'dist/skosif.js',
    'ui/shell.js'
  ].sort());
});
