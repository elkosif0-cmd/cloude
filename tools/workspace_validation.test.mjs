import test from 'node:test';
import assert from 'node:assert/strict';
import {workspaceHarness} from './workspace_validation_fixture.mjs';

const period = {'pe-label':'Synthetic FY 2026','pe-from':'2026-01-01','pe-to':'2026-12-31'};
const plain = value => JSON.parse(JSON.stringify(value));
function requiredError(h,id) {
  const field=h.field(id), error=field.closest('.sk-field').querySelector('.sk-field-err');
  assert.equal(field.getAttribute('aria-invalid'),'true');
  assert.ok(h.document.activeElement === field, `focus must move to ${id}`);
  assert.ok(error); assert.equal(error.textContent,'هذا الحقل مطلوب');
  assert.equal(error.getAttribute('role'),'alert');
  assert.ok(field.getAttribute('aria-describedby').split(/\s+/).includes(error.id));
}

// Mutating any one scoped validation call back to validate(root) must fail the
// matching real-handler test. The DOM fixture parses the actual render output.
for (const service of [true,false]) {
  test(`add period with empty unrelated company name (company service ${service})`,async()=>{
    const h=await workspaceHarness({service}); h.fill(period);
    assert.equal(h.field('co-name').value,''); h.click('add-pe');
    const d=h.get(); assert.equal(d.periods.length,1,'valid period must persist without a company-name workaround');
    assert.equal(d.companies.length,2); assert.equal(d.periods[0].companyId,'synthetic-a');
    assert.equal(d.active.companyId,'synthetic-a'); assert.equal(d.active.periodId,d.periods[0].id);
    assert.equal(h.field('co-name').getAttribute('aria-invalid'),null,'unrelated field stays untouched');
    if(service) { const c=h.ctx.SK.company.current(); assert.equal(c.id,'synthetic-a'); assert.deepEqual(plain(c.period),d.periods[0]); }
  });
  test(`add company with empty unrelated period label (company service ${service})`,async()=>{
    const h=await workspaceHarness({service}); h.fill({'co-name':'  Synthetic New Company  ','co-cur':'EGP'});
    assert.equal(h.field('pe-label').value,''); h.click('add-co');
    const d=h.get(); assert.equal(d.companies.length,3,'valid company must persist without a period-label workaround');
    assert.equal(d.companies[2].name,'Synthetic New Company'); assert.equal(d.companies[2].currency,'EGP'); assert.equal(d.periods.length,0);
    assert.equal(h.field('pe-label').getAttribute('aria-invalid'),null,'unrelated field stays untouched');
    if(service) { assert.equal(h.transitions.length,1); assert.equal(h.transitions[0].id,d.companies[2].id); assert.deepEqual(plain(h.transitions[0].options),{fresh:true,demo:false}); }
  });
  test(`empty own company field remains accessible and creates nothing (service ${service})`,async()=>{
    const h=await workspaceHarness({service}), before=h.get(); h.fill({'co-name':'   '}); h.click('add-co');
    requiredError(h,'co-name'); assert.deepEqual(h.get(),before); assert.equal(h.transitions.length,0);
    assert.equal(h.field('pe-label').getAttribute('aria-invalid'),null);
  });
}

test('empty own period label focuses its accessible error, never the unrelated company field',async()=>{
  const h=await workspaceHarness(),before=h.get(); h.click('add-pe');
  requiredError(h,'pe-label'); assert.deepEqual(h.get(),before);
  assert.equal(h.field('co-name').getAttribute('aria-invalid'),null);
});

for (const [name,from,to] of [['reversed','2026-12-31','2026-01-01'],['missing start','','2026-12-31'],['missing end','2026-01-01',''],['invalid start','invalid','2026-12-31']]) {
  test(`${name} period dates preserve the engine rejection without unrelated inputs`,async()=>{
    const h=await workspaceHarness(),before=h.get(); h.fill({...period,'pe-from':from,'pe-to':to}); h.click('add-pe');
    assert.deepEqual(h.get(),before); assert.deepEqual(h.warnings,[{message:'تاريخ البداية يجب أن يسبق النهاية',type:'warn'}]);
    assert.equal(h.field('pe-label').getAttribute('aria-invalid'),'false');
    assert.equal(h.field('co-name').getAttribute('aria-invalid'),null);
  });
}
test('same-day periods remain valid under the unchanged inclusive date rule',async()=>{
  const h=await workspaceHarness(); h.fill({...period,'pe-from':'2026-06-01','pe-to':'2026-06-01'});h.click('add-pe');assert.equal(h.get().periods.length,1);
});

test('correcting a required error removes its stale alert while retaining other descriptions',async()=>{
  const h=await workspaceHarness();h.field('pe-label').setAttribute('aria-describedby','period-help');h.click('add-pe');
  const field=h.field('pe-label');requiredError(h,'pe-label');
  h.fill({...period,'pe-from':'2026-12-31','pe-to':'2026-01-01'});h.click('add-pe');
  assert.ok(h.field('pe-label') === field,'invalid dates leave the same form in place');
  assert.equal(field.getAttribute('aria-invalid'),'false'); assert.equal(field.getAttribute('aria-describedby'),'period-help');
  assert.equal(field.closest('.sk-field').querySelector('.sk-field-err'),null);
  assert.equal(h.warnings.length,1);assert.equal(h.get().periods.length,0);
});
test('period rerender clears inputs and repeated add without a label does not duplicate records',async()=>{
  const h=await workspaceHarness();h.render();h.render();h.fill(period);h.click('add-pe');
  const after=h.get();assert.equal(after.periods.length,1);assert.equal(h.root.listeners.get('click').length,1);
  assert.equal(h.field('pe-label').value,'');h.click('add-pe');requiredError(h,'pe-label');assert.deepEqual(h.get(),after);
  h.fill({...period,'pe-label':'Synthetic FY 2027','pe-from':'2027-01-01','pe-to':'2027-12-31'});h.click('add-pe');
  const current=h.get();assert.equal(current.periods.length,2);assert.notEqual(current.periods[0].id,current.periods[1].id);
  assert.equal(current.active.periodId,current.periods[1].id);assert.equal(h.ctx.SK.company.current().period.id,current.active.periodId);
});
test('company fallback repaint prevents stale name resubmission and keeps period untouched',async()=>{
  const h=await workspaceHarness({service:false});h.fill({'co-name':'Synthetic Third'});h.click('add-co');
  const after=h.get();assert.equal(after.companies.length,3);assert.equal(h.field('co-name').value,'');
  h.click('add-co');requiredError(h,'co-name');assert.deepEqual(h.get(),after);
});
test('company can be created when no active company exists and period card is absent',async()=>{
  const h=await workspaceHarness({service:false,books:{companies:[],periods:[],active:{}}});
  assert.equal(h.field('pe-label'),null);h.fill({'co-name':'Synthetic First'});h.click('add-co');
  const d=h.get();assert.equal(d.companies.length,1);assert.equal(d.active.companyId,d.companies[0].id);assert.ok(h.field('pe-label'));
});
for (const [action,own,other] of [['add-co','co-name','pe-label'],['add-pe','pe-label','co-name']]) {
  test(`${action} fails closed if its input container is missing`,async()=>{
    const h=await workspaceHarness(),before=h.get();h.field(own).closest('.sk-grid2').remove();
    assert.doesNotThrow(()=>h.click(action));assert.deepEqual(h.get(),before);assert.equal(h.transitions.length,0);
    assert.equal(h.field(other).getAttribute('aria-invalid'),null,'must not fall back to validating the document');
  });
}
