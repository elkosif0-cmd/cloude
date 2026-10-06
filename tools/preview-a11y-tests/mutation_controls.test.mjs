import test from 'node:test';
import assert from 'node:assert/strict';
import {harness} from './output_focus_harness.mjs';

// Targeted negative controls. These mutate only the in-memory source given to
// the isolated fixture. No production file is written. A passing test means
// that the stated broken behavior was observed, not that it is acceptable.
function removeOnce(source,needle,replacement=''){assert.equal(source.split(needle).length,2,'Mutation target must appear exactly once: '+needle);return source.replace(needle,replacement);}

test('negative control detects removal of opener restoration',()=>{const h=harness({sourceTransform:s=>removeOnce(s,'if(owned)restoreFocus(s,reason,ownedFocus);')});const o=h.button();o.focus();h.open();h.click('close');assert.ok(h.document.activeElement!==o,'Mutant must visibly lose opener focus');});
test('negative control detects removal of final-guard iframe keyboard rebind',()=>{const h=harness({sourceTransform:s=>removeOnce(s,'bindGuard(s,w);if(s.wrap)bindLayerFrame(s.layer);return true;','bindGuard(s,w);return true;')});h.button().focus();const w=h.open(),g={identity:{},checkSync:()=>true,check:async()=>true};h.api.guard(w,g);h.write(w,'FINAL');h.api.guard(w,g);w.document.getElementById('frame-first').focus();h.key(w.document,'Escape');assert.ok(h.wrap(),'Mutant retains preview after frame Escape, proving the regression is observable');});
test('negative control detects omitted background reconciliation after presentation exit',async()=>{const h=harness({sourceTransform:s=>removeOnce(s,'if(cur?.active)cur.layer?.hide();')});h.button().focus();h.open();h.click('present');await h.tick();const added=h.button('late');h.mutations();assert.equal(added.hasAttribute('inert'),true);h.key(h.document,'Escape');assert.equal(added.hasAttribute('inert'),false,'Mutant exposes newly added background content after returning to preview');});
