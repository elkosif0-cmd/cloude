import type {CapabilityDefinition} from './capability-types';

export type RegistryIssue = { kind:'id'|'route'|'decision'; value:string };

export const coreCapabilities: CapabilityDefinition[] = [
  { id:'finance.accounts', label:'دليل الحسابات', route:'/finance/accounts', domain:'finance', decision:'REBUILD' },
  { id:'finance.journals', label:'القيود اليومية', route:'/finance/journals', domain:'finance', decision:'REBUILD' },
  { id:'finance.general-ledger', label:'الأستاذ العام', route:'/finance/general-ledger', domain:'finance', decision:'REBUILD' },
  { id:'finance.trial-balance', label:'ميزان المراجعة', route:'/finance/trial-balance', domain:'finance', decision:'REBUILD' },
];

export function inspectEntries(entries:CapabilityDefinition[]):RegistryIssue[]{
  const issues:RegistryIssue[]=[];
  const ids=new Set<string>();
  const routes=new Set<string>();
  for(const entry of entries){
    if(ids.has(entry.id)) issues.push({kind:'id',value:entry.id});
    ids.add(entry.id);
    if(routes.has(entry.route)) issues.push({kind:'route',value:entry.route});
    routes.add(entry.route);
    if(!entry.decision) issues.push({kind:'decision',value:entry.id});
  }
  return issues;
}
