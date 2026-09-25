export type AppEvent={type:string;at:string;payload?:Record<string,unknown>};
type Listener=(event:AppEvent)=>void;
class EventBus{
 private listeners=new Set<Listener>();
 emit(type:string,payload:Record<string,unknown>={}){const event={type,at:new Date().toISOString(),payload};this.listeners.forEach(l=>l(event));return event}
 subscribe(listener:Listener){this.listeners.add(listener);return()=>this.listeners.delete(listener)}
}
export const appEvents=new EventBus();
