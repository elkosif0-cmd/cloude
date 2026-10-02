import assert from "node:assert/strict";
import {
  COGNITIVE_CARD_VERSION,COGNITIVE_SOURCE_DIGEST,POWER_KEYS,STANCE_KEYS,SCHOOL_KEYS,
  STANCE_COMPENSATION,cognitiveCard,cognitiveRosterReceipt
} from "./cognitive-cards-v1.js";

assert.equal(COGNITIVE_CARD_VERSION,"attachment-cognitive-cards-v1");
assert.equal(COGNITIVE_SOURCE_DIGEST,"sha256:fde0c8bcccea08231389591ea379654563dc39bdcd9d2cbb9f7a19016a716166");
assert.equal(POWER_KEYS.length,30);
assert.equal(new Set(POWER_KEYS).size,30);
assert.equal(STANCE_KEYS.length,24);
assert.equal(new Set(STANCE_KEYS).size,24);
assert.equal(SCHOOL_KEYS.length,10);
assert.equal(new Set(SCHOOL_KEYS).size,10);

const cards=Array.from({length:500},(_,i)=>cognitiveCard(i));
assert.equal(new Set(cards.map(x=>x.signature)).size,500,"all counted experts need a unique cognitive signature");
assert.ok(cards.every(x=>x.primary_power!==x.secondary_power),"primary and secondary powers must differ");
const receipt=cognitiveRosterReceipt();
assert.deepEqual(receipt,{
  experts:500,
  unique_signatures:500,
  primary_power_coverage:30,
  secondary_power_coverage:30,
  stance_coverage:24,
  school_coverage:10
});

for(const key of Object.keys(STANCE_COMPENSATION)){
  assert.ok(STANCE_KEYS.includes(key),"compensation refers to an unknown stance: "+key);
  assert.ok(STANCE_COMPENSATION[key].length>20,"compensation must be operational, not a label");
}

console.log(JSON.stringify({
  passed:true,
  contract:COGNITIVE_CARD_VERSION,
  source_digest:COGNITIVE_SOURCE_DIGEST,
  receipt
}));
