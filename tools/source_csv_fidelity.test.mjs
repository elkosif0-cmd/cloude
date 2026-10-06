import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {harness,root}from'./apple-source-harness.mjs';
const serialization=fs.readFileSync(root+'/ui/core/sk.js','utf8').split('\n').filter(l=>/^function (safeCell|csv)\(/.test(l)).join('\n');const serialize=vm.runInNewContext(serialization+';csv');
function csvRows(s){s=s.replace(/^\uFEFF/,'');const out=[],row=[];let value='',quoted=false;for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(quoted&&s[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(!quoted&&(c===','||c==='\n')){row.push(value);value='';if(c==='\n'){out.push(row.splice(0));}}else if(c!=='\r'||quoted)value+=c;}row.push(value);out.push(row);return out;}
const encoded=v=>/^[=+\-@]/.test(String(v))?"'"+v:String(v);
const cases=[['pg-2026',553,12,186,0],['homedepot-2025',291,8,0,0],['mcdonalds-2022',378,4,0,4],['mercedes-2025',464,103,0,0]];
for(const[id,total,dashes,blanks,unavailable]of cases)test(id+': actual serialized source CSV preserves every cell and the exact source dash glyph',async()=>{
 const h=harness(),W=h.context;await W.SKosifTBReview.openClient(id);const c=W.__test.compute(),exported=W.__test.sourceCsv(c),parsed=csvRows(serialize(exported.headers,exported.rows)),headers=parsed.shift();
 for(const key of ['value','normalized_value','value_role','source_status','source_value','source_display'])assert.ok(headers.includes(key),key);
 const rows=parsed.map(v=>Object.fromEntries(headers.map((k,i)=>[k,v[i]])));assert.equal(rows.length,total);let i=0,counts={reported_dash:0,blank:0,unavailable:0,reported_number:0};
 for(const t of c.fsAfterAdj.replay.tables)for(const r of t.rows)for(const col of t.columns){const cell=r.cells[col.id],actual=rows[i++],dash=/^[—–-]$/.test(cell.display||''),status=cell.status==='unavailable'?'unavailable':dash?'reported_dash':cell.status==='blank'?'blank':'reported_number',value=status==='unavailable'?'unavailable':status==='blank'?'':cell.display??String(cell.value);
  assert.equal(actual.line,r.label);assert.equal(actual.source_fact_id,cell.sourceFactId||'');assert.equal(actual.source_status,status);assert.equal(actual.value,encoded(value));assert.equal(actual.source_display,encoded(value));assert.equal(actual.source_value,status==='reported_number'?encoded(cell.value):'');assert.equal(actual.normalized_value,cell.value===null?'':encoded(cell.value));assert.equal(actual.value_role,status==='reported_dash'&&cell.value!==null?'rendering_only_carrier':cell.value===null?'no_numeric_value':'normalized_model_value');counts[status]++;
 }
 assert.equal(counts.reported_dash,dashes);assert.equal(counts.blank,blanks);assert.equal(counts.unavailable,unavailable);
 const fresh=harness();assert.equal(await fresh.context.SKosifTBReview.load(serialize(exported.headers,exported.rows),'source.csv'),false);assert.equal(fresh.context.__test.compute(),null);
});
test('synthetic formatter control preserves printed zero separately from dash, blank and unavailable through actual CSV serialization',()=>{
 const W=harness().context;assert.equal(typeof W.__test.sourceCellCsv,'function');const input=[{value:0,status:'reported'},{value:0,status:'reported',display:'–'},{value:null,status:'blank'},{value:null,status:'unavailable'}],out=input.map(c=>W.__test.sourceCellCsv(c));
 const rows=csvRows(serialize(['value','normalized_value','value_role','source_status','source_value','source_display'],out.map(c=>[c.value,c.normalizedValue,c.valueRole,c.sourceStatus,c.sourceValue,c.sourceDisplay])));rows.shift();
 assert.deepEqual(rows,[['0','0','normalized_model_value','reported_number','0','0'],['–','0','rendering_only_carrier','reported_dash','','–'],['','','no_numeric_value','blank','',''],['unavailable','','no_numeric_value','unavailable','','unavailable']]);
});
