import type {RoleId} from './permissions';

export type UserAccess={
  id:string;
  displayName:string;
  role:RoleId;
  active:boolean;
};

export function createUserAccess(input:{id:string;displayName:string;role:RoleId}):UserAccess{
  const id=input.id.trim();
  const displayName=input.displayName.trim();
  if(!id)throw new Error('USER_ID_REQUIRED');
  if(!displayName)throw new Error('DISPLAY_NAME_REQUIRED');
  return {id,displayName,role:input.role,active:true};
}

export function activeUsers(users:UserAccess[]){
  return users.filter(user=>user.active);
}
