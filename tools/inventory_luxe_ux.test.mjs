import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=path=>fs.readFileSync(new URL("../"+path,import.meta.url),"utf8");
const ui=read("ui/features/inventory.js"),css=read("ui/features/inventory-luxe.css"),build=read("build.py");

test("inventory has exactly one named RTL-friendly tablist and a labelled panel",()=>{
  assert.match(ui,/role="tablist" aria-label="أقسام إدارة المخزون"/);
  assert.match(ui,/role="tabpanel" tabindex="0" aria-labelledby=/);
  assert.match(ui,/aria-controls="sk-inv-content"/);
  assert.match(ui,/aria-selected="/);
  assert.match(ui,/tabindex="/);
  assert.match(ui,/\["ArrowRight","ArrowLeft","Home","End"\]/);
  assert.match(ui,/document\.documentElement\.dir!=="ltr"/);
});
test("both scrolling inventory tables are keyboard-accessible named regions",()=>{
  assert.match(ui,/role="region" aria-label="جدول متابعة الأصناف"/);
  assert.match(ui,/role="region" aria-label="دفعات الصلاحية"/);
  assert.match(ui,/sk-inv-scroll-hint/);
});
test("mobile stock dashboard is a scoped shared-token stylesheet in the published bundle",()=>{
  assert.match(build,/"features\/inventory-luxe\.css"/);
  assert.match(css,/\.sk-inv-content \.sk-kpis\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/);
  assert.match(css,/\.sk-inv-tabs \[role="tab"\]\[aria-selected="true"\]/);
  assert.doesNotMatch(css,/#[0-9a-f]{3,8}\b/i);
  assert.match(ui,/class="sk-inv-exp-form" style="display:none;"/);
});
