export type ExportCell=string|number|boolean|null|undefined;
export type ExportRow=Record<string,ExportCell>;

function escapeCell(value:ExportCell){
  const text=value===null||value===undefined?'':String(value);
  if(/[",\r\n]/.test(text))return '"'+text.replace(/"/g,'""')+'"';
  return text;
}

export function rowsToCsv(rows:ExportRow[],columns?:string[]){
  const keys=columns??Array.from(new Set(rows.flatMap(row=>Object.keys(row))));
  const lines=[keys.map(escapeCell).join(',')];
  for(const row of rows)lines.push(keys.map(key=>escapeCell(row[key])).join(','));
  return '\uFEFF'+lines.join('\r\n');
}

export function safeExportName(name:string){
  return name.trim().replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,'-').replace(/-+/g,'-')||'export';
}
