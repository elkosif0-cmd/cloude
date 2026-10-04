import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const file=new URL('./mercury_ci_e2e.mjs',import.meta.url);
test('visual harness is CI-only, exact-head and synthetic',()=>{
 assert.ok(fs.existsSync(file),'Native CI harness is required');
 const s=fs.readFileSync(file,'utf8');
 for(const token of ['GITHUB_ACTIONS','SQC_TESTED_SHA','managementBrowserSeed','populated','empty','large','reducedMotion','pdfinfo','pdftoppm','baseline','candidate','download'])assert.ok(s.includes(token),token);
 assert.ok(s.includes('failures.length'));
 assert.ok(s.includes('sources'));
});
