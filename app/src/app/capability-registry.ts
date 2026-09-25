import type {CapabilityDefinition} from './capability-types';

export type RegistryIssue = { kind:'id'|'route'|'decision'; value:string };

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
