/* S.kosif component — read the first sheet of an Excel workbook (.xlsx) without a library
   (window.SKXlsx). Companies send their trial balance as Excel; this turns it into tab-separated
   text for the trial-balance engine. A .xlsx is a ZIP: the central directory is parsed here and the
   entries are inflated with the browser's DecompressionStream («deflate-raw»); shared strings,
   inline strings, numbers and booleans are read, formulas give their cached value.
     SKXlsx.toTsv(file) → Promise<string>        SKXlsx.rows(file) → Promise<string[][]> */
(()=>{
"use strict";
const u16=(d,o)=>d.getUint16(o,true),u32=(d,o)=>d.getUint32(o,true);
function directory(buf){
  const d=new DataView(buf),a=new Uint8Array(buf),dec=new TextDecoder();let e=-1;
  for(let i=buf.byteLength-22;i>=Math.max(0,buf.byteLength-65557);i--)if(u32(d,i)===0x06054b50){e=i;break}
  if(e<0)throw new Error("الملف ليس مصنف Excel بصيغة xlsx");
  const n=u16(d,e+10),map=new Map();let p=u32(d,e+16);
  for(let k=0;k<n&&p+46<=buf.byteLength;k++){
    if(u32(d,p)!==0x02014b50)break;
    const method=u16(d,p+10),cs=u32(d,p+20),fl=u16(d,p+28),xl=u16(d,p+30),cl=u16(d,p+32),lo=u32(d,p+42);
    map.set(dec.decode(a.slice(p+46,p+46+fl)),{method,cs,lo});p+=46+fl+xl+cl;
  }
  return {d,a,map};
}
async function entry(z,name){
  const f=z.map.get(name);if(!f)return null;
  const lo=f.lo,st=lo+30+u16(z.d,lo+26)+u16(z.d,lo+28),raw=z.a.slice(st,st+f.cs);
  if(f.method===0)return new TextDecoder().decode(raw);
  if(f.method!==8)throw new Error("ضغط غير مدعوم في الملف");
  if(typeof DecompressionStream!=="function")throw new Error("المتصفح لا يدعم قراءة xlsx — احفظ الملف بصيغة CSV");
  const out=await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer();
  return new TextDecoder().decode(out);
}
const colIndex=ref=>{const m=/^([A-Z]+)/.exec(ref||"");if(!m)return -1;let n=0;for(const ch of m[1])n=n*26+(ch.charCodeAt(0)-64);return n-1};
const text=el=>Array.from(el.getElementsByTagName("t")).map(t=>t.textContent).join("");
async function rows(file){
  const z=directory(await file.arrayBuffer()),xml=s=>new DOMParser().parseFromString(s,"application/xml");
  const wb=await entry(z,"xl/workbook.xml"),rels=await entry(z,"xl/_rels/workbook.xml.rels");
  let sheetPath="xl/worksheets/sheet1.xml";
  if(wb&&rels){
    const first=xml(wb).getElementsByTagName("sheet")[0],rid=first&&(first.getAttribute("r:id")||first.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships","id"));
    const rel=rid&&Array.from(xml(rels).getElementsByTagName("Relationship")).find(r=>r.getAttribute("Id")===rid);
    if(rel){const t=rel.getAttribute("Target").replace(/^\//,"");sheetPath=t.startsWith("xl/")?t:"xl/"+t}
  }
  const ssx=await entry(z,"xl/sharedStrings.xml"),shared=ssx?Array.from(xml(ssx).getElementsByTagName("si")).map(text):[];
  const sx=await entry(z,sheetPath);if(!sx)throw new Error("لم أجد ورقة العمل الأولى في الملف");
  const out=[];
  for(const r of Array.from(xml(sx).getElementsByTagName("row"))){
    const line=[];
    for(const c of Array.from(r.getElementsByTagName("c"))){
      const i=colIndex(c.getAttribute("r")),t=c.getAttribute("t"),v=c.getElementsByTagName("v")[0];
      let val="";
      if(t==="s")val=shared[+(v&&v.textContent)]??"";else if(t==="inlineStr")val=text(c);else if(t==="b")val=v&&v.textContent==="1"?"TRUE":"FALSE";else val=v?v.textContent:"";
      line[i<0?line.length:i]=val;
    }
    if(line.some(x=>String(x??"").trim()))out.push(Array.from(line,x=>x??""));
  }
  return out;
}
async function toTsv(file){return (await rows(file)).map(r=>r.map(x=>String(x).replace(/[\t\r\n]+/g," ")).join("\t")).join("\n")}
window.SKXlsx=Object.freeze({rows,toTsv});
})();
