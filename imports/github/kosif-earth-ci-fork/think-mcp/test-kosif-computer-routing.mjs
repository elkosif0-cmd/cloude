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
assert.match(s,/needs_jev=true/);
assert.match(s,/require an observable postcondition/i);

console.log("KOSIF Computer/Jev-Browser routing catalog checks passed");
