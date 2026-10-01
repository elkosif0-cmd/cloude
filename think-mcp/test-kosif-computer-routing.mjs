import fs from "node:fs";
import assert from "node:assert/strict";

const s=fs.readFileSync(new URL("./worker.js", import.meta.url),"utf8");

assert.match(s,/name:"KOSIF Computer"/);
assert.match(s,/name:"Jev Bridge"/);
assert.match(s,/\["decision",\/\(/);
assert.match(s,/\["computer",\/\(/);
assert.match(s,/\["automation",\/\(/);
assert.match(s,/preferredExecutor:"KOSIF Computer"/);
assert.match(s,/cognitiveLane:"browserjev"/);
assert.match(s,/directRemoteLane:"browserremote"/);
/* 0.5.9 replaced the needs_jev=true flag with a one-time packet ticket and an explicit Jev step in the sequence */
assert.match(s,/packetIdRequiredForJev:true/);
assert.match(s,/"jev_choice_if_needed"/);
assert.match(s,/require an observable postcondition/i);

console.log("KOSIF Computer/Jev-Browser routing catalog checks passed");
