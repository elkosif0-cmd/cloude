export function parseCsv(text:string):string[][]{
  const rows:string[][]=[];
  let row:string[]=[];
  let cell='';
  let quoted=false;

  for(let i=0;i<text.length;i+=1){
    const ch=text[i];
    if(quoted){
      if(ch==='"'&&text[i+1]==='"'){cell+='"';i+=1;}
      else if(ch==='"'){quoted=false;}
      else cell+=ch;
      continue;
    }

    if(ch==='"'){quoted=true;continue;}
    if(ch===','){row.push(cell);cell='';continue;}
    if(ch==='\n'){
      row.push(cell.replace(/\r$/,''));
      if(row.some(value=>value.trim()!==''))rows.push(row);
      row=[];cell='';
      continue;
    }
    cell+=ch;
  }

  row.push(cell.replace(/\r$/,''));
  if(row.some(value=>value.trim()!==''))rows.push(row);
  return rows;
}

export function csvObjects(text:string){
  const rows=parseCsv(text);
  if(rows.length===0)return [] as Record<string,string>[];
  const headers=rows[0].map(h=>h.trim());
  return rows.slice(1).map(row=>Object.fromEntries(headers.map((header,index)=>[header,(row[index]??'').trim()])));
}
