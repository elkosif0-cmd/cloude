export type RoleId='admin'|'accountant'|'operations'|'sales'|'viewer';
export type Action='view'|'create'|'edit'|'approve'|'export'|'import';

export const ROLE_ACTIONS:Readonly<Record<RoleId,readonly Action[]>>={
  admin:['view','create','edit','approve','export','import'],
  accountant:['view','create','edit','approve','export','import'],
  operations:['view','create','edit'],
  sales:['view','create','edit','export'],
  viewer:['view']
};

export function can(role:RoleId|undefined,action:Action){
  if(!role)return false;
  return ROLE_ACTIONS[role]?.includes(action)??false;
}

export function actionsForRole(role:RoleId){
  return [...ROLE_ACTIONS[role]];
}
