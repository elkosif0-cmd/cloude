export type SearchDomain='sales'|'procurement'|'catalog'|'finance'|'audit'|'stock'|'reports'|'system';

export type SearchItem={
  id:string;
  domain:SearchDomain;
  kind:string;
  title:string;
  subtitle?:string;
  keywords?:string[];
};

function normalize(value:string){
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g,'')
    .replace(/[أإآ]/g,'ا')
    .replace(/ة/g,'ه')
    .replace(/ى/g,'ي')
    .replace(/[^\p{L}\p{N}]+/gu,' ')
    .trim();
}

export function searchItems(items:SearchItem[],query:string,limit=20){
  const q=normalize(query);
  if(!q)return [];
  const terms=q.split(/\s+/).filter(Boolean);
  return items.map(item=>{
    const title=normalize(item.title);
    const subtitle=normalize(item.subtitle??'');
    const keywords=normalize((item.keywords??[]).join(' '));
    const haystack=[title,subtitle,keywords].join(' ');
    let score=0;
    for(const term of terms){
      if(title===term)score+=80;
      else if(title.startsWith(term))score+=50;
      else if(title.includes(term))score+=35;
      if(subtitle.includes(term))score+=15;
      if(keywords.includes(term))score+=10;
      if(!haystack.includes(term))score-=100;
    }
    return {item,score};
  }).filter(row=>row.score>0).sort((a,b)=>b.score-a.score||a.item.title.localeCompare(b.item.title,'ar')).slice(0,limit).map(row=>row.item);
}
