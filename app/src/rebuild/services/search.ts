import {CAPABILITIES} from '../core/capabilities';import {repos} from '../data/repositories';
export interface SearchResult{kind:'capability'|'customer'|'product'|'order';id:string;title:string;subtitle:string;route:string}
const norm=(s:unknown)=>String(s??'').toLowerCase().normalize('NFKD').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
export function unifiedSearch(query:string):SearchResult[]{const q=norm(query).trim();if(!q)return[];const out:SearchResult[]=[];
 CAPABILITIES.forEach(c=>{const hay=norm([c.title,c.description,...c.keywords].join(' '));if(hay.includes(q))out.push({kind:'capability',id:c.id,title:c.title,subtitle:c.description,route:c.route})});
 repos.customers().forEach(c=>{if(norm([c.name,c.phone,c.city,c.district].join(' ')).includes(q))out.push({kind:'customer',id:c.id,title:c.name,subtitle:[c.phone,c.city,c.district].filter(Boolean).join(' · '),route:'sales'})});
 repos.raws().forEach(p=>{if(norm([p.name,p.code,p.category].join(' ')).includes(q))out.push({kind:'product',id:p.id,title:p.name,subtitle:'مادة · '+p.code,route:'catalog'})});
 repos.boxes().forEach(p=>{if(norm([p.name,p.code,p.category].join(' ')).includes(q))out.push({kind:'product',id:p.id,title:p.name,subtitle:'بوكس · '+p.code,route:'catalog'})});
 repos.orders().forEach(o=>{if(norm([o.orderNumber,o.customerName,o.customerPhone].join(' ')).includes(q))out.push({kind:'order',id:o.id,title:o.orderNumber,subtitle:o.customerName+' · '+o.totalAmount+' ر.س',route:'sales'})});
 return out.slice(0,30)}
