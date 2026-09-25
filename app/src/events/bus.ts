export type AppEventMap={
  'data:changed':{domain:string;entity:string};
  'scope:changed':{companyId:string;periodId?:string};
  'posting:completed':{kind:'sales'|'procurement';documentId:string};
};

type Listener<T>=(payload:T)=>void;

export class AppEventBus{
  private listeners=new Map<keyof AppEventMap,Set<Listener<never>>>();

  on<K extends keyof AppEventMap>(event:K,listener:Listener<AppEventMap[K]>){
    const set=this.listeners.get(event)??new Set<Listener<never>>();
    set.add(listener as Listener<never>);
    this.listeners.set(event,set);
    return ()=>set.delete(listener as Listener<never>);
  }

  emit<K extends keyof AppEventMap>(event:K,payload:AppEventMap[K]){
    for(const listener of this.listeners.get(event)??[])listener(payload as never);
  }
}

export const appBus=new AppEventBus();
