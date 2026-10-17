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
/* ---------- write: one sheet, right-to-left, bold header, numbers as numbers ----------
   SKXlsx.write(name, headers, rows, {rtl}) → Blob (.xlsx). A ZIP with stored (uncompressed) entries —
   Excel, Numbers and LibreOffice all open it; no library, no network. */
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(b){let c=0xffffffff;for(let i=0;i<b.length;i++)c=CRC[(c^b[i])&255]^(c>>>8);return (c^0xffffffff)>>>0}
function zip(files){
  const enc=new TextEncoder(),parts=[],central=[];let off=0;
  const le=(n,b)=>{const a=new Uint8Array(b);for(let i=0;i<b;i++)a[i]=(n>>>(8*i))&255;return a};
  files.forEach(([name,text])=>{
    const nm=enc.encode(name),data=enc.encode(text),crc=crc32(data);
    const head=[le(0x04034b50,4),le(20,2),le(0x0800,2),le(0,2),le(0,2),le(0x21,2),le(crc,4),le(data.length,4),le(data.length,4),le(nm.length,2),le(0,2),nm];
    const cen=[le(0x02014b50,4),le(20,2),le(20,2),le(0x0800,2),le(0,2),le(0,2),le(0x21,2),le(crc,4),le(data.length,4),le(data.length,4),le(nm.length,2),le(0,2),le(0,2),le(0,2),le(0,2),le(0,4),le(off,4),nm];
    head.forEach(x=>parts.push(x));parts.push(data);off+=head.reduce((a,x)=>a+x.length,0)+data.length;cen.forEach(x=>central.push(x));
  });
  const csize=central.reduce((a,x)=>a+x.length,0);
  const end=[le(0x06054b50,4),le(0,2),le(0,2),le(files.length,2),le(files.length,2),le(csize,4),le(off,4),le(0,2)];
  return new Blob([...parts,...central,...end],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
}
const xe=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,"");
const colName=i=>{let s="";i++;while(i){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s};
/* "1,234.50" / "(1,234)" / "١٢٣" / "12%" → number, else null (codes such as 0123 stay text) */
function asNumber(v){
  if(typeof v==="number")return Number.isFinite(v)?v:null;
  let t=String(v==null?"":v).trim().replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[٬,\s]|ر\.س|ج\.م|SAR|EGP/g,"").replace("٫",".").replace("−","-");
  if(!t||/^0\d/.test(t))return null;const neg=/^\(.*\)$/.test(t);t=t.replace(/[()]/g,"");const pct=/[%٪]$/.test(t);t=t.replace(/[%٪]$/,"");
  if(!/^-?\d+(\.\d+)?$/.test(t))return null;const n=parseFloat(t)*(neg?-1:1);return pct?n/100:n;
}
/* text:true forces a whole sheet to text; text:[zero-based column indices] forces only those columns. */
/* one sheet's XML: right-to-left, bold navy header, frozen first row, numbers as numbers, filter */
function sheetXml(headers,rows,o={}){
  const all=[headers,...rows],widths=headers.map((h,i)=>Math.min(60,Math.max(8,...all.map(r=>String(r[i]==null?"":r[i]).length+2))));
  const cell=(v,r,c,head)=>{const ref=colName(c)+(r+1);if(!head&&!(Array.isArray(o.text)?o.text.includes(c):o.text)){const n=asNumber(v);if(n!==null)return '<c r="'+ref+'"'+(/[%٪]/.test(String(v))?' s="2"':' s="3"')+'><v>'+n+'</v></c>'}
    return '<c r="'+ref+'" t="inlineStr"'+(head?' s="1"':'')+'><is><t xml:space="preserve">'+xe(v==null?"":v)+'</t></is></c>'};
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"'+(o.rtl===false?'':' rightToLeft="1"')+'><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'+
    '<cols>'+widths.map((w,i)=>'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+(o.wide?Math.max(w,o.wide):w)+'" customWidth="1"/>').join("")+'</cols><sheetData>'+
    all.map((r,ri)=>'<row r="'+(ri+1)+'">'+r.map((v,ci)=>cell(v,ri,ci,ri===0)).join("")+'</row>').join("")+'</sheetData>'+(rows.length&&!o.noFilter?'<autoFilter ref="A1:'+colName(headers.length-1)+(rows.length+1)+'"/>':'')+'</worksheet>';
}
const STYLES='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.##"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0B1F3A"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="10" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
/* a workbook of several sheets: SKXlsx.book([{name,headers,rows,text?,wide?}]) → Blob (.xlsx) */
function book(sheets){
  const used=new Set(),list=sheets.map((sh,i)=>{let t=String(sh.name||"Sheet"+(i+1)).replace(/[\\/?*[\]:]/g," ").slice(0,31).trim()||"Sheet"+(i+1);while(used.has(t))t=t.slice(0,28)+" "+(i+1);used.add(t);return{...sh,title:xe(t)}});
  const defs=list.map((sh,i)=>sh.rows.length&&!sh.noFilter?'<definedName name="_xlnm._FilterDatabase" localSheetId="'+i+'" hidden="1">\''+sh.title.replace(/'/g,"''")+'\'!$A$1:$'+colName(sh.headers.length-1)+'$'+(sh.rows.length+1)+'</definedName>':'').join("");
  return zip([
    ["[Content_Types].xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+list.map((_,i)=>'<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join("")+'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
    ["_rels/.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ["xl/workbook.xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+list.map((sh,i)=>'<sheet name="'+sh.title+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>').join("")+'</sheets>'+(defs?'<definedNames>'+defs+'</definedNames>':'')+'</workbook>'],
    ["xl/_rels/workbook.xml.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+list.map((_,i)=>'<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>').join("")+'<Relationship Id="rId'+(list.length+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
    ["xl/styles.xml",STYLES],
    ...list.map((sh,i)=>["xl/worksheets/sheet"+(i+1)+".xml",sheetXml(sh.headers,sh.rows,sh)])]);
}
function write(name,headers,rows,o={}){return book([{name,headers,rows,...o}])}
window.SKXlsx=Object.freeze({rows,toTsv,write,book,asNumber});
})();
